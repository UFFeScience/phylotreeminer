import React from 'react';
import { Typography, Card, Divider, Tag, Space } from 'antd';
import { CodeOutlined } from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const PhylogeneticQueriesDocumentation = () => {
  return (
    <div style={{ padding: '32px', maxWidth: '100vw', margin: '0 auto', height: '80vh', overflow: 'auto' }}>
      <Title level={1} style={{ color: '#1890ff', borderBottom: '2px solid #1890ff', paddingBottom: '10px' }}>
        <CodeOutlined /> Cypher Queries Documentation for Phylogenetic Tree
      </Title>

      <Paragraph>
        This document presents an organized collection of Cypher queries for
        working with phylogenetic data in Neo4j, including practical examples
        and detailed explanations. Updated for the new normalized database structure.
      </Paragraph>

      <Title level={2} style={{ color: '#1890ff', marginTop: '24px' }}>
        Database Structure
      </Title>
      <Paragraph>
        <strong>Nodes:</strong>
      </Paragraph>
      <ul>
        <li><Tag color="blue">Tree</Tag> – Root of the phylogenetic tree</li>
        <li><Tag color="blue">Subtree</Tag> – Branch or clade</li>
        <li><Tag color="blue">Metadata</Tag> – Contains fields: molecule_type, topology, date, source, organism, taxonomy, description, newick_id, terminal_hash</li>
        <li><Tag color="blue">Feature</Tag> – Contains fields: type, location, strand</li>
        <li><Tag color="blue">Qualifier</Tag> – Contains fields: key, value (list of strings)</li>
        <li><Tag color="blue">Support</Tag> – Statistical support value</li>
        <li><Tag color="blue">User</Tag> – Tree owner</li>
      </ul>
      <Paragraph>
        <strong>Relationships:</strong>
      </Paragraph>
      <ul>
        <li><Tag color="green">(:User)-[:OWNS]->(:Tree)</Tag></li>
        <li><Tag color="green">(:Tree|Subtree)-[:HAS_SUBTREE]->(:Subtree)</Tag></li>
        <li><Tag color="green">(:Subtree)-[:HAS_SUPPORT]->(:Support)</Tag></li>
        <li><Tag color="green">(:Subtree)-[:HAS_METADATA]->(:Metadata)</Tag></li>
        <li><Tag color="green">(:Metadata)-[:HAS_FEATURE]->(:Feature)</Tag></li>
        <li><Tag color="green">(:Feature)-[:HAS_QUALIFIER]->(:Qualifier)</Tag></li>
      </ul>

      <Title level={2} style={{ color: '#1890ff', marginTop: '24px' }}>
        Query Tutorial (Cypher in Neo4j)
      </Title>

      <Title level={3}>1. View Complete Tree</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (t:Tree)-[:HAS_SUBTREE*]->(n)
RETURN t, n;`}</code></pre>
          <Tag color="blue">Return: Graph</Tag>
        </Space>
      </Card>
      <Paragraph>Shows the tree and all branches.</Paragraph>

      <Title level={3}>2. Find All Stored Viruses by Organism Name</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)
WHERE m.organism CONTAINS 'Zika virus'
RETURN m.organism, m.source, m.taxonomy;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Lists metadata where organism contains "Zika virus".</Paragraph>

      <Title level={3}>3. Search by Collection Date</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)
WHERE m.date CONTAINS '2007'
RETURN m.organism, m.date, m.source;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        Shows sequences collected in <Text strong>2007</Text>.
      </Paragraph>

      <Title level={3}>4. View Metadata with Specific Source</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)
WHERE m.source CONTAINS 'journal'
RETURN m.source, m.organism, m.description;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Extracts articles or references related to the sequences.</Paragraph>

      <Title level={3}>5. Check Node Reliability</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (s:Support)
RETURN s.value, count(*) AS frequency
ORDER BY s.value DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Shows the most common support values.</Paragraph>

      <Title level={3}>6. Find Host Organisms via Qualifiers</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'host' AND 'Homo sapiens' IN q.value
RETURN m.organism, q.value AS host;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        Sequences that had <Text strong>humans</Text> as hosts.
      </Paragraph>

      <Title level={3}>7. Explore Taxonomy</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)
WHERE m.taxonomy IS NOT NULL
RETURN m.organism, m.taxonomy;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Shows the biological classification of each sequence.</Paragraph>

      <Title level={3}>8. Isolates by Geographic Location</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name'
RETURN q.value AS location, count(*) AS isolates
ORDER BY isolates DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Counts isolates by geographic location.</Paragraph>

      <Title level={3}>9. Hierarchical Structure</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH path=(t:Tree)-[:HAS_SUBTREE*]->(n)
RETURN path;`}</code></pre>
          <Tag color="blue">Return: Graph</Tag>
        </Space>
      </Card>
      <Paragraph>
        Visualizes the <Text strong>hierarchical structure</Text> of the tree.
      </Paragraph>

      <Title level={3}>10. Sequences with Specific Protein via Qualifiers</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'product' AND ANY(val IN q.value WHERE val CONTAINS 'envelope glycoprotein')
RETURN m.organism, q.value AS product;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Searches for genes/proteins of interest.</Paragraph>

      <Title level={3}>11. View Subtree with High Support</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH path=(t:Tree)-[:HAS_SUBTREE*]->(subtree)-[:HAS_SUPPORT]->(support)
WHERE support.value > 0.8
RETURN path;`}</code></pre>
          <Tag color="blue">Return: Graph</Tag>
        </Space>
      </Card>
      <Paragraph>Shows only nodes with high statistical support.</Paragraph>

      <Title level={3}>12. Connected Metadata Network</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m1:Metadata)-[:HAS_METADATA]-(subtree1:Subtree),
      (subtree1)-[:HAS_SUBTREE*]-(subtree2:Subtree),
      (subtree2)-[:HAS_METADATA]-(m2:Metadata)
WHERE m1.organism CONTAINS 'Brazil' AND m2.organism CONTAINS 'Zika'
RETURN m1, subtree1, subtree2, m2;`}</code></pre>
          <Tag color="blue">Return: Graph</Tag>
        </Space>
      </Card>
      <Paragraph>Connects metadata from different related subtrees.</Paragraph>

      <Divider />

      <Title level={2} style={{ color: '#1890ff', marginTop: '24px' }}>
        Biological Insights (Normalized Structure)
      </Title>

      <Title level={3}>1. Temporal Distribution - Isolates per Year</Title>
      <Paragraph>
        We want to know <Text strong>how many viruses were collected each year</Text>.
      </Paragraph>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)
