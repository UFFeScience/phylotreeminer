import pandas as pd
from owid import catalog
import json
from datetime import datetime
import re

class GenericOWIDAnalyzer:
    def __init__(self, json_data):
        self.json_data = json_data
        self.owid_data = {}
        self.organism = self._detect_organism()
        
    def _detect_organism(self):
        """Detecta automaticamente o organismo principal do dataset"""
        organisms = set()
        
        for tree_group in self.json_data:
            for tree_name, tree_data in tree_group.items():
                if isinstance(tree_data, dict):
                    for subtree_name, subtree_data in tree_data.items():
                        if isinstance(subtree_data, dict) and 'data_terminals' in subtree_data:
                            for terminal in subtree_data['data_terminals']:
                                if 'metadata' in terminal and 'annotations' in terminal['metadata']:
                                    source = terminal['metadata']['annotations'].get('source', '')
                                    if source:
                                        organisms.add(source)
        
        if organisms:
            main_organism = list(organisms)[0]  
            print(f"Organismo detectado: {main_organism}")
            return main_organism
        return "unknown_organism"
    
    def _normalize_organism_name(self, organism_name):
        """Normaliza o nome do organismo para busca no OWID"""
        if not organism_name:
            return "unknown"
        
        normalized = organism_name.lower().strip()
        normalized = re.sub(r'[^\w]', '_', normalized)  
        normalized = re.sub(r'_+', '_', normalized)     
        normalized = normalized.strip('_')              
        
        return normalized
    
    def load_owid_data(self):
        """Carrega dados do OWID baseado no organismo detectado"""
        normalized_organism = self._normalize_organism_name(self.organism)
        print(f"Buscando dados OWID para: {normalized_organism}")
        
        try:
            organism_tables = catalog.find(normalized_organism)
            
            if organism_tables.empty:
                print(f"Nenhuma tabela encontrada para {normalized_organism}")
                alternative_searches = self._get_alternative_searches()
                for alt_search in alternative_searches:
                    alt_tables = catalog.find(alt_search)
                    if not alt_tables.empty:
                        print(f"Encontradas tabelas para busca alternativa: {alt_search}")
                        organism_tables = alt_tables
                        break
                else:
                    print("Nenhuma tabela alternativa encontrada")
                    return
            
            print(f"Encontradas {len(organism_tables)} tabelas relacionadas a {normalized_organism}")
            
            datasets_para_carregar = []
            
            for dataset_name in organism_tables['dataset'].unique():
                tables_no_dataset = organism_tables[organism_tables['dataset'] == dataset_name]
                
                # for _, table_info in tables_no_dataset.head(3).iterrows():  # Limitar para não sobrecarregar
                for _, table_info in tables_no_dataset.iterrows():  
                    try:
                        
                        table_key = f"{dataset_name}_{table_info['table']}"
                        self.owid_data[table_key] = table_info.load()
                        print(f"✓ Carregado: {table_key}")
                    except Exception as e:
                        print(f"✗ Erro ao carregar {table_info['table']}: {e}")
                        
        except Exception as e:
            print(f"Erro geral ao carregar dados OWID: {e}")
    
    def _get_alternative_searches(self):
        """Gera buscas alternativas baseadas no organismo"""
        organism_lower = self.organism.lower()
        alternatives = []
        
        # Extrair palavras-chave do nome do organismo
        words = re.findall(r'\w+', organism_lower)
        
        # Adicionar variações
        if 'virus' in organism_lower:
            alternatives.extend(['viral_disease', 'infectious_disease', 'epidemiology'])
        if 'bacteria' in organism_lower or 'bacterial' in organism_lower:
            alternatives.extend(['bacterial_disease', 'antimicrobial_resistance'])
        
        # Adicionar palavras individuais significativas
        for word in words:
            if len(word) > 3 and word not in ['virus', 'bacteria', 'disease']:
                alternatives.append(word)
        
        return alternatives
    
    def extract_sequences_info(self):
        """Extrai informações de todas as sequências do JSON incluindo suporte das subárvores"""
        sequences_info = {}
        tree_support_data = {}
        
        for tree_group in self.json_data:
            for tree_name, tree_data in tree_group.items():
                if isinstance(tree_data, dict):
                    for subtree_name, subtree_data in tree_data.items():
                        if isinstance(subtree_data, dict) and 'data_terminals' in subtree_data:
                            support_values = subtree_data.get('supports', [])
                            subtree_support = sum(support_values) / len(support_values) if support_values else 0
                            
                            for terminal in subtree_data['data_terminals']:
                                seq_info = self._extract_sequence_info(terminal)
                                if seq_info:
                                    seq_id = seq_info['id']
                                    sequences_info[seq_id] = seq_info
                                    
                                    if seq_id not in tree_support_data:
                                        tree_support_data[seq_id] = []
                                    
                                    tree_support_data[seq_id].append({
                                        'subtree_name': subtree_name,
                                        'support': subtree_support,
                                        'support_values': support_values,
                                        'tree_group': tree_name
                                    })
        
        print(f"Extraídas informações de {len(sequences_info)} sequências únicas")
        return sequences_info, tree_support_data
    
    def _extract_sequence_info(self, terminal):
        """Extrai informações de uma sequência individual"""
        try:
            metadata = terminal.get('metadata', {})
            annotations = metadata.get('annotations', {})
            features = metadata.get('features', [])
            
            seq_id = terminal.get('newick', '')
            if not seq_id:
                return None
            
            country = None
            for feature in features:
                if feature.get('type') == 'source':
                    qualifiers = feature.get('qualifiers', {})
                    geo_loc = qualifiers.get('geo_loc_name', [])
                    if geo_loc:
                        country = geo_loc[0].split(':')[0]
                        break
            
            year = None
            for feature in features:
                if feature.get('type') == 'source':
                    qualifiers = feature.get('qualifiers', {})
                    collection_date = qualifiers.get('collection_date', [])
                    if collection_date:
                        date_str = collection_date[0]
                        year = self._extract_year(date_str)
                        break
            
            host = None
            for feature in features:
                if feature.get('type') == 'source':
                    qualifiers = feature.get('qualifiers', {})
                    host_info = qualifiers.get('host', [])
                    if host_info:
                        host = host_info[0]
                        break
            
            isolation_source = None
            for feature in features:
                if feature.get('type') == 'source':
                    qualifiers = feature.get('qualifiers', {})
                    source_info = qualifiers.get('isolation_source', [])
                    if source_info:
                        isolation_source = source_info[0]
                        break
            
            return {
                'id': seq_id,
                'country': country,
                'year': year,
                'host': host,
                'isolation_source': isolation_source,
                'organism': annotations.get('source', ''),
                'description': metadata.get('description', ''),
                'tree_context': {
                    'tree_group': list(self.json_data[0].keys())[0] if self.json_data else 'unknown',
                    'terminal_hash': terminal.get('terminal_hash')
                }
            }
            
        except Exception as e:
            print(f"Erro ao extrair informações da sequência: {e}")
            return None
    
    def _extract_year(self, date_string):
        """Extrai ano de várias formatos de data"""
        if not date_string:
            return None
        
        try:
            if isinstance(date_string, list):
                date_string = date_string[0]
            
            if '-' in date_string:
                parts = date_string.split('-')
                for part in parts:
                    if len(part) == 4 and part.isdigit():
                        return int(part)
            
            if len(date_string) == 4 and date_string.isdigit():
                return int(date_string)
            
            if len(date_string) > 4:
                potential_year = date_string[-4:]
                if potential_year.isdigit():
                    return int(potential_year)
                    
        except:
            pass
        
        return None
    
    def cross_reference_data(self):
        """Cruza dados das sequências com dados OWID e informações de suporte"""
        sequences_info, tree_support_data = self.extract_sequences_info()
        resultados = {}
        
        for seq_id, info in sequences_info.items():
            country = info['country']
            year = info['year']
            
            owid_data = self._find_owid_country_year(country, year) if country and year else {}
            
            support_info = tree_support_data.get(seq_id, [])
            avg_support = sum([s['support'] for s in support_info]) / len(support_info) if support_info else 0
            
            resultados[seq_id] = {
                'sequence_info': info,
                'owid_data': owid_data,
                'support_analysis': {
                    'total_subtrees': len(support_info),
                    'average_support': avg_support,
                    'subtree_details': support_info,
                    'support_category': self._classify_support_level(avg_support)
                },
                'context_analysis': self._analyze_context(info, owid_data, avg_support),
                'search_metadata': {
                    'organism_searched': self.organism,
                    'normalized_organism': self._normalize_organism_name(self.organism),
                    'country_searched': country,
                    'year_searched': year
                }
            }
        
        return resultados
    
    def _classify_support_level(self, support_value):
        """Classifica o nível de suporte da subárvore"""
        if support_value >= 0.8:
            return 'high_confidence'
        elif support_value >= 0.6:
            return 'moderate_confidence' 
        elif support_value >= 0.4:
            return 'low_confidence'
        else:
            return 'very_low_confidence'
        
    def _find_owid_country_year(self, country, year):
        """Encontra dados OWID para país e ano específicos"""
        dados_encontrados = {}
        
        for dataset_name, dataset in self.owid_data.items():
            try:
                if hasattr(dataset, 'reset_index'):
                    df = dataset.reset_index()
                    
                    country_col = self._find_country_column(df)
                    year_col = self._find_year_column(df)
                    
                    if country_col and year_col:
                        country_normalized = self._normalize_country_name(country)
                        
                        country_data = df[
                            (df[country_col].astype(str).str.lower() == country_normalized.lower()) & 
                            (df[year_col] == year)
                        ]
                        
                        if not country_data.empty:
                            dados_encontrados[dataset_name] = {
                                'columns': [ {col: {
                                        'title': country_data[col].metadata.title, 
                                        'unit': country_data[col].metadata.unit}
                                    } for col in country_data.columns ],
                                'data': country_data.to_dict('records'),
                                'row_count': len(country_data)
                            }
                            
            except Exception as e:
                print(f"Erro ao processar {dataset_name}: {e}")
        
        return dados_encontrados
    
    def _find_country_column(self, df):
        """Encontra coluna de país no DataFrame"""
        country_indicators = ['country', 'entity', 'location', 'geo', 'nation']
        for col in df.columns:
            if any(indicator in col.lower() for indicator in country_indicators):
                return col
        return None
    
    def _find_year_column(self, df):
        """Encontra coluna de ano no DataFrame"""
        year_indicators = ['year', 'date', 'time', 'period']
        for col in df.columns:
            if any(indicator in col.lower() for indicator in year_indicators):
                return col
        return None
    
    def _normalize_country_name(self, country):
        """Normaliza nomes de países para matching"""
        country_mapping = {
            'Cote d\'Ivoire': 'Côte d\'Ivoire',
            'Ivory Coast': 'Côte d\'Ivoire',
            'Micronesia, Federated States of': 'Micronesia (country)',
            'Central African Republic': 'Central African Republic',
            'Gabon': 'Gabon',
            'Senegal': 'Senegal',
            'Cambodia': 'Cambodia',
            'Canada': 'Canada'
        }
        return country_mapping.get(country, country)
    
    def _analyze_context(self, info, owid_data, support_value):
        """Analisa o contexto da sequência integrando informações de suporte"""
        analysis = {
            'temporal_context': self._classify_temporal_context(info['year']),
            'sample_type': self._classify_sample_type(info),
            'geographic_significance': self._assess_geographic_significance(info),
            'support_level': self._classify_support_level(support_value),
            'support_value': support_value,
            'data_availability': bool(owid_data),
            'owid_datasets_found': list(owid_data.keys()) if owid_data else []
        }
        
        if owid_data and support_value > 0:
            analysis['epidemiological_insights'] = self._generate_epidemiological_insights(
                info, owid_data, support_value
            )
        
        if not owid_data:
            analysis['recommendations'] = self._generate_recommendations(info)
        
        return analysis
    
    def _generate_epidemiological_insights(self, sequence_info, owid_data, support_value):
        """Gera insights que relacionam dados epidemiológicos com suporte das subárvores"""
        insights = []
        country = sequence_info['country']
        year = sequence_info['year']
        
        for dataset_name, dataset_info in owid_data.items():
            data_rows = dataset_info.get('data', [])
            if not data_rows:
                continue
                
            first_row = data_rows[0]
            
            epi_metrics = self._extract_epidemiological_metrics(first_row)
            
            for metric, value in epi_metrics.items():
                insight = self._create_epidemiological_insight(
                    metric, value, support_value, country, year, dataset_name
                )
                if insight:
                    insights.append(insight)
        
        return insights

    def _extract_epidemiological_metrics(self, data_row):
        """Extrai métricas epidemiológicas dos dados OWID"""
        epi_metrics = {}
        
        metric_patterns = {
            'cases': ['cases', 'confirmed', 'incidence', 'prevalence'],
            'deaths': ['deaths', 'mortality', 'fatality'],
            'dalys': ['dalys', 'disability'],
            'rate': ['rate', 'ratio', 'percentage'],
            'r_number': ['r0', 'r_', 'reproduction'],
            'vaccination': ['vaccine', 'immunization', 'coverage']
        }
        
        for key, value in data_row.items():
            if isinstance(value, (int, float)):
                key_lower = key.lower()
                for category, patterns in metric_patterns.items():
                    if any(pattern in key_lower for pattern in patterns):
                        epi_metrics[f"{category}_{key}"] = value
        
        return epi_metrics

    def _create_epidemiological_insight(self, metric, value, support, country, year, dataset):
        """Cria insight integrando métrica epidemiológica com suporte da subárvore"""
        
        support_correlation = self._calculate_support_correlation(metric, value, support)
        
        insight = {
            'metric': metric,
            'value': value,
            'support': support,
            'support_correlation': support_correlation,
            'dataset': dataset,
            'interpretation': self._interpret_epidemiological_relationship(metric, value, support)
        }
        
        return insight

    def _calculate_support_correlation(self, metric, value, support):
        """Calcula correlação simplificada entre suporte e métrica epidemiológica"""
        if value == 0:
            return 'no_data'
        
        high_incidence_metrics = ['cases', 'incidence', 'prevalence']
        if any(metric in m for m in high_incidence_metrics) and value > 1000:
            if support > 0.7:
                return 'positive_correlation'
            else:
                return 'unexpected_low_support'
        
        if value < 100 and support > 0.8:
            return 'unexpected_high_support'
        
        return 'neutral'
    
    def _interpret_epidemiological_relationship(self, metric, value, support):
        """Interpreta a relação entre dados epidemiológicos e suporte filogenético"""
        
        interpretations = {
            'positive_correlation': f"Alta incidência ({value}) correlacionada com alto suporte filogenético ({support:.2f}) - sugere transmissão sustentada",
            'unexpected_low_support': f"Alta incidência ({value}) mas baixo suporte ({support:.2f}) - possíveis múltiplas introduções independentes",
            'unexpected_high_support': f"Baixa incidência ({value}) mas alto suporte ({support:.2f}) - possível transmissão local sustentada em pequena escala",
            'neutral': f"Relação neutra entre incidência ({value}) e suporte filogenético ({support:.2f})"
        }
        
        correlation = self._calculate_support_correlation(metric, value, support)
        return interpretations.get(correlation, "Relação não determinada")
    
    def _classify_temporal_context(self, year):
        """Classifica o contexto temporal"""
        if not year:
            return 'unknown_period'
        
        current_year = datetime.now().year
        if year >= current_year - 5:
            return 'recent'
        elif year >= current_year - 20:
            return 'modern'
        elif year >= 1950:
            return 'historical_late'
        else:
            return 'historical_early'
    
    def _classify_sample_type(self, info):
        """Classifica o tipo de amostra"""
        host = (info.get('host') or '').lower()
        source = (info.get('isolation_source') or '').lower()
        
        if any(h in host for h in ['homo sapiens', 'human', 'man']):
            return 'human_clinical'
        elif any(v in host for v in ['aedes', 'mosquito', 'vector']):
            return 'vector'
        elif any(a in host for a in ['animal', 'mammal', 'bird']):
            return 'animal'
        else:
            return 'environmental_or_unknown'
    
    def _assess_geographic_significance(self, info):
        """Avalia a significância geográfica"""
        country = info.get('country', '')
        
        outbreak_countries = ['Brazil', 'Colombia', 'Mexico', 'India', 'China']
        endemic_countries = ['Uganda', 'Senegal', 'Ivory Coast', 'Gabon']
        
        if country in outbreak_countries:
            return 'outbreak_region'
        elif country in endemic_countries:
            return 'endemic_region'
        else:
            return 'other_region'
    
    def _generate_recommendations(self, info):
        """Gera recomendações quando dados não são encontrados"""
        recommendations = []
        
        if not info.get('year'):
            recommendations.append("Ano de coleta não disponível - verificar metadados originais")
        
        if not info.get('country'):
            recommendations.append("País de origem não disponível - verificar metadados de localização")
        
        if info.get('year') and info['year'] < 1990:
            recommendations.append("Dados históricos podem ser limitados no OWID")
            recommendations.append("Consultar bases de dados históricas especializadas")
        
        if not recommendations:
            recommendations.append("Tentar busca com termos alternativos ou países vizinhos")
        
        return recommendations
    
    def generate_comprehensive_report(self):
        """Gera relatório completo da análise"""
        print("Iniciando análise OWID...")
        self.load_owid_data()
        results = self.cross_reference_data()
        
        support_epi_analysis = self._analyze_support_epidemiology_correlation(results)
        
        report = {
            'analysis_metadata': {
                'timestamp': datetime.now().isoformat(),
                'organism_detected': self.organism,
                'owid_datasets_loaded': list(self.owid_data.keys()),
                'analysis_version': '2.0'  
            },
            'summary_statistics': self._generate_summary_statistics(results),
            'support_epidemiology_correlation': support_epi_analysis,
            'sequence_analysis': results,
            'recommendations': self._generate_global_recommendations(results)
        }
        
        return report
    
    def _analyze_support_epidemiology_correlation(self, results):
        """Analisa correlação agregada entre suporte filogenético e dados epidemiológicos"""
        correlation_data = []
        
        unique_sequences_by_country = {}
        for seq_id, data in results.items():
            if (data.get('context_analysis', {}).get('epidemiological_insights') and 
                data.get('support_analysis', {}).get('average_support', 0) > 0):
                country = data['sequence_info']['country']
                unique_sequences_by_country[country] = unique_sequences_by_country.get(country, 0) + 1
        
        for seq_id, data in results.items():
            if (data.get('context_analysis', {}).get('epidemiological_insights') and 
                data.get('support_analysis', {}).get('average_support', 0) > 0):
                
                for insight in data['context_analysis']['epidemiological_insights']:
                    correlation_data.append({
                        'sequence': seq_id,
                        'country': data['sequence_info']['country'],
                        'year': data['sequence_info']['year'],
                        'metric': insight['metric'],
                        'epi_value': insight['value'],
                        'support': data['support_analysis']['average_support'],
                        'correlation': insight['support_correlation']
                    })
        
        country_analysis = {}
        for item in correlation_data:
            country = item['country']
            if country not in country_analysis:
                country_analysis[country] = {
                    'total_sequences': unique_sequences_by_country[country],  
                    'avg_support': 0,
                    'avg_epi_value': 0,
                    'correlations': []
                }
            
            country_analysis[country]['avg_support'] += item['support']
            country_analysis[country]['avg_epi_value'] += item['epi_value']
            country_analysis[country]['correlations'].append(item['correlation'])
        
        for country in country_analysis:
            count = len(country_analysis[country]['correlations'])
            country_analysis[country]['avg_support'] /= count
            country_analysis[country]['avg_epi_value'] /= count
        
        return {
            'correlation_data': correlation_data,
            'country_analysis': country_analysis,
            'total_correlations_analyzed': len(correlation_data)
        }
        
    def _generate_summary_statistics(self, results):
        """Gera estatísticas sumárias da análise"""
        total_sequences = len(results)
        sequences_with_data = len([v for v in results.values() if v['owid_data']])
        countries = set()
        years = set()
        
        for seq_id, data in results.items():
            info = data['sequence_info']
            if info.get('country'):
                countries.add(info['country'])
            if info.get('year'):
                years.add(info['year'])
        
        return {
            'total_sequences_analyzed': total_sequences,
            'sequences_with_owid_data': sequences_with_data,
            'success_rate': f"{(sequences_with_data/total_sequences)*100:.1f}%" if total_sequences > 0 else "0%",
            'unique_countries': list(countries),
            'unique_years': list(years),
            'year_range': {
                'min': min(years) if years else None,
                'max': max(years) if years else None
            }
        }
    
    def _generate_global_recommendations(self, results):
        """Gera recomendações globais baseadas na análise"""
        stats = self._generate_summary_statistics(results)
        recommendations = []
        
        if stats['success_rate'] == "0%":
            recommendations.append("Nenhum dado OWID encontrado - considerar fontes de dados alternativas")
            recommendations.append("Verificar se o organismo está presente no catálogo OWID")
        
        if len(stats['unique_countries']) > 10:
            recommendations.append("Dataset com ampla distribuição geográfica - considerar análise por região")
        
        if stats['year_range']['min'] and stats['year_range']['max']:
            year_span = stats['year_range']['max'] - stats['year_range']['min']
            if year_span > 50:
                recommendations.append("Dataset abrange longo período temporal - considerar análise de tendências")
        
        return recommendations

def analyze_json_with_owid(json_file_path, output_file=None):
    """Função principal para análise automática"""
    
    with open(json_file_path, 'r') as f:
        json_data = json.load(f)
    
    analyzer = GenericOWIDAnalyzer(json_data)
    report = analyzer.generate_comprehensive_report()
    
    if output_file:
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2)
        print(f"Relatório salvo em: {output_file}")
    
    return report

