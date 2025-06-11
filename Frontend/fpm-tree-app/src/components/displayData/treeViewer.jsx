import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Layout, Select, List, Typography, Breadcrumb, Alert, Space, Modal, Spin, Table } from 'antd';
import { FolderOutlined, FileOutlined, HomeOutlined } from '@ant-design/icons';
import * as d3 from 'd3';

const { Content } = Layout;
const { Title, Paragraph } = Typography;
const { Option } = Select;


const TreeViewer = ({ content }) => {
  const d3Container = useRef(null);
  const [error, setError] = useState(null);

  // Função para extrair a string Newick do conteúdo Nexus
  const parseNewickFromNexus = (nexusContent) => {
    try {
      const treeLine = nexusContent.match(/tree.*?=/i);
      if (!treeLine) throw new Error("Nenhuma linha 'TREE' encontrada no arquivo Nexus.");
      
      const newickString = nexusContent.substring(nexusContent.indexOf('=', treeLine.index) + 1).trim();
      const firstSemicolon = newickString.indexOf(';');
      if (firstSemicolon === -1) throw new Error("Formato Newick inválido: não terminou com ';'.");

      return newickString.substring(0, firstSemicolon + 1);
    } catch (e) {
      setError(`Erro ao analisar o arquivo Nexus: ${e.message}`);
      return null;
    }
  };

  // Função para converter Newick para uma hierarquia que o D3 entende
  const parseNewick = (newick) => {
      let ances = [];
      let tree = {};
      let tokens = newick.split(/\s*(;|\(|\)|,|:)\s*/);
      for (let i = 0; i < tokens.length; i++) {
        let token = tokens[i];
        switch (token) {
          case '(': 
            let subtree = {};
            tree.children = [subtree];
            ances.push(tree);
            tree = subtree;
            break;
          case ',': 
            let an = ances[ances.length - 1];
            let sibling = {};
            an.children.push(sibling);
            tree = sibling;
            break;
          case ')': 
            tree = ances.pop();
            break;
          case ':': 
            break;
          default:
            let x = tokens[i - 1];
            if (x == ')' || x == '(' || x == ',') {
              tree.name = token;
            }
        }
      }
      return tree;
  }

  useEffect(() => {
    if (content && d3Container.current) {
      const newickString = parseNewickFromNexus(content);
      if (!newickString) return;

      const treeData = parseNewick(newickString);
      const root = d3.hierarchy(treeData);

      // Limpa o SVG anterior
      d3.select(d3Container.current).selectAll("*").remove();
      
      const width = d3Container.current.clientWidth;
      const treeLayout = d3.tree().size([width - 40, 500]);
      treeLayout(root);

      const svg = d3.select(d3Container.current).append("svg")
        .attr("width", width)
        .attr("height", 600) // Altura inicial
        .call(d3.zoom().on("zoom", (event) => g.attr("transform", event.transform)))
        .append("g")
        .attr("transform", "translate(20, 20)");

      const g = svg.append('g');

      // Desenha as ligações (arestas)
      g.selectAll('.link')
        .data(root.links())
        .enter().append('path')
        .attr('class', 'link')
        .attr('d', d3.linkHorizontal().x(d => d.y).y(d => d.x))
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', '2px');

      // Desenha os nós (folhas e internos)
      const node = g.selectAll('.node')
        .data(root.descendants())
        .enter().append('g')
        .attr('class', d => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
        .attr('transform', d => `translate(${d.y},${d.x})`);

      node.append('circle').attr('r', 5).style('fill', '#fff').style('stroke', 'steelblue').style('stroke-width', '3px');
      node.append('text')
        .attr('dy', '.35em')
        .attr('x', d => d.children ? -13 : 13)
        .style('text-anchor', d => d.children ? 'end' : 'start')
        .text(d => d.data.name);

      // Ajusta a altura do SVG para caber a árvore
      const box = g.node().getBBox();
      d3.select(svg.node().parentNode).attr("height", box.height + 40);

    }
  }, [content]);


  if (error) {
    return <Alert message="Erro de Visualização" description={error} type="error" showIcon />;
  }
  return <div ref={d3Container} style={{ width: '100%', height: '100%' }} />;
};

export default TreeViewer;