WHERE m.date IS NOT NULL
WITH substring(m.date, 0, 4) AS collection_year
RETURN collection_year, count(*) AS total_isolates
ORDER BY collection_year;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Explanation</Text>:
      </Paragraph>
      <ul>
        <li>
          <Tag><code>substring(m.date, 0, 4)</code></Tag> → extracts the year from date string.
        </li>
        <li>
          <Tag><code>count(*)</code></Tag> → counts how many records for each year.
        </li>
      </ul>
      <Paragraph>
        This allows building a <Text strong>timeline chart</Text>.
      </Paragraph>

      <Title level={3}>2. Geographic Distribution - Countries with Samples</Title>
      <Paragraph>We want to see where the viruses came from.</Paragraph>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name'
UNWIND q.value AS location
WITH split(location, ':')[0] AS country
RETURN country, count(*) AS total_isolates
ORDER BY total_isolates DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Explanation</Text>:
      </Paragraph>
      <ul>
        <li>
          <Tag><code>UNWIND q.value</code></Tag> → expands the list of locations.
        </li>
        <li>
          <Tag><code>split(location, ':')[0]</code></Tag> → extracts the country part.
        </li>
      </ul>
      <Paragraph>Ideal for later mapping on a map chart.</Paragraph>

      <Title level={3}>3. Correlation Between Support and Taxonomic Diversity</Title>
      <Paragraph>
        Check if nodes with higher support contain more taxonomic diversity.
      </Paragraph>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (s:Support)<-[:HAS_SUPPORT]-(sub:Subtree)-[:HAS_METADATA]->(m:Metadata)
