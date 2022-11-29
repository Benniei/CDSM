// Local Imports

// Imports from MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function SharingChangesCard(props) {

    return(
        <Box className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h6" ml={2} sx={{fontSize:24}}>
                <strong>/FILE/PATH/HERE</strong>
            </Typography>
            <Typography variant="h7" ml={2.1} mt={3} sx={{fontSize:20}}>
                
            </Typography>
        </Box>
    )
}

function FileSharingChangesView(props){
    const{mainView} = props
    return(
        <Box>
            <Stack direction="row" spacing={2}>
                <ArrowBackIcon sx={{fontSize:54}} onClick={mainView}/>
                <Typography variant="h3"><strong>File-Folder Sharing Differences Analysis</strong></Typography>
            </Stack>

            <SharingChangesCard />
        </Box>
    )
}

export default FileSharingChangesView;