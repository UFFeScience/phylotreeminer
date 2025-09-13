import React from 'react';
import { Layout, Spin, Alert } from 'antd';
import GeographicDistribution from './GeographicDistribution';
import TemporalInsights from './TemporalInsights';

const { Content } = Layout;

const PhylogeneticInsights = ({ treeData, loading, error }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erro"
        description={error.message || "An error occurred while loading the data."}
        type="error"
        showIcon
      />
    );
  }

  if (!treeData) {
    return (
      <Alert
        message="No data"
        description="No phylogenetic data available for analysis."
        type="warning"
        showIcon
      />
    );
  }

  return (
    <Layout style={{ padding: '24px', background: '#fff' }}>
      <Content>
        <GeographicDistribution treeData={treeData} />
        <TemporalInsights treeData={treeData} />
      </Content>
    </Layout>
  );
};

export default PhylogeneticInsights;    