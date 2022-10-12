// Local imports


// Imports from Material-UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';

function Dashboard() {
    return (
        <Container>
            <Box>
                {/* Button to redirect user to LandingPage */}
                <Button href = '/'>Return to LandingPage</Button>
                Dashboard
            </Box>   
        </Container>
    );
}

export default Dashboard;