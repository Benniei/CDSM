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

    return(
        <Root>
                <center>
                    <Box 
                        className="black-button" 
                        onClick={event => console.log("click")}
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
                    <ListItem key='myDrive' disablePadding>
                            <ListItemButton>
                                <ListItemIcon sx={{ml: 1}}>
                                    <CloudIcon />
                                </ListItemIcon>
                                <ListItemText primary='My Drive' sx={{ml: -1.5}} />
                            </ListItemButton>
                    </ListItem>
                    <ListItem key='sharedwithme' disablePadding>
                        <ListItemButton>
                            <ListItemIcon sx={{ml: 1}}>
                                <ShareIcon />
                            </ListItemIcon>
                            <ListItemText primary='Shared With Me' sx={{ml: -1.5}} />
                        </ListItemButton>
                    </ListItem>
                    <ListItem key='otherdrive' disablePadding>
                        <ListItemButton>
                            <ListItemIcon sx={{ml: 1}}>
                                <FilterDramaIcon />
                            </ListItemIcon>
                            <ListItemText primary='Other Drives' sx={{ml: -1.5}} />
                        </ListItemButton>
                    </ListItem>
                </List>
                <Divider sx={{mb: -3}}> Functionality </Divider>
                <List mt={-15}>
                    <ListItem key='accesscontrol' disablePadding>
                            <ListItemButton>
                                <ListItemIcon sx={{ml: 1}}>
                                    <PolicyIcon />
                                </ListItemIcon>
                                <ListItemText primary='Access Control' sx={{ml: -1.5}} />
                            </ListItemButton>
                    </ListItem>
                    <ListItem key='analyze' disablePadding>
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