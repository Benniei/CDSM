// Imports from React
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from Material-UI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

function RouteBar(){
    const {store} = useContext(GlobalStoreContext);
    return (
        <Toolbar>
            <HomeIcon sx={{width: 35, height: 35}}/>
                <Box>
                    <Typography variant='h6' ml={1} mt={.5}>
                        {store.openDrive}
                    </Typography>
                </Box>
            <NavigateNextIcon />
                {/* <Box>
                    <Typography variant='h6' ml={1} mt={.5}>
                        {store.openDrive}
                    </Typography>
                </Box> */}
        </Toolbar>
    );
}

export default RouteBar;
