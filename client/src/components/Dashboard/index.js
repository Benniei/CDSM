// Local imports
import AppBanner from './SideComponents/AppBanner';
import DrawerContent from './SideComponents/DrawerContent';
import SnapshotView from './FileView/SnapshotView';
import QueryBuilderModal from './QueryBuilderModal';
import TakeSnapshotModal from './SideComponents/TakeSnapshotModal';
import FileSharingModal from './FileView/FileSharingModal';

// Imports from Material-UI
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';

import React, {useContext, useEffect} from 'react';
import AuthContext from '../../auth/index.js'


const drawerWidth = 250;

function Dashboard() {
    const {auth} = useContext(AuthContext);

    useEffect(() => {
        auth.getLoggedIn();
    }, [auth]);

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
            <FileSharingModal />
        </Box>
    );
}

export default Dashboard;