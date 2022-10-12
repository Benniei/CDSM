// Local imports
import { ReactComponent as GoogleDrive } from '../../assets/GoogleDriveIcon.svg';

// Imports from Material-UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import SvgIcon from '@mui/material/SvgIcon';

function LandingPage() {
    // Custom SvgIcon for the Google Drive logo
    const GoogleDriveIcon = (
        <SvgIcon>
            <GoogleDrive/>
        </SvgIcon>
    );

    return (
        <Container>
            <Box>
                {/* Login button for Google - Redirects to Dashboard screen */}
                <Button href = 'http://localhost:4000/auth/google' variant = 'contained' startIcon = {GoogleDriveIcon}>Google Drive</Button>
                LandingPage
            </Box>   
        </Container>
    );
}

export default LandingPage;