// Local Imports

// Imports from Material UI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function ACViolations(props) {
    const {filePath, violation} = props
    return(
        <Box className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h6" ml={2} sx={{fontSize:24}}>
                <strong>/FILE/PATH/HERE</strong>
            </Typography>
            <Typography variant="h7" ml={2.1} mt={3} sx={{fontSize:20}}>
                <strong>Access Control Requirement Conflicts: </strong>
            </Typography>
            <Stack direction="row" spacing={1} ml={4} mt={.5}>
                <ErrorOutlineIcon style={{color: 'red', fontSize:25}}/>
                <Typography sx={{fontSize:19}}>
                    <strong>Allowed Writer:</strong> Writer Name
                </Typography>
            </Stack>
        </Box>
    )
}

export default ACViolations;