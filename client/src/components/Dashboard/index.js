// Local imports
import AppBanner from './SideComponents/AppBanner';
import DrawerContent from './SideComponents/DrawerContent';
import SnapshotView from './FileView/SnapshotView';
import QueryBuilderModal from './QueryBuilderModal';
import TakeSnapshotModal from './SideComponents/TakeSnapshotModal';

// Imports from Material-UI
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';

const drawerWidth = 250;

function Dashboard() {
    return (
        <Box sx={{display:'flex'}}>
            {/** Top App Banner (Static)*/}
            <AppBanner/>
            {/** Left Side Drawer (Static)*/}
            <Drawer
                variant="permanent"
                sx={{
                    width: drawerWidth,
                    flexShrink: 0,
                    [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
                    borderBottom: 1, borderColor: 'grey.500',
                }}
            >
                <Toolbar sx={{height: 80}}/>
                <DrawerContent />
            </Drawer>

            {/** Middle Component (Dynamic)*/}
            <Box component="main" sx={{flexGrow:1, p:3}}>
                <Toolbar sx={{height: 80}}/>
                <SnapshotView />
            </Box>

            {/* Modals */}
            <QueryBuilderModal />
            <TakeSnapshotModal />
        </Box>
    );
}

export default Dashboard;