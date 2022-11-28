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
import MenuItem from '@mui/material/MenuItem';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '70%',
    maxHeight:'70%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
    overflowY: 'scroll'
};

function FileSharingUser(props) {
    const {user, selectValues, users, setUsers} = props

    return (
        <Box 
            className="fileFolderModal"
            display="flex"
            mt={1.5}
            >
            <Box
                sx={{width:'70%'}}
                ml={1}>
                <Stack
                    direction='row'>
                    {user.type === "user"?
                        <Box>
                            <Typography variant="h6">
                                <strong>{user.email}</strong>
                            </Typography>
                            <Typography variant="h7">
                                <strong>{user.type}</strong>
                            </Typography>
                        </Box>
                        :
                        <Typography variant="h6">
                            <strong>{user.email}</strong>
                        </Typography>
                    }
                </Stack>
                <Stack
                    direction='row'>
                </Stack>
            </Box>
            {user.role === "owner" ?
                <TextField
                        display="flex"
                        id={"roles"}
                        label="Role"
                        value={"Owner"}
                        fullWidth
                        overflow='auto'
                        sx={{width:'30%', "& .MuiInputBase-input.Mui-disabled": {
                            WebkitTextFillColor: "black",
                        }}}
                        justifycontent="flex-end"
                        disabled={true}
                    >
                        {selectValues.map((item, index) => (
                            <MenuItem key={item + index} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </TextField>
                :
                <TextField
                    display="flex"
                    id={"roles"}
                    select
                    label="Role"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    fullWidth
                    overflow='auto'
                    sx={{width:'30%'}}
                    justifycontent="flex-end"
                    onChange={(event) => {
                        setUsers(users.map((item) => {
                            if (item.email === user.email) {
                                return {...item, role: event.target.value}
                            }
                            return item
                        }))
                    }}
                >
                    {selectValues.map((item, index) => (
                        <MenuItem key={index} value={item}>
                            {item}
                        </MenuItem>
                    ))}
                </TextField>
                }
        </Box>
    )
}

function FileSharingModal(props) {
    const {store} = useContext(GlobalStoreContext);
    const {selected} = props
    const [data, setData] = useState("");
    const [uniqueUsers, setUniqueUsers] = useState([]); // Follow a schema of {Email, role, type, name}
    const [mixedUsers, setMixedUsers] = useState([]); // Follow a schema of {Email, role, type}

    const uniqueSelections = ["Reader", "Commenter", "Writer", "Remove Access"]
    const mixedSelections = ["Mixed Values", "Reader", "Commenter", "Writer", "Remove Access"]
    let flag = store.updateSharingModal;
    useEffect(() => {
        
        // Computes the Unique Permissions and Mixed Permissions Amongst Files
        if(store.updateSharingModal && selected.length > 0){
            // Get all permissions across all files
            let mixedResult = []; // User has mixed roles amongst selected files
            let uniqueResult = []; // User roles are consistent
            let data = [];
            for(let file of selected){
                let fileInfo = store.allItems[file.index].permissionsRaw;
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

            // Get all the Users who have consistent roles over all files
            uniqueResult = data.reduce((a, b) => a.filter(c => b.some(item => item.id === c.id)));

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
                            type: perm.type,
                            role: "Mixed Values"
                        });
                    }
                }
            }
            setUniqueUsers(uniqueResult)
            setMixedUsers(mixedResult)
        }
    }, [store.updateSharingModal]);
    // Sanatize the user and split them into unique and mixed users

    function closeModal() { 
        console.log("Close File Sharing Modal");
        setUniqueUsers([]);
        setMixedUsers([]);
        store.closeModal();
    }
    
    function newUser(data) {
        setUniqueUsers([...uniqueUsers, {email: data, role: "writer", type: "new"}])
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
                            sx={{width: '30%'}}>
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
                            sx={{width: '70%'}}>
                                <TextField
                                    id={"user"}
                                    label={"Add User or Group"}
                                    fullWidth
                                    overflow='auto' 
                                    value={data}
                                    sx={{width: '90%', ml:3, mb:1}}
                                    onChange= {(event) => {setData(event.target.value)}}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter'){
                                            newUser(data);
                                            setData("");
                                        }
                                    }}/>
                            {/* TODO: Compute selected users */}
                            { 
                                uniqueUsers.map((item) => {
                                    return(
                                        <FileSharingUser 
                                            user={item}
                                            selectValues={uniqueSelections} 
                                            users={uniqueUsers}
                                            setUsers={setUniqueUsers} />
                                    )
                                })
                            }
                            {
                                mixedUsers.map((item) => {
                                    return(
                                        <FileSharingUser 
                                            user={item}
                                            selectValues={mixedSelections} 
                                            users={mixedUsers}
                                            setUsers={setMixedUsers} />
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