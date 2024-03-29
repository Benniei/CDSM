// Local imports
import {useContext, useEffect} from 'react';
import {GlobalStoreContext} from '../../store';
import AuthContext from '../../auth/index.js';
import AppBanner from './SideComponents/AppBanner';
import DrawerContent from './SideComponents/DrawerContent';
import SnapshotView from './FileView/SnapshotView';
import AccessControlView from './AccessControl/AccessControlView';
import QueryBuilderModal from './QueryBuilderModal';
import TakeSnapshotModal from './SideComponents/TakeSnapshotModal';
import AnalyzeMainView from './AnalyzeView/AnalyzeMainView'

// Imports from Material-UI
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';


const drawerWidth = 250;

function Dashboard() {
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);

    useEffect(() => {
        if(auth.loggedIn){
            console.log(store);
            if (auth.user.filesnapshot && !store.search)
                store.getSnapshot(auth.user.filesnapshot[0], store.openDrive)
        }
    }, [auth.loggedIn]);
    

    let driveFlag = store.openAccess || store.openAnalyze;
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
                {!driveFlag ? <SnapshotView/>: (store.openAccess? <AccessControlView/> : <AnalyzeMainView />)}
            </Box>

            {/* Modals */}
            <QueryBuilderModal />
            <TakeSnapshotModal />
        </Box>
    );
}

export default Dashboard;