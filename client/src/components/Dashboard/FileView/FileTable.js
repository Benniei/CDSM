// Imports from React
import {useState, useContext} from 'react';
import AuthContext from '../../../auth/index.js';
import {GlobalStoreContext} from '../../../store';

// Imports from Material-UI
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Checkbox from '@mui/material/Checkbox';

/* For Testing */
function createData(name, type, owner, lastModified, id) {
    return {
        name: name,
        type: type,
        owner: owner,
        lastModified: lastModified,
        id: id
    };
}

/*const rows = [
    createData('Folder1', 'Folder', 'me', 'Today', '-'),
    createData('Folder2', 'Folder', 'me', 'Today', '35 mb'),
    createData('Folder3', 'Folder', 'me', 'Today', '35 mb'),
    createData('File1', 'File', 'me', 'Today', '7 mb'),
    createData('File2', 'File', 'me', 'Today', '66 mb'),
]*/

const headCells = [
    {
        id: 'name',
        disablePadding: true,
        label: 'Name'
    },
    {
        id: 'type',
        disablePadding: false,
        label: 'File Type'
    },
    {
        id: 'owner',
        disablePadding: false,
        label: 'Owner'
    },
    {
        id: 'lastModified',
        disablePadding: false,
        label: 'Last Modified'
    }
]

function arraySort(arr, order, orderBy){
    let newArr = arr.sort((a, b) => a[orderBy] > b[orderBy] ? 1 : -1);
    if(order === 'asc')
        return newArr;
    return newArr.reverse();
}

// Handles the sorting and the rows {resource: https://mui.com/material-ui/react-table/}
function FileTableHead(props) {
    const { onSelectAllClick, order, orderBy, numSelected, rowCount, onRequestSort } =
        props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };
    
    return (
        <TableHead>
            <TableRow>
                <TableCell padding='checkbox'>
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{'aria-label': 'select all files'}} />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align='left'
                        padding={headCell.disablePadding? 'none': 'normal'}
                        sortDirection={orderBy === headCell.id? order: false}>
                            <TableSortLabel
                                active={orderBy===headCell.id}
                                direction={orderBy===headCell.id ? order: 'asc'}
                                onClick={createSortHandler(headCell.id)}>
                                    {headCell.label}
                            </TableSortLabel>
                    </TableCell>
                ))} 
            </TableRow>
        </TableHead>
    );
}

// Overview of the whole table {resource: https://mui.com/material-ui/react-table/}
function FileTable(props){
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);
    const [order, setOrder] = useState('asc')
    const [orderBy, setOrderBy] = useState('name')
    const [selected, setSelected] = useState([])
    
    let rows = [];

    if (store.allItems) {
        for (let file of store.allItems) {
            rows.push(createData(file.name, file.children ? "Folder" : "File",
                file.owners[0].emailAddress === auth.user.email ? "me": file.owners[0].emailAddress, file.lastModifiedTime, file.fileId));
        };
    }

    
    // Change the order direction or the field
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Selects all the items in the list
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.name);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleChangeFolder = (event, type, fileID, name) => {
        if(type === "Folder") {
            const snapshotID = store.currentSnapshot
            console.log(snapshotID, fileID)
            store.getFolder(snapshotID, fileID, {name: name, id: fileID});
        }
    }

    // Handles clicking on the row
    const handleClick = (event, name) => {
        const selectedIndex = selected.indexOf(name);
        let newSelected = [];
        
        // Add in the item
        if (selectedIndex === -1) {
            console.log("Select " + name + " from list")
            newSelected = newSelected.concat(selected, name);
        }
        // Unselect the already selected item
        else if (selectedIndex === 0) {
            console.log("Unselect " + name + " from list")
            newSelected = newSelected.concat(selected.slice(1));
        } 
        else if (selectedIndex === selected.length - 1) {
            console.log("Unselect " + name + " from list")
            newSelected = newSelected.concat(selected.slice(0, -1));
        } 
        else if (selectedIndex > 0) {
            console.log("Unselect " + name + " from list")
            newSelected = newSelected.concat(
              selected.slice(0, selectedIndex),
              selected.slice(selectedIndex + 1),
            );
        }

        setSelected(newSelected);
    };

    const isSelected = (name) => selected.indexOf(name) !== -1;

    return (
        <Box sx={{width: '100%'}}>
            <TableContainer>
                <Table
                    sx={{minwidth:750}}
                    aria-labelledby="tableTitle">
                        <FileTableHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}/>
                        <TableBody>
                            {arraySort(rows, order, orderBy).map((row, index) =>{
                                const isItemSelected = isSelected(row.name);
                                const labelID = `file-table-checkbox-${index}`;

                                return(
                                    <TableRow
                                        hover
                                        onDoubleClick={(event) => handleChangeFolder(event, row.type, row.id, row.name)}
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.name}
                                        selected={isItemSelected}>
                                        <TableCell padding='checkbox'>
                                            <Checkbox
                                                color='primary'
                                                checked={isItemSelected}
                                                inputProps={{'aria-labelledby': labelID}} 
                                                onClick={(event) => handleClick(event, row.name)}/>
                                        </TableCell>
                                        <TableCell
                                            componet='th'
                                            id={labelID}
                                            scope='row'
                                            padding='none'>
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="left">{row.type}</TableCell>
                                        <TableCell align="left">{row.owner}</TableCell>
                                        <TableCell align="left">{row.lastModified}</TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
}

export default FileTable;