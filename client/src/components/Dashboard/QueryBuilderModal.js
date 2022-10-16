// Local Imports
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../store';

// Imports from Material UI
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import CloseIcon from '@mui/icons-material/Close';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '30%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
  };

function QueryBuilderModal() {
    const {store} = useContext(GlobalStoreContext);
    const [opCount, setOpCount] = useState(0);

    let flag = false;
    if(store.queryBuilder) {
        flag = true;
    }

    function closeModal() { 
        store.closeQueryBuilder();
        setOpCount(0);
        flag=false;
    }

    let queryOperators = [
        {
            operator: "drive",
            target: "My Drive"
        }
    ]

    return(
        <Modal
            open={flag}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <CloseIcon 
                    sx={{ml: '95%', mb:-1}} 
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
                        onClick={event=>setOpCount(opCount + 1)}>
                    <center>
                        <Typography 
                            display="inline"> 
                            <strong> Add Operator </strong> 
                        </Typography>
                    </center>
                    </Box>
                </Stack>
                {opCount?
                    <Stack
                        direction="row"
                        mt={5}>
                        <Box sx={{flexGrow:.94}} />
                        <Box 
                                button 
                                className="black-button"
                                sx={{width: '10%'}}>
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