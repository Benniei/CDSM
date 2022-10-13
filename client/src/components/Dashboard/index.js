// Local imports
import AppBanner from './AppBanner';
import DrawerContent from './DrawerContent';

// Imports from Material-UI
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';

const drawerWidth = 220;

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
                <DrawerContent />
            </Drawer>
        </Box>
    );
}

export default Dashboard;