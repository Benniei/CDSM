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
                        button 
                        className="black-button" 
                        onClick={event => console.log("click")}
                        sx={{width: 150}}
                        mt={2}
                        mb={2}
                        >
                        {/** Add Logo? */}
                        <center>
                            <Typography display="inline"> <strong> Sync </strong> </Typography>
                        </center>
                    </Box>
                </center>
                <Divider> Drive </Divider>
                <Divider sx={{mb: -3}}> Functionality </Divider>
                <List mt={-15}>
                    <ListItem key='analyze' disablePadding>
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