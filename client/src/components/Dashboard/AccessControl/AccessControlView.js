// Local Import
import ACBar from './ACBar'
import ACCard from './ACCard'
import ACModal from './ACModal'
import {useContext} from 'react';
import AuthContext from '../../../auth/index.js';

// Imports from MUI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function AccessControlView(){
    const {auth} = useContext(AuthContext);
    console.log(auth);
    return (
        <Box sx={{flexGrow: 1}}>
            {/* Access Control Title */}
            <Typography variant='h4' ml={1.5} mb={1}>
                <strong>Access Control Policy</strong>
            </Typography>

            {/* Snapshot Bar on top to choose Snapshot + Create New Access Control Policy */}
            <ACBar />

            {/* An AC Card for every Access Control Policy */}
            <ACCard />
            

            {/* AC Modal */}
            <ACModal />
        </Box>
    )
}

export default AccessControlView;