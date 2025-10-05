import os
import asyncio
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from pathlib import Path

from fastapi import  HTTPException
from src.analysis.advancedPhylogeneticAnalysis import AdvancedPhylogeneticAnalysis, AnalysisConfig

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PATH_BASE_WORKFLOW = os.path.abspath(os.path.join(BASE_DIR, "../../BioComp_UFF"))
DATA_ROOT = os.path.join(PATH_BASE_WORKFLOW, "data")
PROJECTS_ROOT = os.path.join(PATH_BASE_WORKFLOW, "projects")

class AdvancedAnalysisService:
    """Serviço para integração das análises avançadas com a API"""
    
    def __init__(self):
        self.active_analyses = {}
    
    async def start_analysis(self, project_name: str, config: Optional[AnalysisConfig] = None) -> str:
        """Iniciar análise avançada para um projeto"""
        analysis_id = f"analysis_{project_name}_{datetime.now().timestamp()}"
        
        project_path = Path(PROJECTS_ROOT) / project_name
        if not project_path.exists():
            raise HTTPException(404, f"Project {project_name} not found")
        
        # Executar em thread separada para não bloquear
        loop = asyncio.get_event_loop()
        analysis_task = loop.run_in_executor(
            None, self._run_analysis, project_path, config, analysis_id
        )
        
        self.active_analyses[analysis_id] = {
            "project": project_name,
            "task": analysis_task,
            "status": "running",
            "start_time": datetime.now()
        }
        
        return analysis_id
    
    def _run_analysis(self, project_path: Path, config: AnalysisConfig, analysis_id: str):
        """Executar análise em thread separada"""
        try:
            analyzer = AdvancedPhylogeneticAnalysis(project_path, config)
            results = analyzer.run_complete_analysis()
            analyzer.generate_visualizations()
            
            self.active_analyses[analysis_id].update({
                "status": "completed",
                "results": results,
                "end_time": datetime.now()
            })
            
        except Exception as e:
            self.active_analyses[analysis_id].update({
                "status": "failed",
                "error": str(e),
                "end_time": datetime.now()
            })
    
    def get_analysis_status(self, analysis_id: str) -> Dict[str, Any]:
        """Obter status de uma análise"""
        if analysis_id not in self.active_analyses:
            raise HTTPException(404, f"Analysis {analysis_id} not found")
        
        return self.active_analyses[analysis_id]
    
    def get_analysis_results(self, analysis_id: str) -> Dict[str, Any]:
        """Obter resultados de uma análise concluída"""
        status = self.get_analysis_status(analysis_id)
        
        if status["status"] != "completed":
            raise HTTPException(400, f"Analysis {analysis_id} is not completed")
        
        return status["results"]