WHERE m.taxonomy IS NOT NULL
RETURN s.value AS support,
       size(m.taxonomy) AS taxonomic_levels
ORDER BY support DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Explanation</Text>:
      </Paragraph>
      <ul>
        <li>
          <Tag><code>s.value</code></Tag> → statistical support value of the node.
        </li>
        <li>
          <Tag><code>size(m.taxonomy)</code></Tag> → counts how many taxonomic levels exist.
        </li>
      </ul>
      <Paragraph>
        This helps to see if <Text strong>well-supported</Text> nodes really
        represent <Text strong>more diversity</Text>.
      </Paragraph>

      <Title level={3}>4. Detection of Most Cited Lineages in Scientific Articles</Title>
      <Paragraph>Which lineages appear in the most bibliographic references.</Paragraph>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'references'
UNWIND q.value AS ref
RETURN m.source AS lineage,
       count(ref) AS total_references
ORDER BY total_references DESC
LIMIT 10;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Explanation</Text>:
      </Paragraph>
      <ul>
        <li>
          <Tag><code>q.key = 'references'</code></Tag> → selects qualifier with references.
        </li>
        <li>
          <Tag><code>UNWIND q.value</code></Tag> → breaks the reference list into multiple rows.
        </li>
        <li>
          <Tag><code>count(ref)</code></Tag> → counts how many times each lineage was cited.
        </li>
      </ul>
      <Paragraph>
        Allows detecting the <Text strong>most studied lineages</Text>.
      </Paragraph>

      <Title level={3}>5. Host Comparison (humans, mosquitoes, animals)</Title>
      <Paragraph>Discover which hosts appear and in what quantity.</Paragraph>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'host'
UNWIND q.value AS host
RETURN host, count(*) AS total_isolates
ORDER BY total_isolates DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Explanation</Text>:
      </Paragraph>
      <ul>
        <li>
          <Tag><code>q.key = 'host'</code></Tag> → selects host qualifier.
        </li>
        <li>
          <Tag><code>UNWIND q.value</code></Tag> → transforms the list into rows for counting.
        </li>
      </ul>
      <Paragraph>
        This way, we see if the sequences come from{" "}
        <Text strong>humans, mosquitoes, or other animals</Text>.
      </Paragraph>

      <Title level={3}>6. Geographic Distribution with Feature-Level Access</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name'
UNWIND q.value AS location
RETURN location, count(*) AS freq
ORDER BY freq DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        This query demonstrates direct access to geographic data via qualifiers without JSON parsing.
      </Paragraph>

      <Title level={3}>7. View Clades by Geographic Region</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH path=(t:Tree)-[:HAS_SUBTREE*]->(subtree)-[:HAS_METADATA]->(m:Metadata),
      (m)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name' AND ANY(loc IN q.value WHERE loc CONTAINS 'Brazil')
