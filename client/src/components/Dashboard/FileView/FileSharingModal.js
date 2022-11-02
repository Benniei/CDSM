// Local Imports
import {useContext, useState, useEffect} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '60%',
    maxHeight:'70%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
    overflowY: 'scroll'
};

function FileSharingUser(props) {
    const {selectValues, setUniqueUsers, mixedUsers, setMixedUsers} = props

    return (
        <Box />
    )
}

function FileSharingModal(props) {
    const {store} = useContext(GlobalStoreContext);
    const {selected} = props
    const [data, setData] = useState("");
    const [uniqueUsers, setUniqueUsers] = useState([]); // Follow a schema of {Email, role, type, name}
    const [mixedUsers, setMixedUsers] = useState([]); // Follow a schema of {Email, role, type}

    const uniqueSelections = ["Viewer", "Commenter", "Editor"]
    const mixedSelections = ["Mixed Values", "Viewer", "Commenter", "Editor"]
    let flag = store.updateSharingModal;

    useEffect(() => {
        if(store.updateSharingModal && selected.length > 0){
            // Get all permissions across all files
            let mixedResult = [];
            let uniqueResult = [];
            if(selected.length > 0) {
                console.log(2);
                let data = [];
                for(let file of selected){
                    let fileInfo = store.allItems[file.index].permissions[0];
                    let setdata = [];
                    for(let key in fileInfo){
                        let obj = fileInfo[key]
                        let permission = {
                            role: obj.role,
                            type: obj.type,
                            email: obj.emailAddress,
                            name: obj.displayName,
                            id: obj.emailAddress+obj.role
                        }
                        setdata.push(permission);
                    }
                    data.push(setdata);
                }
                console.log(data);
                uniqueResult = data.reduce((a, b) => a.filter(c => b.some(item => item.id === c.id)));
                // console.log("Unique Results ", uniqueResult);
                // Get all the owners on top 
                // -1 means owner is before the others, so we sort by owner as priority and then by group
                uniqueResult.sort(function(x,y) { return (x.role==="owner"?-1 : y.role ==="owner" ? 1: 0) || (x.type === "group"?-1: y.type==="group"?1:0)});

                // Get all emails in unique Results
                let set = new Set();
                for(let user of uniqueResult){
                    set.add(user.email);
                }

                // Get all emails from users with mixed results
                for(let file of data){
                    for(let perm of file){
                        if(!set.has(perm.email)){
                            set.add(perm.email);
                            mixedResult.push({
                                name: perm.name,
                                email: perm.email,
                                type: perm.type
                            });
                        }
                    }
                }
                // console.log("mixedResult ",  mixedResult);

                setUniqueUsers(uniqueResult)
                setMixedUsers(mixedResult)
            }
        }
    }, [store.updateSharingModal]);
    // Sanatize the user and split them into unique and mixed users

    function closeModal() { 
        console.log("Close File Sharing Modal");
        setUniqueUsers([]);
        setMixedUsers([]);
        store.closeModal();
    }

    function submitData(data) {

    }

    return (
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
                
                {/* Title */}
                <Stack 
                    direction = "row"
                    alignItems = "center"
                    justifyContent = "center"
                    sx={{mb:2}}
                    >
                        <Typography 
                            variant="h5"
                        >Sharing Files</Typography>
                    </Stack>

                <Box
                    display="flex">
                        {/* Left Column -- Shows all Selected Files */}
                        <Stack
                            sx={{width: '40%'}}>
                                <Typography variant="h5" mb={1.2}>
                                    <strong>Selected Items</strong>
                                </Typography>
                                {
                                    selected.map((item) => {
                                        return(
                                            <Typography key={item.name} variant="h6" ml ={1} mt={.2}>
                                                <strong>{item.name}</strong>
                                            </Typography>
                                        )
                                    })
                                }
                            </Stack>
                        <Divider orientation="vertical" flexItem/>
                        {/* Right Column -- Show all Shared Users */}
                        <Stack
                            sx={{width: '60%'}}>
                                <TextField
                                    id={"user"}
                                    label={"Add User or Group"}
                                    fullWidth
                                    overflow='auto' 
                                    value={data}
                                    sx={{width: '90%', ml:3}}
                                    onChange= {(event) => {setData(event.target.value)}}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter'){
                                            submitData(data);
                                            setData("");
                                        }
                                    }}/>
                            {/* TODO: Compute selected users */}
                            { 
                                uniqueUsers.map((item) => {
                                    return(
                                        <FileSharingUser 
                                            selectValues={uniqueSelections} 
                                            setUniqueUsers={setUniqueUsers}
                                            mixedUsers={mixedUsers}
                                            setMixedUsers={setMixedUsers} />
                                    )
                                })
                            }
                            {
                                mixedUsers.map((item) => {
                                    return(
                                        <FileSharingUser 
                                            selectValues={mixedSelections} 
                                            setUniqueUsers={setUniqueUsers}
                                            mixedUsers={mixedUsers}
                                            setMixedUsers={setMixedUsers} />
                                    )
                                })
                            }
                        </Stack>
                </Box>
                <Box 
                className="black-button" 
                sx={{width:'100px', ml: '83%', mt:3}}
                onClick={event => {store.takeSnapshot()}}>
                <center>
                    <Typography 
                        sx={{color:'black'}}> 
                        <strong> Confirm </strong> 
                    </Typography>
                </center>
            </Box>
            </Box>
        </Modal>
    )
}

export default FileSharingModal;