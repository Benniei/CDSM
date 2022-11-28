// Local Imports
import {useContext, useState, useEffect} from 'react';
import {GlobalStoreContext} from '../../../store';
import AuthContext from '../../../auth/index.js';
import NameBar from '../NameBar'

// Imports from MUI
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import Grid from '@mui/material/Grid'

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '38%',
    maxHeight:'70%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
    overflowY: 'scroll'
};

function ACModal() {
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);
    const [allowWrite, setAllowWrite] = useState("");
    const [allowWriters, setAllowWriters] = useState([]);
    const [allowRead, setAllowRead] = useState("");
    const [allowReaders, setAllowReaders] = useState([]);
    const [denyRead, setDenyRead] = useState("");
    const [denyReaders, setDenyReaders] = useState([]);
    const [denyWrite, setDenyWrite] = useState("");
    const [denyWriters, setDenyWriters] = useState([]);
    const [flag, setFlag] = useState(false);

    useEffect(() => {
        let acr = auth.user.access_control_req;
        if(acr && acr !== ' ') {
            setAllowWriters(acr.AW);
            setAllowReaders(acr.AR);
            setDenyReaders(acr.DR);
            setDenyWriters(acr.DW);
            setFlag(acr.Grp);
        }
    }, [auth.user.access_control_req])
    
    function handleOpenBuilder(){
        store.openAccessControlSearch();
    }

    function handleSave() {
        let access_control_req = {
            AW: allowWriters,
            AR: allowReaders,
            DW: denyWriters,
            DR: denyReaders,
            Grp: flag
        };
        store.updateACR(access_control_req);
    }

    function closeModal() { 
        console.log("Close Access Control Modal");
        store.closeModal();
        setAllowWrite("");
        setAllowWriters([]);
        setAllowRead("");
        setAllowReaders([]);
        setDenyRead("");
        setDenyReaders([]);
        setDenyWrite("");
        setDenyWriters([]);
        setFlag(false);
    }

    function addAllowWrite(name){
        console.log("Add " + allowWrite + " in Allow Writers")
        setAllowWriters([...allowWriters, name])
    }

    function removeAllowWrite(name){
        console.log("Remove " + name + " in Allow Writers")
        setAllowWriters(allowWriters.filter((obj) => obj !== name))
    }

    function addAllowRead(name){
        console.log("Add " + allowRead + " in Allow Readers")
        setAllowReaders([...allowReaders, name])
    }

    function removeAllowRead(name){
        console.log("Remove " + name + " in Allow Readers")
        setAllowReaders(allowReaders.filter((obj) => obj !== name))
    }

    function addDenyRead(name){
        console.log("Add " + denyRead + " in Deny Readers")
        setDenyReaders([...denyReaders, name])
    }

    function removeDenyRead(name){
        console.log("Remove " + name + " in Deny Readers")
        setDenyReaders(denyReaders.filter((obj) => obj !== name))
    }

    function addDenyWrite(name){
        console.log("Add " + denyWrite + " in Deny Writers")
        setDenyWriters([...denyWriters, name])
    }

    function removeDenyWrite(name){
        console.log("Remove " + name + " in Deny Writers")
        setDenyWriters(denyWriters.filter((obj) => obj !== name))
    }

    function handleGrpFlag(event) {
        console.log("Changing flag value from " + flag + " to " + event.target.checked)
        setFlag(event.target.checked);
    }

    return (
        <Modal
            open={store.accessModal}
            aria-labelledby="modal-modal-snapshot"
            aria-describedby="modal-modal-snapshottake"
        >
            <Box sx={style}>
                <CloseIcon 
                    sx={{ml: '95%',
                        ':hover': {
                            bgcolor: 'grey.300',
                            color: 'black'
                        },
                        color: 'black',
                        p:1,
                        borderRadius: '50%',
                        mt:-2
                    }} 
                    onClick={event => closeModal()}/>
                <Stack 
                    direction = "column"
                    alignItems = "center"
                    justifyContent = "center"
                    sx={{mb:2}}
                >
                    <Typography 
                        variant="h5"
                    >Edit Access Control Policy</Typography>

                    {/* Access Control Policy Name */}
                    {/* <TextField   
                        id="name"
                        label="Access Control Name"
                        name="name"
                        autoComplete="Access Control Name"
                        size="large"
                        onChange={(event) => setName(event.value.target)}
                        sx={{backgroundColor:"#FFFFFF", width:'85%', mt:3}}
                    /> */}

                    {/* Search Bar */}
                    <TextField   
                        id="search"
                        label="Search Query"
                        name="search"
                        autoComplete="Search"
                        size="large"
                        sx={{backgroundColor:"#FFFFFF", width:'85%', mt:3}}
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
                    <FormGroup>
                        <FormControlLabel 
                            control={
                                <Switch 
                                    onChange={event => handleGrpFlag(event)}
                                    checked={flag}/>
                            } 
                            label="Include Groups? " 
                            labelPlacement="start" />
                    </FormGroup>
                </Stack>
                
                {/* Access Control permissions */}
                <Grid container spacing={3} mt={1.5} mb={5} justifyContent='center' alignContent='center'>
                    <Grid item xs={11}>
                        <NameBar 
                            label = {"Allow Write"}
                            values = {allowWriters}
                            submitData = {addAllowWrite}
                            removeData = {removeAllowWrite}
                            /> 
                    </Grid>
                    <Grid item xs={11}>
                        <NameBar 
                            label = {"Allow Read"}
                            values = {allowReaders}
                            submitData = {addAllowRead}
                            removeData = {removeAllowRead}/> 
                    </Grid>
                    <Grid item xs={11}>
                        <NameBar 
                            label = {"Deny Read"}
                            values = {denyReaders}
                            submitData = {addDenyRead}
                            removeData = {removeDenyRead}/> 
                    </Grid>
                    <Grid item xs={11}>
                        <NameBar 
                            label = {"Deny Write"}
                            values = {denyWriters}
                            submitData = {addDenyWrite}
                            removeData = {removeDenyWrite}/> 
                    </Grid>
                </Grid>

                <Box 
                className="black-button" 
                sx={{width:'100px', ml: '80%', mt:3}}
                onClick={(event) => {
                    console.log("Submit New Access Control Policy")
                }}>
                <center>
                    <Typography 
                        sx={{color:'black'}}
                        onClick={(event) => handleSave()}
                        > 
                        <strong> Save </strong> 
                    </Typography>
                </center>
            </Box>
            </Box>
        </Modal>
    )
}

export default ACModal;