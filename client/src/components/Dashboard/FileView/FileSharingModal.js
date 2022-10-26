// Local Imports
import {useContext, useState} from 'react';
import {GlobalStoreContext} from '../../../store';

// Imports from MUI
import CloseIcon from '@mui/icons-material/Close';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '40%',
    maxHeight:'70%',
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    overflow: 'auto',
    overflowY: 'scroll'
};

function FileSharingModal() {
    const {store} = useContext(GlobalStoreContext);

    let flag = false;
    if(store.updateSharingModal)
        flag = true;
    
    function closeModal() { 
        console.log("Close File Sharing Modal");
        store.closeModal();
        flag=false;
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
            </Box>
        </Modal>
    )
}

export default FileSharingModal;