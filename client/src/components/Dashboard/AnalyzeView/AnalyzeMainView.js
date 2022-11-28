// Local Imports
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../../store';
import AuthContext from '../../../auth/index.js';
import DeviantView from "./DeviantView";
import FileSharingChangesView from "./FileSharingChangesView";
import SharingDifferenceView from "./SharingDifferenceView";


// Imports from MUI
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from'@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';

function AnalyzeMainView() {
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);
    const [deviant, setDeviant] = useState(".51");
    const [view, setView] = useState("Normal");
    const [snapshot1, setSnapshot1] = useState(store.currentSnapshot);
    const [snapshot2, setSnapshot2] = useState(store.currentSnapshot);

    function mainView() {
        setView("Normal")
    }

    function openDeviant(event) {
        if(deviant >= .51)
            setView("Deviant")
    }
     
    function openSharingChanges(event) {
        setView("SharingChanges")
    }

    function openSharingDifferences(event) {
        setView("SharingDifferences")
    }



    const snapshotArray = auth.user.filesnapshot;

    let content
    if (view === "Normal"){
        content = 
        <Box mt={3}>
            <Typography variant="h3"><strong>Analytics</strong></Typography>
            <Box display="flex" sx={{mt: 3}}>
                    <Stack 
                        direction="column" 
                        className="analyzeOption"
                        sx={{width:'40%', mr:'2%'}}>
                        <Typography style={{fontSize:29}}><strong>Deviant Sharing</strong></Typography>
                        <Typography style={{fontSize:19}} sx={{ml:1.5, mb:1}}>
                            <strong>
                                Deviant Permissions check to ensure if most other files in the same folder have the exact same permissions
                                as each other. The Threshold must be at least 51%.
                            </strong>
                        </Typography>
                        <Stack direction="row">
                            <TextField 
                                label={"Threshold"}
                                sx={{width:'35%'}} 
                                value={deviant}
                                onChange={(event) => setDeviant(event.target.value)}/>
                            <Box sx={{flexGrow: .98}} />
                            <Box 
                            className="black-button" 
                            sx={{width:'100px', height:'25px', mt:1}}
                            onClick={openDeviant}
                            >
                                <center>
                                    <Typography 
                                        sx={{color:'black', mb:1}}> 
                                        <strong> Analyze </strong> 
                                    </Typography>
                                </center>
                            </Box>
                        </Stack>
                    </Stack>
                    <Stack 
                        direction="column" 
                        className="analyzeOption"
                        sx={{width:'40%'}}>
                        <Typography style={{fontSize:29}}><strong>File-Folder Sharing Differences</strong></Typography>
                        <Typography style={{fontSize:19}} sx={{ml:2, mb: 1}}>
                            <strong>
                                File-Folder Sharing Differences display files whose permissions differ from the permisions of the folder 
                                they are in.
                            </strong>
                        </Typography>
                        <Stack direction="row">
                            <Box sx={{flexGrow: .98}} />
                            <Box 
                            className="black-button" 
                            sx={{width:'100px', height:'25px', mt:1}}
                            onClick={openSharingChanges}
                            >
                                <center>
                                    <Typography 
                                        sx={{color:'black', mb:1}}> 
                                        <strong> Analyze </strong> 
                                    </Typography>
                                </center>
                            </Box>
                        </Stack>
                    </Stack> 
            </Box>

            <Box
                sx={{width:'84%', mt:3}} 
                className="analyzeOption">
                    <Typography style={{fontSize:29}}><strong>Sharing Differences</strong></Typography>
                        <Typography style={{fontSize:19}} sx={{ml:1.5, mb:1}}>
                            <strong>
                                Sharing Differences displays information about the differences between two snapshots. This includes sharing new 
                                files and sharing changes for files that exist in both snapshots. It excludes information about deleted files.
                            </strong>
                        </Typography>
                        <Stack direction="row" mt={2}>
                            {/* Select Snapshot Dropdown Menu */}
                            <TextField
                                id="select-snapshot"
                                select
                                display="inline"
                                label="File Snapshot"
                                value={snapshot1}
                                onChange={(event) => setSnapshot1(event.target.value)}
                                sx={{width:"43%", mr:3}}
                                overflow='auto'
                            >
                                {snapshotArray.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option.substring(option.indexOf('-')+1)}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                id="select-snapshot"
                                select
                                display="inline"
                                label="File Snapshot"
                                value={snapshot2}
                                onChange={(event) => setSnapshot2(event.target.value)}
                                sx={{width:"43%"}}
                                overflow='auto'
                            >
                                {snapshotArray.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option.substring(option.indexOf('-')+1)}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Stack>
                        <Stack direction="row">
                            <Box sx={{flexGrow: .98}} />
                            <Box 
                            className="black-button" 
                            sx={{width:'100px', height:'25px', mt:1}}
                            onClick={openSharingDifferences}
                            // onClick={event => {store.analyzeSnapshots('63622af03f1cede505453ce6-November 23rd 2022, 3:54:25', '63622af03f1cede505453ce6-November 23rd 2022, 3:55:44')}}
                            // onClick={event => {store.analyzeSnapshots('63622af03f1cede505453ce6-November 23rd 2022, 3:55:44', '63622af03f1cede505453ce6-November 23rd 2022, 3:56:46')}}
                            >
                                <center>
                                    <Typography 
                                        sx={{color:'black', mb:1}}> 
                                        <strong> Analyze </strong> 
                                    </Typography>
                                </center>
                            </Box>
                        </Stack>
            </Box>
        </Box>
    }
    
    else if(view === "Deviant"){
        content = <DeviantView
                    mainView={mainView}/>
    }
    else if(view === "SharingChanges") {
        content = <FileSharingChangesView 
                    mainView={mainView}/>
    }
    else if(view === "SharingDifferences") {
        content = <SharingDifferenceView 
                    mainView={mainView}/>
    }

    return(
       content
    )
}

export default AnalyzeMainView;