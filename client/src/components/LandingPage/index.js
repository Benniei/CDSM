// Local imports
import { ReactComponent as GoogleDrive } from '../../assets/GoogleDriveIcon.svg';
import { ReactComponent as MicrosoftOneDriveIcon } from '../../assets/MicrosoftOneDriveIcon.svg';

// Imports from Material-UI
import {Box, Typography} from '@mui/material'

function LandingPage() {

    return (
        <div id="splash-screen">
            <Box
                        inline
                        component="img"
                        sx={{width: 100, height: 100}}
                        ml={1}
                        src="https://i.imgur.com/MWrRhEY.png" /><b>loud Drive Manager</b>
            <br></br>
            {/* Login Button for Google Drive - Redirects to Dashboard Screen */}
            <Box button className="splash-button-outer" onClick={event => window.location.href='http://localhost:4000/auth/google'} mt={4}>
                <GoogleDrive />
                <Typography display="inline" ml={.5}> <strong> Login with Google Drive </strong> </Typography>
            </Box>
            {/* Login Button for Google Drive - Redirects to Dashboard Screen */}
            <Box button className="splash-button-outer" onClick={event => window.location.href=''}>
                <MicrosoftOneDriveIcon />
                <Typography display="inline" ml={.5}> <strong> Login with Microsoft One Drive </strong> </Typography>
            </Box>
        </div>
    );
}

export default LandingPage;