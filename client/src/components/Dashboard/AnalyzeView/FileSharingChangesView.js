// Local Imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function SharingChangesCard(props) {
    const {path, fileExclusive, folderExclusive} = props
    return(
        <Box key={'filechange' + path} className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h6" ml={2} sx={{fontSize:30}}>
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
                                <Typography key={'filechange1' + path+item} variant="h7" ml={5} mt={1} sx={{fontSize:20}}>
                                    {result}
                                </Typography>
                            )
                        })
                    }
                </Stack>
                <Stack direction="column" sx={{width:'40%'}}>
                    <Typography variant="h7" ml={3} sx={{fontSize:24}}>
                        <strong>Folder Exclusive Permissions</strong>
                    </Typography>
                    {
                        folderExclusive.map((item) => {
                            const parts = item.substring(1, item.length-1).split(",").map((item) => item.trim())
                            let result;
                            if(parts[0] === "anyone")
                                result = "Anyone (" + parts[1] + ")";
                            else
                                result = parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + " (" + parts[2] + ")";

                            return(
                                <Typography key={'filechange2' + path+item} variant="h7" ml={5} mt={1} sx={{fontSize:20}}>
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

function FileSharingChangesView(props){
    const {store} = useContext(GlobalStoreContext);
    const{mainView, snapshot} = props

    return(
        <Box>
            <Stack direction="row" spacing={2}>
                <ArrowBackIcon sx={{fontSize:54}} onClick={mainView}/>
                <Typography variant="h3"><strong>File-Folder Sharing Differences Analysis</strong></Typography>
            </Stack>
            <Typography variant="h5" ml={3} mt={.5}><strong>Snapshot: </strong> {snapshot.substring(snapshot.indexOf('-')+1)}</Typography>
            
            {store.analyze.map((item) => {
                return(<SharingChangesCard 
                    path={item.path} 
                    fileExclusive={item.fileFolderDifferences.fileExclusivePermissions}
                    folderExclusive={item.fileFolderDifferences.folderExclusivePermissions}/>)
            })}
        </Box>
    )
}

export default FileSharingChangesView;