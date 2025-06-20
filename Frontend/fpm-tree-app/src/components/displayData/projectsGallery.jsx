import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, Row, Col, Typography, Button, Space, Select, Input, Alert, 
    Spin, Tag, Empty, Segmented, Table, Progress, Dropdown, Menu 
} from 'antd';
import { 
    CheckCircleOutlined, SyncOutlined, ClockCircleOutlined, CloseCircleOutlined, 
    FilterOutlined, AppstoreOutlined, TableOutlined, MoreOutlined 
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

import ProjectsCardsView from './projectsCardsView';
import ProjectsTableView from './projectsTableView';

const ProjectGallery = ({ onProjectSelect }) => {
    const [projects, setProjects] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    
    const [viewMode, setViewMode] = useState('table');

    const API_BASE_URL = 'http://localhost:8000';

    const fetchJobsData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [projectsRes, statusRes] = await Promise.all([
                fetch(`${API_BASE_URL}/projects`),
                fetch(`${API_BASE_URL}/projects/status`)
            ]);
            if (!projectsRes.ok || !statusRes.ok) throw new Error("Falha ao carregar dados dos jobs.");
            const projectsData = await projectsRes.json();
            const statusData = await statusRes.json();
            
            const combinedData = projectsData.map(p => ({ ...p, status: statusData[p.name] || 'idle' }));
            setProjects(combinedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchJobsData();
    }, [fetchJobsData]);

    const statusMap = {
        completed: { color: 'green', icon: <CheckCircleOutlined />, text: 'Concluído' },
        running: { color: 'blue', icon: <SyncOutlined spin />, text: 'Em Execução' },
        idle: { color: 'gold', icon: <ClockCircleOutlined />, text: 'Aguardando' },
        failed: { color: 'red', icon: <CloseCircleOutlined />, text: 'Falha' } 
    };
    
    const filteredProjects = projects.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        (statusFilter === 'all' || p.status === statusFilter)
    );

    return (
        <div>
            <Title level={3}>Projetos Recentes</Title>
            <Card style={{marginBottom: 24}}>
                <Space direction="vertical" style={{width: '100%'}} size="middle">
                    <Row justify="space-between" align="middle" gutter={[16, 16]}>
                        <Col flex="auto"><Search placeholder="Buscar pelo nome do job..." onChange={(e) => setSearchTerm(e.target.value)} /></Col>
                        <Col><Space><FilterOutlined /><Select defaultValue="all" style={{ width: 150 }} onChange={(value) => setStatusFilter(value)}><Option value="all">Todos</Option><Option value="running">Em Execução</Option><Option value="completed">Concluído</Option><Option value="idle">Aguardando</Option></Select></Space></Col>
                    <Segmented 
                        options={[
                            { label: 'Tabela', value: 'table', icon: <TableOutlined /> },
                            { label: 'Cards', value: 'cards', icon: <AppstoreOutlined /> },
                        ]} 
                        value={viewMode} 
                        onChange={setViewMode} 
                        style={{
                            marRginTop: 20,
                        }}
                    />
                    </Row>
                </Space>
            </Card>

            {isLoading && <div style={{textAlign: 'center', padding: 50}}><Spin size="large"/></div>}
            {error && <Alert message="Erro" description={error} type="error" showIcon />}
            
            {!isLoading && !error && (
                viewMode === 'cards' ? (
                    <ProjectsCardsView projects={filteredProjects} statusMap={statusMap} onProjectSelect={onProjectSelect} />
                ) : (
                    <ProjectsTableView projects={filteredProjects} statusMap={statusMap} onProjectSelect={onProjectSelect} />
                )
            )}
        </div>
    );
};

export default ProjectGallery;