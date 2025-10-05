// components/analysis/AdvancedPhyloAnalysis.jsx
import React, { useState, useEffect } from 'react';
import { Card, Tabs, Table, Alert, Spin, Typography, Timeline, Tag, Space } from 'antd';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const AdvancedPhyloAnalysis = ({ projectName }) => {
  const [analysisData, setAnalysisData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalysisData();
  }, [projectName]);

  const fetchAnalysisData = async () => {
    if (!projectName) return;
    
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/advanced-analysis/${projectName}/latest`);
      if (!response.ok) throw new Error('Failed to fetch analysis data');
      
      const data = await response.json();
      setAnalysisData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" />;
  if (error) return <Alert message="Error" description={error} type="error" />;
  if (!analysisData) return <Alert message="No analysis data available" type="info" />;

  return (
    <div style={{ padding: '20px' }}>
      <Title level={3}>Advanced Phylogenetic Analysis</Title>
      
      <Tabs defaultActiveKey="divergence">
        <TabPane tab="Divergence Dating" key="divergence">
          <DivergenceAnalysis data={analysisData.analyses?.divergence_dating} />
        </TabPane>
        
        <TabPane tab="Mutation Analysis" key="mutation">
          <MutationAnalysis data={analysisData.analyses?.mutation_analysis} />
        </TabPane>
        
        <TabPane tab="Recombination" key="recombination">
          <RecombinationAnalysis data={analysisData.analyses?.recombination_analysis} />
        </TabPane>
        
        <TabPane tab="Phenotype Correlation" key="correlation">
          <PhenotypeAnalysis data={analysisData.analyses?.phenotype_correlation} />
        </TabPane>
      </Tabs>
    </div>
  );
};

// Subcomponentes para cada tipo de análise
const DivergenceAnalysis = ({ data }) => (
  <Card title="Divergence Events">
    <Timeline>
      {data?.map((event, index) => (
        <Timeline.Item key={index}>
          <Space direction="vertical">
            <Text strong>{event.years_ago.toFixed(1)} years ago</Text>
            <Text>{event.clade} diverged from {event.diverged_from}</Text>
            <Tag color={event.confidence > 0.9 ? 'green' : 'orange'}>
              Confidence: {(event.confidence * 100).toFixed(1)}%
            </Tag>
          </Space>
        </Timeline.Item>
      ))}
    </Timeline>
  </Card>
);

const MutationAnalysis = ({ data }) => (
  <Card title="Significant Mutations">
    <Table
      columns={[
        { title: 'Gene', dataIndex: 'gene', key: 'gene' },
        { title: 'Position', dataIndex: 'position', key: 'position' },
        { title: 'Mutation', dataIndex: 'mutation', key: 'mutation' },
        { title: 'Clade', dataIndex: 'clade', key: 'clade' },
        { title: 'Prevalence', dataIndex: 'prevalence', key: 'prevalence', 
          render: (val) => `${(val * 100).toFixed(1)}%` },
        { title: 'Impact', dataIndex: 'functional_impact', key: 'impact' }
      ]}
      dataSource={data}
      pagination={{ pageSize: 10 }}
    />
  </Card>
);

const RecombinationAnalysis = ({ data }) => (
  <Card title="Recombination Events">
    <Table
      columns={[
        { 
          title: 'Breakpoints', 
          dataIndex: 'breakpoints', 
          key: 'breakpoints',
          render: (_, record) => `${record.breakpoint_start} - ${record.breakpoint_end}`
        },
        { 
          title: 'Parents', 
          dataIndex: 'parents', 
          key: 'parents',
          render: (_, record) => `${record.major_parent} + ${record.minor_parent}`
        },
        { 
          title: 'Confidence', 
          dataIndex: 'confidence', 
          key: 'confidence',
          render: (val) => (
            <Tag color={val > 0.95 ? 'green' : val > 0.8 ? 'orange' : 'red'}>
              {(val * 100).toFixed(1)}%
            </Tag>
          )
        },
        { 
          title: 'Bootstrap', 
          dataIndex: 'bootstrap_support', 
          key: 'bootstrap',
          render: (val) => val ? `${val}%` : 'N/A'
        },
        { 
          title: 'Novel Features', 
          dataIndex: 'novel_features', 
          key: 'features',
          render: (features) => features?.join(', ') || 'None'
        }
      ]}
      dataSource={data}
      pagination={{ pageSize: 5 }}
      expandedRowRender={record => (
        <div style={{ margin: 0 }}>
          <Text strong>Event Details:</Text>
          <br />
          <Text>Region: {record.breakpoint_end - record.breakpoint_start} bp</Text>
          <br />
          <Text>Confidence: {(record.confidence * 100).toFixed(1)}%</Text>
          {record.novel_features && record.novel_features.length > 0 && (
            <>
              <br />
              <Text>Novel Features: {record.novel_features.join(', ')}</Text>
            </>
          )}
        </div>
      )}
    />
  </Card>
);

const PhenotypeAnalysis = ({ data }) => {
  const [selectedTree, setSelectedTree] = useState(null);

  if (!data || Object.keys(data).length === 0) {
    return (
      <Card title="Phenotype Correlations">
        <Alert message="No phenotypic correlation data available" type="info" />
      </Card>
    );
  }

  const treeOptions = Object.keys(data).map(treeName => ({
    value: treeName,
    label: treeName
  }));

  const selectedData = selectedTree ? data[selectedTree] : data[Object.keys(data)[0]];

  return (
    <Card title="Phenotype Correlations">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {treeOptions.length > 1 && (
          <Select
            value={selectedTree || treeOptions[0]?.value}
            onChange={setSelectedTree}
            options={treeOptions}
            style={{ width: 200 }}
            placeholder="Select tree"
          />
        )}
        
        <Table
          columns={[
            { title: 'Trait', dataIndex: 'trait', key: 'trait' },
            { title: 'Clade', dataIndex: 'clade', key: 'clade' },
            { 
              title: 'Correlation', 
              dataIndex: 'correlation_strength', 
              key: 'correlation',
              render: (val) => (
                <Tag color={Math.abs(val) > 0.7 ? 'green' : Math.abs(val) > 0.4 ? 'orange' : 'blue'}>
                  {val.toFixed(3)}
                </Tag>
              )
            },
            { 
              title: 'P-value', 
              dataIndex: 'p_value', 
              key: 'p_value',
              render: (val) => (
                <Tag color={val < 0.01 ? 'red' : val < 0.05 ? 'orange' : 'green'}>
                  {val.toFixed(4)}
                </Tag>
              )
            },
            { title: 'Effect Size', dataIndex: 'effect_size', key: 'effect_size' },
            { title: 'Sample Size', dataIndex: 'sample_size', key: 'sample_size' }
          ]}
          dataSource={selectedData?.significant_correlations || []}
          pagination={{ pageSize: 10 }}
        />
      </Space>
    </Card>
  );
};

const EvolutionaryTimeline = ({ divergenceData }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);

  const timelineEvents = divergenceData
    ?.filter(event => event.years_ago > 0)
    ?.sort((a, b) => b.years_ago - a.years_ago)
    ?.map((event, index) => ({
      ...event,
      key: index,
      color: event.confidence > 0.9 ? 'green' : event.confidence > 0.7 ? 'orange' : 'red'
    }));

  return (
    <Card title="Evolutionary Timeline">
      <Row gutter={[16, 16]}>
        <Col xs={24} md={16}>
          <Timeline mode="alternate">
            {timelineEvents?.slice(0, 10).map(event => (
              <Timeline.Item
                key={event.key}
                color={event.color}
                label={`${event.years_ago.toFixed(1)} years ago`}
              >
                <div 
                  style={{ 
                    cursor: 'pointer', 
                    padding: '8px',
                    backgroundColor: selectedEvent?.key === event.key ? '#f0f8ff' : 'transparent',
                    borderRadius: '4px'
                  }}
                  onClick={() => setSelectedEvent(event)}
                >
                  <Text strong>{event.clade}</Text>
                  <br />
                  <Text type="secondary">Diverged from {event.diverged_from}</Text>
                  <br />
                  <Tag color={event.color}>
                    CI: {event.confidence_interval[0].toFixed(1)}-{event.confidence_interval[1].toFixed(1)} years
                  </Tag>
                </div>
              </Timeline.Item>
            ))}
          </Timeline>
        </Col>
        
        <Col xs={24} md={8}>
          {selectedEvent ? (
            <Card size="small" title="Event Details">
              <Space direction="vertical">
                <Text strong>Clade: {selectedEvent.clade}</Text>
                <Text>Diverged from: {selectedEvent.diverged_from}</Text>
                <Text>Time: {selectedEvent.years_ago.toFixed(1)} years ago</Text>
                <Text>Confidence: {(selectedEvent.confidence * 100).toFixed(1)}%</Text>
                <Text>
                  Confidence Interval: {selectedEvent.confidence_interval[0].toFixed(1)} - {selectedEvent.confidence_interval[1].toFixed(1)} years
                </Text>
                {selectedEvent.geographic_origin && (
                  <Text>Origin: {selectedEvent.geographic_origin}</Text>
                )}
                {selectedEvent.bootstrap_support && (
                  <Text>Bootstrap: {selectedEvent.bootstrap_support}%</Text>
                )}
              </Space>
            </Card>
          ) : (
            <Alert message="Select an event to view details" type="info" />
          )}
        </Col>
      </Row>
    </Card>
  );
};

const MutationMap = ({ mutationData, geneStructure }) => {
  const [selectedGene, setSelectedGene] = useState(null);
  const [selectedMutation, setSelectedMutation] = useState(null);

  // Agrupar mutações por gene
  const mutationsByGene = mutationData?.reduce((acc, mutation) => {
    if (!acc[mutation.gene]) {
      acc[mutation.gene] = [];
    }
    acc[mutation.gene].push(mutation);
    return acc;
  }, {});

  const geneOptions = mutationsByGene ? Object.keys(mutationsByGene).map(gene => ({
    value: gene,
    label: gene
  })) : [];

  const selectedMutations = selectedGene ? mutationsByGene[selectedGene] : [];

  return (
    <Card title="Mutation Map">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        {geneOptions.length > 0 && (
          <Select
            value={selectedGene}
            onChange={setSelectedGene}
            options={geneOptions}
            style={{ width: 200 }}
            placeholder="Select gene"
          />
        )}

        {selectedGene && (
          <div style={{ position: 'relative', height: '120px', border: '1px solid #d9d9d9', borderRadius: '4px' }}>
            {/* Representação visual do gene */}
            {geneStructure?.[selectedGene]?.domains?.map(domain => (
              <div
                key={domain.name}
                style={{
                  position: 'absolute',
                  left: `${(domain.start / geneStructure[selectedGene].length) * 100}%`,
                  width: `${((domain.end - domain.start) / geneStructure[selectedGene].length) * 100}%`,
                  height: '40px',
                  backgroundColor: domain.color || '#1890ff',
                  top: '40px',
                  border: '1px solid #fff',
                  cursor: 'pointer'
                }}
                onMouseEnter={() => setSelectedMutation(null)}
              >
                <div style={{ textAlign: 'center', fontSize: '10px', color: 'white', paddingTop: '12px' }}>
                  {domain.name}
                </div>
              </div>
            ))}

            {/* Marcadores de mutação */}
            {selectedMutations.map(mutation => (
              <div
                key={`${mutation.gene}-${mutation.position}`}
                style={{
                  position: 'absolute',
                  left: `${(mutation.position / geneStructure[selectedGene].length) * 100}%`,
                  top: '20px',
                  width: '6px',
                  height: '80px',
                  backgroundColor: mutation.prevalence > 0.9 ? 'red' : mutation.prevalence > 0.7 ? 'orange' : 'yellow',
                  cursor: 'pointer',
                  transform: 'translateX(-50%)'
                }}
                onMouseEnter={() => setSelectedMutation(mutation)}
                onMouseLeave={() => setSelectedMutation(null)}
              />
            ))}

            {/* Escala */}
            <div style={{ position: 'absolute', bottom: '5px', width: '100%', textAlign: 'center' }}>
              <Text type="secondary" style={{ fontSize: '10px' }}>
                0 - {geneStructure[selectedGene]?.length} bp
              </Text>
            </div>
          </div>
        )}

        {selectedMutation && (
          <Card size="small" title="Mutation Details">
            <Space direction="vertical">
              <Text strong>{selectedMutation.mutation}</Text>
              <Text>Position: {selectedMutation.position}</Text>
              <Text>Prevalence: {(selectedMutation.prevalence * 100).toFixed(1)}%</Text>
              <Text>Clade: {selectedMutation.clade}</Text>
              <Text>Impact: {selectedMutation.functional_impact}</Text>
              {selectedMutation.p_value && (
                <Text>P-value: {selectedMutation.p_value.toFixed(4)}</Text>
              )}
            </Space>
          </Card>
        )}

        {selectedGene && (
          <Table
            size="small"
            columns={[
              { title: 'Mutation', dataIndex: 'mutation', key: 'mutation' },
              { title: 'Position', dataIndex: 'position', key: 'position' },
              { title: 'Prevalence', dataIndex: 'prevalence', key: 'prevalence', 
                render: val => `${(val * 100).toFixed(1)}%` },
              { title: 'Clade', dataIndex: 'clade', key: 'clade' },
              { title: 'Impact', dataIndex: 'functional_impact', key: 'impact' }
            ]}
            dataSource={selectedMutations}
            pagination={{ pageSize: 5 }}
          />
        )}
      </Space>
    </Card>
  );
};

const AnalysisDashboard = ({ analysisData }) => {
  const stats = {
    divergenceEvents: analysisData.analyses?.divergence_dating?.length || 0,
    significantMutations: analysisData.analyses?.mutation_analysis?.length || 0,
    recombinationEvents: analysisData.analyses?.recombination_analysis?.length || 0,
    phenotypeCorrelations: Object.values(analysisData.analyses?.phenotype_correlation || {})
      .flatMap(treeData => treeData.significant_correlations || []).length
  };

  return (
    <Card title="Analysis Overview">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Divergence Events"
              value={stats.divergenceEvents}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Significant Mutations"
              value={stats.significantMutations}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ExperimentOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Recombination Events"
              value={stats.recombinationEvents}
              valueStyle={{ color: '#722ed1' }}
              prefix={<SwapOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card size="small">
            <Statistic
              title="Phenotype Correlations"
              value={stats.phenotypeCorrelations}
              valueStyle={{ color: '#1890ff' }}
              prefix={<LineChartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Recent Divergence Events" size="small">
            <List
              size="small"
              dataSource={analysisData.analyses?.divergence_dating?.slice(0, 3)}
              renderItem={event => (
                <List.Item>
                  <List.Item.Meta
                    title={`${event.clade} from ${event.diverged_from}`}
                    description={`${event.years_ago.toFixed(1)} years ago (CI: ${event.confidence_interval[0].toFixed(1)}-${event.confidence_interval[1].toFixed(1)})`}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Top Mutations" size="small">
            <List
              size="small"
              dataSource={analysisData.analyses?.mutation_analysis
                ?.sort((a, b) => b.prevalence - a.prevalence)
                ?.slice(0, 3)}
              renderItem={mutation => (
                <List.Item>
                  <List.Item.Meta
                    title={mutation.mutation}
                    description={`${(mutation.prevalence * 100).toFixed(1)}% in ${mutation.clade}`}
                  />
                  <Tag color={mutation.prevalence > 0.9 ? 'red' : 'orange'}>
                    {mutation.gene}
                  </Tag>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

const AnalysisControls = ({ projectName, onAnalysisStart }) => {
  const [config, setConfig] = useState({
    min_support: 0.7,
    max_divergence_time: 1000,
    mutation_threshold: 0.8,
    recombination_confidence: 0.95,
    correlation_threshold: 0.05
  });
  const [loading, setLoading] = useState(false);

  const handleStartAnalysis = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/advanced-analysis/${projectName}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      
      if (response.ok) {
        message.success('Advanced analysis started');
        onAnalysisStart?.();
      } else {
        throw new Error('Failed to start analysis');
      }
    } catch (error) {
      message.error('Error starting analysis: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Analysis Controls">
      <Space direction="vertical" style={{ width: '100%' }} size="middle">
        <Text strong>Analysis Configuration</Text>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Slider
              min={0.1}
              max={1.0}
              step={0.1}
              value={config.min_support}
              onChange={value => setConfig({...config, min_support: value})}
              marks={{ 0.1: '0.1', 0.5: '0.5', 1.0: '1.0'}}
            />
            <Text>Min Support: {config.min_support}</Text>
          </Col>
          
          <Col xs={24} sm={12}>
            <Slider
              min={100}
              max={5000}
              step={100}
              value={config.max_divergence_time}
              onChange={value => setConfig({...config, max_divergence_time: value})}
              marks={{ 100: '100', 2500: '2500', 5000: '5000'}}
            />
            <Text>Max Divergence Time: {config.max_divergence_time} years</Text>
          </Col>
        </Row>

        <Button 
          type="primary" 
          onClick={handleStartAnalysis}
          loading={loading}
          icon={<PlayCircleOutlined />}
        >
          Start Advanced Analysis
        </Button>
      </Space>
    </Card>
  );
};

export default AdvancedPhyloAnalysis;