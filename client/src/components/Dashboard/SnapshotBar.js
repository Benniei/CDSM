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

function SnapshotBar(){
    const [snapshot, setSnapshot] = useState('Snapshot01');

    const handleChange = (event) => {
        setSnapshot(event.target.value);
    }

    return(
        <Grid container spacing={2} mb={2}>
            {/* Select Snapshot Dropdown Menu */}
            <Grid item xs={5}>
                <TextField
                    id="select-snapshot"
                    select
                    label="Snapshot"
                    value={snapshot}
                    onChange={handleChange}
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
            {/* TODO: Group Membership (?) */}
            <Grid item xs={5}>
            </Grid>
        </Grid>
    );
}

export default SnapshotBar;
