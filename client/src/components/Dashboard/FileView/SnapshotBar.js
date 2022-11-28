// Imports from React
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../../store';
import AuthContext from '../../../auth/index.js';

// Imports from Material-UI
import TextField from'@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';


function SnapshotBar(){
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);
    const handleSnapshotChange = (event) => {
        store.getSnapshot(event.target.value, store.openDrive);
    }

    const snapshotArray = auth.user?auth.user.filesnapshot:[];

    return(
        <Toolbar >

            {/* Select Snapshot Dropdown Menu */}
            <TextField
                id="select-snapshot"
                select
                display="inline"
                label="File Snapshot"
                value={store.currentSnapshot}
                InputLabelProps={{shrink: true}}
                onChange={handleSnapshotChange}
                sx={{width:"50%"}}
                overflow='auto'
            >
                {snapshotArray.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option.substring(option.indexOf('-')+1)}
                    </MenuItem>
                ))}
            </TextField>

            {/* View Information or Update Sharing */}
            <Box sx={{flexGrow:.95}}/>
            <Box 
                className="black-button" 
                sx={{width:'150px'}}
                onClick={event => store.openUpdateSharing()}>
                <center>
                    <Typography 
                        display="inline" 
                        sx={{color:'black'}}> 
                        <strong> Update Sharing </strong> 
                    </Typography>
                </center>
            </Box>
        </Toolbar>
    );
}

export default SnapshotBar;
