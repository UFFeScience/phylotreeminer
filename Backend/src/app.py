from contextlib import asynccontextmanager
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Query, Response, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field
from typing import List, Dict, Literal, Optional, Any, Tuple
import os, datetime, mimetypes, asyncio, re, psutil, json
import glob, tempfile, zipfile, shutil

from Bio import Phylo, SeqIO, Entrez
from io import StringIO, BytesIO
import numpy as np
from dendropy import Tree, TreeList, TaxonNamespace
from dendropy.calculate import treecompare

from src.routers import neo4j_router, ncbi_router
from src.services.neo4j_services import neo4j_service
from src.services.ncbi_acquisition import NCBIAcquisition

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_BASE_WORKFLOW = os.path.abspath(os.path.join(BASE_DIR, "../../BioComp_UFF"))
DATA_ROOT = os.path.join(PATH_BASE_WORKFLOW, "data")
PROJECTS_ROOT = os.path.join(PATH_BASE_WORKFLOW, "projects")

WORKFLOW_SCRIPT_PATH = os.path.join(PATH_BASE_WORKFLOW, "workflow.py")

NCBI_WORK_DIR = os.path.join(BASE_DIR, "temp_ncbi")
os.makedirs(NCBI_WORK_DIR, exist_ok=True)

if not os.path.exists(PROJECTS_ROOT) or not os.path.isdir(PROJECTS_ROOT):
    raise RuntimeError(f"O diretório base de projetos não foi encontrado em: {PROJECTS_ROOT}")

