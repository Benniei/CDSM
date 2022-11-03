// Local imports
const FileSnapshot = require('../models/filesnapshot-model');
const File = require('../models/file-model');
const User = require('../models/user-model');

// Non-Specific Drive Functions
getSnapshot = async (req, res) => {
    const id = req.body.id;
    console.log(id);
    const snapshot = await FileSnapshot.findOne({snapshotId: id});
    res.status(200).json(snapshot).end();
};

getFolder = async function(req, res) {
    const {id, folderid} = req.params;
    try {
        const user = await User.findById(req.userId, { _id: 0, refreshToken: 1 });
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        const fileList = await File.find({ snapshotId: id, parent: folderid });
        let folderPerms = await File.find({fileId: folderid, snapshotId: id});

        res.status(200).json({ success: true, folder: fileList, perms: folderPerms[0].permissions});
    } catch(error) {
        console.error('Failed to find folder: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
};

buildQuery = async function(req, res) {
    const query = req.body.query;
    try {
        const user = await User.findById(req.userId, { searchHistory: 1 });
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        if (user.searchHistory) {
            user.searchHistory.unshift(query);
            if(user.searchHistory.length > 5) 
                user.searchHistory = user.searchHistory.slice(0, 5);
        } else {
            user.searchHistory = [query];
        } 
        user.save();
        res.status(200).json({ success: true, query: query });
    } catch(error) {
        console.error('Failed to build search query: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
};

// do query
doQuery = async function (req, res) {
    function parseQuery(query) {
        op_list = ['drive:', 'owner:', 'creator:', 'from:', 'to:', 'readable:', 'writable:', 'sharable:', 'name:', 'inFolder:', 'folder:', 'path:', 'sharing:']
            
        op_queries = []
        
        let nextColon = 0;
        let endInd = 0;
        while (op_list.some(v => query.toLowerCase().includes(v))) {
            nextColon = query.indexOf(':')+1
            if (query.charAt(nextColon) === '"' ) {
                endInd = query.indexOf('"', nextColon+1)+1
                endInd = query.indexOf(' ', endInd)
            } else {
                endInd = query.indexOf(' ', nextColon)
            }
                
            if (endInd === -1) {
                endInd = query.length;
            }
                
            op_str = query.substring(0, endInd);
            if (op_str.indexOf('and') === 0) {
                op_str = op_str.substring(4)
            } 
            if (op_str.indexOf('or') === 0) {
                op_str = op_str.substring(3)
            }
            op_str = op_str.trim()
            while (op_str.indexOf('(') === 0) {
                op_str = op_str.substring(1)
            }
            while (op_str.indexOf(')', op_str.length-1) === (op_str.length-1)) {
                op_str = op_str.substring(0, op_str.length - 1)
            }
            query = query.substring(endInd).trim();
            
            op_query = op_str.split(':')
            op_query.push(op_query[0].charAt(0) === '-' ? true : false)
            if (op_query[0].charAt(0) === '-') {
                op_query[0] = op_query[0].substring(1)
            }
            if (op_query[1].charAt(0) === '"' && op_query[1].charAt(op_query[1].length-1) === '"' ) {
                op_query[1] = op_query[1].substring(1, op_query[1].length-1)
            }
            
            op_queries.push(op_query);
        }
        return op_queries
    }
    
    function queryBuilder(query_list, snapshot_id) {
        function negate(content, negate) {
            return (negate ? { $ne: content } : content); 
        }
        
        query = { snapshotId: { $regex: snapshot_id } }
        for (op of query_list) {
            
            if (op[0] === 'inFolder') {
                content = { $regex: op[1]+'\/$'}
                query['path'] = negate(content, op[2])
            } else if (op[0] === 'folder') {
                content = { $regex: '\/'+op[1]}
                query['path'] = negate(content, op[2])
            } else if (op[0] === 'path') {
                content = { $regex: op[1]}
                query['path'] = negate(content, op[2])
            } else {
                query[op[0]] = negate(op[1], op[2])
            }
        }
        return query
    }
    // for testing we hardcoded snapshot_id
    // const {query, snapshot_id} = req.params;
    let {query} = req.body;
    console.log(parseQuery(query))
    snapshot_id = '6358b63f68f6810c650732af-November 2nd 2022, 20:16:30'
    try {
        builtQuery = queryBuilder(parseQuery(query), snapshot_id)
        console.log(query, builtQuery);
        files = await File.find( builtQuery );
        //console.log(files);
        res.status(200).json({ success: true, files: files, snapshot_id: snapshot_id});
    } catch(error) {
        console.error('Failed to execute query: ' + error);
        res.status(400).json({ success: false, error: error });
    }
}

// User Functions
updateACR = async (req, res) => {
    try {
        const acr = await User.findOneAndUpdate({ _id: req.userId }, { $set:{ access_control_req: req.body }}, { fields: 'access_control_req', returnDocument: 'after' });
        if (!acr) {
            throw new Error('Could not find User in database.');
        }
        res.status(200).json({ success: true, acr: acr.access_control_req });
    } catch(error) {
        console.error('Failed to update ACR: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
}

listSnapshots = async (req, res) => {
    try {
        const snapshots = await User.findById(req.userId, { _id: 0, filesnapshot: 1, groupsnapshot: 1 });
        if (!snapshots) {
            throw new Error('Could not find User in database.');
        }
        res.status(200).json({ success: true, snapshots: snapshots });
    } catch(error) {
        console.error('Failed to list snapshots: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
}

module.exports = {
    updateACR,
    listSnapshots,
    getSnapshot,
    getFolder,
    buildQuery,
    doQuery
};