// Local imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from Material-UI
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TimelineIcon from '@mui/icons-material/Timeline';
import PolicyIcon from '@mui/icons-material/Policy';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import CloudIcon from '@mui/icons-material/Cloud';
import ShareIcon from '@mui/icons-material/Share';
import FilterDramaIcon from '@mui/icons-material/FilterDrama';

const Root = styled('div')(({ theme }) => ({
    width: '100%',
    ...theme.typography.body2,
    '& > :not(style) + :not(style)': {
      marginTop: theme.spacing(2),
    },
  }));

function DrawerContent(){
    const {store} = useContext(GlobalStoreContext);

    const drives = store.otherDrive
    // console.log(drives)
    return(
        <Root>
                <center>
                    <Box 
                        className="black-button" 
                        onClick={event => store.openTakeSnapshot()}
                        sx={{width: 180}}
                        mt={2}
                        mb={2}
                        textAlign="center"
                        >
                        <AddAPhotoIcon />
                        <Typography display="inline"> <strong> Take Snapshot </strong> </Typography>
                    </Box>
                </center>

                <Divider> Drive </Divider>
                <List mt={-15}>
                    {/* My Drive */}
                    <ListItem key='myDrive' disablePadding
                        onClick={(event)=>{
                            console.log("Open My Drive")
                            store.getSnapshot(store.currentSnapshot, 'MyDrive')
                        }}>
                            <ListItemButton>
                                <ListItemIcon sx={{ml: 1}}>
                                    <CloudIcon />
                                </ListItemIcon>
                                <ListItemText primary='My Drive' sx={{ml: -1.5}} />
                            </ListItemButton>
                    </ListItem>
                    {/* Shared with Me */}
                    <ListItem key='sharedwithme' disablePadding
                        onClick={(event)=>{
                            console.log("Open Shared Drive")
                            store.getSnapshot(store.currentSnapshot, 'SharedWithMe')
                            // store.openDriveView('SharedWithMe')
                        }}>
                        <ListItemButton>
                            <ListItemIcon sx={{ml: 1}}>
                                <ShareIcon />
                            </ListItemIcon>
                            <ListItemText primary='Shared With Me' sx={{ml: -1.5}} />
                        </ListItemButton>
                    </ListItem>
                    {/* Other Shared Drives */}
                    {drives.map((item, i) => {
                        let driveName = item[0]
                        let driveID = item[1]
                        return(
                            <ListItem key={driveID} disablePadding
                                onClick={(event)=>{
                                    console.log("Open " + driveName)
                                    store.getDrive(store.currentSnapshot, driveID, driveName)
                                    // store.openDriveView('SharedWithMe')
                                }}>
                                <ListItemButton>
                                    <ListItemIcon sx={{ml: 1}}>
                                        <FilterDramaIcon />
                                    </ListItemIcon>
                                    <ListItemText primary={driveName} sx={{ml: -1.5}} />
                                </ListItemButton>
                            </ListItem>
                        )
                    })}


                </List>

                <Divider sx={{mb: -3}}> Functionality </Divider>
                <List mt={-15}>
                    {/* Access Control Policy */}
                    <ListItem key='accesscontrol' disablePadding
                        onClick={(event)=>{
                            store.openAccessView();
                        }}>
                            <ListItemButton>
                                <ListItemIcon sx={{ml: 1}}>
                                    <PolicyIcon />
                                </ListItemIcon>
                                <ListItemText primary='Access Control' sx={{ml: -1.5}} />
                            </ListItemButton>
                    </ListItem>
                    {/* Analyze Snapshot */}
                    <ListItem key='analyze' disablePadding
                        onClick={(event)=>{
                            console.log("Open Analyze Snapshot")
                            store.openAnalyzeView();
                        }}>
                        <ListItemButton>
                            <ListItemIcon sx={{ml: 1}}>
                                <TimelineIcon />
                            </ListItemIcon>
                            <ListItemText primary='Analyze' sx={{ml: -1.5}} />
                        </ListItemButton>
                    </ListItem>
                </List>
                
            </Root>
    );
}

export default DrawerContent;