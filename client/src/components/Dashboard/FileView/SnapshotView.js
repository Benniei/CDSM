// Local Imports
import {useState} from 'react';
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';
import SnapshotBar from './SnapshotBar';
import FileTable from './FileTable';
import RouteBar from './RouteBar';
import FileSharingModal from './FileSharingModal';

// Imports from Material-UI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'

function SnapshotView() {
    const {store} = useContext(GlobalStoreContext);
    const [selected, setSelected] = useState([]);
    return(
        <Box sx={{flexGrow: 1}}>
            {/* Snapshot Bar sits on top (Static) */}
            <SnapshotBar />
            {!store.search ? <RouteBar /> : <Typography variant='h5' ml={2} mt={2}><strong>Search Results</strong></Typography>}
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