import React, { useState } from "react";
import {
  Layout,
  Menu,
  Typography,
  Divider,
  Input,
  List,
  Breadcrumb,
  Row,
  Col,
  Space,
  Card,
  Alert,
  Tag
} from "antd";
import {
  HomeOutlined,
  SearchOutlined,
  FileTextOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import Logo from '../../pages/componentsHomepage/logo'
import { colors } from "../../themes";

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const PhyloTreeMinerDocs = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentSection, setCurrentSection] = useState("home");
  const [currentSubsection, setCurrentSubsection] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState([
    "Home",
    "PhyloTreeMiner-Docs",
  ]);

  // Estrutura completa da documentação
  const documentationStructure = {
    home: {
      title: "PhyloTreeMiner Docs",
      icon: <HomeOutlined />,
      content: (
        <div>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <div
                className="logo-container"
                style={{
                  height: "94px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0 10px",
                  backgroundColor: colors.white,
                }}
              >
                <Logo size="50px" />
                {!collapsed && (
                  <Title
                    level={8}
                    style={{
                      color: colors.primary,
                      marginBottom: 0,
                      marginLeft: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    PhyloTreeMiner
                  </Title>
                )}
              </div>
            <Title level={3} type="secondary">
              Identificação Paralela de Subárvores Frequentes em Análises
              Filogenéticas
            </Title>
          </div>

          <Card
            style={{
              marginBottom: 24,
              borderLeft: "4px solid #1890ff",
              backgroundColor: "#f6ffed",
            }}
          >
            <Paragraph style={{ fontSize: "16px", margin: 0 }}>
              <strong>🚀 Uma plataforma computacional avançada</strong> para
              automatizar a análise filogenética em larga escala, proporcionando
              uma solução sistemática, paralela e reprodutível para identificar
              padrões evolutivos robustos.
            </Paragraph>
          </Card>

          <Divider />

          <Title level={2}>🎯 Objetivo Principal</Title>
          <Paragraph>
            Diante do{" "}
            <Text strong>crescimento exponencial de dados biológicos</Text> e da
            capacidade de gerar árvores filogenéticas cada vez maiores, surge um
            novo desafio: como extrair conhecimento confiável de milhares de
            árvores que podem ser geradas a partir do mesmo conjunto de dados.
          </Paragraph>

          <Alert
            message="Mudança de Paradigma"
            description="O PhyloTreeMiner move o foco da 'busca pela árvore única e correta' para a 'identificação das relações evolutivas mais robustas e confiáveis'"
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Title level={2}>🔍 O Problema: A Incerteza Filogenética</Title>

          <Card style={{ marginBottom: 16 }}>
            <Title level={4}>
              📊 Por quê? O Desafio da Escolha Metodológica
            </Title>
            <Paragraph>
              A construção de uma árvore filogenética não é um processo único.
              Existem múltiplas filosofias e métodos:
            </Paragraph>
            <List
              dataSource={[
                "Máxima Parsimônia",
                "Máxima Verossimilhança",
                "Matriz de Distâncias",
              ]}
              renderItem={(item) => (
                <List.Item>
                  <Text checkable>{item}</Text>
                </List.Item>
              )}
            />
          </Card>

          <Alert
            message="Questões Críticas"
            description={
              <List
                size="small"
                dataSource={[
                  "Como extrair conhecimento útil da variação metodológica?",
                  "Como identificar padrões evolutivos confiáveis em meio a discordância?",
                  "Por que as árvores de consenso tradicionais são inadequadas?",
                ]}
                renderItem={(item) => <List.Item>• {item}</List.Item>}
              />
            }
            type="warning"
            showIcon
          />

          <Divider />

          <Title level={2}>💡 A Solução: Foco na Robustez</Title>

          <Card
            type="inner"
            title="🎯 O que é Robustez Filogenética?"
            style={{ marginBottom: 24 }}
          >
            <Paragraph>
              Um padrão (clado) que é identificado consistentemente por métodos
              com premissas matemáticas e estatísticas completamente diferentes
              é, por definição, um padrão de{" "}
              <Text strong>altíssima confiança</Text>, e não um artefato de um
              único método.
            </Paragraph>
          </Card>

          <Title level={2}>⚙️ Como Funciona: O Workflow Automatizado</Title>

          <List
            itemLayout="vertical"
            dataSource={[
              {
                title: "1. 📥 Aquisição e Pré-processamento",
                content:
                  "Aquisição de sequências (arquivos Fasta ou consulta direta ao NCBI) com validação e preparação dos dados",
              },
              {
                title: "2. 🔄 Alinhamento Múltiplo de Sequências",
                content:
                  "Alinhamento usando diferentes programas (ClustalW, MAFFT) para criar a base da comparação estrutural",
              },
              {
                title: "3. 🌳 Inferência das Árvores (O Ensemble)",
                content:
                  "Geração paralela de um conjunto robusto de árvores candidatas usando múltiplos métodos de inferência",
              },
              {
                title: "4. 🎯 Geração e Mapeamento de Subárvores",
                content:
                  "Decomposição de cada árvore em subárvores com enriquecimento de metadados (país, data, etc.)",
              },
              {
                title: "5. 📊 Mineração (Cálculo de Frequência)",
                content:
                  "Comparação de todas as subárvores usando algoritmo FPMax para calcular frequência de padrões topológicos",
              },
              {
                title: "6. 📈 Representação de Conhecimento",
                content:
                  "Exportação para banco de dados de grafos (Neo4j) para visualização interativa e consultas complexas",
              },
            ]}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta title={item.title} description={item.content} />
              </List.Item>
            )}
          />

          <Divider />

          <Title level={2}>🌟 Funcionalidades Chave e Sua Importância</Title>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card
                size="small"
                title="🔄 Múltiplas Metodologias de Inferência"
                style={{ height: "100%" }}
              >
                <Paragraph>
                  <strong>Base do "teste de estresse" metodológico</strong>.
                  Integra um arsenal abrangente incluindo:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Métodos de Distância (NJ, UPGMA)",
                    "Máxima Verossimilhança (RAxML, IQ-TREE)",
                    "Inferência Bayesiana (MrBayes)",
                  ]}
                  renderItem={(item) => <List.Item>• {item}</List.Item>}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                title="🌐 Integração com NCBI"
                style={{ height: "100%" }}
              >
                <Paragraph>
                  <strong>
                    Aquisição e enriquecimento automático de dados
                  </strong>
                  . Consulta direta ao banco de dados do NCBI para:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Automatizar aquisição de sequências",
                    "Associar metadados cruciais (data, localização, gene)",
                    "Transformar padrões abstratos em informações acionáveis",
                  ]}
                  renderItem={(item) => <List.Item>• {item}</List.Item>}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col span={12}>
              <Card
                size="small"
                title="⚡ Algoritmo FPMax"
                style={{ height: "100%" }}
              >
                <Paragraph>
                  <strong>Mineração eficiente em larga escala</strong>. Torna
                  viável a comparação de milhares de árvores e milhões de
                  subárvores:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Abordagem de ciência da computação de alto desempenho",
                    "Resolução de problemas NP-difíceis",
                    "Análise concluída em tempo hábil",
                  ]}
                  renderItem={(item) => <List.Item>• {item}</List.Item>}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card
                size="small"
                title="📈 Integração com OWID"
                style={{ height: "100%" }}
              >
                <Paragraph>
                  <strong>Contextualização epidemiológica em tempo real</strong>
                  . Conecta padrões filogenéticos com dados do mundo real:
                </Paragraph>
                <List
                  size="small"
                  dataSource={[
                    "Validação de impacto de variantes",
                    "Sistema de alerta precoce",
                    "Monitoramento de intervenções",
                  ]}
                  renderItem={(item) => <List.Item>• {item}</List.Item>}
                />
              </Card>
            </Col>
          </Row>

          <Divider />

          <Title level={2}>🎯 Insights Geográficos e Temporais</Title>

          <Alert
            message="Transformando Dados em Conhecimento Acionável"
            description="O PhyloTreeMiner não apenas encontra padrões frequentes, mas os contextualiza no espaço e no tempo, fornecendo insights profundos sobre dinâmica evolutiva"
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: 8 }}>🌍</div>
                <Title level={4}>Análise Geográfica</Title>
                <Paragraph>
                  Rastreamento de linhagens por região, identificação de rotas
                  de dispersão e hotspots evolutivos
                </Paragraph>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: 8 }}>📅</div>
                <Title level={4}>Análise Temporal</Title>
                <Paragraph>
                  Monitoramento da emergência e declínio de linhagens ao longo
                  do tempo, detectando tendências evolutivas
                </Paragraph>
              </Card>
            </Col>
            <Col span={8}>
              <Card size="small" style={{ textAlign: "center" }}>
                <div style={{ fontSize: "24px", marginBottom: 8 }}>🔗</div>
                <Title level={4}>Correlação Epidemiológica</Title>
                <Paragraph>
                  Integração com dados de saúde pública para validar impacto
                  biológico de padrões genéticos
                </Paragraph>
              </Card>
            </Col>
          </Row>

          <Divider />

          <Card
            style={{
              backgroundColor: "#fff7e6",
              border: "1px solid #ffd591",
            }}
          >
            <Title level={3}>💫 Por que o PhyloTreeMiner é Essencial?</Title>
            <Paragraph>
              Em um mundo com dados biológicos crescendo exponencialmente,
              ferramentas tradicionais tornam-se inadequadas. O PhyloTreeMiner
              representa a{" "}
              <Text strong>próxima geração de análise filogenética</Text>, onde
              a robustez metodológica, a escalabilidade computacional e a
              contextualização epidemiológica se unem para fornecer insights
              confiáveis e acionáveis para pesquisa e saúde pública.
            </Paragraph>
          </Card>
        </div>
      ),
    },
    workflowGuide: {
      title: "Workflow Guide",
      icon: <FileTextOutlined />,
      count: 4,
      subsections: {
        overview: {
          title: "Workflow Overview",
          content: (
            <div>
              <Title level={2}>🌳 PhyloTreeMiner Workflow Overview</Title>

              <Alert
                message="Fluxo de Trabalho Integrado"
                description="Pipeline completo e automatizado para análise filogenética em larga escala"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Paragraph>
                O PhyloTreeMiner fornece um workflow completo e padronizado para
                análises filogenéticas, encapsulado em um ambiente Docker. A
                solução permite a execução de pipelines de alinhamento e
                construção de árvores filogenéticas de forma{" "}
                <Text strong>reprodutível e eficiente</Text>.
              </Paragraph>

              <Card
                title="📋 Etapas do Workflow"
                style={{ marginBottom: 24 }}
                type="inner"
              >
                <List
                  bordered
                  dataSource={[
                    "🔍 Alinhamento de sequências usando MAFFT ou Clustal Omega",
                    "🌳 Construção de árvores filogenéticas usando IQ-TREE ou RAxML-NG",
                    "🎯 Mineração e análise de subárvores",
                    "📊 Geração de resultados e coleta de metadados",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text strong>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>

              <Title level={3}>🎯 Componentes Principais</Title>
              <Paragraph>
                O workflow é controlado por um arquivo de configuração JSON que
                fornece
                <Text strong> flexibilidade total</Text> na escolha de métodos e
                parâmetros para cada etapa de análise.
              </Paragraph>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    size="small"
                    title="⚙️ Configuração"
                    style={{ height: "100%" }}
                  >
                    <Paragraph>
                      <code>templates/config.json</code> define todos os
                      parâmetros para construção de árvores e mineração de
                      subárvores
                    </Paragraph>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    title="🐳 Containerização"
                    style={{ height: "100%" }}
                  >
                    <Paragraph>
                      Ambiente Docker completo com todas as dependências
                      pré-instaladas para máxima reprodutibilidade
                    </Paragraph>
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        },
        configuration: {
          title: "Configuration Guide",
          content: (
            <div>
              <Title level={2}>⚙️ Guia de Configuração</Title>

              <Alert
                message="Arquivo de Configuração Central"
                description="Todo o workflow é controlado através do templates/config.json"
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Paragraph>
                O workflow é configurado através do arquivo{" "}
                <code>templates/config.json</code>. Este arquivo JSON define
                todos os parâmetros para construção de árvores e mineração de
                subárvores.
              </Paragraph>

              <Card
                title="📁 Seções Principais de Configuração"
                style={{ marginBottom: 24 }}
              >
                <List
                  bordered
                  dataSource={[
                    "🌳 tree_config: Parâmetros principais de construção de árvores",
                    "🎯 subtree_config: Configuração de mineração de subárvores",
                    "⚡ subtree_miner_configs: Configurações específicas do algoritmo de mineração",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text strong>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>

              <Title level={3}>📋 Exemplo de Configuração</Title>
              <Paragraph>
                Configuração básica para uma análise padrão:
              </Paragraph>

              <Card>
                <pre
                  style={{
                    fontSize: "12px",
                    backgroundColor: "#f5f5f5",
                    padding: "16px",
                    borderRadius: "4px",
                  }}
                >
                  {`{
  "log_file": true,
  "project_name": "MinhaAnalise",
  "output_log": "./projects/#/out",
  "tree_config": {
    "mode": "auto",
    "construct_tree_method": "distance",
    "align_method": "mafft",
    "num_threads": 4,
    "input_path": "./data/minhas_sequencias",
    "output_path": "./projects/MinhaAnalise/out",
    "output_format": "nexus"
  },
  "subtree_config": {
    "construct_tree_method": "distance",
    "input_path": "./projects/#/out/Trees",
    "output_path": "./projects/#/out",
    "input_format": "nexus",
    "output_format": "nexus",
    "resume_infos": true,
    "save_metadata": true,
    "subtree_miner": true
  }
}`}
                </pre>
              </Card>

              <Alert
                message="Dica de Performance"
                description="Ajuste 'num_threads' conforme o número de CPUs disponíveis para processamento paralelo"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            </div>
          ),
        },
        inputOutput: {
          title: "Input & Output Formats",
          content: (
            <div>
              <Title level={2}>📁 Formatos de Entrada e Saída</Title>

              <Row gutter={[16, 24]}>
                <Col span={12}>
                  <Card
                    title="📥 Requisitos de Entrada"
                    style={{ height: "100%" }}
                    type="inner"
                  >
                    <List
                      bordered
                      dataSource={[
                        "Sequências de entrada: Formato FASTA (.fasta, .fa)",
                        "Múltiplos arquivos de sequência suportados",
                        "Processamento em lote automático de conjuntos de dados",
                        "Validação automática de formato e conteúdo",
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    title="📤 Formatos de Saída"
                    style={{ height: "100%" }}
                    type="inner"
                  >
                    <List
                      bordered
                      dataSource={[
                        "Árvores: Nexus (.nexus) ou Newick (.nwk)",
                        "Alinhamentos: Formatos de alinhamento padrão",
                        "Arquivos de log: Logs de execução detalhados",
                        "Metadados: JSON com metadados para subárvores mineradas",
                        "Resultados FPMax: Padrões frequentes identificados",
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>

              <Divider />

              <Title level={3}>🎯 Estrutura de Diretórios</Title>

              <Card>
                <pre
                  style={{
                    fontSize: "12px",
                    backgroundColor: "#f5f5f5",
                    padding: "16px",
                    borderRadius: "4px",
                  }}
                >
                  {`projeto/
├── data/                 # Dados de entrada
│   ├── sequencias.fasta
│   └── outro_conjunto.fa
├── templates/
│   └── config.json      # Arquivo de configuração
└── projects/            # Resultados das análises
    └── MeuProjeto/
        ├── out/
        │   ├── Trees/   # Árvores geradas
        │   ├── Alignments/ # Alinhamentos
        │   └── logs/    # Logs de execução
        └── resultados/  # Resultados finais`}
                </pre>
              </Card>
            </div>
          ),
        },
        performance: {
          title: "Performance Optimization",
          content: (
            <div>
              <Title level={2}>⚡ Otimização de Performance</Title>

              <Alert
                message="Otimização para Larga Escala"
                description="Configure adequadamente para lidar com grandes conjuntos de dados filogenéticos"
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Paragraph>
                Otimize a execução do workflow configurando adequadamente a
                alocação de recursos e processamento paralelo.
              </Paragraph>

              <Card
                title="🎯 Parâmetros Chave de Performance"
                style={{ marginBottom: 24 }}
              >
                <List
                  bordered
                  dataSource={[
                    "num_threads: Número de threads CPU para processamento paralelo",
                    "align_method: Escolha entre MAFFT (mais rápido) e ClustalW",
                    "construct_tree_method: Seleção de algoritmos de construção de árvores",
                    "memory_allocation: Alocação de recursos no Docker",
                    "mode: Modo de operação (auto, OFST, distance, parsimony)",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text strong>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>

              <Title level={3}>💡 Configurações Recomendadas</Title>
              <Paragraph>
                Para performance ideal em uma estação de trabalho padrão:
              </Paragraph>

              <Card style={{ marginBottom: 16 }}>
                <pre
                  style={{
                    fontSize: "12px",
                    backgroundColor: "#f6ffed",
                    padding: "16px",
                    borderRadius: "4px",
                  }}
                >
                  {`{
  "num_threads": 8,
  "align_method": "mafft",
  "construct_tree_method": "nj",
  "tree_config": {
    "mode": "auto"
  }
}`}
                </pre>
              </Card>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    size="small"
                    title="🖥️ Hardware Recomendado"
                    style={{ height: "100%" }}
                  >
                    <List
                      size="small"
                      dataSource={[
                        "CPU: 8+ cores para processamento paralelo",
                        "RAM: 16GB+ para grandes conjuntos de dados",
                        "Storage: SSD para I/O rápido de arquivos",
                        "Docker: 4GB+ de memória alocada",
                      ]}
                      renderItem={(item) => <List.Item>• {item}</List.Item>}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    size="small"
                    title="🚀 Dicas de Otimização"
                    style={{ height: "100%" }}
                  >
                    <List
                      size="small"
                      dataSource={[
                        "Use MAFFT para conjuntos grandes de dados",
                        "Ajuste num_threads conforme disponibilidade de CPU",
                        "Monitore uso de memória durante execução",
                        'Use modo "auto" para balanceamento automático',
                      ]}
                      renderItem={(item) => <List.Item>• {item}</List.Item>}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        },
      },
    },
    cliDockerExecution: {
      title: "CLI & Docker Execution",
      icon: <BookOutlined />,
      count: 3,
      subsections: {
        dockerExecution: {
          title: "Docker Execution Guide",
          content: (
            <div>
              <Title level={2}>🐳 Guia de Execução Docker</Title>

              <Alert
                message="Execução com Máxima Reprodutibilidade"
                description="Use Docker para ambiente isolado e consistente em qualquer sistema"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Paragraph>
                Execute o workflow PhyloTreeMiner usando Docker para máxima
                reprodutibilidade e isolamento.
              </Paragraph>

              <Card
                title="📥 Passo 1: Construir Imagem Docker"
                style={{ marginBottom: 16 }}
              >
                <Paragraph>
                  Construa a imagem Docker antes da primeira execução:
                </Paragraph>
                <Card>
                  <pre
                    style={{
                      fontSize: "14px",
                      backgroundColor: "#001529",
                      color: "#fff",
                      padding: "16px",
                      borderRadius: "4px",
                    }}
                  >
                    docker build -t phylotreeminer:latest .
                  </pre>
                </Card>
                <Alert
                  message="Atenção"
                  description="Este passo pode levar vários minutos na primeira vez enquanto o Conda baixa todas as dependências"
                  type="warning"
                  showIcon
                />
              </Card>

              <Card
                title="⚙️ Passo 2: Preparar Configuração"
                style={{ marginBottom: 16 }}
              >
                <Paragraph>
                  Edite <code>templates/config.json</code> com os parâmetros da
                  sua análise:
                </Paragraph>
                <Card>
                  <pre
                    style={{
                      fontSize: "12px",
                      backgroundColor: "#f5f5f5",
                      padding: "16px",
                      borderRadius: "4px",
                    }}
                  >
                    {`{
  "project_name": "MinhaAnalise",
  "tree_config": {
    "input_path": "./data/minhas_sequencias",
    "output_path": "./projects/MinhaAnalise/out",
    "num_threads": 4
  }
}`}
                  </pre>
                </Card>
              </Card>

              <Card
                title="🚀 Passo 3: Executar Workflow"
                style={{ marginBottom: 16 }}
              >
                <Paragraph>
                  Execute o container com montagem de volumes para acesso aos
                  dados:
                </Paragraph>

                <Title level={4}>🐧 Linux/macOS</Title>
                <Card style={{ marginBottom: 16 }}>
                  <pre
                    style={{
                      fontSize: "12px",
                      backgroundColor: "#001529",
                      color: "#fff",
                      padding: "16px",
                      borderRadius: "4px",
                    }}
                  >
                    {`docker run --rm \\
  -v "$(pwd)/data":/app/data \\
  -v "$(pwd)/projects":/app/projects \\
  -v "$(pwd)/templates/config.json":/app/templates/config.json \\
  phylotreeminer:latest`}
                  </pre>
                </Card>

                <Title level={4}>🪟 Windows PowerShell</Title>
                <Card>
                  <pre
                    style={{
                      fontSize: "12px",
                      backgroundColor: "#001529",
                      color: "#fff",
                      padding: "16px",
                      borderRadius: "4px",
                    }}
                  >
                    {`docker run --rm \\
  -v "$(pwd)/data":/app/data \\
  -v "$(pwd)/projects":/app/projects \\
  -v "$(pwd)/templates/config.json":/app/templates/config.json \\
  phylotreeminer:latest`}
                  </pre>
                </Card>
              </Card>

              <Alert
                message="Resultados"
                description="Após execução, seus arquivos de resultado estarão disponíveis na pasta projects/ local"
                type="success"
                showIcon
              />
            </div>
          ),
        },
        localExecution: {
          title: "Local CLI Execution",
          content: (
            <div>
              <Title level={2}>💻 Execução Local via CLI</Title>

              <Alert
                message="Execução Direta sem Container"
                description="Execute o PhyloTreeMiner diretamente na sua máquina local"
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Paragraph>
                Execute o PhyloTreeMiner diretamente na sua máquina local sem
                Docker.
              </Paragraph>

              <Card title="📋 Pré-requisitos" style={{ marginBottom: 24 }}>
                <List
                  bordered
                  dataSource={[
                    "Python 3.10 ou superior",
                    "Todas as dependências do environment.yml",
                    "MAFFT, IQ-TREE, RAxML-NG instalados system-wide",
                    "Pacotes Python: Biopython, DendroPy, Pandas",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>

              <Card title="⚡ Comando de Execução" style={{ marginBottom: 16 }}>
                <Paragraph>Execute o workflow diretamente:</Paragraph>
                <Card style={{ marginBottom: 16 }}>
                  <pre
                    style={{
                      fontSize: "14px",
                      backgroundColor: "#001529",
                      color: "#fff",
                      padding: "16px",
                      borderRadius: "4px",
                    }}
                  >
                    python workflow.py --path "templates/config.json"
                  </pre>
                </Card>

                <Paragraph>Ou usando Python 3 explicitamente:</Paragraph>
                <Card>
                  <pre
                    style={{
                      fontSize: "14px",
                      backgroundColor: "#001529",
                      color: "#fff",
                      padding: "16px",
                      borderRadius: "4px",
                    }}
                  >
                    python3 workflow.py --path "templates/config.json"
                  </pre>
                </Card>
              </Card>

              <Card
                title="🔧 Configuração do Ambiente"
                style={{ marginBottom: 16 }}
              >
                <Paragraph>
                  Crie e ative o ambiente Conda a partir do environment.yml:
                </Paragraph>
                <Card>
                  <pre
                    style={{
                      fontSize: "12px",
                      backgroundColor: "#001529",
                      color: "#fff",
                      padding: "16px",
                      borderRadius: "4px",
                    }}
                  >
                    {`conda env create -f environment.yml
conda activate phylotreeminer`}
                  </pre>
                </Card>
              </Card>

              <Alert
                message="Vantagens da Execução Local"
                description={
                  <List
                    size="small"
                    dataSource={[
                      "Acesso direto a recursos do sistema",
                      "Debug mais fácil",
                      "Integração com ferramentas locais",
                      "Performance potencialmente melhor",
                    ]}
                    renderItem={(item) => <List.Item>• {item}</List.Item>}
                  />
                }
                type="info"
                showIcon
              />
            </div>
          ),
        },
        troubleshooting: {
          title: "Troubleshooting & Common Issues",
          content: (
            <div>
              <Title level={2}>🔧 Solução de Problemas</Title>

              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <Card
                    title="🐳 Problemas com Docker"
                    size="small"
                    style={{ height: "100%" }}
                  >
                    <List
                      size="small"
                      dataSource={[
                        "Erros de permissão: Garanta acesso do Docker aos diretórios montados",
                        "Memória insuficiente: Aumente alocação de memória no Docker Desktop",
                        "Falhas na construção: Verifique conexão de rede para downloads",
                        "Imagem não encontrada: Verifique nome da imagem no build",
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title="⚡ Problemas de Execução"
                    size="small"
                    style={{ height: "100%" }}
                  >
                    <List
                      size="small"
                      dataSource={[
                        "Arquivos de entrada faltando: Verifique paths no config.json",
                        "Falhas no alinhamento: Verifique formato e conteúdo do FASTA",
                        "Erros na construção de árvores: Valide resultados do alinhamento primeiro",
                        "Permissões negadas: Verifique permissões de escrita nos diretórios",
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title="🚀 Problemas de Performance"
                    size="small"
                    style={{ height: "100%" }}
                  >
                    <List
                      size="small"
                      dataSource={[
                        "Execução lenta: Aumente num_threads na configuração",
                        "Erros de memória: Reduza num_threads ou tamanho do dataset",
                        "Espaço em disco: Monitore crescimento do diretório projects/",
                        "CPU sobrecarregada: Ajuste número de threads conforme disponibilidade",
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <Text>{item}</Text>
                        </List.Item>
                      )}
                    />
                  </Card>
                </Col>
              </Row>

              <Card title="🎯 Soluções Comuns" style={{ marginBottom: 16 }}>
                <List
                  bordered
                  dataSource={[
                    "Verifique se todos os caminhos no config.json existem",
                    "Confirme que as sequências FASTA estão no formato correto",
                    "Valide permissões de leitura/escrita nos diretórios data/ e projects/",
                    "Verifique logs detalhados em projects/[nome_projeto]/out/logs/",
                    "Teste com dataset pequeno antes de executar análise completa",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>

              <Alert
                message="Dica de Debug"
                description="Sempre verifique os arquivos de log para informações detalhadas sobre erros e avisos"
                type="info"
                showIcon
              />
            </div>
          ),
        },
      },
    },
    toolsReference: {
      title: "Tools Reference",
      icon: <ToolOutlined />,
      count: 4,
      subsections: {
        alignmentTools: {
          title: "Alignment Tools",
          content: (
            <div>
              <Title level={2}>🛠️ Ferramentas de Alinhamento</Title>

              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={12}>
                  <Card
                    title="⚡ MAFFT"
                    style={{ height: "100%" }}
                    extra={<Tag color="blue">Recomendado</Tag>}
                  >
                    <Paragraph>
                      <strong>Método:</strong> Multiple alignment using fast
                      Fourier transform
                      <br />
                      <strong>Casos de Uso:</strong> Grandes conjuntos de dados,
                      execução mais rápida
                      <br />
                      <strong>Configuração:</strong> align_method: "mafft"
                    </Paragraph>
                    <Alert
                      message="Vantagens"
                      description="Velocidade superior para conjuntos grandes, boa acurácia"
                      type="success"
                      size="small"
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card title="🎯 Clustal Omega" style={{ height: "100%" }}>
                    <Paragraph>
                      <strong>Método:</strong> Progressive multiple sequence
                      alignment
                      <br />
                      <strong>Casos de Uso:</strong> Conjuntos menores, alta
                      acurácia
                      <br />
                      <strong>Configuração:</strong> align_method: "clustalw"
                    </Paragraph>
                    <Alert
                      message="Características"
                      description="Alta confiabilidade, adequado para análises precisas"
                      type="info"
                      size="small"
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        },
        treeTools: {
          title: "Tree Construction Tools",
          content: (
            <div>
              <Title level={2}>🌳 Ferramentas de Construção de Árvores</Title>

              <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <Card
                    title="📊 IQ-TREE"
                    size="small"
                    style={{ height: "100%" }}
                    extra={<Tag color="green">ML</Tag>}
                  >
                    <Paragraph>
                      <strong>Método:</strong> Maximum likelihood inference
                      <br />
                      <strong>Casos de Uso:</strong> Inferência filogenética de
                      alta acurácia
                    </Paragraph>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title="⚡ RAxML-NG"
                    size="small"
                    style={{ height: "100%" }}
                    extra={<Tag color="green">ML</Tag>}
                  >
                    <Paragraph>
                      <strong>Método:</strong> Randomized Axelerated Maximum
                      Likelihood
                      <br />
                      <strong>Casos de Uso:</strong> Análises filogenéticas em
                      larga escala
                    </Paragraph>
                  </Card>
                </Col>
                <Col span={8}>
                  <Card
                    title="🎯 Neighbor-Joining"
                    size="small"
                    style={{ height: "100%" }}
                    extra={<Tag color="orange">Distance</Tag>}
                  >
                    <Paragraph>
                      <strong>Método:</strong> Construção baseada em distância
                      <br />
                      <strong>Casos de Uso:</strong> Construção rápida, grandes
                      datasets
                      <br />
                      <strong>Configuração:</strong> construct_tree_method: "nj"
                    </Paragraph>
                  </Card>
                </Col>
              </Row>

              <Card title="📈 Comparação de Métodos">
                <List
                  dataSource={[
                    "Máxima Verossimilhança (IQ-TREE, RAxML): Alta acurácia, computacionalmente intensivo",
                    "Neighbor-Joining: Rápido, adequado para datasets grandes e análises exploratórias",
                    "UPGMA: Simples, baseado em agrupamento, útil para análises iniciais",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>{item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          ),
        },
        miningAlgorithms: {
          title: "Mining Algorithms",
          content: (
            <div>
              <Title level={2}>⛏️ Algoritmos de Mineração</Title>

              <Card
                title="⚡ Algoritmo FPMax"
                style={{ marginBottom: 24 }}
                extra={<Tag color="red">High Performance</Tag>}
              >
                <Paragraph>
                  <strong>Descrição:</strong> Algoritmo eficiente para mineração
                  de conjuntos de itens frequentes
                  <br />
                  <strong>Importância:</strong> Torna viável a comparação de
                  milhares de árvores e milhões de subárvores
                </Paragraph>

                <Alert
                  message="Desafio Computacional"
                  description="Comparar centenas ou milhares de árvores e suas milhões de subárvores possíveis é um problema NP-difícil de larga escala"
                  type="warning"
                  style={{ marginBottom: 16 }}
                />

                <Title level={4}>🎯 Por que FPMax?</Title>
                <List
                  dataSource={[
                    "Abordagem de ciência da computação de alto desempenho",
                    "Capacidade de lidar com problemas NP-difíceis",
                    "Análise concluída em tempo hábil",
                    "Eficiência em larga escala",
                  ]}
                  renderItem={(item) => (
                    <List.Item>
                      <Text>• {item}</Text>
                    </List.Item>
                  )}
                />
              </Card>
            </div>
          ),
        },
        integrationTools: {
          title: "Integration Tools",
          content: (
            <div>
              <Title level={2}>🔗 Ferramentas de Integração</Title>

              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card
                    title="🌐 Integração NCBI"
                    style={{ height: "100%" }}
                    extra={<Tag color="blue">Data Source</Tag>}
                  >
                    <Paragraph>
                      <strong>Funcionalidade:</strong> Consulta direta ao banco
                      de dados do NCBI
                      <br />
                      <strong>Vantagens:</strong> Aquisição automática e
                      enriquecimento com metadados
                    </Paragraph>
                    <List
                      size="small"
                      dataSource={[
                        "Data de coleta",
                        "Localização geográfica",
                        "Informações do gene",
                        "Metadados do organismo",
                      ]}
                      renderItem={(item) => <List.Item>• {item}</List.Item>}
                    />
                  </Card>
                </Col>
                <Col span={12}>
                  <Card
                    title="📊 Integração OWID"
                    style={{ height: "100%" }}
                    extra={<Tag color="purple">Epidemiology</Tag>}
                  >
                    <Paragraph>
                      <strong>Funcionalidade:</strong> Cruzamento com dados
                      epidemiológicos do Our World in Data
                      <br />
                      <strong>Importância:</strong> Conexão entre padrões
                      genéticos e dados do mundo real
                    </Paragraph>
                    <List
                      size="small"
                      dataSource={[
                        "Validação de impacto de variantes",
                        "Sistema de alerta precoce",
                        "Monitoramento de intervenções",
                      ]}
                      renderItem={(item) => <List.Item>• {item}</List.Item>}
                    />
                  </Card>
                </Col>
              </Row>
            </div>
          ),
        },
      },
    },
  };

  const navigateTo = (sectionKey, subsectionKey = null) => {
    if (sectionKey === "home") {
      setCurrentSection("home");
      setCurrentSubsection(null);
      setBreadcrumbPath(["Home", "PhyloTreeMiner-Docs"]);
      return;
    }

    if (
      subsectionKey &&
      documentationStructure[sectionKey]?.subsections?.[subsectionKey]
    ) {
      setCurrentSection(sectionKey);
      setCurrentSubsection(subsectionKey);
      setBreadcrumbPath([
        "Home",
        "PhyloTreeMiner-Docs",
        documentationStructure[sectionKey].title,
        documentationStructure[sectionKey].subsections[subsectionKey].title,
      ]);
    } else if (documentationStructure[sectionKey]) {
      setCurrentSection(sectionKey);
      setCurrentSubsection(null);
      setBreadcrumbPath([
        "Home",
        "PhyloTreeMiner-Docs",
        documentationStructure[sectionKey].title,
      ]);
    }
  };

  const generateMenuItems = () => {
    const items = [];

    items.push({
      key: "home",
      icon: <HomeOutlined />,
      label: "Home",
      onClick: () => navigateTo("home"),
    });

    // Seções principais
    Object.keys(documentationStructure).forEach((sectionKey) => {
      if (sectionKey !== "home") {
        const section = documentationStructure[sectionKey];

        items.push({
          key: sectionKey,
          icon: section.icon,
          label: `${section.title} (${section.count || 0})`,
          children: section.subsections
            ? Object.keys(section.subsections).map((subsectionKey) => ({
                key: `${sectionKey}-${subsectionKey}`,
                label: section.subsections[subsectionKey].title,
                onClick: () => navigateTo(sectionKey, subsectionKey),
              }))
            : [],
        });
      }
    });

    return items;
  };

  const renderContent = () => {
    if (currentSection === "home") {
      return documentationStructure.home.content;
    }

    const section = documentationStructure[currentSection];

    if (!section) {
      return (
        <div>
          <Title level={2}>Section Not Found</Title>
          <Paragraph>The requested section does not exist.</Paragraph>
        </div>
      );
    }

    if (!currentSubsection) {
      return (
        <div>
          <Title level={2}>{section.title}</Title>
          <Paragraph>Select a topic to view its content:</Paragraph>
          <List
            size="large"
            bordered
            dataSource={
              section.subsections ? Object.keys(section.subsections) : []
            }
            renderItem={(key) => (
              <List.Item
                style={{ cursor: "pointer", padding: "16px" }}
                onClick={() => navigateTo(currentSection, key)}
              >
                <FileTextOutlined
                  style={{ marginRight: "12px", color: "#1890ff" }}
                />
                <Text strong>{section.subsections[key].title}</Text>
              </List.Item>
            )}
          />
        </div>
      );
    }

    return (
      section.subsections[currentSubsection]?.content || (
        <div>
          <Title level={2}>Content Not Found</Title>
          <Paragraph>The requested content does not exist.</Paragraph>
        </div>
      )
    );
  };

  return (
    <Layout
      style={{
        maxHeight: "77vh",
        borderRadius: 8,
        backgroundColor: "#ffffff",
      }}
    >
      <Header
        style={{
          padding: "0 16px",
          backgroundColor: "#ffffff",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Space>
          <Title level={3} style={{ margin: 0 }}>
            PhyloTreeMiner Docs
          </Title>
        </Space>
      </Header>

      <Layout style={{ borderRadius: 8 }}>
        <Sider
          width={300}
          style={{ backgroundColor: "#ffffff" }}
          trigger={null}
        >
          <Menu
            mode="inline"
            defaultSelectedKeys={["home"]}
            defaultOpenKeys={["workflowGuide", "cliDockerExecution"]}
            style={{ borderRight: 0, height: "100%" }}
            items={generateMenuItems()}
          />
        </Sider>

        <Layout
          style={{
            padding: "24px",
            backgroundColor: "#F3F3F3FF",
            borderRadius: 8,
          }}
        >
          <Content
            style={{
              backgroundColor: "#ffffff",
              padding: 32,
              margin: 0,
              minHeight: 280,
              borderRadius: 8,
              overflow: 'auto',
              maxHeight:'750px',
              boxShadow:
                "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)",
            }}
          
          >
            <Breadcrumb style={{ marginBottom: "24px" }}>
              {breadcrumbPath.map((item, index) => (
                <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
              ))}
            </Breadcrumb>

            {renderContent()}
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

export default PhyloTreeMinerDocs;
