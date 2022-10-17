// Local Imports
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../store';

// Imports from Material UI
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '50%',
    maxHeight:'70%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
    overflowY: 'scroll'
  };


const Root = styled('div')(({ theme }) => ({
    width: '100%',
    ...theme.typography.body2,
    '& > :not(style) + :not(style)': {
      marginTop: theme.spacing(2),
    },
  }));

  const operators = ["Drive", "Owner", "Creator", "From", "To", "Name", "inFolder", "Folder", "Path", "Sharing"]

function QueryBuilderModal() {
    const {store} = useContext(GlobalStoreContext);
    const [opCount, setOpCount] = useState(0);
    const [queryOp, setqueryOp] = useState([]);
    const [readText, setReadText] = useState("");
    const [readableUser, setReadableUser] = useState([]);
    const [writeText, setWriteText] = useState("");
    const [writableUser, setWritableUser] = useState([]);
    const [shareText, setShareText] = useState("");
    const [sharableUser, setSharableUser] = useState([]);
    
    let flag = false;
    if(store.queryBuilder) {
        flag = true;
    }

    function closeModal() { 
        console.log("Close Search Query Modal")
        store.closeQueryBuilder();
        setOpCount(0);
        setqueryOp([]);
        setReadText("");
        setReadableUser([]);
        setWriteText("");
        setWritableUser([]);
        setShareText("");
        setSharableUser([]);
        flag=false;
    }

    function addOperator() {
        console.log("Add new empty Operator")
        const newOperator = {
            operator: '',
            target: '',
            id: opCount
        }
        setqueryOp([...queryOp, newOperator]);

        setOpCount(opCount + 1);
    }

    function handleRemoveOperation(id) {
        setqueryOp(queryOp.filter((obj) => obj.id !== id));
    }

    function addRead(){
        console.log("Add " + readText + " in Reader query")
        setReadableUser([...readableUser, readText])
        console.log(queryOp)
    }

    function removeRead(name){
        console.log("Remove " + name + " in Reader query")
        setReadableUser(readableUser.filter((obj) => obj !== name))
    }

    function addWrite(){
        console.log("Add " + writeText + " in Writer query")
        setWritableUser([...writableUser, writeText])
    }

    function removeWrite(name){
        console.log("Remove " + name + " in Writer query")
        setWritableUser(writableUser.filter((obj) => obj !== name))
    }

    function addShare(){
        console.log("Add " + shareText + " in Shared query")
        setSharableUser([...sharableUser, shareText])
    }

    function removeShare(name){
        console.log("Remove " + name + " in Shared query")
        setSharableUser(sharableUser.filter((obj) => obj !== name))
    }

    return(
        <Modal
            open={flag}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
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
                        borderRadius: '50%'
                    }} 
                    onClick={event => closeModal()}/>
                <Stack 
                        direction = "row"
                        alignItems = "center"
                        justifyContent = "center"
                    >
                    <Typography 
                        variant="h5"
                    >Search Query Builder</Typography>
                    
                </Stack>

                {/* Groups and Add Operator */}
                <Stack 
                    direction="row"
                    alignItems = "center"
                    ml={3} mt={2}>
                    <Typography display="inline" variant="h6"> Groups: </Typography>
                    <Switch display="inline" />
                    <Box sx={{flexGrow: 1}}/>
                    <Box 
                        button 
                        className="black-button"
                        onClick={event=>addOperator()}>
                    <center>
                        <Typography 
                            display="inline"> 
                            <strong> Add Operator </strong> 
                        </Typography>
                    </center>
                    </Box>
                </Stack>

                {/* Operators which allow for multiple entry */}
                <Grid container spacing={3} mt={1.5} mb={5}>
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <TextField
                                id="readable"
                                label="Readable"
                                fullWidth
                                overflow='auto' 
                                value={readText}
                                onChange= {(event) => {setReadText(event.target.value)}}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter'){
                                        addRead(event);
                                        setReadText("");
                                    }
                                }}/>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignContent: 'flex-start'}}>
                                {readableUser.map((user) => (
                                    <Box 
                                        button
                                        className="grey-button"
                                        display="flex"
                                        ml={.25}
                                        mr={.25}
                                    >
                                        <Typography display='inline' sx={{ml:1}}>{user}</Typography>
                                        <CloseIcon sx={{width:'28%', ml:.2, mt:-.2,
                                            ':hover': {
                                                bgcolor: 'grey.300',
                                                color: 'black'
                                            },
                                            color: 'black',
                                            p:.1,
                                            borderRadius: '50%'}}
                                            onClick={event => removeRead(user)}/>
                                    </Box>
                                ))}
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <TextField
                                id="writable"
                                label="Writable"
                                fullWidth
                                overflow='auto' 
                                value={writeText}
                                onChange= {(event) => {setWriteText(event.target.value)}}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter'){
                                        addWrite(event);
                                        setWriteText("");
                                    }
                                }}/>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignContent: 'flex-start'}}>
                                {writableUser.map((user) => (
                                    <Box 
                                        button
                                        className="grey-button"
                                        display="flex"
                                        ml={.25}
                                        mr={.25}
                                    >
                                        <Typography display='inline' sx={{ml:1}}>{user}</Typography>
                                        <CloseIcon sx={{width:'28%', ml:.2, mt:-.2,
                                            ':hover': {
                                                bgcolor: 'grey.300',
                                                color: 'black'
                                            },
                                            color: 'black',
                                            p:.1,
                                            borderRadius: '50%'}}
                                            onClick={event => removeWrite(user)}/>
                                    </Box>
                                ))}
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12}>
                        <Stack spacing={1}>
                            <TextField
                                id="sharable"
                                label="Shareable"
                                fullWidth
                                overflow='auto' 
                                value={shareText}
                                onChange= {(event) => {setShareText(event.target.value)}}
                                onKeyPress={(event) => {
                                    if (event.key === 'Enter'){
                                        addShare(event);
                                        setShareText("");
                                    }
                                }}/>
                            <Box sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                alignContent: 'flex-start'}}>
                                {sharableUser.map((user) => (
                                    <Box 
                                        button
                                        className="grey-button"
                                        display="flex"
                                        ml={.25}
                                        mr={.25}
                                    >
                                        <Typography display='inline' sx={{ml:1}}>{user}</Typography>
                                        <CloseIcon sx={{width:'28%', ml:.2, mt:-.2,
                                            ':hover': {
                                                bgcolor: 'grey.300',
                                                color: 'black'
                                            },
                                            color: 'black',
                                            p:.1,
                                            borderRadius: '50%'}}
                                            onClick={event => removeShare(user)}/>
                                    </Box>
                                ))}
                            </Box>
                        </Stack>
                    </Grid>
                </Grid>

                <Divider />
                    {queryOp.map((option, index) => (
                        <Grid container spacing={2} mt={2}>
                            <Grid item xs={.1} />
                            <Grid item xs={5.25}>
                                <TextField
                                    id={index}
                                    select
                                    label="Query"
                                    value={option.operator}
                                    fullWidth
                                    overflow='auto'
                                    onChange={(event) => {
                                        setqueryOp(queryOp.map((user) => {
                                            if (user.id === option.id) {
                                                return {...user, operator: event.target.value}
                                            }
                                            return user
                                        }))
                                    }}
                                >
                                    {operators.map((item, value) => (
                                        <MenuItem key={value} value={item}>
                                            {item}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item xs={5.25}>
                                <TextField
                                    id="text"
                                    label="Target"
                                    fullWidth 
                                    value={option.target}
                                    onChange={(event) => {
                                        setqueryOp(queryOp.map((user) => {
                                            if (user.id === option.id) {
                                                return {...user, target: event.target.value}
                                            }
                                            return user
                                        }))
                                    }}/>
                            </Grid>
                            <Grid item xs={1} alignContent="center" justifyContent="center">
                                <CloseIcon sx={{
                                    mt:"10%",
                                    ':hover': {
                                        bgcolor: 'grey.300',
                                        color: 'black'
                                    },
                                    color: 'black',
                                    p:1,
                                    borderRadius: '50%'}} 
                                    onClick={event => handleRemoveOperation(option.id)}/>
                            </Grid>
                        </Grid>
                    ))}
                
                {/* Search Button */}
                {opCount?
                    <Stack
                        direction="row"
                        mt={5}>
                        <Box sx={{flexGrow:.94}} />
                        <Box 
                                button 
                                className="black-button"
                                sx={{width: '8%'}}>
                            <center>
                                <Typography 
                                    display="inline"> 
                                    <strong> Search </strong> 
                                </Typography>
                            </center>
                            </Box>
                    </Stack>
                    : null
                    }
            </Box>  
        </Modal>
    );
}

export default QueryBuilderModal;