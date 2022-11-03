// Local Imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';
import AuthContext from '../../../auth/index.js';

// Imports from MUI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

function ACNameBar(props) {
    const {content, names} = props;
    console.log(content, names);
    return (
        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start'}} mt={.5} ml={2}>
            <Stack direction='row' spacing={1}>
                <Typography variant="h6" ml={2} mr>
                    <strong>{content}</strong> 
                </Typography>

                {names.map((item) => (
                    <Box 
                        key={item}
                        className="grey-button"
                        display="flex"
                        ml={.25}
                        mr={.25}
                    >
                        <Typography mt={.3}>{item}</Typography>
                    </Box>
                ))}
            </Stack> 
        </Box>
    )
}

function ACCard() {
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);
    let data = {
        query: auth.user.access_control_req.query,
        grp: auth.user.access_control_req.Grp,
        allowWrite: auth.user.access_control_req.AW,
        allowRead: auth.user.access_control_req.AR,
        denyRead: auth.user.access_control_req.DR,
        denyWrite: auth.user.access_control_req.DW
    }
    console.log(data.grp);
    
    return (
        <Box className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h4" ml={2} mb={1.5}>
                <strong>Search Query: </strong> {data.query}
            </Typography>
            
            <Typography variant="h6" ml={4} mb={.5}> 
                <strong>Group Directive: </strong> { String(data.grp)== "true" ? "On" : "Off"}
            </Typography>
            <ACNameBar
                content={"Allowed Writers: "}
                names={data.allowWrite} />
        
            <ACNameBar
                content={"Allowed Readers: "}
                names={data.allowRead} />
        
            <ACNameBar
                content={"Deny Readers: "}
                names={data.denyRead} />
        
            <ACNameBar
                content={"Deny Writers: "}
                names={data.denyWrite} />
                        
        </Box>
    );
}

export default ACCard;