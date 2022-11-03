// Local Imports
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import TextField from'@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';

const snapshotArray = [
    {
        id: 'Snapshot01'
    },
    {
        id: 'Snapshot02'
    },
    {
        id: 'Snapshot03'
    },
    {
        id: 'Snapshot04'
    },
]

function ACBar() {
    const {store} = useContext(GlobalStoreContext);
    const [snapshot, setSnapshot] = useState('Snapshot01');

    const handleSnapshotChange = (event) => {
        setSnapshot(event.target.value);
    }

    return (
        <Toolbar sx={{mb:3}}>

            {/* Select Snapshot Dropdown Menu */}
            <TextField
                id="select-snapshot"
                select
                display="inline"
                label="File Snapshot"
                value={snapshot}
                onChange={handleSnapshotChange}
                sx={{width:"50%"}}
                overflow='auto'
            >
                {snapshotArray.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                        {option.id}
                    </MenuItem>
                ))}
            </TextField>

            {/* View Information or Update Sharing */}
            <Box sx={{flexGrow:.85}}/>
            <Box 
                className="black-button" 
                sx={{width:'150px'}}
                onClick={event => store.openCreateAccessControl() }>
                <center>
                    <Typography 
                        display="inline" 
                        sx={{color:'black'}}> 
                        <strong> Edit Access Control Policy </strong> 
                    </Typography>
                </center>
            </Box>
        </Toolbar>
    );
}

export default ACBar;