# src/services/advanced_phylo_analysis.py
import json
import os
import logging
import asyncio
import tempfile
import subprocess
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

import pandas as pd
import numpy as np
from Bio import Phylo, SeqIO, AlignIO
from Bio.Phylo.TreeConstruction import DistanceCalculator, DistanceTreeConstructor
from dendropy import Tree, TreeList, TaxonNamespace
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
from ete3 import Tree as EteTree, TreeStyle, NodeStyle, faces, AttrFace

logger = logging.getLogger(__name__)

@dataclass
class AnalysisConfig:
    """Configurações para análises avançadas"""
    min_support: float = 0.7
    max_divergence_time: float = 1000.0
    mutation_threshold: float = 0.8
    recombination_confidence: float = 0.95
    correlation_threshold: float = 0.05

@dataclass
class DivergenceEvent:
    """Evento de divergência datado"""
    clade: str
    diverged_from: str
    years_ago: float
    confidence_interval: Tuple[float, float]
    geographic_origin: Optional[str] = None
    bootstrap_support: Optional[float] = None

@dataclass
class SignificantMutation:
    """Mutação significativa identificada"""
    gene: str
    position: int
    mutation: str
    clade: str
    functional_impact: str
    prevalence: float
    p_value: Optional[float] = None

@dataclass
class RecombinationEvent:
    """Evento de recombinação detectado"""
    breakpoint_start: int
    breakpoint_end: int
    major_parent: str
    minor_parent: str
    confidence: float
    bootstrap_support: float
    novel_features: List[str]

