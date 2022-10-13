// Local imports


// Imports from Material-UI
import Box from '@mui/material/Box';
import AppBanner from './AppBanner';
import Drawer from '@mui/material/Drawer';
import Divider from '@mui/material/Divider';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography'

const drawerWidth = 250;

function Dashboard() {
    return (
        <Box sx={{display:'flex'}}>
            <AppBanner/>
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                    borderBottom: 1, borderColor: 'grey.500',
                }}
            >
                <Toolbar sx={{height: 80, borderBottom:1, borderColor: 'grey.500'}}/>
                <center>
                    <Box 
                        button 
                        className="black-button" 
                        onClick={event => console.log("click")}
                        sx={{width: 200}}
                        mt={2}
                        mb={2}
                        >
                        {/** Add Logo? */}
                        <center>
                            <Typography display="inline"> <strong> Sync </strong> </Typography>
                        </center>
                    </Box>
                </center>
            </Drawer>
        </Box>
    );
}

export default Dashboard;