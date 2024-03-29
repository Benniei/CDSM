// Imports from React
import {useState, useContext, useEffect} from 'react';
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
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Popper from '@mui/material/Popper';
import Fade from '@mui/material/Fade';
import Paper from '@mui/material/Paper';

function createData(name, type, owner, lastModified, id, index, inheritedperms, directperms) {
    return {
        name: name,
        type: type,
        owner: owner,
        lastModified: lastModified,
        id: id,
        index: index,
        inherited: inheritedperms,
        direct: directperms
    };
}

const headCells = [
    {
        id: 'name',
        disablePadding: true,
        label: 'Name',
        sort: true
    },
    {
        id: 'owner',
        disablePadding: false,
        label: 'Owner',
        sort: true
    },
    {
        id: 'inheritedperms',
        disablePadding:false,
        label: "Inherited Permissions",
        sort: false
    },
    {
        id: 'directperms',
        disablePadding:false,
        label: "Direct Permissions",
        sort:false
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
                    headCell.sort?
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
                    :
                    <TableCell
                        key={headCell.id}
                        align='left'
                        padding={headCell.disablePadding? 'none': 'normal'}>
                            {headCell.label}
                    </TableCell>
                ))} 
            </TableRow>
        </TableHead>
    );
}

function PermissionsTab (props){
    const {store} = useContext(GlobalStoreContext);
    const {permissions} = props
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

    return (
        <Box>
            <Popper open={open} anchorEl={anchorEl} placement={'left'} transition
                sx={{overflowY: "auto", maxHeight: 600, boxShadow: 1}}>
                {({ TransitionProps }) => (
                <Fade {...TransitionProps} timeout={350}
                onClose={handleClick}>
                    <Paper>
                        {
                            group.map((item) => {
                                return(
                                    <Typography ml={1} key={"filetable" + item} sx={{fontsize: 20}} mt={.2}>
                                        {item}
                                    </Typography> 
                                )
                            })
                        }
                    </Paper>
                </Fade>
                )}
            </Popper>
            <Stack
                direction="row"
                sx={{maxWidth:600, overflowX: 'auto'}}>
                    {permissions?.map((item) => {
                        let result;
                        if(store.groups? store.groups[item.emailAddress || item.domain]: false){
                            result = <Box 
                                key={item.id}
                                className="grey-button"
                                ml={.25}
                                mr={.25}
                                onClick={handleClick(item.emailAddress || item.domain)}
                            >
                                <Typography sx={{ml:.2, color:'#39acac'}} variant="h7">{item.emailAddress || item.domain}</Typography>
                            </Box>
                        }

                        else{
                            result = <Box 
                            key={item.id}
                            className="grey-button"
                            ml={.25}
                            mr={.25}
                        >
                            <Typography sx={{ml:.2}} variant="h7">{item.emailAddress || item.domain}</Typography>
                        </Box>
                        }
                        return(
                            result
                        )
                        })}
            </Stack>
            
        </Box>
    );
}

// Overview of the whole table {resource: https://mui.com/material-ui/react-table/}
function FileTable(props){
    const {store} = useContext(GlobalStoreContext);
    const {auth} = useContext(AuthContext);
    const [order, setOrder] = useState('asc')
    const [rows, setRows] = useState([])
    const [orderBy, setOrderBy] = useState('name')
    const {selected, setSelected} = props;

    useEffect(() => {
        setRows([])
        setSelected([])
        let rowPrototype = [];
        let inheritiedPerms = [];
        let directPerms = [];
        if (store.allItems) {
            let i = 0;
            // Enter Data into the File Table
            for (let file of store.allItems) {
                //console.log(file.name)
                // Intersection between the file and its parent's permissions
                // Step 1 Find out if File has Corresponding Parent
                let parent = store.parents && store.parents.find(o => (o.fileId === file.parent)? o: null)
                // Gather all the file's permissions as an array
                let data = [[],[]]
                for(let key in file.permissionsRaw){
                    if(key === "anyoneWithLink"){
                        continue
                    }
                    data[0].push(file.permissionsRaw[key])
                }
                if(parent)
                    for(let key in parent.permissionsRaw){
                        data[1].push(parent.permissionsRaw[key])
                    }
                // console.log(data)
                // If there is parent, there can be inheritied and direct permissions
                if(parent){
                    inheritiedPerms = data.reduce((a,b) => a.filter(c => c.role !== "owner" && b.some(item => (item.emailAddress || item.domain) === (c.emailAddress || item.domain) && item.role === c.role)))
                    directPerms = data.reduce((a,b) => a.filter(c => c.role !== "owner" && !b.some(item => ( (item.emailAddress || item.domain) === (c.emailAddress || item.domain) && item.role === c.role))))
                }
                // If no parent, all permissions are direct
                else{
                    directPerms = data[0].filter(item => item.role !== "owner")
                }
                // console.log(inheritiedPerms, directPerms)
                rowPrototype.push(createData(file.name, file.children ? "Folder" : "File",
                file.owner === auth.user.email ? "me": file.owner, file.lastModifiedTime, file.fileId, i++, inheritiedPerms, directPerms));
                
            }
            console.log(rowPrototype)
            setRows(rowPrototype);
        }
    }, [store.allItems]);

    
    // Change the order direction or the field
    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    // Selects all the items in the list
    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = rows;
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleChangeFolder = (event, type, fileID, name) => {
        if(type === "Folder") {
            const snapshotID = store.currentSnapshot
            //console.log(snapshotID, fileID)
            store.getFolder(snapshotID, fileID, {name: name, id: fileID}, -1);
        }
    }

    // Handles clicking on the row
    const handleClick = (event, row) => {
        let name = row.name
        const selectedIndex = selected.map((e) => e.name).indexOf(name);
        let newSelected = [];
        
        // Add in the item
        if (selectedIndex === -1) {
            console.log("Select " + name + " from list")
            newSelected = newSelected.concat(selected, row);
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

    const isSelected = (e) => selected.map((item) => item.name).indexOf(e) !== -1;

    return (
        <Box sx={{width: '100%'}}>
            <TableContainer
                sx={{width:'100%', overflowX: 'auto'}}>
                <Table
                    sx={{minWidth: 1000}}
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
                                        key={row.name + index}
                                        selected={isItemSelected}>
                                        <TableCell padding='checkbox'>
                                            <Checkbox
                                                color='primary'
                                                checked={isItemSelected}
                                                inputProps={{'aria-labelledby': labelID}} 
                                                onClick={(event) => handleClick(event, row)}/>
                                        </TableCell>
                                        <TableCell
                                            componet='th'
                                            id={labelID}
                                            scope='row'
                                            padding='none'
                                            >
                                            <Stack direction="row" alignItems="center" gap={1}>
                                                {
                                                    row.type === "Folder"? <FolderIcon /> : <ArticleIcon sx={{mr:.5}}/>
                                                }
                                                <Box display='inline'>{row.name}</Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="left">{row.owner}</TableCell>
                                        <TableCell align="left"><PermissionsTab permissions={row.inherited} /></TableCell>
                                        <TableCell align="left"><PermissionsTab permissions={row.direct} /></TableCell>
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