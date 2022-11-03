// Local Imports
import {useState} from 'react';

// Imports from Material UI
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

function NameBar(props){
    const [data, setData] = useState("");
    const {label, values, submitData, removeData} = props

    console.log(label, values);

    return (
        <Stack spacing={1}>
            <TextField
                id={label}
                label={label}
                fullWidth
                overflow='auto' 
                value={data}
                onChange= {(event) => {setData(event.target.value)}}
                onKeyPress={(event) => {
                    if (event.key === 'Enter'){
                        submitData(data)
                        setData("");
                    }
                }}/>
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'flex-start'}}>
                {values.map((item) => (
                    <Box 
                        className="grey-button"
                        display="flex"
                        ml={.25}
                        mr={.25}
                    >
                        <Typography display='inline' sx={{ml:1}}>{item}</Typography>
                        <CloseIcon sx={{width:'28%', ml:.2, mt:-.2,
                            ':hover': {
                                bgcolor: 'grey.300',
                                color: 'black'
                            },
                            color: 'black',
                            p:.1,
                            borderRadius: '50%'}}
                            onClick={event => removeData(item)}/>
                    </Box>
                ))}
            </Box>
        </Stack>
    )
}

export default NameBar;