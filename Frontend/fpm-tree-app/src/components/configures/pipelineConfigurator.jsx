import { useRef, useState } from 'react';
import {
    Select, Typography, Steps, Form, InputNumber, Upload,
    Descriptions, message, Card, Row, Col, Button, Input,
    Radio, Checkbox, Divider, Tour, Flex
} from 'antd';
import {
    SettingOutlined, DatabaseOutlined, RocketOutlined, UploadOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { Option } = Select;


const PipelineConfigurator = () => {
    const [current, setCurrent] = useState(0);
    const [form] = Form.useForm();
    const [messageInfo, contextHolder] = message.useMessage();
    const navigate = useNavigate();

    const ref1 = useRef(null);
    const ref2 = useRef(null);
    const ref3 = useRef(null);
    const ref4 = useRef(null);
    const ref5 = useRef(null);
    const ref6 = useRef(null);

    const [open, setOpen] = useState(false);

    const stepsTour = [
        {
            title: 'Upload File',
            description: 'Put your files here.',
            cover: (
                <img
                    alt="tour.png"
                    src="https://user-images.githubusercontent.com/5378891/197385811-55df8480-7ff4-44bd-9d43-a7dade598d70.png"
                />
            ),
            target: () => ref1.current,
        },
        {
            title: 'Save',
            description: 'Save your changes.',
            target: () => ref2.current,
        },
        {
            title: 'Other Actions',
            description: 'Click to see other actions.',
            target: () => ref3.current,
        },
    ];



    const projectNameValue = Form.useWatch('project_name', form);
    const treeMode = Form.useWatch(['trees', 'mode'], form);
    const treeOutputFormat = Form.useWatch(['trees', 'output_format'], form) || 'nexus';
    const subtreeMinerMode = Form.useWatch(['subtrees', 'subtree_miner'], form);
    const supportFpmaxMode = Form.useWatch(['subtree_mining', 'support_fpmax'], form);

    const [pipelineData, setPipelineData] = useState({
        config: null,
        dataset: null,
    });

    const handleNext = async () => {
        if (current === 0) {
            try {
                const values = await form.validateFields();
                const finalConfig = {
                    general: {
                        project_name: values.project_name,
                        output_dir: `projects/${values.project_name}/out/`,
                        log_file: `projects/${values.project_name}/out/outputs/log_setup_${new Date().toISOString().split('T')[0]}.log`,
                    },
                    trees: values.trees,
                    subtrees: {
                        ...(values.subtrees || {}),
                        input_format: values.trees?.output_format || 'nexus',
                    },
                    subtree_mining: values.subtree_mining,
                };
                finalConfig.subtrees.input_format = finalConfig.trees.output_format;

                setPipelineData(prev => ({ ...prev, config: finalConfig }));
                setCurrent(current + 1);
            } catch (errorInfo) {
                console.log('Falha na validação:', errorInfo);
            }
        } else if (current === 1) {
            if (!pipelineData.dataset) {
                messageInfo.error('Por favor, selecione ou envie um arquivo de dataset.',);
                return;
            }
            setCurrent(current + 1);
        }
    };

    const handlePrev = () => setCurrent(current - 1);

    const handleStartWorkflow = () => {
        const finalPayload = convertToFinalFormat(pipelineData);
        console.log("Iniciando Workflow com os seguintes dados:", JSON.stringify(finalPayload, null, 2));
        messageInfo.success('Workflow iniciado! Veja o progresso na aba "Jobs".');
        navigate('/projects');
    };


    const convertToFinalFormat = (pipelineData) => {
        const { config = {}, dataset = {} } = pipelineData || {};
        const {
            general = {},
            trees = {},
            subtrees = {},
            subtree_mining = {}
        } = config;

        const projectName = general.project_name || 'default_project';
        const outputPath = `./projects/#1/out`;

        const finalFormat = {

            log_file: true,
            project_name: projectName,
            output_log: outputPath,

            tree_config: {
                mode: trees.mode ?? 'auto',
                ignore_mode: Array.isArray(trees.ignore_mode) ? trees.ignore_mode.join(',') : '',
                construct_tree_method: trees.distance_method === 'Neighbor-Joining  (NJ)' ? 'nj' : trees.distance_method,
                align_method: trees.alignment_method ?? 'mafft',
                input_path: `./data/${dataset.name || 'unknown_dataset.fasta'}`,
                output_path: `${outputPath}`,
                output_format: trees.output_format ?? 'nexus',
            },

            subtree_config: {
                construct_tree_method: subtrees.method ?? 'parsimony',
                input_path: `${outputPath}/Trees`,
                output_path: `${outputPath}`,
                input_format: subtrees.input_format ?? 'nexus',
                output_format: subtrees.output_format ?? 'nexus',
                resume_infos: subtrees.resume_infos ?? false,
                save_metadata: subtrees.save_metadata ?? false,
                subtree_miner: subtrees.subtree_miner ?? false,
            }
        };

        if (finalFormat.subtree_config.subtree_miner === true) {
            finalFormat.subtree_config.subtree_miner_configs = {
                mode: subtree_mining.mode ?? 'OFST',
                save_fpmax: subtree_mining.save_fpmax ?? false,
                output_path: `${outputPath}`,

                support_fpmax: subtree_mining.support_fpmax ?? 'auto',
            };
        }

        return finalFormat;
    };

    const renderConfigValue = (value) => {
        if (typeof value === 'boolean') {
            return value ? 'Sim' : 'Não';
        }
        if (typeof value === 'object' && value !== null) {
            // return <pre style={{ margin: 0 }}>{JSON.stringify(value, null, 4)}</pre>;
            const datas = JSON.stringify(value, null, 4);
            const formattedDatas = Object.entries(value).map(([label, children], index) => {
                return {
                    key: String(index + 1),
                    label: label,
                    children: children,
                };
            });
            return (
                <Descriptions
                    column={1}
                    bordered
                    size="small"
                    style={{ padding: '8px', marginTop: '8px' }}
                >
                    {formattedDatas.map(item => (
                        <Descriptions.Item key={item.key} label={item.label}>
                            {item.children}
                        </Descriptions.Item>
                    ))}
                </Descriptions>
            );
        }
        return value || 'Não definido';
    };


    const steps = [
        {
            title: '1. Configuração do Workflow',
            status: current === 0 ? 'process' : 'wait',
            description: 'Defina os parâmetros da execução.',
            icon: <SettingOutlined />,
            content: (
                <Form form={form} layout="vertical" name="pipeline_config">
                    <Divider ref={ref1} orientation="left" style={{ color: '#ADADADFF' }}>Configurações de Construção de Árvores</Divider>

                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} >
                        <Col span={8}>

                            <Form.Item name="project_name" label="Nome do Projeto" rules={[{ required: true, message: 'Por favor, insira o nome do projeto!' }]}>
                                <Input placeholder="Ex: Analise_Zika_Global" />
                            </Form.Item>
                        </Col>
                        <Col span={8}>

                            <Form.Item label="Arquivo de Log (Gerado Automaticamente)">
                                <Input value={projectNameValue ? `projects/${projectNameValue}/out/outputs/log_setup_${new Date().toISOString().split('T')[0]}.log` : ''} disabled />
                            </Form.Item>
                        </Col>

                        <Col span={8}>

                            <Form.Item name={['trees', 'mode']} label="Modo de Construção" initialValue="auto">
                                <Radio.Group>
                                    <Radio value="auto">Automático (todas as combinações)</Radio>
                                    <Radio value="manual">Manual</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>


                    {treeMode === 'manual' && (
                        <Row gutter={24}>
                            <Col span={6}>
                                <Form.Item name={['trees', 'distance_method']} label="Método de Construção" initialValue="Neighbor-Joining  (NJ)">
                                    <Select>
                                        <Option value="nj"> Neighbor-Joining  (NJ)</Option>
                                        <Option value="upgma">UPGMA</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}><Form.Item name={['trees', 'alignment_method']} label="Método de Alinhamento" initialValue="MAFFT">
                                <Select>
                                    <Option value="mafft">MAFFT</Option>
                                    <Option value="clustalw">ClustalW</Option>
                                </Select>
                            </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name={['trees', 'output_format']} label="Formato de Saída" initialValue="nexus">
                                    <Select><Option value="nexus">Nexus (.nexus)</Option><Option value="nwk">Newick (.nwk)</Option></Select>
                                </Form.Item>
                            </Col>
                            <Col span={6}>
                                <Form.Item name={['trees', 'ignore_mode']} label="Ignorar Métodos (Opcional)" initialValue="Parsimônia">
                                    <Select mode="multiple" placeholder="Selecione métodos a ignorar no modo auto" allowClear>
                                        <Option value="clustalw">ClustalW</Option>
                                        <Option value="parsimony">Parsimônia</Option>
                                    </Select>
                                </Form.Item>
                            </Col>
                        </Row>
                    )}

                    <Divider ref={ref2} orientation="left" style={{ color: '#ADADADFF' }}>Configurações de Construção de Subárvores</Divider>

                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} >
                        <Col span={8}>
                            <Form.Item name={['subtrees', 'method']} label="Método de Construção" initialValue="parsimony">
                                <Select>
                                    <Option value="nj"> Neighbor-Joining  (NJ) </Option>
                                    <Option value="clustalw">ClustalW</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={8}>

                            <Form.Item label="Formato de Entrada">
                                <Input value={treeOutputFormat} disabled />
                            </Form.Item>
                        </Col>
                        <Col span={8}>
                            <Form.Item name={['subtrees', 'output_format']} label="Formato de Saída" initialValue="nexus">
                                <Select><Option value="nexus">Nexus (.nexus)</Option><Option value="nwk">Newick (.nwk)</Option></Select>
                            </Form.Item>

                        </Col>
                    </Row>

                    <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} >
                        <Col span={8}>

                            <Form.Item name={['subtrees', 'resume_infos']} valuePropName="checked" initialValue={true}>
                                <Checkbox> Salvar Metadados das Subárvores</Checkbox>
                            </Form.Item>
                        </Col>
                        <Col span={8}>

                            <Form.Item name={['subtrees', 'save_metadata']} valuePropName="checked" initialValue={true}>
                                <Checkbox > Salvar Metadados em JSON</Checkbox>
                            </Form.Item>
                        </Col>

                        <Col span={8}><Form.Item name={['subtrees', 'subtree_miner']} valuePropName="checked" initialValue={true}><Checkbox>Executar Mineração de Subárvores</Checkbox></Form.Item></Col>
                    </Row>
                    {subtreeMinerMode &&
                        (
                            <div>

                                <Divider ref={ref3} orientation="left" style={{ color: '#ADADADFF' }}>Configurações de Mineração de Subárvores</Divider>

                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} >
                                    <Col span={8}>
                                        <Form.Item name={['subtree_mining', 'mode']} label="Modo de Mineração" initialValue="distance">
                                            <Select>
                                                <Option value="OFST">OFST (Only of the Same Tree)</Option>
                                                <Option value="distance">Distância</Option>
                                                <Option value="parsimony">Parsimônia</Option>
                                            </Select>
                                        </Form.Item>

                                    </Col>
                                    <Col span={8}>

                                        <Form.Item name={['subtree_mining', 'save_fpmax']} label="Mineração de Subárvores Frequêntes" valuePropName="checked" initialValue={true}>
                                            <Checkbox onChange={{}}> Salvar Resultados FPMAX</Checkbox>
                                        </Form.Item>

                                    </Col>
                                </Row>

                                <Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }} >
                                    <Col span={8}>

                                        <Form.Item name={['subtree_mining', 'support_fpmax']} label="Suporte FPMAX" initialValue="auto">
                                            <Radio.Group>
                                                <Radio value="auto">Automático (0.1 a 1.0)</Radio>
                                                <Radio value="manual">Manual</Radio>
                                            </Radio.Group>
                                        </Form.Item>
                                    </Col>
                                    <Col span={8}>

                                        {supportFpmaxMode === 'manual' && (
                                            <Form.Item name={['subtree_mining', 'support_value']} label="Valor do Suporte">
                                                <InputNumber min={0.1} max={1.0} step={0.1} style={{ width: '100%' }} />
                                            </Form.Item>
                                        )}
                                    </Col>
                                </Row>
                            </div>
                        )
                    }
                </Form>
            )
        },
        {
            title: '2. Seleção do Dataset',
            status: current === 1 ? 'process' : 'wait',
            description: 'Escolha um dataset existente ou envie um novo.',
            icon: <DatabaseOutlined />,
            content: (
                <Card title="Fonte de Dados das Sequências">
                    <Select
                        placeholder="Selecione um dataset existente (Exemplo)"
                        style={{ width: '100%', marginBottom: 24 }}
                        onChange={(value) => setPipelineData(prev => ({ ...prev, dataset: { name: value } }))}>
                        <Option value="zika_virus_americas.fasta">zika_virus_americas.fasta</Option>
                        <Option value="dengue_type2_asia.fasta">dengue_type2_asia.fasta</Option>
                    </Select>

                    <Text strong>OU</Text>

                    <Upload.Dragger
                        name="file"
                        multiple={false}
                        style={{ marginTop: 16 }}
                        beforeUpload={(file) => {
                            setPipelineData(prev => ({ ...prev, dataset: file }));
                            message.success(`${file.name} selecionado com sucesso.`);
                            return false;
                        }}
                        onRemove={() => setPipelineData(prev => ({ ...prev, dataset: null }))}
                    >
                        <p className="ant-upload-drag-icon"><UploadOutlined /></p>
                        <p className="ant-upload-text">Clique ou arraste o arquivo .fasta para esta área</p>
                    </Upload.Dragger>
                </Card>
            ),
        },
        {
            title: '3. Revisão e Início',
            status: current === 2 ? 'process' : 'wait',
            description: 'Confirme os dados e inicie a execução.',
            icon: <RocketOutlined />,
            content: (
                <Card>
                    <Title level={5}>Revise as Configurações Finais</Title>
                    {pipelineData.config && (
                        <Descriptions title="Configuração do Workflow" bordered column={1} size="small">
                            {Object.entries(pipelineData.config).map(([key, value]) => (
                                <Descriptions.Item key={key} label={key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}>
                                    {renderConfigValue(value)}
                                </Descriptions.Item>
                            ))}
                        </Descriptions>
                    )}
                    {pipelineData.dataset && (
                        <Descriptions title="Dataset" bordered column={1} size="small" style={{ marginTop: 24 }}>
                            <Descriptions.Item label="Arquivo Selecionado">{pipelineData.dataset.name}</Descriptions.Item>
                            {pipelineData.dataset.size && <Descriptions.Item label="Tamanho">{`${(pipelineData.dataset.size / 1024).toFixed(2)} KB`}</Descriptions.Item>}
                        </Descriptions>
                    )}
                </Card>
            ),
        }

    ]

    return (
        <>
            {contextHolder}
            <div
                style={{
                    borderRadius: 8,
                    backgroundColor: '#ffffff',
                    padding: 24
                }}
            >
                <Flex justify='space-between'>

                    <Title level={3}>Configurações do workflow</Title>
                    <Button type="dashed" onClick={() => setOpen(!open)}>
                        Tutorial de execução
                    </Button>
                </Flex>
                <Tour open={open} onClose={() => setOpen(!open)} steps={stepsTour} />

                <Row gutter={32} style={{
                    backgroundColor: '#fff',
                    borderRadius: 8,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    margin: '24px 0',
                    minHeight: '70vh'
                }}>
                    <Col xs={24} md={8} lg={6} style={{
                        backgroundColor: '#E0ECFF96',
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                        padding: 32,
                    }}>
                        <Title level={4} style={{ color: '#000000A8' }}>Passos</Title>
                        <Steps current={current} direction="vertical" items={steps.map(s => ({ title: s.title, description: s.description, status: s.status, icon: s.icon }))} />
                    </Col>
                    <Col xs={24} md={16} lg={18} style={{
                        padding: 32,

                    }}>
                        <div style={{ marginBottom: 64 }} >{steps[current].content}</div>
                        <div style={{ marginTop: 24 }}>
                            {current > 0 && (<Button style={{ margin: '0 8px' }} onClick={handlePrev}>Anterior</Button>)}
                            {current < steps.length - 1 && (<Button type="primary" onClick={handleNext}>Próximo</Button>)}
                            {current === steps.length - 1 && (<Button type="primary" icon={<RocketOutlined />} onClick={handleStartWorkflow} disabled={!pipelineData.config || !pipelineData.dataset}>Iniciar Workflow</Button>)}
                        </div>
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default PipelineConfigurator;