// Local Imports
import {useContext} from 'react';
import {GlobalStoreContext} from '../../store';

// Imports from Material UI
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';


function QueryBuilderModal() {
    const {store} = useContext(GlobalStoreContext);

    let flag = false;
    if(store.queryBuilder) {
        flag = true;
    }

    function closeModal() { 
        store.closeQueryBuilder();
        flag=false;
    }

    return(
        <div></div>
    );
}

export default QueryBuilderModal;