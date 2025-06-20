import { 
    Typography, Button, Space, Tag, Table, Progress, Dropdown, Menu 
} from 'antd';
import { 
    MoreOutlined,
    LoadingOutlined,
    FileOutlined
} from '@ant-design/icons';

const { Text } = Typography;

const ProjectsTableView = ({ projects, statusMap, onProjectSelect }) => {
    
    const columns = [
        {
            title: 'Nome do Projeto',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name),
            render: (text, record) => (
                <a onClick={() => onProjectSelect(record.name)}>{text}</a>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            filters: Object.entries(statusMap).map(([key, value]) => ({
                text: value.text,
                value: key,
            })),
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const statusInfo = statusMap[status] || {};
                return <Tag color={statusInfo.color} icon={statusInfo.icon}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: 'Progresso',
            key: 'progress',
            render: (record) => (
                record.status === 'running' ? <Progress percent={0}status /> 
                : record.status === 'completed' ? <Progress percent={100}status />  
                : record.status === 'failed' ? <Progress percent={100} status="exception" /> 
                : <Text type="secondary">Buscando <LoadingOutlined /></Text>
            )
        },
        {
            title: 'Iniciado em',
            dataIndex: 'last_modified',
            key: 'last_modified',
            sorter: (a, b) => new Date(a.last_modified) - new Date(b.last_modified),
            render: (date) => new Date(date).toLocaleString('pt-BR'),
        },
        {
            title: 'Input data',
            dataIndex: 'input_data',
            key: 'input_data',
            
            render: () => <Text> <FileOutlined /> Data testset </Text>,
        },
        {
            title: 'Ações',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Button type="primary" ghost onClick={() => onProjectSelect(record.name)}>
                        Detalhes
                    </Button>
                    <Dropdown overlay={
                        <Menu>
                            {/* <Menu.Item key="1">Re-executar Job</Menu.Item> */}
                            {/* <Menu.Item key="2" danger>Apagar Job</Menu.Item> */}
                        </Menu>
                    }>
                        <Button icon={<MoreOutlined />} />
                    </Dropdown>
                </Space>
            ),
        },
    ];

    return <Table columns={columns} dataSource={projects} rowKey="name" pagination={{ pageSize: 10 }} />;
};

export default ProjectsTableView;
