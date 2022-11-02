// Local Imports
import {useState} from 'react';
import SnapshotBar from './SnapshotBar';
import FileTable from './FileTable';
import RouteBar from './RouteBar';
import FileSharingModal from './FileSharingModal';

// Imports from Material-UI
import Box from '@mui/material/Box'

function SnapshotView() {
    const [selected, setSelected] = useState([])
    return(
        <Box sx={{flexGrow: 1}}>
            {/* Snapshot Bar sits on top (Static) */}
            <SnapshotBar />
            <RouteBar />
            {/* File Table based on Selected Drive */}
            <FileTable 
                selected={selected}
                setSelected={setSelected}/>

            <FileSharingModal
                selected={selected}/>
        </Box>
    );
}

export default SnapshotView;