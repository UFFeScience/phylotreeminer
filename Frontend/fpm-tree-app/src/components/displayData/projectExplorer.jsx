import React, { useState, useEffect, useCallback } from 'react';
import {
    Layout,
    Select,
    List,
    Typography,
    Breadcrumb,
    Alert,
    Space,
    Modal,
    Spin,
    Card,
    Empty
} from 'antd';
import {
    FolderOutlined,
    FileOutlined,
    HomeOutlined
} from '@ant-design/icons';
import MSAViewer from '../../components/analysis/MSAViewer';
import PhylogeneticTreeViewer from '../../components/analysis/PhylogeneticTreeViewer';
import TableView from '../../components/common/TableView';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;


const ProjectExplorer = ({ initialProjectName = null }) => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(initialProjectName);
    const [currentPath, setCurrentPath] = useState(initialProjectName || '');

    const [directoryContent, setDirectoryContent] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [modalItem, setModalItem] = useState(null); 
    const [modalContent, setModalContent] = useState(null);
    const [modalContentType, setModalContentType] = useState(null);
    const [isModalLoading, setIsModalLoading] = useState(false);

    const API_BASE_URL = 'http://localhost:8000';

    useEffect(() => {
        const fetchProjects = async () => {
            if (initialProjectName) return;

            setIsLoading(true);
            try {
                const response = await fetch(`${API_BASE_URL}/projects`);
                if (!response.ok) throw new Error('Falha ao buscar projetos.');
                const data = await response.json();
                setProjects(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProjects();
    }, [initialProjectName]);

    const fetchDirectoryContent = useCallback(async (path) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(`${API_BASE_URL}/browse?path=${encodeURIComponent(path)}`);
            if (!response.ok) throw new Error((await response.json()).detail || 'Failed to fetch content.');
            setDirectoryContent(await response.json());
        } catch (err) {
            setError(err.message);
            setDirectoryContent([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (selectedProject) { 
            fetchDirectoryContent(currentPath);
        } else {
            setDirectoryContent([]);
        }
    }, [currentPath, selectedProject, fetchDirectoryContent]);


    const handleItemClick = async (item) => {
        if (item.type === 'directory') {
            setCurrentPath(item.path);
            return;
        }

        setModalItem(item);
        setIsModalVisible(true);
        setIsModalLoading(true);
        setModalContent(null);
        setModalContentType(null);

        try {
            const response = await fetch(`${API_BASE_URL}/file?path=${encodeURIComponent(item.path)}`);
            if (!response.ok) throw new Error(`Erro ${response.status}: ${response.statusText}`);

            if (response.headers.get("content-type")?.startsWith("image/")) {
                const blob = await response.blob();
                setModalContent(URL.createObjectURL(blob));
                setModalContentType('image');
            } else {
                const data = await response.json();
                setModalContent(data.content);
                setModalContentType(data.type);
            }
        } catch (error) {
            console.error("Falha ao carregar conteúdo do arquivo:", error);
            setModalContent(null);
            setModalContentType('error');
        } finally {
            setIsModalLoading(false);
        }
    };

    const handleProjectSelect = (projectName) => {
        setSelectedProject(projectName);
        setCurrentPath(projectName || '');
    };

    const handleBreadcrumbClick = (pathToGo) => {
        setCurrentPath(pathToGo);
    };

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setModalItem(null);
    };

    // useEffect(() => {
    //     if (!preview.visible || !preview.item) return;
    //     const isImage = /\.(jpe?g|png|gif|svg|webp)$/i.test(preview.item.name);
    //     if (!isImage) {
    //         const fetchContent = async () => {
    //             setIsPreviewLoading(true);
    //             try {
    //                 const response = await fetch(`${API_BASE_URL}/file?path=${encodeURIComponent(preview.item.path)}`);
    //                 if (!response.ok) throw new Error((await response.json()).detail || 'Falha ao buscar arquivo.');
    //                 setPreviewContent((await response.json()).content);
    //             } catch (err) { setPreviewContent(`Erro: ${err.message}`); }
    //             finally { setIsPreviewLoading(false); }
    //         };
    //         fetchContent();
    //     }


    // }, [preview]);




    const generateBreadcrumbItems = () => {
        if (!currentPath) return null;
        
        const relativePath = currentPath.replace(new RegExp(`^${selectedProject}/?`), '');
        const pathParts = relativePath.split('/').filter(Boolean);

        let accumulatedPath = selectedProject; 

        const items = pathParts.map((part, index) => {
            accumulatedPath = `${accumulatedPath}/${part}`;
            const isLast = index === pathParts.length - 1;
            const pathToNavigate = accumulatedPath; 
            return (
                <Breadcrumb.Item key={pathToNavigate}>
                    {isLast ? <span>{part}</span> : <a onClick={() => handleBreadcrumbClick(pathToNavigate)}>{part}</a>}
                </Breadcrumb.Item>
            );
        });

        return [
            <Breadcrumb.Item key="project_root">
                <a onClick={() => handleBreadcrumbClick(selectedProject)}>{selectedProject}</a>
            </Breadcrumb.Item>, 
            ...items
        ];
    };

    // const renderPreviewContent = () => {
    //     if (!preview.item) return null;
    //     if (/\.(jpe?g|png|gif|svg|webp)$/i.test(preview.item.name)) {
    //         return <img src={`${API_BASE_URL}/file?path=${encodeURIComponent(preview.item.path)}`} alt={preview.item.name} style={{ maxWidth: '100%' }} />;
    //     }
    //     const isNexus = /\.nexus$/i.test(preview.item.name);

    //     if (isNexus) {
    //         return <div>
    //             <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{previewContent}</pre>
    //             <TreeViewer content={previewContent} />
    //         </div>
    //     }
    //     return <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{previewContent}</pre>;
    // };

    const renderModalContent = () => {
        if (isModalLoading) {
            return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spin size="large" /></div>;
        }
        if (!modalContent) {
            return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Empty description="No content to display." /></div>;
        }

        const viewerContainerStyle = { height: '70vh', width: '100%' };

        switch (modalContentType) {
            case 'newick':
            case 'nexus':
                return <div style={viewerContainerStyle}><PhylogeneticTreeViewer data={modalContent} /></div>;
            case 'fasta':
            case 'clustal':
                return <div style={viewerContainerStyle}><MSAViewer data={modalContent} /></div>;
            case 'table':
                return <TableView content={modalContent} />;
            case 'json':
                return <pre style={{ maxHeight: '70vh', overflow: 'auto' }}>{JSON.stringify(JSON.parse(modalContent), null, 2)}</pre>;
            case 'image':
                return <img src={modalContent} alt={modalItem?.name} style={{ maxWidth: '100%', maxHeight: '70vh' }} />;
            case 'error':
                return <Empty description="Could not load file contents." />;
            default:
                return (
                    <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                        <Typography.Paragraph
                            style={{
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                fontFamily: 'sans-serif' // Garante a fonte normal
                            }}
                        >
                            {modalContent}
                        </Typography.Paragraph>
                    </div>
                );
        }
    };


    return (
        <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {!initialProjectName && (
                    <Select
                        showSearch
                        placeholder="Select a Project"
                        style={{ width: '100%' }}
                        value={selectedProject}
                        onChange={handleProjectSelect}
                        allowClear
                    >
                        {projects.map((proj) => <Option key={proj.name} value={proj.name}>{proj.name}</Option>)}
                    </Select>
                )}

                {selectedProject && (
                    <>
                        <Card size="small" style={{background: '#fafafa'}}>
                            <Breadcrumb separator=">">
                                <Breadcrumb.Item href="#" onClick={() => handleProjectSelect(initialProjectName)}>
                                    <HomeOutlined />
                                    <span style={{marginLeft: '8px'}}>Projects</span>
                                </Breadcrumb.Item>
                                {generateBreadcrumbItems()}
                            </Breadcrumb>
                        </Card>
                        
                        {error && <Alert message="Erro" description={error} type="error" showIcon />}
                        
                        <List
                            loading={isLoading}
                            itemLayout="horizontal"
                            dataSource={directoryContent}
                            renderItem={(item) => (
                                <List.Item onClick={() => handleItemClick(item)} style={{ cursor: 'pointer', padding: '8px' }}>
                                    <List.Item.Meta
                                        avatar={item.type === 'directory' ? <FolderOutlined /> : <FileOutlined />}
                                        title={<Typography.Text ellipsis>{item.name}</Typography.Text>}
                                    />
                                </List.Item>
                            )}
                            locale={{ emptyText: 'This folder is empty.' }}
                            style={{ maxHeight: '50vh', overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: '8px', padding: '8px' }}
                        />
                    </>
                )}
            </Space>


            <Modal
                title={modalItem ? `Viewing: ${modalItem.name}` : ''}
                open={isModalVisible}
                onCancel={handleCloseModal}
                footer={null}
                width="80vw"
                destroyOnClose
            >
                {renderModalContent()}
            </Modal>

        </Card>
    );

};
export default ProjectExplorer;