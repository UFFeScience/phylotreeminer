import React, { useState } from 'react';
import {
  Layout,
  Menu,
  Typography,
  Divider,
  Input,
  List,
  Breadcrumb,
  Button,
  Space,
  Card
} from 'antd';
import {
  HomeOutlined,
  SearchOutlined,
  FileTextOutlined,
  BookOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Search } = Input;

const PhyloTreeMinerDocs = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentSection, setCurrentSection] = useState('home');
  const [currentSubsection, setCurrentSubsection] = useState(null);
  const [breadcrumbPath, setBreadcrumbPath] = useState(['Home', 'PhyloTreeMiner-Docs']);

  // Estrutura completa da documentação - centralizada e dinâmica
  const documentationStructure = {
    home: {
      title: "PhyloTreeMiner Docs",
      icon: <HomeOutlined />,
      content: (
        <div>
          <Title level={2}>Bem-vindo à Documentação do PhyloTreeMiner</Title>
          <Paragraph>
            PhyloTreeMiner é uma plataforma de orquestração de workflows científicos projetada para executar
            cargas de trabalho complexas em diversos ambientes, desde Kubernetes local até supercomputadores.
          </Paragraph>
          <Divider />
          <Title level={3}>Comece por aqui</Title>
          <List
            size="large"
            dataSource={[
              'Configuração local com Kubernetes (Docker Desktop)',
              'Configuração com Singularity',
              'Como contribuir para o projeto'
            ]}
            renderItem={(item) => (
              <List.Item>
                <Text>{item}</Text>
              </List.Item>
            )}
          />
        </div>
      )
    },
    gettingStarted: {
      title: "Getting started",
      icon: <BookOutlined />,
      count: 3,
      subsections: {
        kubernetesSetup: {
          title: "PhyloTreeMiner Setup Guide: Kubernetes Local Setup (Docker Desktop)",
          content: (
            <div>
              <Title level={2}>PhyloTreeMiner Setup Guide: Kubernetes Local Setup (Docker Desktop)</Title>
              <Paragraph>
                This guide provides step-by-step instructions for setting up PhyloTreeMiner using <strong>Docker Desktop with Kubernetes</strong>. 
                This is one of several deployment options for PhyloTreeMiner, specifically tailored for developers and users who prefer using 
                Docker Desktop's built-in Kubernetes for local development and testing.
              </Paragraph>
              
              <div style={{ margin: '16px 0', padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                <Text>
                  <strong>Note:</strong> This guide focuses solely on the Docker Desktop with Kubernetes setup option. 
                  PhyloTreeMiner supports multiple runtime environments, including SDumont Supercomputer, Singularity, and other 
                  Kubernetes distributions. For those alternative deployment options, please refer to the appropriate documentation.
                </Text>
              </div>
              
              <Divider />
              
              <Title level={3}>Requirements</Title>
              
              <List
                size="large"
                bordered
                dataSource={[
                  'Docker Desktop: Download and install Docker Desktop from Docker\'s official website. Ensure Kubernetes is enabled in Docker Desktop (instructions provided below).',
                  'kubectl CLT: Install kubectl to interact with the Kubernetes cluster. Installation guide: Kubernetes CLT installation.',
                  'PhyloTreeMiner Release Client: Download the PhyloTreeMiner client from the official GitHub releases: PhyloTreeMiner Releases.',
                  'System Resources: Minimum 4 CPUs and 4GB RAM allocated to Docker Desktop for Kubernetes. Storage requirements depend on the workflows you plan to execute.'
                ]}
                renderItem={(item, index) => (
                  <List.Item>
                    <Text strong>{index + 1}. </Text>
                    {item}
                  </List.Item>
                )}
              />
            </div>
          )
        },
        contributing: {
          title: "Contributing to PhyloTreeMiner",
          content: (
            <div>
              <Title level={2}>Contributing to PhyloTreeMiner</Title>
              <Paragraph>
                PhyloTreeMiner is an open-source project and we welcome contributions from the community. 
                This guide will help you get started with contributing to the project.
              </Paragraph>
              
              <Title level={3}>How to Contribute</Title>
              <List
                bordered
                dataSource={[
                  'Report bugs and issues',
                  'Suggest new features',
                  'Improve documentation',
                  'Submit pull requests'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
              
              <Title level={3}>Development Setup</Title>
              <Paragraph>
                To set up your development environment, follow the standard setup guide but use the development branch instead of the stable release.
              </Paragraph>
            </div>
          )
        },
        singularitySetup: {
          title: "PhyloTreeMiner Setup Guide: Singularity Local Setup",
          content: (
            <div>
              <Title level={2}>PhyloTreeMiner Setup Guide: Singularity Local Setup</Title>
              <Paragraph>
                This guide provides instructions for setting up PhyloTreeMiner using Singularity containers for environments where Docker is not available or suitable.
              </Paragraph>
              
              <Title level={3}>Prerequisites</Title>
              <List
                bordered
                dataSource={[
                  'Singularity installed on your system',
                  'Basic understanding of container concepts',
                  'PhyloTreeMiner singularity image downloaded'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            </div>
          )
        }
      }
    },
    gettingStarted_1: {
      title: "Getting started 2",
      icon: <BookOutlined />,
      count: 3,
      subsections: {
        kubernetesSetup: {
          title: "PhyloTreeMiner Setup Guide: Kubernetes Local Setup (Docker Desktop)",
          content: (
            <div>
              <Title level={2}>PhyloTreeMiner Setup Guide: Kubernetes Local Setup (Docker Desktop)</Title>
              <Paragraph>
                This guide provides step-by-step instructions for setting up PhyloTreeMiner using <strong>Docker Desktop with Kubernetes</strong>. 
                This is one of several deployment options for PhyloTreeMiner, specifically tailored for developers and users who prefer using 
                Docker Desktop's built-in Kubernetes for local development and testing.
              </Paragraph>
              
              <div style={{ margin: '16px 0', padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
                <Text>
                  <strong>Note:</strong> This guide focuses solely on the Docker Desktop with Kubernetes setup option. 
                  PhyloTreeMiner supports multiple runtime environments, including SDumont Supercomputer, Singularity, and other 
                  Kubernetes distributions. For those alternative deployment options, please refer to the appropriate documentation.
                </Text>
              </div>
              
              <Divider />
              
              <Title level={3}>Requirements</Title>
              
              <List
                size="large"
                bordered
                dataSource={[
                  'Docker Desktop: Download and install Docker Desktop from Docker\'s official website. Ensure Kubernetes is enabled in Docker Desktop (instructions provided below).',
                  'kubectl CLT: Install kubectl to interact with the Kubernetes cluster. Installation guide: Kubernetes CLT installation.',
                  'PhyloTreeMiner Release Client: Download the PhyloTreeMiner client from the official GitHub releases: PhyloTreeMiner Releases.',
                  'System Resources: Minimum 4 CPUs and 4GB RAM allocated to Docker Desktop for Kubernetes. Storage requirements depend on the workflows you plan to execute.'
                ]}
                renderItem={(item, index) => (
                  <List.Item>
                    <Text strong>{index + 1}. </Text>
                    {item}
                  </List.Item>
                )}
              />
            </div>
          )
        },
        contributing: {
          title: "Contributing to PhyloTreeMiner",
          content: (
            <div>
              <Title level={2}>Contributing to PhyloTreeMiner</Title>
              <Paragraph>
                PhyloTreeMiner is an open-source project and we welcome contributions from the community. 
                This guide will help you get started with contributing to the project.
              </Paragraph>
              
              <Title level={3}>How to Contribute</Title>
              <List
                bordered
                dataSource={[
                  'Report bugs and issues',
                  'Suggest new features',
                  'Improve documentation',
                  'Submit pull requests'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
              
              <Title level={3}>Development Setup</Title>
              <Paragraph>
                To set up your development environment, follow the standard setup guide but use the development branch instead of the stable release.
              </Paragraph>
            </div>
          )
        },
        singularitySetup: {
          title: "PhyloTreeMiner Setup Guide: Singularity Local Setup",
          content: (
            <div>
              <Title level={2}>PhyloTreeMiner Setup Guide: Singularity Local Setup</Title>
              <Paragraph>
                This guide provides instructions for setting up PhyloTreeMiner using Singularity containers for environments where Docker is not available or suitable.
              </Paragraph>
              
              <Title level={3}>Prerequisites</Title>
              <List
                bordered
                dataSource={[
                  'Singularity installed on your system',
                  'Basic understanding of container concepts',
                  'PhyloTreeMiner singularity image downloaded'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            </div>
          )
        }
      }
    },
    PhyloTreeMiner: {
      title: "PhyloTreeMiner",
      icon: <FileTextOutlined />,
      count: 4,
      subsections: {
        whatIs: {
          title: "What is PhyloTreeMiner?",
          content: (
            <div>
              <Title level={2}>What is PhyloTreeMiner?</Title>
              <Paragraph>
                PhyloTreeMiner is a workflow management system designed specifically for scientific computing environments. 
                It provides a flexible and scalable way to define, execute, and monitor complex computational workflows.
              </Paragraph>
              
              <Title level={3}>Key Features</Title>
              <List
                bordered
                dataSource={[
                  'Multi-environment support (Kubernetes, Singularity, HPC)',
                  'Visual workflow editor',
                  'Extensive monitoring and logging',
                  'Reproducible research capabilities'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            </div>
          )
        },
        workflowActivities: {
          title: "Workflow & Activities",
          content: (
            <div>
              <Title level={2}>Workflow & Activities</Title>
              <Paragraph>
                In PhyloTreeMiner, a workflow is a directed acyclic graph (DAG) of activities. Each activity represents a computational task that needs to be executed.
              </Paragraph>
              
              <Title level={3}>Activity Types</Title>
              <List
                bordered
                dataSource={[
                  'Container-based activities',
                  'Script activities',
                  'Data processing activities',
                  'Conditional activities'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            </div>
          )
        },
        workflowSpecification: {
          title: "Workflow Specification",
          content: (
            <div>
              <Title level={2}>Workflow Specification</Title>
              <Paragraph>
                PhyloTreeMiner uses a YAML-based specification to define workflows. This specification describes the structure of the workflow, its activities, and their dependencies.
              </Paragraph>
              
              <Title level={3}>Basic Structure</Title>
              <Card>
                <pre>
{`name: my-workflow
activities:
  - name: data-preprocessing
    type: container
    image: preprocess:latest
  - name: analysis
    type: container
    image: analyze:latest
    dependsOn: [data-preprocessing]`}
                </pre>
              </Card>
            </div>
          )
        },
        integration: {
          title: "Integration with PhyloTreeMiner",
          content: (
            <div>
              <Title level={2}>Integration with PhyloTreeMiner</Title>
              <Paragraph>
                PhyloTreeMiner provides several integration points for connecting with external systems and services.
              </Paragraph>
              
              <Title level={3}>Supported Integrations</Title>
              <List
                bordered
                dataSource={[
                  'REST API for programmatic control',
                  'CLI for command-line interaction',
                  'Web UI for visual management',
                  'Webhooks for event-driven automation'
                ]}
                renderItem={(item) => (
                  <List.Item>
                    {item}
                  </List.Item>
                )}
              />
            </div>
          )
        }
      }
    }
  };

  const navigateTo = (sectionKey, subsectionKey = null) => {
    if (sectionKey === 'home') {
      setCurrentSection('home');
      setCurrentSubsection(null);
      setBreadcrumbPath(['Home', 'PhyloTreeMiner-Docs']);
      return;
    }

    if (subsectionKey) {
      setCurrentSection(sectionKey);
      setCurrentSubsection(subsectionKey);
      setBreadcrumbPath([
        'Home', 
        'PhyloTreeMiner-Docs', 
        documentationStructure[sectionKey].title, 
        documentationStructure[sectionKey].subsections[subsectionKey].title
      ]);
    } else {
      setCurrentSection(sectionKey);
      setCurrentSubsection(null);
      setBreadcrumbPath(['Home', 'PhyloTreeMiner-Docs', documentationStructure[sectionKey].title]);
    }
  };

  const generateMenuItems = () => {
    const items = [];
    
    items.push({
      key: 'home',
      icon: documentationStructure.home.icon,
      label: 'Home',
      onClick: () => navigateTo('home')
    });
    
    // Seções principais
    Object.keys(documentationStructure).forEach(sectionKey => {
      if (sectionKey !== 'home') {
        const section = documentationStructure[sectionKey];
        
        items.push({
          key: sectionKey,
          icon: section.icon,
          label: `${section.title} (${section.count || 0})`,
          children: section.subsections ? 
            Object.keys(section.subsections).map(subsectionKey => ({
              key: `${sectionKey}-${subsectionKey}`,
              label: section.subsections[subsectionKey].title,
              onClick: () => navigateTo(sectionKey, subsectionKey)
            })) : []
        });
      }
    });
    
    return items;
  };

  const renderContent = () => {
    if (currentSection === 'home') {
      return documentationStructure.home.content;
    }

    const section = documentationStructure[currentSection];
    
    if (!currentSubsection) {
      return (
        <div>
          <Title level={2}>{section.title}</Title>
          <Paragraph>Selecione um tópico para visualizar seu conteúdo:</Paragraph>
          <List
            size="large"
            bordered
            dataSource={section.subsections ? Object.keys(section.subsections) : []}
            renderItem={(key) => (
              <List.Item 
                style={{ cursor: 'pointer', padding: '16px' }}
                onClick={() => navigateTo(currentSection, key)}
              >
                <FileTextOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
                <Text strong>{section.subsections[key].title}</Text>
              </List.Item>
            )}
          />
        </div>
      );
    }

    return section.subsections[currentSubsection].content;
  };

  return (
    <Layout style={{ minHeight: '100vh', borderRadius: 8, backgroundColor: "#ffffff" }}>
      <Header style={{ padding: '0 16px', backgroundColor: "#ffffff", display: 'flex', alignItems: 'center' }}>
        <Space>
          {/* <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{ fontSize: '16px', width: 64, height: 64 }}
          /> */}
          <Title level={3} style={{ margin: 0 }}>PhyloTreeMiner Docs</Title>
        </Space>
        
        {/* <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Search
            placeholder="Search Knowledge Base"
            enterButton={<SearchOutlined />}
            size="middle"
            style={{ width: 300 }}
          />
        </div> */}
      </Header>
      
      <Layout style={{ borderRadius: 8 }}>
        <Sider
          // collapsible
          // collapsed={collapsed}
          // onCollapse={setCollapsed}
          width={250}
          style={{ backgroundColor: "#ffffff" }}
          trigger={null}
        >
          <Menu 
            mode="inline" 
            defaultSelectedKeys={['home']}
            defaultOpenKeys={['gettingStarted', 'PhyloTreeMiner']}
            style={{ borderRight: 0, height: '100%' }}
            items={generateMenuItems()}
          />
        </Sider>

        <Layout style={{ padding: '24px', backgroundColor: "#F3F3F3FF", borderRadius: 8 }}>
          <Content style={{ 
            backgroundColor: "#ffffff", 
            padding: 24, 
            margin: 0, 
            minHeight: 280,
            borderRadius: 8,
            boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
          }}>
            <Breadcrumb style={{ marginBottom: '24px' }}>
              {breadcrumbPath.map((item, index) => (
                <Breadcrumb.Item key={index}>
                  {item}
                </Breadcrumb.Item>
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