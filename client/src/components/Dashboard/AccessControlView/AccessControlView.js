// Local Import
import ACBar from './ACBar'
import ACCard from './ACCard'
import ACModal from './ACModal'

// Imports from MUI
import Box from '@mui/material/Box'

function AccessControlView(){
    return (
        <Box sx={{flexGrow: 1}}>
            {/* Snapshot Bar on top to choose Snapshot + Create New Access Control Policy */}
            <ACBar />

            {/* An AC Card for every Access Control Policy */}

            {/* AC Modal */}
            
        </Box>
    )
}

export default AccessControlView;