RETURN path;`}</code></pre>
          <Tag color="blue">Return: Graph</Tag>
        </Space>
      </Card>
      <Paragraph>Shows the complete structure of clades originating from Brazil.</Paragraph>

      <Divider />

      <Title level={2} style={{ color: '#1890ff', marginTop: '24px' }}>Advanced Queries</Title>
      
      <Title level={3}>Query 1 – Isolate Frequency by Country (Optimized)</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name'
UNWIND q.value AS location
WITH split(location, ':')[0] AS country
RETURN country, count(*) AS freq
ORDER BY freq DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Analysis:</Text>
      </Paragraph>
      <ul>
        <li>
          Direct access to normalized qualifier data.
        </li>
        <li>
          <Tag><code>split(location, ':')[0]</code></Tag> to get only the <Text strong>country</Text>.
        </li>
      </ul>
      
      <Title level={3}>Query 2 – Frequency and Average Support by Location</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (s:Support)<-[:HAS_SUPPORT]-(subtree:Subtree)-[:HAS_METADATA]->(m:Metadata),
      (m)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name'
UNWIND q.value AS location
RETURN location,
       count(*) AS freq,
       round(avg(s.value), 2) AS avg_support
ORDER BY freq DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Analysis:</Text> Combines support values with geographic data.
      </Paragraph>

      <Title level={3}>Query 3 – Countries with Highest Average Support</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (s:Support)<-[:HAS_SUPPORT]-(subtree:Subtree)-[:HAS_METADATA]->(m:Metadata),
      (m)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name'
UNWIND q.value AS location
WITH split(location, ':')[0] AS country, s.value AS support
WHERE country IS NOT NULL
RETURN country,
       count(*) AS freq,
       round(avg(support), 2) AS avg_support
ORDER BY avg_support DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>
        <Text strong>Analysis:</Text> Shows which countries have the most reliable phylogenetic nodes.
      </Paragraph>

      <Title level={3}>Query 4 – Evolutionary Relationships Network</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (t:Tree)-[:HAS_SUBTREE*1..3]->(parent:Subtree),
      (parent)-[:HAS_SUBTREE]->(child:Subtree),
      (parent)-[:HAS_SUPPORT]->(parentSupport:Support),
      (child)-[:HAS_SUPPORT]->(childSupport:Support),
      (parent)-[:HAS_METADATA]->(parentMeta:Metadata),
      (child)-[:HAS_METADATA]->(childMeta:Metadata)
WHERE parentSupport.value > 0.7 AND childSupport.value > 0.7
RETURN parent, child, parentSupport, childSupport, parentMeta, childMeta;`}</code></pre>
          <Tag color="blue">Return: Graph</Tag>
        </Space>
      </Card>
      <Paragraph>
        Shows evolutionary relationships between well-supported nodes with their metadata.
      </Paragraph>

      <Title level={3}>Query 5 – Phylogenetic Tree with Geographic Hotspots</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH path=(t:Tree)-[:HAS_SUBTREE*]->(subtree)-[:HAS_METADATA]->(m:Metadata),
      (m)-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
WHERE q.key = 'geo_loc_name' AND (
  ANY(loc IN q.value WHERE loc CONTAINS 'Brazil') OR
  ANY(loc IN q.value WHERE loc CONTAINS 'Colombia') OR
  ANY(loc IN q.value WHERE loc CONTAINS 'Mexico')
)
RETURN path;`}</code></pre>
          <Tag color="blue">Return: Graph</Tag>
        </Space>
      </Card>
      <Paragraph>Visualizes the tree focusing on specific Latin American countries.</Paragraph>

      <Title level={3}>Query 6 – Feature Type Distribution</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (f:Feature)
RETURN f.type, count(*) AS frequency
ORDER BY frequency DESC;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Shows the distribution of feature types (gene, CDS, etc.) across all sequences.</Paragraph>

      <Title level={3}>Query 7 – All Qualifiers for a Specific Metadata</Title>
      <Card size="small" style={{ marginBottom: '16px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <pre><code>{`MATCH (m:Metadata {organism: 'Zika virus'})-[:HAS_FEATURE]->(f:Feature)-[:HAS_QUALIFIER]->(q:Qualifier)
RETURN m.organism, f.type, q.key, q.value
ORDER BY f.type, q.key;`}</code></pre>
          <Tag color="green">Return: Tabular</Tag>
        </Space>
      </Card>
      <Paragraph>Lists all qualifiers (host, product, country, etc.) for a specific organism.</Paragraph>
    </div>
  );
};

export default PhylogeneticQueriesDocumentation;