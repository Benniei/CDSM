// Imports from React
import {useState} from 'react';

// Imports from Material-UI
import Grid from '@mui/material/Grid';
import TextField from'@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

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

const groupSnapshotArray =[
    {
        id: 'GroupSnapshot01'
    },
    {
        id: 'GroupSnapshot02'
    },
    {
        id: 'GroupSnapshot03'
    },
    {
        id: 'GroupSnapshot04'
    }
]

function SnapshotBar(){
    const [snapshot, setSnapshot] = useState('Snapshot01');
    const [groupsnapshot, setGroupsnapshot] = useState('GroupSnapshot01');

    const handleSnapshotChange = (event) => {
        setSnapshot(event.target.value);
    }

    const handleGroupChange = (event) => {
        setGroupsnapshot(event.target.value);
    }

    return(
        <Grid container spacing={2} mb={2}>
            {/* TODO: Add Selected item + selected drive */}
            {/* <Grid item xs={1}>
            </Grid> */}

            {/* Select Snapshot Dropdown Menu */}
            <Grid item xs={4.5}>
                <TextField
                    id="select-snapshot"
                    select
                    label="Snapshot"
                    value={snapshot}
                    onChange={handleSnapshotChange}
                    fullWidth
                    overflow='auto'
                >
                    {snapshotArray.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.id}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            {/* Select Group Snapshot Dropdown Menu */}
            <Grid item xs={4.5}>
                <TextField
                    id="select-group-snapshot"
                    select
                    label="Group Snapshot"
                    value={groupsnapshot}
                    onChange={handleGroupChange}
                    fullWidth
                    overflow='auto'
                >
                    {groupSnapshotArray.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                            {option.id}
                        </MenuItem>
                    ))}
                </TextField>
            </Grid>

            <Grid item xs={1.5}>
                {/* Button for edit sharing */}
            </Grid>
        </Grid>
    );
}

export default SnapshotBar;