if not os.path.exists(WORKFLOW_SCRIPT_PATH):
     raise RuntimeError(f"O script do workflow não foi encontrado em: {WORKFLOW_SCRIPT_PATH}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await neo4j_service.connect()
    yield 
    await neo4j_service.close()

app = FastAPI(lifespan=lifespan)


ncbi_service = NCBIAcquisition(
    email="seu_email@example.com",  
    work_dir=NCBI_WORK_DIR,
    data_root=DATA_ROOT
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



app.include_router(
    neo4j_router.router,
    prefix="/api/neo4j",
    tags=["Neo4j"]
)


app.include_router(
    ncbi_router.router,
    prefix="/api/ncbi",
    tags=["NCBI"]
)

class Project(BaseModel):
    name: str = Field(..., description="Nome do projeto.")
    last_modified: datetime.datetime = Field(..., description="Data da última modificação do diretório do projeto.")
    duration: Optional[int] = Field(None, description="Duração do último processo em segundos.")

class FileSystemItem(BaseModel):
    name: str = Field(..., description="Nome do arquivo ou diretório.")
    path: str = Field(..., description="Caminho relativo ao diretório de projetos.")
    type: Literal["file", "directory"] = Field(..., description="Tipo do item (arquivo ou diretório).")
    size: int = Field(..., description="Tamanho do item em bytes.")
    last_modified: datetime.datetime = Field(..., description="Data da última modificação.")

class ProjectDetails(BaseModel):
    input_file: Optional[str] = None
    current_step: Optional[str] = None
    
class WorkflowConfig(BaseModel):
    """Modelo para as configurações do workflow enviadas pelo frontend."""
    configs: Dict[str, Any] = Field(..., description="Dicionário de configurações para o workflow.")

class NCBIDownloadRequest(BaseModel):
    query: str = Field(..., description="Query de busca no NCBI")
    species_name: Optional[str] = Field(None, description="Nome personalizado para a espécie (opcional)")
    retmax: int = Field(100, description="Número máximo de sequências para download")
    initial_min_length: Optional[int] = Field(None, description="Comprimento mínimo inicial (bp)")
    refined_min_length: Optional[int] = Field(None, description="Comprimento mínimo refinado (bp)")
    utr5_end: Optional[int] = Field(None, description="Posição final do UTR 5'")
    utr3_start: Optional[int] = Field(None, description="Posição inicial do UTR 3'")
    similarity_threshold: Optional[float] = Field(None, description="Threshold de similaridade para remoção de duplicatas")

class NCBIAccessionRequest(BaseModel):
    accessions: List[str] = Field(..., description="Lista de números de acesso")
    species_name: Optional[str] = Field(None, description="Nome personalizado para a espécie (opcional)")
    initial_min_length: Optional[int] = Field(None, description="Comprimento mínimo inicial (bp)")
    refined_min_length: Optional[int] = Field(None, description="Comprimento mínimo refinado (bp)")
    utr5_end: Optional[int] = Field(None, description="Posição final do UTR 5'")
    utr3_start: Optional[int] = Field(None, description="Posição inicial do UTR 3'")
    similarity_threshold: Optional[float] = Field(None, description="Threshold de similaridade para remoção de duplicatas")

class NCBISearchRequest(BaseModel):
    query: str = Field(..., description="Termo para busca de espécies")
    retmax: int = Field(10, description="Número máximo de resultados")

#  WebSocket para Monitoramento de Progresso 
class ProgressConnectionManager:
    """Gerencia as conexões de WebSocket por projeto."""
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, project_name: str, websocket: WebSocket):
        await websocket.accept()
        if project_name not in self.active_connections:
            self.active_connections[project_name] = []
        self.active_connections[project_name].append(websocket)
        print(f"Cliente conectado ao projeto: {project_name}")

    def disconnect(self, project_name: str, websocket: WebSocket):
        if project_name in self.active_connections:
            self.active_connections[project_name].remove(websocket)
            if not self.active_connections[project_name]:
                del self.active_connections[project_name]
        print(f"Cliente desconectado do projeto: {project_name}")

    async def broadcast(self, project_name: str, message: dict):
        """Envia uma mensagem JSON para todos os clientes de um projeto."""
        if project_name in self.active_connections:
            for connection in self.active_connections[project_name][:]:
                try:
                    await connection.send_json(message)
                except Exception:
                    self.active_connections[project_name].remove(connection)

manager = ProgressConnectionManager()
active_watchers: Dict[str, asyncio.Task] = {}
running_workflows: Dict[str, asyncio.subprocess.Process] = {}


def parse_log_line(line: str) -> dict:
    """Analisa uma linha de log e a converte em um dicionário estruturado."""
    match = re.match(r"(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3}) - (INFO|WARNING|ERROR) - (.*)", line)
    if match:
        return {"timestamp": match.group(1), "level": match.group(2), "message": match.group(3).strip()}
    return {"timestamp": datetime.datetime.now().isoformat(), "level": "RAW", "message": line.strip()}

async def stream_workflow_output(project_name: str, process: asyncio.subprocess.Process):
    """
    Lê stdout/stderr de um processo, analisa o progresso de múltiplos tqdms
    e transmite um progresso combinado via WebSocket.
    """
    print(f"Iniciando streaming de saída para o projeto: {project_name}")
    tqdm_regex = re.compile(r"(\d+)\s*%\s*\|")

    current_stage = 1
    last_percentage = 0
    total_stages = 2

    while True:
        if process.returncode is not None:
            break
        
        try:
            stdout_line = await asyncio.wait_for(process.stdout.readline(), timeout=0.1)
            if stdout_line:
                line_str = stdout_line.decode('utf-8', errors='ignore').strip()
                tqdm_match = tqdm_regex.search(line_str)
                
                if tqdm_match:
                    percentage = int(tqdm_match.group(1))

                    if percentage < last_percentage and current_stage < total_stages:
                        current_stage += 1
                    
                    stage_progress = percentage / total_stages
                    completed_stages_progress = (current_stage - 1) * (100 / total_stages)
                    
                    total_progress = int(completed_stages_progress + stage_progress)
                    
                    total_progress = min(total_progress, 100)
                    last_percentage = percentage

                    await manager.broadcast(project_name, {
                        "type": "tqdm_update",
                        "payload": {"percentage": total_progress, "details": line_str}
                    })
                else:
                    parsed_line = parse_log_line(line_str)
                    await manager.broadcast(project_name, {"type": "progress_update", "payload": parsed_line})

        except asyncio.TimeoutError:
            pass 

        try:
            stderr_line = await asyncio.wait_for(process.stderr.readline(), timeout=0.1)
            if stderr_line:
                line_str = stderr_line.decode('utf-8', errors='ignore').strip()
                await manager.broadcast(project_name, {
                    "type": "progress_update",
                    "payload": {"level": "ERROR", "message": line_str, "timestamp": datetime.datetime.now().isoformat()}
                })
        except asyncio.TimeoutError:
            pass

    return_code = await process.wait()
    

    print(f"Workflow do projeto {project_name} concluído com código de saída: {return_code}")

    final_message = {
        "timestamp": datetime.datetime.now().isoformat()
    }
    if return_code == 0:
        final_message["type"] = "workflow_complete"
        final_message["message"] = f"Workflow do projeto {project_name} foi concluído com sucesso."
    else:
        final_message["type"] = "workflow_failed"
        final_message["message"] = f"Workflow do projeto {project_name} falhou com código de saída {return_code}."
    
    await manager.broadcast(project_name, final_message)
    
    if project_name in running_workflows:
        del running_workflows[project_name]

@app.post("/projects/{project_name}/run", status_code=202)
async def run_workflow(project_name: str, workflow_config: WorkflowConfig):
    """
    Inicia a execução do workflow de análise para um projeto específico.

    Args:
        project_name (str): Nome do projeto já existente na pasta de projetos.
        workflow_config (WorkflowConfig): Configurações do workflow enviadas pelo frontend. 
            O dicionário deve conter os parâmetros de entrada, saída e ajustes necessários.

    Returns:
        dict: Mensagem confirmando a execução do workflow.

    Raises:
        HTTPException 404: Se o projeto não for encontrado.
        HTTPException 409: Se já houver um workflow em execução para o mesmo projeto.
        HTTPException 500: Se ocorrer falha ao iniciar o processo.
    """
    project_path = os.path.abspath(os.path.join(PROJECTS_ROOT, project_name))
    print(project_path)
    if not project_path.startswith(PROJECTS_ROOT) or not os.path.isdir(project_path):
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")

    if project_name in running_workflows:
        raise HTTPException(status_code=409, detail=f"O workflow para o projeto '{project_name}' já está em execução.")

    config_dict = workflow_config.configs
    data_input_folder = config_dict['tree_config']['input_path']
    data_input_folder = data_input_folder.split('/')[-1]
    
    config_dict['output_log'] = os.path.join(PROJECTS_ROOT,project_name,'out')
    config_dict['tree_config']['input_path'] = os.path.join(DATA_ROOT,data_input_folder)
    config_dict['tree_config']['output_path'] = os.path.join(PROJECTS_ROOT,project_name,'out') 
    config_dict['subtree_config']['input_path'] = os.path.join(PROJECTS_ROOT,project_name,'out','Trees')
    config_dict['subtree_config']['output_path'] = os.path.join(PROJECTS_ROOT,project_name,'out')
    config_dict['subtree_config']['subtree_miner_configs']['output_path'] = os.path.join(PROJECTS_ROOT,project_name,'out')
    
    config_str = json.dumps(workflow_config.configs)
    
    
    command = [
        "python3",
        WORKFLOW_SCRIPT_PATH,
        "-cw",
        config_str
    ]

    print(f"Executando comando para o projeto '{project_name}': {' '.join(command)}")
    
    
    try:
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=PATH_BASE_WORKFLOW 
        )

        running_workflows[project_name] = process
        asyncio.create_task(stream_workflow_output(project_name, process))

        return {"message": f"Workflow para o projeto '{project_name}' iniciado com sucesso."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao iniciar o workflow: {e}")

@app.post("/projects/{project_name}/rerun", status_code=202)
async def rerun_workflow(project_name: str):
    """
    Re-executa um workflow existente usando as configurações salvas.
    """
    project_path = os.path.abspath(os.path.join(PROJECTS_ROOT, project_name))
    config_backup_path = os.path.join(project_path, "out", "outputs", "config_backup.json")
    
    if not project_path.startswith(PROJECTS_ROOT) or not os.path.isdir(project_path):
        raise HTTPException(status_code=404, detail="Projeto não encontrado.")
    
    if not os.path.exists(config_backup_path):
        raise HTTPException(status_code=404, detail="Arquivo de configuração não encontrado para este projeto.")
    
    if project_name in running_workflows:
        raise HTTPException(status_code=409, detail=f"O workflow para o projeto '{project_name}' já está em execução.")

    try:
        with open(config_backup_path, 'r') as f:
            saved_config = json.load(f)
        
        command = [
            "python3",
            WORKFLOW_SCRIPT_PATH,
            "-cw",
            json.dumps(saved_config)
        ]

        print(f"Reexecutando projeto '{project_name}': {' '.join(command)}")
        
        process = await asyncio.create_subprocess_exec(
            *command,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
            cwd=PATH_BASE_WORKFLOW 
        )

        running_workflows[project_name] = process
        asyncio.create_task(stream_workflow_output(project_name, process))

        return {"message": f"Workflow do projeto '{project_name}' reexecutado com sucesso."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Falha ao reexecutar o workflow: {e}")

@app.get("/projects/{project_name}/can-rerun")
async def can_rerun_project(project_name: str):
    """
    Verifica se um projeto pode ser reexecutado (tem configurações salvas).
    """
    project_path = os.path.abspath(os.path.join(PROJECTS_ROOT, project_name))
    config_backup_path = os.path.join(project_path, "out", "outputs", "config_backup.json")
    
    if not project_path.startswith(PROJECTS_ROOT) or not os.path.isdir(project_path):
        return {"can_rerun": False, "reason": "Projeto não encontrado"}
    
    if not os.path.exists(config_backup_path):
        return {"can_rerun": False, "reason": "Configurações não salvas"}
    
    return {"can_rerun": True}

@app.get("/projects", response_model=List[Project])
async def get_projects():
    """
    Lista todos os projetos disponíveis no sistema.

    Returns:
        List[Project]: Lista de projetos, incluindo:
            - **name**: Nome do projeto
            - **last_modified**: Data da última modificação do diretório
            - **duration**: Duração do último processo (em segundos), se disponível

    Observação:
        A duração é calculada a partir dos arquivos de log, caso existam.
    """
    projects = []
    now = datetime.datetime.now()
    today = now.date()
    timestamp_regex = re.compile(r"^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2},\d{3})")

    for project_name in sorted(os.listdir(PROJECTS_ROOT)):
        full_path = os.path.join(PROJECTS_ROOT, project_name)
        if not os.path.isdir(full_path):
            continue

        duration_seconds = None
        log_dir = os.path.join(PROJECTS_ROOT, project_name, "out/outputs")

        log_files = glob.glob(os.path.join(log_dir, "*.log"))
        if log_files:
            latest_log = max(log_files, key=os.path.getmtime)
            
            try:
                with open(latest_log, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = [line for line in f if line.strip()] 
                
                if lines:
                    first_match = timestamp_regex.match(lines[0])
                    if first_match:
                        first_line_time = datetime.datetime.strptime(first_match.group(1), "%Y-%m-%d %H:%M:%S,%f")
                        
                        if project_name in running_workflows and first_line_time.date() == today:
                            duration_seconds = int((now - first_line_time).total_seconds())
                        else:
                            last_match = timestamp_regex.match(lines[-1])
                            if last_match:
                                last_line_time = datetime.datetime.strptime(last_match.group(1), "%Y-%m-%d %H:%M:%S,%f")
                                duration_seconds = int((last_line_time - first_line_time).total_seconds())
            except Exception:
                duration_seconds = None

        projects.append(Project(
            name=project_name,
            last_modified=datetime.datetime.fromtimestamp(os.path.getmtime(full_path)),
            duration=duration_seconds
        ))
            
    return projects

@app.get("/api/tree/metadata/{project_name}", status_code=202)
async def get_tree_metadata(project_name: str):
    """
    Obtém metadados para os nós de uma árvore filogenética.
    """
    project_path = os.path.join(PROJECTS_ROOT, project_name)
    metadata_path = os.path.join(project_path,'out','outputs',"metadata.json")
    
    if not os.path.exists(metadata_path):
        raise HTTPException(status_code=404, detail="Arquivo de metadados não encontrado")
    
    try:
        with open(metadata_path, 'r') as f:
            metadata = json.load(f)
        
        return metadata
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler metadados: {e}")

@app.get("/dataFolders", response_model=List[Project])
async def get_data_folders():
    """
    Lista os diretórios de dados disponíveis.

    Returns:
        List[Project]: Diretórios de dados, com:
            - **name**: Nome da pasta
            - **last_modified**: Data da última modificação
    """
    data_folders = []
    for data_folder in sorted(os.listdir(DATA_ROOT)):
        full_path = os.path.join(DATA_ROOT, data_folder)
        if os.path.isdir(full_path):
            data_folders.append(Project(
                name=data_folder,
                last_modified=datetime.datetime.fromtimestamp(os.path.getmtime(full_path))
                
            ))
    return data_folders

@app.get("/browse", response_model=List[FileSystemItem])
async def browse_path(path: str = Query("", description="O caminho relativo a ser explorado. Ex: 'meu_projeto/Trees'")):
    """
    Explora o conteúdo de um diretório dentro da pasta de projetos.

    Args:
        path (str): Caminho relativo ao `PROJECTS_ROOT`.

    Returns:
        List[FileSystemItem]: Lista de itens encontrados, incluindo:
            - **name**: Nome do arquivo ou pasta
            - **path**: Caminho relativo ao projeto
            - **type**: "file" ou "directory"
            - **size**: Tamanho em bytes
            - **last_modified**: Data da última modificação

    Raises:
        HTTPException 403: Tentativa de acessar diretórios fora de `PROJECTS_ROOT`.
        HTTPException 404: Caminho inexistente ou não é diretório.
    """
    requested_path = os.path.abspath(os.path.join(PROJECTS_ROOT, path))

    if not requested_path.startswith(PROJECTS_ROOT):
        raise HTTPException(status_code=403, detail="Acesso negado: tentativa de acessar um caminho inválido.")

    if not os.path.exists(requested_path) or not os.path.isdir(requested_path):
        raise HTTPException(status_code=404, detail="Caminho não encontrado ou não é um diretório.")

    items = []
    for item_name in sorted(os.listdir(requested_path)):
        full_item_path = os.path.join(requested_path, item_name)
        relative_item_path = os.path.relpath(full_item_path, PROJECTS_ROOT)
        
        item_type = "directory" if os.path.isdir(full_item_path) else "file"
        
        items.append(FileSystemItem(
            name=item_name,
            path=relative_item_path.replace("\\", "/"),
            type=item_type,
            size=os.path.getsize(full_item_path),
            last_modified=datetime.datetime.fromtimestamp(os.path.getmtime(full_item_path))
        ))
    return items

@app.get("/inputs_data", response_model=List[FileSystemItem])
async def inputs_data_path(path: str = Query("", description="O caminho relativo a ser explorado. Ex: 'meu_projeto/Trees'")):
    """
    
    """
    requested_path = os.path.abspath(os.path.join(PATH_BASE_WORKFLOW, 'data'))

    if not os.path.exists(requested_path) or not os.path.isdir(requested_path):
        raise HTTPException(status_code=404, detail="Caminho não encontrado ou não é um diretório.")

    items = []
    for item_name in sorted(os.listdir(requested_path)):
        full_item_path = os.path.join(requested_path, item_name)
        relative_item_path = os.path.relpath(full_item_path, PROJECTS_ROOT)
        
        item_type = "directory" if os.path.isdir(full_item_path) else "file"
        
        items.append(FileSystemItem(
            name=item_name,
            path=relative_item_path.replace("\\", "/"), 
            type=item_type,
            size=os.path.getsize(full_item_path),
            last_modified=datetime.datetime.fromtimestamp(os.path.getmtime(full_item_path))
        ))
    return items

@app.get("/file")
async def get_file_content(path: str = Query(..., description="Caminho relativo do arquivo.")):
    """
    Retorna o conteúdo de um arquivo para pré-visualização no frontend.

    Args:
        path (str): Caminho relativo ao arquivo.

    Returns:
        dict: Conteúdo do arquivo em texto, incluindo:
            - **content**: Conteúdo em string
            - **type**: Tipo interpretado (newick, fasta, clustal, table, text, json)

        FileResponse: Caso o arquivo seja uma imagem.

    Raises:
        HTTPException 403: Acesso negado (fora de PROJECTS_ROOT).
        HTTPException 404: Arquivo não encontrado.
        HTTPException 415: Tipo de arquivo não suportado.
        HTTPException 500: Erro ao abrir ou processar arquivo.
    """
    full_path = os.path.abspath(os.path.join(PROJECTS_ROOT, path))
    if not full_path.startswith(PROJECTS_ROOT):
        raise HTTPException(status_code=403, detail="Acesso negado.")
    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Arquivo não encontrado.")

    file_type = "unsupported"
    content = ""

    try:
        with open(full_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = f.read()

        if any(full_path.endswith(ext) for ext in [".newick", ".nwk", ".tree",".nexus"]):
            file_type = "newick"
        elif any(full_path.endswith(ext) for ext in [".fasta", ".fa", ".fas", ".faa"]):
            file_type = "fasta"
        elif any(full_path.endswith(ext) for ext in [".aln", ".clustal"]):
            file_type = "clustal"
        elif any(full_path.endswith(ext) for ext in [".csv", ".tsv"]):
            file_type = "table"
        elif any(full_path.endswith(ext) for ext in [".log", ".txt", ".cql"]):
            file_type = "text"
        elif full_path.endswith(".json"):
            file_type = "json"
        
        mime_type, _ = mimetypes.guess_type(full_path)
        if mime_type and mime_type.startswith("image/"):
            return FileResponse(full_path)
        
        if file_type != "unsupported":
             return {"content": content, "type": file_type}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao ler arquivo: {e}")

    raise HTTPException(status_code=415, detail="Tipo de arquivo não suportado para pré-visualização.")


@app.head("/")
def read_root_head():
    return Response(content="Bem-vindo à API FastAPI!",status_code=200)

@app.get("/projects/status")
async def get_projects_status():
    """
    Consulta o status atual de todos os projetos.

    Returns:
        dict: Dicionário com `{project_name: status}`, onde status pode ser:
            - **running**: Workflow em execução
            - **completed**: Workflow concluído
            - **failed**: Erro durante execução
            - **idle**: Nenhum processo em andamento
    """
    statuses = {}
    for project_name in os.listdir(PROJECTS_ROOT):
        project_path = os.path.join(PROJECTS_ROOT, project_name)
        if os.path.isdir(project_path):
            if project_name in running_workflows:
                statuses[project_name] = "running"
                continue 

            outputs_dir = os.path.join(project_path, "out", "outputs")
            if not os.path.exists(outputs_dir):
                statuses[project_name] = "idle"
                continue

            log_files = glob.glob(os.path.join(outputs_dir, "*.log"))
            if log_files:
                latest_log = max(log_files, key=os.path.getmtime)
                with open(latest_log, 'r', encoding='utf-8', errors='ignore') as f:
                    log_content = f.read()

                if ("Histograma de frequência processado" in log_content):
                    statuses[project_name] = "completed"
                elif "ERROR" in log_content:
                    statuses[project_name] = "failed"
                else:
                    statuses[project_name] = "idle"
            else:
                statuses[project_name] = "idle"
    return statuses

@app.post("/projects/details", response_model=Dict[str, ProjectDetails])
async def get_projects_details(project_names: List[str]):
    """
    Obtém detalhes dos projetos especificados.

    Args:
        project_names (List[str]): Lista com os nomes dos projetos.

    Returns:
        Dict[str, ProjectDetails]: Detalhes de cada projeto:
            - **input_file**: Arquivo de entrada identificado no log
            - **current_step**: Última etapa registrada no log
    """
    details = {}
    for project_name in project_names:
        project_path = os.path.join(PROJECTS_ROOT, project_name)
        outputs_dir = os.path.join(project_path, "out", "outputs")

        input_file = "Not found"
        current_step = "Not started"

        if os.path.exists(outputs_dir):
            log_files = glob.glob(os.path.join(outputs_dir, "*.log"))
            if log_files:
                latest_log = max(log_files, key=os.path.getmtime)
                with open(latest_log, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = reversed(f.readlines())

                input_file_regex = re.compile(r"Iniciando processamento do arquivo:\s*(.*)")
                step_regex = re.compile(r"STEP:\s*(.*)")

                found_input = False
                found_step = False

                for line in lines:
                    if not found_step:
                        match = step_regex.search(line)
                        if match:
                            current_step = match.group(1).strip()
                            found_step = True

                    if not found_input:
                        match = input_file_regex.search(line)
                        if match:
                            input_file = match.group(1).strip()
                            found_input = True
                    
                    if found_input and found_step:
                        break
        
        details[project_name] = ProjectDetails(input_file=input_file, current_step=current_step)
        
    return details

def extract_trees_from_nexus(nexus_content: str, taxon_namespace: TaxonNamespace = None) -> List[Tree]:
    """
    Extrai árvores do conteúdo Nexus usando um taxon namespace compartilhado
    """
    try:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.nexus', delete=False) as temp_file:
            temp_file.write(nexus_content)
            temp_file.flush()
            
            if taxon_namespace:
                trees = TreeList.get_from_path(
                    temp_file.name, 
                    'nexus', 
                    taxon_namespace=taxon_namespace,
                    rooting='force-unrooted'
                )
            else:
                trees = TreeList.get_from_path(
                    temp_file.name, 
                    'nexus', 
                    rooting='force-unrooted'
                )
            
        return trees
        
    except Exception as e:
        raise ValueError(f"Failed to parse Nexus content: {str(e)}")
    finally:
        try:
            import os
            os.unlink(temp_file.name)
        except:
            pass

def align_taxon_namespaces(tree1: Tree, tree2: Tree) -> Tuple[Tree, Tree]:
    """
    Alinha os taxon namespaces das duas árvores
    """
    unified_namespace = TaxonNamespace()
    
    all_taxa = set()
    for tree in [tree1, tree2]:
        for taxon in tree.taxon_namespace:
            all_taxa.add(taxon.label)
    
    for taxon_label in sorted(all_taxa):
        unified_namespace.new_taxon(label=taxon_label)
    
    tree1_aligned = Tree.get_from_string(
        tree1.as_string('newick'),
        'newick',
        taxon_namespace=unified_namespace,
        rooting='force-unrooted'
    )
    
    tree2_aligned = Tree.get_from_string(
        tree2.as_string('newick'),
        'newick',
        taxon_namespace=unified_namespace,
        rooting='force-unrooted'
    )
    
    return tree1_aligned, tree2_aligned

def calculate_rf_distance(tree1: Tree, tree2: Tree) -> int:
    """
    Calcula a distância Robinson-Foulds
    """
    return treecompare.symmetric_difference(tree1, tree2)

def calculate_quartet_distance(tree1: Tree, tree2: Tree) -> int:
    """
    Calcula a distância Quartet entre duas árvores
    """
    try:
        return treecompare.quartet_distance(tree1, tree2)
    except Exception as e:
        print(f"Quartet distance calculation failed: {e}")
        return approximate_quartet_distance(tree1, tree2)

def approximate_quartet_distance(tree1: Tree, tree2: Tree) -> int:
    """
    Calcula uma aproximação da distância Quartet
    """
    taxa = sorted([taxon.label for taxon in tree1.taxon_namespace])
    if len(taxa) < 4:
        return 0
    
    quartet_distance = 0
    sample_size = min(500, len(taxa) * 10)  
    
    for _ in range(sample_size):
        try:
            sampled_taxa = np.random.choice(taxa, 4, replace=False)
            quartet_taxa = set(sampled_taxa)
            
            quartet1 = tree1.quartet(*quartet_taxa)
            quartet2 = tree2.quartet(*quartet_taxa)
            
            if quartet1 != quartet2:
                quartet_distance += 1
                
        except Exception:
            quartet_distance += 1
    
    total_quartets = len(taxa) * (len(taxa)-1) * (len(taxa)-2) * (len(taxa)-3) // 24
    if total_quartets > 0 and sample_size > 0:
        return int((quartet_distance / sample_size) * total_quartets)
    return 0

def find_common_clades(tree1: Tree, tree2: Tree) -> Tuple[int, List[str]]:
    """
    Encontra clados comuns entre duas árvores
    """
    common_clades = 0
    common_clade_descriptions = []
    
    tree1.encode_bipartitions()
    tree2.encode_bipartitions()
    
    bipartitions1 = set()
    bipartitions2 = set()
    
    for edge in tree1.postorder_edge_iter():
        if edge.bipartition and not edge.bipartition.is_trivial():
            bipartition_str = edge.bipartition.split_bitmask
            bipartitions1.add(bipartition_str)
    
    for edge in tree2.postorder_edge_iter():
        if edge.bipartition and not edge.bipartition.is_trivial():
            bipartition_str = edge.bipartition.split_bitmask
            bipartitions2.add(bipartition_str)
    
    common_bipartitions = bipartitions1.intersection(bipartitions2)
    common_clades = len(common_bipartitions)
    
    return common_clades, common_clade_descriptions

def find_conflicting_clades(tree1: Tree, tree2: Tree) -> Tuple[int, List[str]]:
    """
    Encontra clados conflitantes entre duas árvores
    """
    conflicting_clades = 0
    
    tree1.encode_bipartitions()
    tree2.encode_bipartitions()
    
    bipartitions1 = set()
    bipartitions2 = set()
    
    for edge in tree1.postorder_edge_iter():
        if edge.bipartition and not edge.bipartition.is_trivial():
            bipartitions1.add(edge.bipartition.split_bitmask)
    
    for edge in tree2.postorder_edge_iter():
        if edge.bipartition and not edge.bipartition.is_trivial():
            bipartitions2.add(edge.bipartition.split_bitmask)
    
    conflicting_clades = len(bipartitions1.symmetric_difference(bipartitions2))
    
    return conflicting_clades, []

def get_tree_statistics(tree: Tree) -> Dict:
    """
    Obtém estatísticas detalhadas de uma árvore
    """
    nodes = 0
    leaves = 0
    internal_nodes = 0
    
    for node in tree:
        nodes += 1
        if node.is_leaf():
            leaves += 1
        else:
            internal_nodes += 1
    
    branch_lengths = []
    for edge in tree.postorder_edge_iter():
        if edge.length is not None:
            branch_lengths.append(edge.length)
    
    avg_branch_length = sum(branch_lengths) / len(branch_lengths) if branch_lengths else 0
    
    return {
        'total_nodes': nodes,
        'leaf_nodes': leaves,
        'internal_nodes': internal_nodes,
        'avg_branch_length': round(avg_branch_length, 6),
        'tree_length': round(tree.length(), 6)
    }

@app.post("/api/tree/compare")
async def compare_trees(tree_data: dict):
    """
    Compara duas árvores filogenéticas no formato Nexus
    """
    try:
        tree1_nexus = tree_data.get('tree1')
        tree2_nexus = tree_data.get('tree2')
        
        if not tree1_nexus or not tree2_nexus:
            raise HTTPException(status_code=400, detail="Both tree1 and tree2 content are required")
        
        trees1 = extract_trees_from_nexus(tree1_nexus)
        if len(trees1) == 0:
            raise HTTPException(status_code=400, detail="No trees found in tree1 Nexus content")
        
        taxon_namespace = trees1[0].taxon_namespace
        
        trees2 = extract_trees_from_nexus(tree2_nexus, taxon_namespace)
        if len(trees2) == 0:
            raise HTTPException(status_code=400, detail="No trees found in tree2 Nexus content")
        
        tree1 = trees1[0]
        tree2 = trees2[0]
        
        tree1.is_rooted = False
        tree2.is_rooted = False
        
        if tree1.taxon_namespace is not tree2.taxon_namespace:
            tree1, tree2 = align_taxon_namespaces(tree1, tree2)
        
        rf_distance = calculate_rf_distance(tree1, tree2)
        quartet_distance = calculate_quartet_distance(tree1, tree2)
        common_clades, common_clade_descriptions = find_common_clades(tree1, tree2)
        conflicting_clades, conflicting_descriptions = find_conflicting_clades(tree1, tree2)
        
        tree1_stats = get_tree_statistics(tree1)
        tree2_stats = get_tree_statistics(tree2)
        
        total_possible_clades = max((tree1_stats['leaf_nodes'] - 3), 1)
        similarity_score = (common_clades / total_possible_clades) * 100 if total_possible_clades > 0 else 0
        
        return {
            'rf_distance': rf_distance,
            'quartet_distance': quartet_distance,
            'common_clades': common_clades,
            'conflicting_clades': conflicting_clades,
            'similarity_score': round(similarity_score, 2),
            'tree1_stats': tree1_stats,
            'tree2_stats': tree2_stats,
            'taxon_count': len(tree1.taxon_namespace),
            'comparison_notes': {
                'rf_interpretation': interpret_rf_distance(rf_distance, tree1_stats['leaf_nodes']),
                'quartet_interpretation': interpret_quartet_distance(quartet_distance, tree1_stats['leaf_nodes']),
                'similarity_interpretation': interpret_similarity(similarity_score)
            }
        }
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error comparing trees: {str(e)}")

def interpret_rf_distance(rf_distance: int, num_taxa: int) -> str:
    """Interpreta a distância RF"""
    max_rf = 2 * (num_taxa - 3) if num_taxa > 3 else 0
    if max_rf == 0:
        return "Árvores idênticas ou muito pequenas para comparação RF"
    
    normalized_rf = rf_distance / max_rf
    if normalized_rf < 0.1:
        return "Árvores muito similares"
    elif normalized_rf < 0.3:
        return "Árvores similares com pequenas diferenças"
    elif normalized_rf < 0.6:
        return "Árvores moderadamente diferentes"
    else:
        return "Árvores muito diferentes"

def interpret_quartet_distance(qd: int, num_taxa: int) -> str:
    """Interpreta a distância Quartet"""
    max_qd = num_taxa * (num_taxa-1) * (num_taxa-2) * (num_taxa-3) // 24 if num_taxa >= 4 else 0
    if max_qd == 0:
        return "Não aplicável (menos de 4 táxons)"
    
    normalized_qd = qd / max_qd
    if normalized_qd < 0.1:
        return "Baixa discordância de quartetos"
    elif normalized_qd < 0.3:
        return "Discordância moderada de quartetos"
    elif normalized_qd < 0.6:
        return "Alta discordância de quartetos"
    else:
        return "Discordância muito alta de quartetos"

def interpret_similarity(similarity: float) -> str:
    """Interpreta o score de similaridade"""
    if similarity > 90:
        return "Árvores quase idênticas"
    elif similarity > 70:
        return "Árvores muito similares"
    elif similarity > 50:
        return "Árvores moderadamente similares"
    elif similarity > 30:
        return "Árvores com similaridade limitada"
    else:
        return "Árvores muito diferentes"
    
#  WebSocket Endpoints 

async def log_watcher(project_name: str):
    """Observa um arquivo de log e transmite novas linhas via WebSocket. (Para logs antigos)"""
    print(f"Iniciando observador para o projeto: {project_name}")
    
    project_path = os.path.join(PROJECTS_ROOT, project_name)
    outputs_dir = os.path.join(project_path, "out", "outputs")
    log_path = None
    
    retries = 10
    while retries > 0:
        if os.path.isdir(outputs_dir):
            log_files = glob.glob(os.path.join(outputs_dir, "*.log"))
            if log_files:
                log_path = max(log_files, key=os.path.getmtime)
                break
        await asyncio.sleep(1)
        retries -= 1

    if not log_path:
        await manager.broadcast(project_name, {"type": "error", "message": f"Arquivo de log não encontrado em {outputs_dir}."})
        return

    try:
        with open(log_path, "r", encoding='utf-8', errors='ignore') as f:
            print(f"Lendo histórico do log: {log_path}")
            for line in f:
                parsed_line = parse_log_line(line)
                await manager.broadcast(project_name, {
                    "type": "progress_update",
                    "payload": parsed_line
                })
            await manager.broadcast(project_name, {
                "type": "history_complete",
                "message": f"Histórico do log do projeto {project_name} carregado."
            })
    except Exception as e:
        await manager.broadcast(project_name, {"type": "error", "message": f"Erro no observador de log: {e}"})
    finally:
        print(f"Observador de histórico para o projeto {project_name} concluído.")
        if project_name in active_watchers:
            del active_watchers[project_name]
            

@app.post("/api/ncbi/download")
async def ncbi_download_sequences(request: NCBIDownloadRequest):
    try:
        result = ncbi_service.download_sequences(
            query=request.query,
            species_name=request.species_name,  
            retmax=request.retmax,
            initial_min_length=request.initial_min_length,
            refined_min_length=request.refined_min_length,
            utr5_end=request.utr5_end,
            utr3_start=request.utr3_start,
            similarity_threshold=request.similarity_threshold
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": f"Download concluído: {result['count']} sequências de {result['species']}",
                "data": result
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no download: {str(e)}")
    
@app.post("/api/ncbi/download-accessions")
async def ncbi_download_by_accessions(request: NCBIAccessionRequest):
    """
    Baixa sequências do NCBI baseado em números de acesso.
    """
    try:
        result = ncbi_service.download_from_accessions(
            accessions=request.accessions,
            species_name=request.species_name,
            initial_min_length=request.initial_min_length,
            refined_min_length=request.refined_min_length,
            utr5_end=request.utr5_end,
            utr3_start=request.utr3_start,
            similarity_threshold=request.similarity_threshold
        )
        
        if result["success"]:
            return {
                "success": True,
                "message": f"Download concluído: {result['count']} sequências de {result['species']}",
                "data": result
            }
        else:
            raise HTTPException(status_code=400, detail=result["message"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro no download: {str(e)}")
    
@app.post("/api/ncbi/search-species")
async def ncbi_search_species(request: NCBISearchRequest):
    """
    Busca espécies no NCBI para autocompletar.
    """
    try:
        species_list = ncbi_service.search_species(
            query=request.query,
            retmax=request.retmax
        )
        
        return {
            "success": True,
            "count": len(species_list),
            "species": species_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na busca: {str(e)}")

@app.get("/api/ncbi/email")
async def get_ncbi_email():
    """
    Retorna o email configurado para o NCBI.
    """
    return {"email": Entrez.email}

@app.post("/api/ncbi/set-email")
async def set_ncbi_email(email: str = Form(...)):
    """
    Define o email para consultas ao NCBI.
    """
    try:
        if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
            raise HTTPException(status_code=400, detail="Formato de email inválido")
        
        Entrez.email = email
        ncbi_service = NCBIAcquisition(
            email=email,
            work_dir=NCBI_WORK_DIR,
            data_root=DATA_ROOT
        )
        
        return {"success": True, "message": f"Email configurado: {email}"}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao configurar email: {str(e)}")
    
@app.post("/upload-data")
async def upload_data(
    name: str = Form(..., description="Nome da pasta onde os dados serão salvos"),
    files: List[UploadFile] = File(..., description="Arquivos para upload (FASTA, ZIP)")
):
    """
    Faz upload de arquivos para análise, concatenando sequências em um único arquivo FASTA.
    
    Args:
        name (str): Nome da pasta onde os dados serão salvos
        files (List[UploadFile]): Arquivos para upload (FASTA ou ZIP com FASTA)
    
    Returns:
        dict: Mensagem de sucesso com informações do upload
    """
    try:
        if not name or not re.match(r'^[a-zA-Z0-9_-]+$', name):
            raise HTTPException(status_code=400, detail="Nome inválido. Use apenas letras, números, hífens e underscores.")
        
        target_dir = os.path.join(DATA_ROOT, name)
        os.makedirs(target_dir, exist_ok=True)
        
        final_fasta_path = os.path.join(target_dir, "concatenated_sequences.fasta")
        all_sequences = []
        processed_files = []
        
        for uploaded_file in files:
            file_content = await uploaded_file.read()
            
            if uploaded_file.filename.endswith('.zip'):
                with zipfile.ZipFile(BytesIO(file_content), 'r') as zip_ref:
                    zip_files = zip_ref.namelist()
                    fasta_files = [f for f in zip_files if f.lower().endswith(('.fasta', '.fa', '.fas', '.faa',''))]
                    
                    for fasta_file in fasta_files:
                        with zip_ref.open(fasta_file) as f:
                            content = f.read().decode('utf-8', errors='ignore')
                            sequences = list(SeqIO.parse(StringIO(content), "fasta"))
                            all_sequences.extend(sequences)
                            processed_files.append(fasta_file)
            
            elif uploaded_file.filename.lower().endswith(('.fasta', '.fa', '.fas', '.faa')):
                content = file_content.decode('utf-8', errors='ignore')
                sequences = list(SeqIO.parse(StringIO(content), "fasta"))
                all_sequences.extend(sequences)
                processed_files.append(uploaded_file.filename)
            
            else:
                other_file_path = os.path.join(target_dir, uploaded_file.filename)
                with open(other_file_path, 'wb') as f:
                    f.write(file_content)
                processed_files.append(uploaded_file.filename)
        
        if all_sequences:
            with open(final_fasta_path, 'w') as output_handle:
                SeqIO.write(all_sequences, output_handle, "fasta")
        
        return {
            "message": "Upload realizado com sucesso",
            "folder_name": name,
            "processed_files": processed_files,
            "total_sequences": len(all_sequences),
            "output_file": "concatenated_sequences.fasta" if all_sequences else None
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro durante o upload: {str(e)}")

@app.get("/uploaded-data", response_model=List[Project])
async def get_uploaded_data():
    """
    Lista todos os conjuntos de dados enviados via upload.
    """
    uploaded_folders = []
    for folder_name in sorted(os.listdir(DATA_ROOT)):
        full_path = os.path.join(DATA_ROOT, folder_name)
        if os.path.isdir(full_path):
            fasta_files = glob.glob(os.path.join(full_path, "*.fasta")) + \
                         glob.glob(os.path.join(full_path, "*.fa")) + \
                         glob.glob(os.path.join(full_path, "*.fas")) + \
                         glob.glob(os.path.join(full_path, "*")) + \
                         glob.glob(os.path.join(full_path, "*.faa"))
            
            if fasta_files:
                uploaded_folders.append(Project(
                    name=folder_name,
                    last_modified=datetime.datetime.fromtimestamp(os.path.getmtime(full_path))
                ))
    
    return uploaded_folders
            

@app.websocket("/ws/progress/{project_name}")
async def websocket_progress_endpoint(websocket: WebSocket, project_name: str):
    """
    WebSocket para monitorar em tempo real o progresso de execução de um workflow.

    - Conecta clientes ao projeto especificado.
    - Envia logs e atualizações de progresso.
    - Permite acompanhar execução mesmo após início.

    Args:
        project_name (str): Nome do projeto.
    """
    await manager.connect(project_name, websocket)
    
    if project_name not in running_workflows and project_name not in active_watchers:
        task = asyncio.create_task(log_watcher(project_name))
        active_watchers[project_name] = task

    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(project_name, websocket)


performance_clients: List[WebSocket] = []
performance_watcher_task: asyncio.Task = None

async def performance_watcher():
    """Coleta e transmite métricas de performance do sistema."""
    NETWORK_MAX_BPS = 10**9

    while True:
        if not performance_clients:
            break

        cpu_usage = psutil.cpu_percent(interval=1)
        memory_info = psutil.virtual_memory()
        disk_info = psutil.disk_usage('/')
        
        message = {
            "cpu": cpu_usage,
            "memory": memory_info.percent,
            "disk": disk_info.percent,
        }
        
        for client in performance_clients[:]:
            try:
                await client.send_json(message)
            except Exception:
                performance_clients.remove(client)

    global performance_watcher_task
    performance_watcher_task = None
    print("Observador de performance encerrado.")

@app.websocket("/ws/system-performance")
async def websocket_performance_endpoint(websocket: WebSocket):
    """
    WebSocket para monitoramento de métricas do sistema em tempo real.

    Retorna periodicamente:
        - **cpu**: Uso de CPU em porcentagem
        - **memory**: Uso de memória RAM em porcentagem
        - **disk**: Uso de disco em porcentagem
    """
    global performance_watcher_task
    await websocket.accept()
    performance_clients.append(websocket)

    if performance_watcher_task is None or performance_watcher_task.done():
        print("Iniciando observador de performance.")
        performance_watcher_task = asyncio.create_task(performance_watcher())
    
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        performance_clients.remove(websocket)
        print("Cliente de performance desconectado.")
