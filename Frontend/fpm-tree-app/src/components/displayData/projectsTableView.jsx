import {
    Typography, Button, Space, Tag, Table, Progress, Dropdown, Menu,
    Empty
} from 'antd';
import {
    MoreOutlined,
    LoadingOutlined,
    FileOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Text } = Typography;

const ProjectsTableView = ({ projects, statusMap, onProjectSelect }) => {

    if (projects.length === 0) {
        const navigate = useNavigate();
        return (
            <Empty
                description={
                    <Typography.Text>
                        No projects found. Start a new project.
                    </Typography.Text>
                }
            >
                <Button type='primary' onClick={() => { navigate('/workflow'); }}>Create Now</Button>
            </Empty>
        );
    };

    const progress_percent = {
        "Construction of distance matrix.": 14.0,
        "Tree Construction with parsimony method.": 24.8,
        "Tree Construction with distance matrix.": 40.0,
        "Construction of Subtrees.": 80.5,
        "Frequent subtree mining.": 95.2,
        "Completed successfully!": 100
    }


    const columns = [
        {
            title: 'Project Name',
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
            sorter: (a, b) => a.status.localeCompare(b.status),
            onFilter: (value, record) => record.status === value,
            render: (status) => {
                const statusInfo = statusMap[status] || {};
                return <Tag color={statusInfo.color} icon={statusInfo.icon}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: 'Progress',
            key: 'progress',
            render: (record) => (
                record.status === 'running' ? <Progress percent={progress_percent[record.details?.current_step]} status />
                    : record.status === 'completed' ? <Progress percent={100} status />
                        : record.status === 'failed' ? <Progress percent={100} status="exception" />
                            : <Text type="secondary">Loading <LoadingOutlined /></Text>
            )
        },
        {
            title: 'Last Modified',
            dataIndex: 'last_modified',
            key: 'last_modified',
            sorter: (a, b) => new Date(a.last_modified) - new Date(b.last_modified),
            render: (date) => new Date(date).toLocaleString('pt-BR'),
        },
        {
            title: 'Duration',
            dataIndex: 'duration',
            key: 'duration',
            sorter: (a, b) => (a.duration || 0) - (b.duration || 0),
            render: (totalSeconds) => {
                if (totalSeconds === null || totalSeconds === undefined) {
                    return '—';
                }

                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const seconds = totalSeconds % 60;

                const format = (num) => String(num).padStart(2, '0');

                return `${format(hours)}:${format(minutes)}:${format(seconds)}`;
            },
        },
        {
            title: 'Input',
            key: 'input',
            render: (_, record) => (
                <Text>
                    <FileOutlined style={{ marginRight: 8 }} />
                    {record.details?.input_file || '...'}
                </Text>
            ),
        },
        {
            title: 'Current Stage',
            key: 'step',
            render: (_, record) => <Text>{record.details?.current_step || '...'}</Text>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (record) => (
                <Space>
                    <Button type="primary" ghost onClick={() => onProjectSelect(record.name)}>
                        Details
                    </Button>
                    <Dropdown overlay={
                        <Menu>
                            <Menu.Item key="1" disabled>Re-run Project</Menu.Item>
                            <Menu.Item key="2" danger disabled>Delete Project</Menu.Item>
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
