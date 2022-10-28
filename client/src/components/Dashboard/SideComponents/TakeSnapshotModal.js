// Local Imports
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import CloseIcon from '@mui/icons-material/Close';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';


const SnapshotType=["File Snapshot", "Group Snapshot"]

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

function FileSnapshot() {
    const {store} = useContext(GlobalStoreContext);
    const [snapshotID, setSnapshotID] = useState("")
    return(
        <Box sx={{width: '100%'}}>
            <Stack
                direction="row">

                <Typography 
                    display="flex"
                    variant="h6"
                    sx={{ml: 2, width: '28%', mt: 1.7}}
                    justifyContent="flex-end">
                    <strong> User: </strong>
                </Typography>
                <Typography
                    variant="h6"
                    sx={{ml: 2, mt: 1.7, width: '70%'}}>
                    <strong> EMAIL </strong>
                </Typography>
                
            </Stack>
            <Stack
                direction="row"
                mt={1}>

                <Typography 
                    display="flex"
                    variant="h6"
                    sx={{ml: 2, width: '28%', mt: 1.7, pr:2.5}}
                    justifyContent="flex-end">
                    <strong>Snapshot ID:</strong>
                </Typography>
                <TextField
                    id={"SnapshotID"}
                    label="Snapshot ID"
                    value={snapshotID}
                    sx={{width: '70%',}}
                    overflow='auto'
                    onChange= {(event) => {setSnapshotID(event.target.value)}}
                />
            </Stack>
            <Box 
                className="black-button" 
                sx={{width:'100px', ml: '80%', mt:3}}
                onClick={event => console.log("Confirm File Snapshot")}>
                <center>
                    <Typography 
                        sx={{color:'black'}}> 
                        <strong> Confirm </strong> 
                    </Typography>
                </center>
            </Box>
        </Box>
    )
}

function GroupSnapshot() {
    const [groupName, setGroupName] = useState("")
    const [groupEmail, setGroupEmail] = useState("")
    const [file, setFile] = useState({})
    return(
        <Box sx={{width: '100%'}}>
            <Stack
                direction="row"
                mt={1}>

                <Typography 
                    display="flex"
                    variant="h6"
                    sx={{ml: 2, width: '25%', mt: 1.7, pr:2.5}}
                    justifyContent="flex-end">
                    <strong>Group Name:</strong>
                </Typography>
                <TextField
                    id="GroupName"
                    label="Group Name"
                    value={groupName}
                    sx={{width: '70%',}}
                    overflow='auto'
                    onChange= {(event) => {setGroupName(event.target.value)}}
                />
            </Stack>
            <Stack
                direction="row"
                mt={1}>

                <Typography 
                    display="flex"
                    variant="h6"
                    sx={{ml: 2, width: '25%', mt: 1.7, pr:2.5}}
                    justifyContent="flex-end">
                    <strong>Group Email:</strong>
                </Typography>
                <TextField
                    id="GroupEmail"
                    label="Group Email"
                    value={groupEmail}
                    sx={{width: '70%',}}
                    overflow='auto'
                    onChange= {(event) => {setGroupEmail(event.target.value)}}
                />
            </Stack>

            <Stack
                direction="row"
                mt={1}>
                <Box 
                    className="upload-button" 
                    sx={{width:'100px', ml: '30%', mr: 2}}>
                    <center>
                        <Typography 
                            sx={{color:'black'}}
                            component='label'> 
                            <strong> Upload File </strong> 
                            <input type="file" hidden
                                onChange={(event) => setFile(event.target.files[0])}/>
                        </Typography>
                    </center>
                    
                </Box>
                <Typography 
                        sx={{color:'black', mt:.5}}
                        component='label'> 
                        <strong> {file['name']? file['name']: null} </strong> 
                </Typography>
            </Stack>

            <Box 
                className="black-button" 
                sx={{width:'100px', ml: '80%', mt:3}}
                onClick={event => console.log("Confirm Group Snapshot")}>
                <center>
                    <Typography 
                        sx={{color:'black'}}
                        > 
                        <strong> Confirm </strong> 
                    </Typography>
                </center>
            </Box>
        </Box>
    )
}

// Adaptor for Taking either a File or Group Snapshot
function TakeSnapshotModal() {
    const {store} = useContext(GlobalStoreContext);
    const [snapshotType, setSnapshotType] = useState("File Snapshot")

    let flag = false;
    if(store.takeSnapshotModal)
        flag = true;
    
    function closeModal() { 
        console.log("Close Take Snapshot Modal")
        store.closeModal();
        setSnapshotType("File Snapshot")
        flag=false;
    }

    return(
        <Modal
            open={flag}
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
                        direction = "row"
                        alignItems = "center"
                        justifyContent = "center"
                        sx={{mb:2}}
                    >
                    <AddAPhotoIcon sx={{mr: 2, mb:.7}}/>
                    <Typography 
                        variant="h5"
                    >Take Snapshot</Typography>
                </Stack>

                {/* Choose Type of Snapshot */}
                <TextField
                    id={"Snapshot"}
                    select
                    label="Snapshot"
                    value={snapshotType}
                    fullWidth
                    overflow='auto'
                    sx={{mb:2}}
                    onChange={(event) => {
                        setSnapshotType(event.target.value)
                    }}
                >
                    {SnapshotType.map((item) => (
                        <MenuItem key={item} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </TextField>
                {(snapshotType === SnapshotType[0])? <FileSnapshot/> : <GroupSnapshot/>}

            </Box>
        </Modal>
    )
}

export default TakeSnapshotModal;