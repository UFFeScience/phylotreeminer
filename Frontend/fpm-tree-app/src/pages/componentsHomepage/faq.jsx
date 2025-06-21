
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const FAQ = () => (
    <Container id="faq" sx={{ py: { xs: 8, sm: 16 } }}>
        <Typography component="h2" variant="h4" color="text.primary" align="center" sx={{ mb: { xs: 4, sm: 8 } }}>
            Perguntas Frequentes
        </Typography>
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>Para quem é o PhyloPipeline?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography >
                        O PhyloPipeline foi projetado tanto para pesquisadores experientes em bioinformática quanto para estudantes e cientistas que estão a começar na área de análise filogenética. A sua interface intuitiva e workflows pré-configurados facilitam o uso por iniciantes, enquanto as opções avançadas de personalização atendem às necessidades de especialistas.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography >Preciso de saber programar para usar a ferramenta?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography >
                        Não! Um dos nossos principais objetivos é democratizar o acesso a análises complexas. Pode executar workflows completos através da nossa interface gráfica, sem escrever uma única linha de código.
                    </Typography>
                </AccordionDetails>
            </Accordion>
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography >Quais tipos de dados de entrada são suportados?</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Typography >
                        Atualmente, a plataforma suporta sequências de DNA, RNA e proteínas em formato FASTA. Estamos a trabalhar para expandir o suporte a outros formatos populares na comunidade científica.
                    </Typography>
                </AccordionDetails>
            </Accordion>
        </Box>
    </Container>
);

export default FAQ;