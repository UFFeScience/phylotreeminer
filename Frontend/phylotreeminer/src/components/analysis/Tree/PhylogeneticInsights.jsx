import React, { useMemo, useState, useEffect } from "react";
import { Layout, Spin, Alert } from "antd";
import GeographicDistribution from "./GeographicDistribution";
import TemporalInsights from "./TemporalInsights";
import OWIDAnalysisDashboard from "./OWIDAnalysisDashboard";

const { Content } = Layout;



const extractMeta = (metadata, key) => {
  if (!metadata) return null;
  
  if (key === 'geoLoc') {
    return metadata?.features?.[0]?.qualifiers?.geo_loc_name?.[0] || 
           metadata?.country || 
           metadata?.location || null;
  }
  if (key === 'date') {
    const raw = metadata?.annotations?.date || 
                metadata?.features?.[0]?.qualifiers?.collection_date?.[0] || 
                metadata?.date;
    return raw && raw.includes("-") ? raw.split("-")[raw.split("-").length - 1] : raw;
  }
  if (key === 'isolate') {
    return metadata?.features?.[0]?.qualifiers?.isolate?.[0] || 
           metadata?.strain || 
           metadata?.features?.[0]?.qualifiers?.strain?.[0] || null;
  }
  
  return null;
};

const processPhylogeneticTree = (treeData) => {
  if (!treeData || treeData.length === 0) return [];
  
  const terminalsList = [];
  const metadataRegistry = {}; 

  const registerMetadata = (id, metadataObj) => {
    if (!id || id === "Unknown") return;
    
    if (!metadataRegistry[id]) {
      metadataRegistry[id] = { geoLoc: null, collectionDate: null, isolate: null };
    }
    
    const extractedGeo = extractMeta(metadataObj, 'geoLoc');
    const extractedDate = extractMeta(metadataObj, 'date');
    const extractedIsolate = extractMeta(metadataObj, 'isolate');

    if (!metadataRegistry[id].geoLoc && extractedGeo) metadataRegistry[id].geoLoc = extractedGeo;
    if (!metadataRegistry[id].collectionDate && extractedDate) metadataRegistry[id].collectionDate = extractedDate;
    if (!metadataRegistry[id].isolate && extractedIsolate) metadataRegistry[id].isolate = extractedIsolate;
  };

  const traverseTree = (node) => {
    if (!node || typeof node !== 'object') return;

    
    if (node.data_terminals && typeof node.data_terminals === 'object') {
      Object.entries(node.data_terminals).forEach(([id, meta]) => {
        registerMetadata(id, meta);
      });
    }

    if (node.data_terminals && Array.isArray(node.data_terminals)) {
      node.data_terminals.forEach(terminal => {
        const metadata = terminal.metadata || {};
        const id = metadata.id || terminal.name || "Unknown";
        
        registerMetadata(id, metadata);

        terminalsList.push({
          raw: terminal,
          id: id,
          newick: terminal.newick
        });
      });
    }

    if (node.metadata && (node.metadata.id || node.name)) {
      registerMetadata(node.metadata.id || node.name, node.metadata);
    }

    const ignoredKeys = ['List_terminals_hash', 'metadata', 'supports', 'newick', 'name']; 
    
    Object.keys(node).forEach(key => {
      if (!ignoredKeys.includes(key) && typeof node[key] === 'object' && node[key] !== null) {
        traverseTree(node[key]);
      }
    });
  };

  const rootObj = treeData[0] || treeData;
  traverseTree(rootObj);

  const enrichedSequences = terminalsList.map(term => {
    const meta = metadataRegistry[term.id] || {};
    return {
      ...term,
      geoLoc: meta.geoLoc || null,               
      collectionDate: meta.collectionDate || null, 
      isolate: meta.isolate || "Unknown"
    };
  });

  const uniqueSequences = Array.from(new Map(enrichedSequences.map(item => [item.id, item])).values());

  return uniqueSequences;
};

const PhylogeneticInsights = ({ treeData, owidMetadata, loading, error }) => {
  const sequences = useMemo(() => processPhylogeneticTree(treeData), [treeData]);
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Erro"
        description={
          error.message || "An error occurred while loading the data."
        }
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
    <Layout style={{ padding: "24px", background: "#fff" }}>
      <Content>
        <GeographicDistribution sequences={sequences} />
        <TemporalInsights sequences={sequences} />
        {owidMetadata && <OWIDAnalysisDashboard analysisData={owidMetadata} />}
      </Content>
    </Layout>
  );
};

export default PhylogeneticInsights;
