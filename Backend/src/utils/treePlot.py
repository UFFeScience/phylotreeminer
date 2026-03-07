from ete3 import Tree, TreeStyle, NodeStyle, TextFace, CircleFace

# Mapeamento baseado nos clusters definidos na legenda do estudo base
REGION_MAPPING = {
    # Americas
    "Jamaica": "Americas",
    "USA": "Americas",
    "Dominican Republic": "Americas",
    "Mexico": "Americas",
    "Brazil": "Americas",
    "Colombia": "Americas",
    
    # Africa
    "Uganda": "Africa",
    "Senegal": "Africa",
    
    # South-East Asia (Agrupamento semântico do estudo)
    "Thailand": "South-East Asia",
    "Philippines": "South-East Asia",
    "Malaysia": "South-East Asia",
    "Micronesia": "South-East Asia", 
    
    # Clusters Isolados
    "Singapore": "Singapore",
    "French Polynesia": "French Polynesia"
}

def map_country_to_region(country: str) -> str:
    """
    Mapeia o país extraído para a região/cluster correspondente.
    """
    if not country or country == "Unknown":
        return "Unknown"
        
    # Normalização básica: remove espaços em branco extras e capitaliza a primeira letra de cada palavra
    country_clean = country.strip().title() 
    
    # Correção de casos específicos (ex: USA geralmente é maiúsculo)
    if country_clean.upper() == "USA":
        country_clean = "USA"
        
    return REGION_MAPPING.get(country_clean, "Unknown")

def render_annotated_tree(tree_file, metadata_dict, output_file="tree_plot.png"):
    """
    Renderiza a árvore filogenética com metadados customizados.
    
    Parâmetros:
    - tree_file: Caminho para o arquivo .nwk
    - metadata_dict: Dicionário onde a chave é o nome do nó na árvore (geralmente Accession ID) 
                     e o valor é o dicionário retornado por `get_node_information`.
    """
    # 1. Carregar a árvore
    # format=0 lê a árvore de forma flexível (suporta nomes de nós internos e folhas)
    t = Tree(tree_file, format=0) 

    # 2. Definir o mapeamento de cores para os clusters (Localização)
    color_map = {
        "Americas": "#D35400",          # Laranja/Marrom
        "French Polynesia": "#E74C3C",  # Vermelho
        "Singapore": "#F1C40F",         # Amarelo
        "South-East Asia": "#8E44AD",   # Roxo
        "Africa": "#7F8C8D",            # Cinza
        "Unknown": "#BDC3C7"            # Cinza claro para dados faltantes
    }

    # 3. Configurar o estilo geral da árvore
    ts = TreeStyle()
    ts.show_leaf_name = False # Desabilitamos o padrão para criar o nosso customizado
    ts.show_branch_support = False # Desabilitamos o padrão para customizar a posição das métricas
    
    # Adicionar barra de escala no fundo (como na imagem: 0.02)
    ts.show_scale = True

    # 4. Iterar sobre os nós para aplicar estilos e faces
    for node in t.traverse():
        if node.is_leaf():
            resultado = next((item for item in metadata_dict if item["accessionId"] == node.name.split('.')[0]), None)
            # Buscar os metadados do nó atual
            # Presume-se que node.name corresponde ao accessionId do seu script
            meta = {
                "accessionId": resultado['accessionId'],
                "region": resultado['region'],
                "year": resultado['year'],
                "country": resultado['country']
            }
            
            # --- Adicionar o círculo colorido (Cluster) ---
            node_color = color_map.get(meta["region"], color_map["Unknown"])
            # radius ajusta o tamanho da bolinha
            circle = CircleFace(radius=0.1, color=node_color, style="circle")
            # position="branch-right" coloca na ponta do ramo
            node.add_face(circle, column=0, position="branch-right")
            
            # --- Adicionar o texto: <Accession ID> <Geo Loc> <Collection Date> ---
            label_text = f"  {meta['accessionId']} {meta['country']} {meta['year']}"
            text_face = TextFace(label_text, fsize=1, fgcolor="black")
            node.add_face(text_face, column=1, position="branch-right")
            
            # Estilo básico para remover a "bolinha" padrão do ETE3 no nó folha
            nstyle = NodeStyle()
            nstyle["size"] = 0 
            node.set_style(nstyle)

        else:
            # --- Adicionar métricas (Valores de Suporte / Bootstrap) ---
            # Softwares como IQ-TREE frequentemente exportam suportes duplos (SH-aLRT/UFboot) 
            # ex: "100/100" como nome do nó interno no formato Newick.
            # Se for um valor numérico simples, o ETE3 armazena em node.support.
            
            support_val = ""
            if node.name and "/" in str(node.name): 
                support_val = node.name
            elif hasattr(node, "support") and node.support is not None:
                # Arredonda se for float
                support_val = f"{node.support:g}" 

            if support_val:
                support_face = TextFace(f"{support_val}", fsize=1, fgcolor="#444444")
                # Posiciona acima do ramo
                node.add_face(support_face, column=0, position="branch-top")
                
            nstyle = NodeStyle()
            nstyle["size"] = 0 # Esconder nós internos
            node.set_style(nstyle)

    # 5. Renderizar
    t.render(output_file, w=1280, h=720, dpi=300, units="px", tree_style=ts)
    print(f"Árvore renderizada com sucesso em: {output_file}")