import {Link} from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import IconButton from '@mui/material/IconButton';

export default function AppBanner() {

    return (
        <Box sx={{flexGrow:1, borderBottom:1, borderColor: 'grey.500', zIndex: (theme) => theme.zIndex.drawer + 1}}>
            <Toolbar  position="fixed" sx={{height: 80}}>
                {/** Kloud Logo */}
                <Box
                    component="img"
                    sx={{width: 55, height: 55}}
                    ml={.5}
                    src="https://i.imgur.com/MWrRhEY.png" />
                <Typography variant="h4">
                    <strong> LOUD </strong>
                </Typography>

                <Grid container spacing={2} ml={18} alignItems="center" justifyContent="center">
                    <Grid item xs={9}>
                        <TextField   
                            id="search"
                            label="Search"
                            name="search"
                            autoComplete="Search"
                            size="large"
                            fullWidth
                            sx={{backgroundColor:"#FFFFFF"}}
                        />
                    </Grid>
                    <Grid item xs={1}>
                        <TuneOutlinedIcon sx={{fontSize:30}} />
                    </Grid>
                    <Grid item xs={2} />
                    
                </Grid>
                {/**Logout Button */}
                <Box 
                    button 
                    className="black-button" 
                    onClick={event => window.location.href='http://localhost:3000'}
                    mr={-30}>
                    {/** Add Logo? */}
                    <center>
                        <Typography display="inline"> <strong> Logout </strong> </Typography>
                    </center>
                </Box>
                        

                
            </Toolbar>
            
            
        </Box>
    );
}