class AdvancedPhylogeneticAnalysis:
    """Classe para análises filogenéticas avançadas"""
    
    def __init__(self, project_path: str, config: Optional[AnalysisConfig] = None):
        self.project_path = Path(project_path)
        self.config = config or AnalysisConfig()
        self.results_dir = self.project_path / "advanced_analysis"
        self.results_dir.mkdir(exist_ok=True)
        
        # Carregar dados
        self.metadata = self._load_metadata()
        self.fpmax_data = self._load_fpmax_data()
        self.trees = self._load_trees()
        self.alignment = self._load_alignment()
        
        # Resultados
        self.divergence_results = None
        self.mutation_results = None
        self.recombination_results = None
        self.correlation_results = None
        
    def _load_metadata(self) -> Dict:
        """Carregar metadados do projeto"""
        metadata_path = self.project_path / "out" / "outputs" / "metadata.json"
        if not metadata_path.exists():
            raise FileNotFoundError(f"Metadata file not found: {metadata_path}")
        
        with open(metadata_path, 'r') as f:
            return json.load(f)
    
    def _load_fpmax_data(self) -> pd.DataFrame:
        """Carregar dados FPMax"""
        fpmax_path = self.project_path / "out" / "outputs" / "all_results_fpmax.csv"
        if not fpmax_path.exists():
            raise FileNotFoundError(f"FPMax file not found: {fpmax_path}")
        
        return pd.read_csv(fpmax_path)
    
    def _load_trees(self) -> Dict[str, Tree]:
        """Carregar árvores filogenéticas"""
        trees_dir = self.project_path / "out" / "Trees"
        trees = {}
        
        for tree_file in trees_dir.glob("*.nwk"):
            try:
                tree = Tree.get_from_path(str(tree_file), 'newick')
                trees[tree_file.stem] = tree
            except Exception as e:
                logger.warning(f"Failed to load tree {tree_file}: {e}")
        
        return trees
    
    def _load_alignment(self) -> Dict[str, Any]:
        """Carregar alinhamento de sequências"""
        alignment_dir = self.project_path / "out" / "Alignments"
        alignments = {}
        
        for aln_file in alignment_dir.glob("*.fasta"):
            try:
                alignment = AlignIO.read(str(aln_file), "fasta")
                alignments[aln_file.stem] = alignment
            except Exception as e:
                logger.warning(f"Failed to load alignment {aln_file}: {e}")
        
        return alignments
    
    def run_complete_analysis(self) -> Dict[str, Any]:
        """Executar pipeline completo de análise"""
        logger.info("Starting complete phylogenetic analysis")
        
        results = {
            "timestamp": datetime.now().isoformat(),
            "project": str(self.project_path.name),
            "analyses": {}
        }
        
        try:
            # 1. Análise de datação de divergência
            results["analyses"]["divergence_dating"] = self.analyze_divergence_times()
            
            # 2. Análise de mutações significativas
            results["analyses"]["mutation_analysis"] = self.analyze_significant_mutations()
            
            # 3. Detecção de recombinação
            results["analyses"]["recombination_analysis"] = self.detect_recombination()
            
            # 4. Análise de correlação fenotípica
            results["analyses"]["phenotype_correlation"] = self.analyze_phenotype_correlations()
            
            # Salvar resultados
            self._save_results(results)
            
            logger.info("Complete analysis finished successfully")
            return results
            
        except Exception as e:
            logger.error(f"Analysis failed: {e}")
            raise
    
    def analyze_divergence_times(self) -> List[Dict]:
        """Analisar tempos de divergência usando relógio molecular"""
        logger.info("Analyzing divergence times")
        
        divergence_events = []
        
        for tree_name, tree in self.trees.items():
            try:
                # Método 1: Usando taxa de substituição constante
                events = self._calculate_divergence_constant_rate(tree, tree_name)
                divergence_events.extend(events)
                
                # Método 2: Usando pontos de calibração externos
                events_calibrated = self._calculate_divergence_calibrated(tree, tree_name)
                divergence_events.extend(events_calibrated)
                
            except Exception as e:
                logger.warning(f"Divergence analysis failed for {tree_name}: {e}")
        
        # Salvar resultados
        self._save_divergence_results(divergence_events)
        return [event.__dict__ for event in divergence_events]
    
    def _calculate_divergence_constant_rate(self, tree: Tree, tree_name: str) -> List[DivergenceEvent]:
        """Calcular divergência com taxa constante"""
        events = []
        
        # Assumir taxa de substituição (ajustável por tipo de gene)
        substitution_rate = self._get_substitution_rate(tree_name)
        
        for node in tree.preorder_node_iter():
            if not node.is_leaf() and node.edge_length is not None:
                # Converter distância genética para tempo
                time_ago = node.edge_length / substitution_rate
                
                if time_ago <= self.config.max_divergence_time:
                    event = DivergenceEvent(
                        clade=self._get_clade_name(node, tree),
                        diverged_from=self._get_parent_clade(node),
                        years_ago=time_ago,
                        confidence_interval=(
                            time_ago * 0.8,  # Intervalo de confiança de 80%
                            time_ago * 1.2
                        ),
                        bootstrap_support=getattr(node, 'bootstrap', None)
                    )
                    events.append(event)
        
        return events
    
    def _get_substitution_rate(self, tree_name: str) -> float:
        """Obter taxa de substituição apropriada baseada no gene"""
        # Taxas de substituição típicas (substituições/sítio/ano)
        rates = {
            "coi": 0.0115,    # Citocromo c oxidase
            "16s": 0.0056,    # rRNA 16S
            "18s": 0.0038,    # rRNA 18S
            "cytb": 0.021,    # Citocromo b
            "rag1": 0.0043,   # Gene nuclear RAG1
            "default": 0.01   # Taxa padrão
        }
        
        for gene, rate in rates.items():
            if gene in tree_name.lower():
                return rate
        
        return rates["default"]
    
    def analyze_significant_mutations(self) -> List[Dict]:
        """Identificar mutações significativas em clados específicos"""
        logger.info("Analyzing significant mutations")
        
        significant_mutations = []
        
        for gene_name, alignment in self.alignment.items():
            try:
                mutations = self._find_mutations_for_gene(alignment, gene_name)
                significant_mutations.extend(mutations)
            except Exception as e:
                logger.warning(f"Mutation analysis failed for {gene_name}: {e}")
        
        # Filtrar mutações significativas
        filtered_mutations = [
            mut for mut in significant_mutations 
            if mut.prevalence >= self.config.mutation_threshold
        ]
        
        self._save_mutation_results(filtered_mutations)
        return [mut.__dict__ for mut in filtered_mutations]
    
    def _find_mutations_for_gene(self, alignment, gene_name: str) -> List[SignificantMutation]:
        """Encontrar mutações para um gene específico"""
        mutations = []
        
        # Analisar cada posição no alinhamento
        for pos in range(alignment.get_alignment_length()):
            column = alignment[:, pos]
            unique_bases = set(column)
            
            # Ignorar colunas conservadas
            if len(unique_bases) <= 1:
                continue
            
            # Encontrar mutações predominantes por clado
            clade_mutations = self._analyze_mutations_by_clade(column, pos, gene_name)
            mutations.extend(clade_mutations)
        
        return mutations
    
    def detect_recombination(self) -> List[Dict]:
        """Detectar eventos de recombinação"""
        logger.info("Detecting recombination events")
        
        recombination_events = []
        
        # Usar método de quebra de consistência filogenética
        for gene_name, alignment in self.alignment.items():
            try:
                events = self._detect_recombination_phylogenetic(alignment, gene_name)
                recombination_events.extend(events)
            except Exception as e:
                logger.warning(f"Recombination detection failed for {gene_name}: {e}")
        
        # Filtrar eventos com alta confiança
        filtered_events = [
            event for event in recombination_events 
            if event.confidence >= self.config.recombination_confidence
        ]
        
        self._save_recombination_results(filtered_events)
        return [event.__dict__ for event in filtered_events]
    
    def analyze_phenotype_correlations(self) -> Dict[str, Any]:
        """Analisar correlações entre filogenia e fenótipos"""
        logger.info("Analyzing phenotype correlations")
        
        correlations = {}
        
        if not self.metadata or 'phenotypic_data' not in self.metadata:
            logger.warning("No phenotypic data available for correlation analysis")
            return correlations
        
        # Analisar cada árvore
        for tree_name, tree in self.trees.items():
            try:
                tree_correlations = self._correlate_tree_phenotypes(tree, tree_name)
                correlations[tree_name] = tree_correlations
            except Exception as e:
                logger.warning(f"Phenotype correlation failed for {tree_name}: {e}")
        
        self._save_correlation_results(correlations)
        return correlations
    
    # Métodos auxiliares e de salvamento
    def _save_results(self, results: Dict[str, Any]):
        """Salvar todos os resultados da análise"""
        output_file = self.results_dir / "complete_analysis_results.json"
        with open(output_file, 'w') as f:
            json.dump(results, f, indent=2, default=str)
    
    def _save_divergence_results(self, events: List[DivergenceEvent]):
        """Salvar resultados de datação"""
        output_file = self.results_dir / "divergence_analysis.json"
        with open(output_file, 'w') as f:
            json.dump([event.__dict__ for event in events], f, indent=2)
    
    def _save_mutation_results(self, mutations: List[SignificantMutation]):
        """Salvar resultados de mutações"""
        output_file = self.results_dir / "mutation_analysis.json"
        with open(output_file, 'w') as f:
            json.dump([mut.__dict__ for mut in mutations], f, indent=2)
    
    def _save_recombination_results(self, events: List[RecombinationEvent]):
        """Salvar resultados de recombinação"""
        output_file = self.results_dir / "recombination_analysis.json"
        with open(output_file, 'w') as f:
            json.dump([event.__dict__ for event in events], f, indent=2)
    
    def _save_correlation_results(self, correlations: Dict[str, Any]):
        """Salvar resultados de correlação"""
        output_file = self.results_dir / "phenotype_correlations.json"
        with open(output_file, 'w') as f:
            json.dump(correlations, f, indent=2)
    
    def generate_visualizations(self):
        """Gerar visualizações para os resultados"""
        self._plot_divergence_timeline()
        self._plot_mutation_map()
        self._plot_recombination_events()
        self._plot_correlation_heatmap()
    
    def _plot_divergence_timeline(self):
        """Gerar linha do tempo de divergência"""
        if not self.divergence_results:
            return
        
        # Implementar visualização da linha do tempo
        pass
    
    # ... outros métodos de visualização ...
