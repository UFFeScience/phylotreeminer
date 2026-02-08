from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Dict, Any, Optional
from ..services.neo4j_services import neo4j_service

router = APIRouter()

class CypherQuery(BaseModel):
    query: str
    parameters: Dict[str, Any] = {}
    
class ConnectionDetails(BaseModel):
    uri: str
    username: str
    password: Optional[str] = None

async def get_user_id(x_user_id: str = Header(...)):
    """Extrai o ID do usuário do Header e garante que existe."""
    if not x_user_id:
        raise HTTPException(status_code=400, detail="X-User-ID header missing")
    return x_user_id

@router.get("/status")
async def get_connection_status():
    """Verifica o status da conexão com Neo4j."""
    return {
        'connected': neo4j_service.connected,
        'uri': neo4j_service.uri,
        'username': neo4j_service.username,
    }

@router.post("/connect")
async def set_connection(details: ConnectionDetails):
    """
    Configura e testa uma nova conexão com o banco de dados Neo4j.
    """
    success = await neo4j_service.update_connection(
        uri=details.uri,
        username=details.username,
        password=details.password
    )
    
    if success:
        return {"success": True, "message": "Conectado ao Neo4j com sucesso!"}
    else:
        raise HTTPException(
            status_code=400,
            detail="Falha ao conectar ao Neo4j. Verifique as credenciais e o URI."
        )

@router.post("/query")
async def execute_cypher_query(cypher_query: CypherQuery, user_id: str = Depends(get_user_id)):
    """Executa uma consulta Cypher personalizada."""
    
    cypher_query.parameters['user_id'] = user_id
    
    if not cypher_query.query.strip():
        raise HTTPException(status_code=400, detail="Consulta não fornecida")
    try:
        results = await neo4j_service.execute_query(cypher_query.query, cypher_query.parameters)
        return {'success': True, 'results': results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/graph")
async def get_graph_data(cypher_query: CypherQuery, user_id: str = Depends(get_user_id)):
    """Retorna dados do grafo para visualização."""
    try:
        cypher_query.parameters['user_id'] = user_id
        graph_data = await neo4j_service.get_graph_data(cypher_query.query, parameters=cypher_query.parameters)
        return {'success': True, 'data': graph_data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/predefined-queries")
async def get_predefined_queries():
    """Retorna uma lista de consultas pré-definidas para o frontend."""
    queries = {
        'all_trees': {
            'name': 'All Trees',
            'description': 'List all nodes with the label Tree.',
            'type':'graph',
            'query': 'MATCH (n:Tree {uid: $user_id}) RETURN n LIMIT 25'
        },
        'all_subtrees': {
            'name': 'All Subtrees',
            'description': 'List all nodes with the label Subtree.',
            'type':'graph',
            'query': 'MATCH (n:Subtree {uid: $user_id}) RETURN n LIMIT 25'
        },
        'full_graph_pattern': {
            'name': 'Complete Pattern (Graph)',
            'description': 'Shows the pattern Tree -> Subtree -> Metadata.',
            'type':'graph',
            'query': 'MATCH path = (t:Tree {uid: $user_id})-[:HAS_SUBTREE]->(s:Subtree)-[]->(m:Metadata) RETURN path LIMIT 10'
        },
        'frequence_geograph':{
            'name': 'Frequency by location',
            'description':'Table with frequencies by location.',
            'type':'query',
            'query': 'MATCH (:Tree {uid: $user_id})-[:HAS_SUBTREE*]->(:Subtree)-[:HAS_METADATA]->(m:Metadata) WITH apoc.convert.fromJsonMap(m.value) AS meta WITH meta.metadata.features AS features UNWIND features AS f WITH f.qualifiers.geo_loc_name AS geo_loc UNWIND geo_loc AS location RETURN location, count(*) AS freq ORDER BY freq DESC'
        }
    }
    return {"success": True, "queries": queries}