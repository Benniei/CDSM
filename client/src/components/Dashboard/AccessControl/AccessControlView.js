// Local Import
import ACBar from './ACBar'
import ACCard from './ACCard'
import ACModal from './ACModal'
import ACViolations from './ACViolations'
import {useContext} from 'react';
import AuthContext from '../../../auth/index.js';
import GlobalStoreContext from '../../../store/index.js';

// Imports from MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function AccessControlView(){
    const {auth} = useContext(AuthContext);
    const {store} = useContext(GlobalStoreContext);

    let violations = store.violations;
    
    return (
        <Box sx={{flexGrow: 1}}>
            {/* Access Control Title */}
            <Typography variant='h3' mb={3} mt={3}>
                <strong>Access Control Policy</strong>
            </Typography>

            {/* Snapshot Bar on top to choose Snapshot + Create New Access Control Policy */}
            <ACBar />
            {/* Access Control Policy Card */}
            <ACCard />
            
            {/* Violations found in AC Policy */}
            <Box>
                <Typography variant='h4' mb={2} mt={3}>
                    <strong>Violations</strong>
                </Typography>
                {
                    violations.map(violation =>
                        <ACViolations violation={violation}/> )
                }
            </Box>

            {/* AC Modal */}
            <ACModal />
        </Box>
    )
}

export default AccessControlView;