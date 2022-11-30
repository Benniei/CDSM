// Local Imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function DeviantCard(props) {
    const {path, fileExclusive, majorityExclusive} = props
    return(
        <Box key={'deviant' + path} className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h6" ml={2} sx={{fontSize:24}}>
                <strong>{path}</strong>
            </Typography>

            <Box display="flex" mt={1}>
                <Stack direction="column" sx={{width:'40%', mr:'2%'}}>
                    <Typography variant="h7" ml={2.1} sx={{fontSize:24}}>
                        <strong>File Exclusive Permissions</strong>
                    </Typography>
                    {
                        fileExclusive.map((item) => {
                            const parts = item.substring(1, item.length-1).split(",").map((item) => item.trim())
                            let result;
                            if(parts[0] === "anyone")
                                result = "Anyone (" + parts[1] + ")";
                            else
                                result = parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + " (" + parts[2] + ")";
                                
                            return(
                                <Typography key={'deviant1' + path+item} variant="h7" ml={5} mt={1} sx={{fontSize:20}}>
                                    {result}
                                </Typography>
                            )
                        })
                    }
                </Stack>
                <Stack direction="column" sx={{width:'40%'}}>
                    <Typography variant="h7" ml={3} sx={{fontSize:24}}>
                        <strong>Majority Exclusive Permissions</strong>
                    </Typography>
                    {
                        majorityExclusive.map((item) => {
                            const parts = item.substring(1, item.length-1).split(",").map((item) => item.trim())
                            let result;
                            if(parts[0] === "anyone")
                                result = "Anyone (" + parts[1] + ")";
                            else
                                result = parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + " (" + parts[2] + ")";

                            return(
                                <Typography key={'deviant2' + path+item} variant="h7" ml={5} mt={1} sx={{fontSize:20}}>
                                    {result}
                                </Typography>
                            )
                        })
                    }
                </Stack>
            </Box>
        </Box>
    )
}

function DeviantView(props) {
    const {store} = useContext(GlobalStoreContext);
    const{mainView, snapshot} = props
    console.log(store.analyze)
    return(
        <Box>
            <Stack direction="row" spacing={2}>
                <ArrowBackIcon sx={{fontSize:54}} onClick={mainView}/>
                <Typography variant="h3"><strong>Deviant Sharing Analysis</strong></Typography>
            </Stack>
            <Typography variant="h5" ml={3} mt={.5}><strong>Snapshot: </strong> {snapshot.substring(snapshot.indexOf('-')+1)}</Typography>
            {store.analyze.map((item) => {
                return(<DeviantCard 
                    path={item.path} 
                    fileExclusive={item.fileFolderDifferences.fileExclusivePermissions}
                    majorityExclusive={item.fileFolderDifferences.folderExclusivePermissions}/>)
            })}
        </Box>
    )
}

export default DeviantView