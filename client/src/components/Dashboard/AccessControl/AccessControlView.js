// Local Import
import ACBar from './ACBar'
import ACCard from './ACCard'
import ACModal from './ACModal'
import ACViolations from './ACViolations'
import {useContext} from 'react';
import AuthContext from '../../../auth/index.js';

// Imports from MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function AccessControlView(){
    const {auth} = useContext(AuthContext);
    
    return (
        <Box sx={{flexGrow: 1}}>
            {/* Access Control Title */}
            <Typography variant='h3' mb={3} mt={3}>
                <strong>Access Control Policy</strong>
            </Typography>

            {/* Snapshot Bar on top to choose Snapshot + Create New Access Control Policy */}
            <ACBar />
            {/* Access Control Policy Card */}
            {auth.user.access_control_req && auth.user.access_control_req !== ' ' ? <ACCard /> : <Typography variant="h4" ml={10}><ErrorOutlineIcon sx={{fontSize: 33, color: 'red'}}/> <strong>Please Create an Access Control Requirement Policy </strong></Typography> }
            
            {/* Violations found in AC Policy */}
            {auth.user.access_control_req && auth.user.access_control_req !== ' ' ?  
                <Box>
                    <Typography variant='h4' mb={2} mt={3}>
                        <strong>Violations</strong>
                    </Typography>
                    <ACViolations />
                </Box>
            : "" }

            {/* AC Modal */}
            <ACModal />
        </Box>
    )
}

export default AccessControlView;