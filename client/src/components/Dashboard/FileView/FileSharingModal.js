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
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';

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
    const {store} = useContext(GlobalStoreContext);
    const {user, selectValues, users, setUsers, changePermission} = props
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false)
    const [placement, setPlacement] = useState()
    const [group, setGroup] = useState([])

    const handleClick = (newPlacement) => (event) => {
        setAnchorEl(event.currentTarget);
        setOpen((prev) => placement !== newPlacement || !prev);
        setPlacement(newPlacement);
        setGroup(store.groups[newPlacement])
    };

    let userItem;
    if (user.type === "user" || user.type === "domain") {
        userItem = <Box>
            <Typography variant="h6">
                <strong>{user.email}</strong>
            </Typography>
            <Typography variant="h7">
                <strong>{user.type}</strong>
            </Typography>
        </Box>
    }
    else if (user.type === "group" && store.groups[user.email]) {
        userItem = <Box onClick={handleClick(user.email)}>
            <Typography variant="h6">
                <strong>{user.email}</strong>
            </Typography>
            <Typography variant="h7" sx={{color: '#39acac'}}>
                <strong>{user.type}</strong>
            </Typography>
        </Box>
    }
    else if (user.type === "anyone") {
        userItem = <Box>
            <Typography variant="h6">
                <strong>File Link</strong>
            </Typography>
            <Typography variant="h7">
                <strong>{user.type}</strong>
            </Typography>
            </Box>
    }
    else {
        userItem = <Box>
            <Typography variant="h6">
                <strong>{user.email}</strong>
            </Typography>
            <Typography variant="h7">
                <strong>{user.type}</strong>
            </Typography>
        </Box>
    }

    return (
        <Box 
            className="fileFolderModal"
            display="flex"
            mt={1.5}
            key={"FileSharingUser" + user.email}
            >
            <Popper open={open} anchorEl={anchorEl} placement={'left'} transition
                sx={{overflowY: "auto", maxHeight: 600, boxShadow: 1}}
                style={{zIndex:1300}}>
                {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}
                onClose={handleClick}>
                    <Paper>
                        {
                            group.map((item) => {
                                return(
                                    <Typography ml={1} key={"filetable2" + item} sx={{fontsize: 20}} mt={.2}>
                                        {item}
                                    </Typography> 
                                )
                            })
                        }
                    </Paper>
                </Fade>
                )}
            </Popper>
            <Box
                sx={{width:'70%'}}
                ml={1}>
                <Stack
                    direction='row'>
                    {userItem}
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
                            <MenuItem key={"filesharing3" + item + index} value={item}>
                                {item}
                            </MenuItem>
                        ))}
                    </TextField>
                :
                user.tag === "special"?
                <TextField
                    display="flex"
                    id={"roles"}
                    label="Role"
                    value={user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    fullWidth
                    overflow='auto'
                    sx={{width:'30%', "& .MuiInputBase-input.Mui-disabled": {
                        WebkitTextFillColor: "black",
                    }}}
                    justifycontent="flex-end"
                    disabled={true}
                />
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
                                changePermission({...item, role: event.target.value})
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

function FileSharingViolations(props) {
    const {store} = useContext(GlobalStoreContext);
    const {selected} = props;
    let violations = [];
    
    useEffect(() => {
        for(let file of selected){
            let fileInfo = store.allItems[file.index].permissionsRaw;
            for(let key in fileInfo){
                let obj = fileInfo[key]
                // TODO: Find Violations and Push to violations array ({file, role, violation})
            }
        }
    }, [store.updateSharingModal])
    
    return(
        <Box ml={2} mt={1.5}>
            <Typography variant="h5"><strong>Access Control Requirement Conflicts</strong></Typography>
            {/* List of Violations */}
        </Box>
    )
}

function FileSharingModal(props) {
    const {store} = useContext(GlobalStoreContext);
    const {selected} = props
    const [data, setData] = useState("");
    const [uniqueUsers, setUniqueUsers] = useState([]); // Follow a schema of {Email, role, type, name}
    const [mixedUsers, setMixedUsers] = useState([]); // Follow a schema of {Email, role, type}
    const [newRole, setNewRole] = useState("user")
    const [changes, setChanges] = useState([]);

    const uniqueSelections = ["Reader", "Commenter", "Writer", "Remove Access"]
    const mixedSelections = ["Mixed Values", "Reader", "Commenter", "Writer", "Remove Access"]
    const userRoles = ["user", "group"]
    let flag = store.updateSharingModal;
    useEffect(() => {
        
        // Computes the Unique Permissions and Mixed Permissions Amongst Files
        if(store.updateSharingModal && selected.length > 0){
            // Get all permissions across all files
            let mixedResult = []; // User has mixed roles amongst selected files
            let uniqueResult = []; // User roles are consistent
            let owners = []
            let data = [];
            for(let file of selected){
                let fileInfo = store.allItems[file.index].permissionsRaw;
                let setdata = [];
                if(fileInfo===undefined || Object.keys(fileInfo).length === 0){
                    console.log(store.allItems[file.index])
                    let permission = {
                        role: "owner",
                        type: "user",
                        email: store.allItems[file.index].owner,
                        id: store.allItems[file.index].fileID,
                    }
                    setdata.push(permission)
                    owners.push(permission.email)
                }
                for(let key in fileInfo){
                    if(selected.length > 1 && fileInfo[key].id === "anyoneWithLink")
                        continue;
                    let obj = fileInfo[key]
                    let permission = {
                        role: obj.role,
                        type: obj.type,
                        email: obj.emailAddress || obj.domain,
                        name: obj.displayName,
                        id: obj.id
                    }
                    if (permission.role === "owner")
                        owners.push(permission.email)
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
                        if(owners.includes(perm.email))
                            mixedResult.push({
                                name: perm.name,
                                email: perm.email,
                                type: perm.type,
                                role: "Mixed Values",
                                tag: "special",
                                id: perm.id
                            });
                        else
                            mixedResult.push({
                                name: perm.name,
                                email: perm.email,
                                type: perm.type,
                                role: "Mixed Values",
                                tag: "notspecial",
                                id: perm.id
                            });
                    }
                }
            }
            // Move all "owner" special values to the top
            mixedResult.sort(function(x,y) { return (x.tag==="special"?-1 : y.tag ==="special" ? 1: 0)});

            setUniqueUsers(uniqueResult)
            setMixedUsers(mixedResult)
        }
    }, [store.updateSharingModal]);

    function updateShare() {
        let filePerms = []; 
        for(let file of selected){
            let fileID = store.allItems[file.index].fileId
            let fileInfo = store.allItems[file.index].permissionsRaw;
            filePerms.push({fileId: fileID, permissions: fileInfo})
        }
        let payload = {files: filePerms, changes: changes}
        store.updateSharing(payload)
    }

    function closeModal() { 
        console.log("Close File Sharing Modal");
        setUniqueUsers([]);
        setMixedUsers([]);
        setChanges([]);
        store.closeModal();
    }

    function changePermission(payload) {
        console.log(payload)
        if(payload.id === "new"){
            let temp = changes.filter(item=> item.id !== "new" || item.email !== payload.email );
            temp.push(payload)
            setChanges([...changes, payload])
            console.log(temp)
        }
        else{
            let temp = changes.filter(item=> item.id !== payload.id);
            temp.push(payload)
            setChanges([...changes, payload])
            console.log(temp)
        }
    }
    
    function newUser(data) {
        if(uniqueUsers.some(e => e.email === data) || mixedUsers.some(e=>e.email === data)){
            return
        }
        let newUser = {role: "writer", type: newRole, email: data, id: "new"}
        setUniqueUsers([...uniqueUsers, newUser])
        changePermission(newUser)
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
                
                {selected.length === 0?
                <Typography variant="h4"> <strong> No Files Selected </strong> </Typography>
                :
                (store.sharingResult.length > 0)?
                <Box></Box>
                :
                <Box>
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
                                <Box display="flex">
                                    <TextField
                                        id={"user"}
                                        label={"Add User"}
                                        fullWidth
                                        overflow='auto' 
                                        value={data}
                                        sx={{width: '80%', ml:3, mb:1}}
                                        onChange= {(event) => {setData(event.target.value)}}
                                        onKeyPress={(event) => {
                                            if (event.key === 'Enter'){
                                                newUser(data);
                                                setData("");
                                            }
                                        }}/>
                                    <TextField
                                        id={"newRoles"}
                                        select
                                        label={"Role"}
                                        value={newRole}
                                        sx={{width:'20%', ml:3, mb:1}}
                                        justifycontent="flex-end"
                                        onChange={(event) => {
                                            setNewRole(event.target.value)
                                        }}
                                    >
                                        {userRoles.map((item, index) => (
                                            <MenuItem key={index + item} value={item}>
                                                {item}
                                            </MenuItem>
                                        ))}
                                    </TextField>
                                </Box>
                                {/* TODO: Compute selected users */}
                                { 
                                    uniqueUsers.map((item) => {
                                        return(
                                            <FileSharingUser 
                                                user={item}
                                                selectValues={uniqueSelections} 
                                                users={uniqueUsers}
                                                setUsers={setUniqueUsers} 
                                                changePermission={changePermission}/>
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
                                                setUsers={setMixedUsers} 
                                                changePermission={changePermission}/>
                                        )
                                    })
                                }
                            </Stack>
                    </Box>

                    <FileSharingViolations 
                        selected={selected}/>

                    <Box 
                    className="black-button" 
                    sx={{width:'100px', ml: '83%', mt:3}}
                    onClick={updateShare}>
                    <center>
                        <Typography 
                            sx={{color:'black'}}> 
                            <strong> Confirm </strong> 
                        </Typography>
                    </center>
                    </Box>
                </Box>
                }
            </Box>
        </Modal>
    )
}

export default FileSharingModal;