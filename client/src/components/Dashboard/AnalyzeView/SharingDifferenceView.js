// Local Imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function SharingDifferencesCard(props) {
    const {route, permission} = props
    return(
        <Box key={"DiffAnalysis0" + route} className="access-control-card" sx={{width: '87%'}} ml={3} mt={2}>
            <Typography variant="h6" ml={2} sx={{fontSize:23}}>
                <strong>{route}</strong>
            </Typography>
            {permission[0].length > 0 ? <Box>
                <Typography variant="h7" ml={4} mt={3} sx={{fontSize:20, color: 'red'}}>
                    Snapshot 1 Exclusive Permissions
                </Typography>
                    {permission[0].map((item) => {
                        const parts = item.substring(1, item.length-1).split(",").map((item) => item.trim())
                        let result;
                        if(parts[0] === "anyone")
                            result = "Anyone (" + parts[1] + ")";
                        else
                            result = parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + " (" + parts[2] + ")";

                        return(
                            <Typography key={'DiffAnalysis1' + route+item} variant="h7" ml={6} mt={1} sx={{fontSize:20}}>
                                {result}
                            </Typography>
                        )
                    })}
            </Box>: null}
            {permission[1].length > 0 ? <Box>
                <Typography variant="h7" ml={4} mt={3} sx={{fontSize:20, color:'blue'}}>
                    <strong>Snapshot 2 Exclusive Permissions</strong>
                </Typography>
                <Stack>
                    {permission[1].map((item) => {
                        const parts = item.substring(1, item.length-1).split(",").map((item) => item.trim())
                        let result;
                        if(parts[0] === "anyone")
                            result = "Anyone (" + parts[1] + ")";
                        else
                            result = parts[1].charAt(0).toUpperCase() + parts[1].slice(1) + " (" + parts[2] + ")";

                        return(
                            <Typography key={'DiffAnalysis2' + route+item} variant="h7" ml={6} mt={1} sx={{fontSize:20}}>
                                {result}
                            </Typography>
                        )
                    })}
                </Stack>
            </Box>: null}
        </Box>
    )
}

function SharingDifferenceView(props) {
    const {store} = useContext(GlobalStoreContext);
    const{mainView, snapshot1, snapshot2} = props

    return(
        <Box>
            <Stack direction="row" spacing={2}>
                <ArrowBackIcon sx={{fontSize:54}} onClick={mainView}/>
                <Typography variant="h3"><strong>Sharing Differences Analysis</strong></Typography>
            </Stack>
            <Box display="flex" sx={{mt: .5}}>
                <Typography variant="h5" ml={3} mt={.5}><strong style={{color: 'red'}}>Snapshot 1: </strong> {snapshot1.substring(snapshot1.indexOf('-')+1)}</Typography>
                <Typography variant="h5" ml={3} mt={.5}><strong style={{color: 'blue'}}>Snapshot 2: </strong> {snapshot2.substring(snapshot2.indexOf('-')+1)}</Typography>
            </Box>

            <Box display="flex" mt={2}>
                <Stack direction="column" sx={{width:'50%'}}>
                    <Typography variant="h6" ml={2.1} sx={{fontSize:30}}>
                        <strong>New Files</strong> 
                    </Typography>
                    {
                        store.analyze.newFiles.map((item) => {
                            return(
                                <Box key={'DiffAnalysis' + item.fileId} sx={{overflow: "hidden", width: "auto", fontSize:20, display: "flex"}} whiteSpace="normal" >
                                    <Typography variant="h6">
                                    {item.path.name + item.name}
                                    </Typography>
                                </Box>
                            )
                        })
                    }
                </Stack>
                <Stack direction="column" sx={{width:'50%', ml:-5}}>
                        <Typography variant="h6" ml={2.1} sx={{fontSize:30}}>
                            <strong>Permission Differences</strong>
                        </Typography>
                        {
                            Object.keys(store.analyze.permissionDifferences).map((item) => {
                                return(
                                    <SharingDifferencesCard
                                        route={item}
                                        permission={store.analyze.permissionDifferences[item]} />
                                )
                            })
                        }
                </Stack>
            </Box>
        </Box>
    )
}

export default SharingDifferenceView;