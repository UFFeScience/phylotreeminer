import {
    Card, Row, Col, Typography, Button, Space,
    Tag, Empty, Progress
} from 'antd';
import {
    LoadingOutlined,
    FileOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const ProjectsCardsView = ({ projects, statusMap, onProjectSelect }) => {
    return (
        <Row gutter={[12, 12]}>
            {projects.length > 0 ? projects.map(job => (
                <Col xs={10} sm={8} lg={6} key={job.name}>
                    <Card
                        hoverable
                        title={<Text ellipsis={{ tooltip: job.name }}>{job.name}</Text>}
                        extra={<Tag color={statusMap[job.status]?.color} icon={statusMap[job.status]?.icon}>{statusMap[job.status]?.text}</Tag>}
                    >
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <Row justify="space-between"><Text type="secondary">Iniciado</Text><Text>{new Date(job.last_modified).toLocaleString('pt-BR')}</Text></Row>
                            <Row justify="space-between"><Text type="secondary">Duração</Text><Text>--</Text></Row>
                            <Row justify="space-between"><Text type="secondary">Input</Text><Text><FileOutlined/> Zika 2019</Text></Row>
                            <Row justify="space-between"><Text type="secondary">Etapa</Text><Text>Alinhamento</Text></Row>
                            {
                                job.status === 'running' ? <Progress percent={0} status />
                                    : job.status === 'completed' ? <Progress percent={100} status />
                                        : job.status === 'failed' ? <Progress percent={100} status="exception" />
                                            : <Text type="secondary">Buscando <LoadingOutlined /></Text>
                            }
                        </Space>
                        <Button type="primary" ghost block style={{ marginTop: 24 }} onClick={() => onProjectSelect(job.name)}>
                            Ver Detalhes
                        </Button>
                    </Card>
                </Col>
            )) : <Col span={24} style={{ textAlign: 'center', padding: 50 }}><Empty description="Nenhum job encontrado com os filtros aplicados." /></Col>}
        </Row>
    );
};

export default ProjectsCardsView
