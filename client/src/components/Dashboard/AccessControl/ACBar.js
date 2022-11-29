// Local Imports
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../../store';
import AuthContext from '../../../auth/index.js';

// Imports from MUI
import TextField from'@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';

function ACBar() {
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);
    const [snapshot, setSnapshot] = useState(store.currentSnapshot);

    const snapshotArray = auth.user?auth.user.filesnapshot:[];
    return (
        <Toolbar sx={{mb:3}}>

            {/* Select Snapshot Dropdown Menu */}
            <TextField
                id="select-snapshot"
                select
                display="inline"
                label="File Snapshot"
                value={snapshot}
                onChange={(event) => setSnapshot(event.target.value)}
                sx={{width:"50%", ml:1}}
                overflow='auto'
            >
                {snapshotArray.map((option) => (
                    <MenuItem key={option} value={option}>
                        {option.substring(option.indexOf('-')+1)}
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