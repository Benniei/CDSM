// Local Imports
import SnapshotBar from './SnapshotBar'
import FileTable from './FileTable'
import RouteBar from './RouteBar'

// Imports from Material-UI
import Box from '@mui/material/Box'

function SnapshotView() {
    return(
        <Box sx={{flexGrow: 1}}>
            {/* Snapshot Bar sits on top (Static) */}
            <SnapshotBar />
            <RouteBar />
            {/* File Table based on Selected Drive */}
            <FileTable />
        </Box>
    );
}

export default SnapshotView;