// Local Imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

function ACNameBar(props) {
    const {content, names} = props
    return (
        <Box sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignContent: 'flex-start'}} mt={.5}>
            <Stack direction='row' spacing={1}>
                <Typography variant="h6" ml={2} mr>
                    <strong>{content}</strong> 
                </Typography>

                {names.map((item) => (
                    <Box 
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
    let data = {
        name: "Access Control 01",
        query: "Search Query",
        allowWrite: ["adam", "Bob", "Carlos"],
        allowRead: [],
        denyRead: ["Zombis", "yell"],
        denyWrite: []
    }
    
    return (
        <Box className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h5">
                <strong> {data.name} </strong>
            </Typography>
            <Typography variant="h6" ml={2} mb={-.5}>
                <strong>Search Query: </strong> {data.query}
            </Typography>
            
            {(data.allowWrite.length > 0) ? 
                <ACNameBar
                    content={"Allowed Writers: "}
                    names={data.allowWrite} />:null}
            {(data.allowRead.length > 0) ? 
                <ACNameBar
                    content={"Allowed Readers: "}
                    names={data.allowReaders} />:null}
            {(data.denyRead.length > 0) ? 
                <ACNameBar
                    content={"Deny Readers: "}
                    names={data.denyRead} />:null}
            {(data.denyWrite.length > 0) ? 
                <ACNameBar
                    content={"Deny Writers: "}
                    names={data.denyWrite} />:null}
                        
        </Box>
    );
}

export default ACCard;