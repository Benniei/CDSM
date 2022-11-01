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

    let path = [];
    if(store.path.length > 0)
        path = store.path
    
    return (
        <Toolbar>
            <HomeIcon sx={{width: 35, height: 35, mr: .5}}/>
                <Box
                    className="folderLink"
                    onClick={() => store.getSnapshot(store.currentSnapshot)}>
                    <Typography variant='h6' mt={.5} ml={.5} mr={.5}>
                        {store.openDrive}
                    </Typography>
                </Box>
            {
                path.map((item) => {
                    return(
                            [<NavigateNextIcon key={item.id+"nav"}/>,
                            <Box 
                                key={item.id+"box"}
                                className="folderLink"
                                >
                                <Typography variant='h6' ml={.5} mr={.5} mt={.5}>
                                    {item.name}
                                </Typography>
                            </Box>]
                    );
                })
            }
            
        </Toolbar>
    );
}

export default RouteBar;
