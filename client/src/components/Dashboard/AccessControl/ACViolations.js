// Local Imports

// Imports from Material UI
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function ACViolations(props) {
    const {violation} = props

    let AW = "";
    let AR = "";
    let DW = "";
    let DR = "";
    let path = "";
    console.log(violation);
    console.log(violation && violation.AW);

    if (violation && violation.AW) 
        AW =    (<Stack direction="row" spacing={1} ml={4} mt={.5}>
                    <ErrorOutlineIcon style={{color: 'red', fontSize:25}}/>
                    <Typography sx={{fontSize:19}}>
                        <strong>Allowed Writers: {violation.AW}</strong>
                    </Typography>
                </Stack>);
    if (violation && violation.AR) 
        AR =    (<Stack direction="row" spacing={1} ml={4} mt={.5}>
                    <ErrorOutlineIcon style={{color: 'red', fontSize:25}}/>
                    <Typography sx={{fontSize:19}}>
                        <strong>Allowed Readers: {violation.AR}</strong>
                    </Typography>
                </Stack>);
    if (violation && violation.DW) 
        DW =    (<Stack direction="row" spacing={1} ml={4} mt={.5}>
                    <ErrorOutlineIcon style={{color: 'red', fontSize:25}}/>
                    <Typography sx={{fontSize:19}}>
                        <strong>Denied Writers: {violation.DW}</strong>
                    </Typography>
                </Stack>);
    if (violation && violation.DR) 
        DR =    (<Stack direction="row" spacing={1} ml={4} mt={.5}>
                    <ErrorOutlineIcon style={{color: 'red', fontSize:25}}/>
                    <Typography sx={{fontSize:19}}>
                        <strong>Denied Readers: {violation.DR}</strong>
                    </Typography>
                </Stack>);

    if (violation) 
        path = violation.path.name;

    return(
        <Box className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h6" ml={2} sx={{fontSize:24}}>
                <strong>{path}</strong>
            </Typography>
            <Typography variant="h7" ml={2.1} mt={3} sx={{fontSize:20}}>
                <strong>Access Control Requirement Conflicts: </strong>
            </Typography>
            <Stack direction="column" spacing={1}>
            { AW }
            { AR }
            { DW }
            { DR }                 
            </Stack>
        </Box>
    )
}

export default ACViolations;