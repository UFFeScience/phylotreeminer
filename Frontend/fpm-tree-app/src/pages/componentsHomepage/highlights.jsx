import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

import AnalyticsIcon from '@mui/icons-material/Analytics';
import AlignHorizontalLeftIcon from '@mui/icons-material/AlignHorizontalLeft';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import ScienceIcon from '@mui/icons-material/Science';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import DataObjectIcon from '@mui/icons-material/DataObject';


const Highlights = () => (
    <Box
        id="highlights"
        sx={{
            // pt: { xs: 4, sm: 12 },
            pb: { xs: 8, sm: 16 },
            color: 'white',
            // bgcolor: '#06090E',
        }}
    >
        <Container
            sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: { xs: 3, sm: 6 },
            }}
        >
            <Box sx={{ width: { sm: '100%', md: '60%' }, textAlign: { sm: 'left', md: 'center' } }}>
                <Typography component="h2" variant="h4" sx={{ color: 'grey.800', fontWeight: 'bold' }}>
                    Workflow Highlights
                </Typography>
                <Typography variant="body1" sx={{ color: 'grey.500' }}>
                    Explore the key features that make PhyloTreeMiner the ideal tool for your analyses.
                </Typography>
            </Box>
            <Grid container rowSpacing={{ xs: 1, sm: 2, md: 3 }} columnSpacing={{ xs: 1, sm: 2, md: 3 }}>
                <Grid item size={{ xs: 2, sm: 4, md: 4 }}>
                    <Stack
                        direction="column"
                        color="inherit"
                        spacing={1}
                        useFlexGap
                        sx={{ p: 4, height: '100%', border: '1px solid #E4E4E4FF', borderRadius: 2 }}
                    >
                        <Box sx={{ color: 'grey.800' }}><AnalyticsIcon /></Box>
                        <div>
                            <Typography fontWeight="bold" gutterBottom sx={{ color: 'grey.800' }}>
                                Visual Insights with Neo4j
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'grey.800' }} align="justify">
                                Graph-based visualization powered by Neo4j reveals hidden biological relationships between taxa, enabling the discovery of complex evolutionary patterns that are difficult to capture in tabular views.
                            </Typography>
                        </div>
                    </Stack>
                </Grid>

                <Grid item size={{ xs: 2, sm: 4, md: 4 }}>
                    <Stack
                        direction="column"
                        color="inherit"
                        spacing={1}
                        useFlexGap
                        sx={{ p: 4, height: '100%', border: '1px solid #E4E4E4FF', borderRadius: 2 }}
                    >
                        <Box sx={{ color: 'grey.800' }}><AlignHorizontalLeftIcon /></Box>
                        <div>
                            <Typography fontWeight="bold" gutterBottom sx={{ color: 'grey.800' }}>
                                Alignment Viewer
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'grey.800' }} align="justify">
                                An advanced visualization tool for multiple sequence alignments, highlighting conservation patterns, gap distributions, and regions of biological significance to support comparative and evolutionary analysis.
                            </Typography>
                        </div>
                    </Stack>
                </Grid>

                <Grid item size={{ xs: 2, sm: 4, md: 4 }}>
                    <Stack
                        direction="column"
                        color="inherit"
                        spacing={1}
                        useFlexGap
                        sx={{ p: 4, height: '100%', border: '1px solid #E4E4E4FF', borderRadius: 2 }}
                    >
                        <Box sx={{ color: 'grey.800' }}><FileOpenIcon /></Box>
                        <div>
                            <Typography fontWeight="bold" gutterBottom sx={{ color: 'grey.800' }}>
                                Multi-format Support
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'grey.800' }} align="justify">
                                Seamlessly handles common bioinformatics standards such as phylogenetic trees (.nexus, .newick) and sequence alignments (.fasta, .clustal), ensuring smooth integration into existing research workflows.
                            </Typography>
                        </div>
                    </Stack>
                </Grid>

                <Grid item size={{ xs: 2, sm: 4, md: 4 }}>
                    <Stack
                        direction="column"
                        color="inherit"
                        spacing={1}
                        useFlexGap
                        sx={{ p: 4, height: '100%', border: '1px solid #E4E4E4FF', borderRadius: 2 }}
                    >
                        <Box sx={{ color: 'grey.800' }}><ScienceIcon /></Box>
                        <div>
                            <Typography fontWeight="bold" gutterBottom sx={{ color: 'grey.800' }}>
                                Data Enrichment with NCBI
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'grey.800' }} align="justify">
                                Real-time integration with NCBI databases enhances analyses with taxonomic metadata and links to relevant publications, providing deeper biological context to sequence-based studies.
                            </Typography>
                        </div>
                    </Stack>
                </Grid>

                <Grid item size={{ xs: 2, sm: 4, md: 4 }}>
                    <Stack
                        direction="column"
                        color="inherit"
                        spacing={1}
                        useFlexGap
                        sx={{ p: 4, height: '100%', border: '1px solid #E4E4E4FF', borderRadius: 2 }}
                    >
                        <Box sx={{ color: 'grey.800' }}><AccountTreeIcon /></Box>
                        <div>
                            <Typography fontWeight="bold" gutterBottom sx={{ color: 'grey.800' }}>
                                Interactive Tree Exploration
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'grey.800' }} align="justify">
                                Phylogenetic trees that allow intuitive exploration of evolutionary relationships, with interactive node selection to investigate clades, divergences, and lineage-specific patterns.
                            </Typography>
                        </div>
                    </Stack>
                </Grid>

                <Grid item size={{ xs: 2, sm: 4, md: 4 }}>
                    <Stack
                        direction="column"
                        color="inherit"
                        spacing={1}
                        useFlexGap
                        sx={{ p: 4, height: '100%', border: '1px solid #E4E4E4FF', borderRadius: 2 }}
                    >
                        <Box sx={{ color: 'grey.800' }}><DataObjectIcon /></Box>
                        <div>
                            <Typography fontWeight="bold" gutterBottom sx={{ color: 'grey.800' }}>
                                Containerized Workflow with Docker
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'grey.800' }} align="justify">
                                Delivered in a reproducible Docker environment, ensuring consistent analyses, facilitating collaboration, and supporting long-term scientific reproducibility across different systems.
                            </Typography>
                        </div>
                    </Stack>
                </Grid>
            </Grid>
        </Container>
    </Box>
);

export default Highlights;