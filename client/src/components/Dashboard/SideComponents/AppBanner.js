// Local Imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../../store';
import AuthContext from '../../../auth/index.js';
import { ReactComponent as GoogleDrive } from '../../../assets/GoogleDriveIcon.svg';
import { ReactComponent as MicrosoftOneDriveIcon } from '../../../assets/MicrosoftOneDriveIcon.svg';


// Imports from Material-UI
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';

function AppBanner() {
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);

    function handleOpenBuilder(){
        store.openQueryBuilder();
    }

    let driveIcon = null;
    let email = "";
    if (auth.loggedIn) {
        driveIcon = auth.user.cloudProvider === "google"? <GoogleDrive className="driveIcon"/>:<MicrosoftOneDriveIcon className="driveIcon"/>;
        email = auth.user.email;
    }

    return (
        <AppBar 
            position="fixed"
            elevation={0}
            sx={{height: 80, 
                flexGrow:1, 
                borderBottom:1, 
                borderColor: 'grey.500', 
                zIndex: (theme) => theme.zIndex.drawer + 1,
                background: "#ffffff"}}>
            <Toolbar>
                {/** Kloud Logo */}
                <Box
                    component="img"
                    sx={{height: 55}}
                    ml={.5}
                    mr={10}
                    src="https://i.imgur.com/TXlPK0j.png" />

                {/** Search Bar */}
                <TextField   
                    id="search"
                    label="Search"
                    name="search"
                    autoComplete="Search"
                    size="large"
                    sx={{backgroundColor:"#FFFFFF", width:'50%', mt:1}}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <TuneOutlinedIcon 
                                    sx={{
                                        ':hover': {
                                            bgcolor: 'grey.300',
                                            color: 'black'
                                        },
                                        color: 'black',
                                        p:1,
                                        borderRadius: '50%'
                                    }}
                                    onClick={event =>  handleOpenBuilder()}/>
                            </InputAdornment>
                        )
                      }}
                />                
                <Box sx={{flexGrow:1}} />
                {/* Logo + User Login Name */}
                {driveIcon}
                <Divider orientation="vertical" variant="middle" flexItem />
                <Typography
                    sx={{zIndex: (theme) => theme.zIndex.drawer + 1, color:'black', ml: 1, mr: 2, mt:1.5}}
                    variant='h9'>
                    <strong> {email} </strong>
                </Typography>
                {/* Logout Button */}
                <Box 
                    className="black-button" 
                    onClick={event => window.location.href=`${process.env.REACT_APP_URL}/logout`}
                    sx={{zIndex: (theme) => theme.zIndex.drawer + 1, width: '70px', mt:1}}>
                    {/** Add Logo? */}
                    <center>
                        <Typography 
                            display="inline" 
                            sx={{zIndex: (theme) => theme.zIndex.drawer + 1, color:'black'}}> 
                            <strong> Logout </strong> 
                        </Typography>
                    </center>
                </Box>
            </Toolbar>  
        </AppBar>
    );
}

export default AppBanner;