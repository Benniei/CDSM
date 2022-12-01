// Local imports
const File = require('../models/file-model');
const User = require('../models/user-model');
const FileSnapshot = require('../models/filesnapshot-model')
const GroupSnapshot = require('../models/groupsnapshot-model')

buildQuery = async function(req, res) {
    const query = req.body.query;
    try {
        const user = await User.findById(req.userId, { searchHistory: 1 });
        if (!user) {
            throw new Error('Could not find User in database.');
        }
        if (user.searchHistory) {
            user.searchHistory = user.searchHistory.filter(item => item !== query);
            user.searchHistory.unshift(query);
            if(user.searchHistory.length > 10) 
                user.searchHistory = user.searchHistory.slice(0, 10);
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

// Helper Query Functions
function objectify(op, email) {
    let op_statement = op;
    let toInvert = false;;
    if (op_statement.charAt(0) === '-') {
        toInvert = true;
        op_statement = op_statement.substring(1);
    }
    
    field = op_statement.substring(0, op_statement.indexOf(':'));
    value = op_statement.substring(op_statement.indexOf(':')+1);
    if (value.charAt(0) === '"' && value.charAt(value.length-1) === '"') {
        value = value.slice(1, -1);
    }
    query = {};

    if (field === 'name') {
        regexValue = { $regex: value };
        query['name'] = toInvert ? { $ne: regexValue } : regexValue;
    } else if (field === 'inFolder') {
        regexValue = { $regex: '\/'+value+'\/$' };
        query['path'] = toInvert ? { $ne: regexValue } : regexValue;
    } else if (field === 'folder') {
        regexValue = { $regex: '\/'+value };
        query['path'] = toInvert ? { $ne: regexValue } : regexValue;
    } else if (field === 'drive') {
        regexValue = { $regex: '^\/'+value };
        query['path'] = toInvert ? { $ne: regexValue } : regexValue;
    } else {
        if (value === 'me') {
            first = {}
            second = {}
            first[field] = toInvert ? { $ne: value } : value
            second[field] = toInvert ? { $ne: email } : email
        
            query["$or"] = [ first, second ]
        } else {
            query[field] = toInvert ? { $ne: value } : value;
        }
    }
    return query;
}

function combine(bool, b, a) {
    combined = {};
    ab = [a, b];
    combined["$"+bool] = ab;
    return combined;
}

function parseQuery(query, email) {
    /*
    Regex explanation:
    ( and | or |\(|\))  : match " and " or " or " or "(" or ")"
     (?=                : lookahead, match if its followed by
      (?:               : these
       [^"]*"           : any number of not ", and then "
       [^"]*"           : same, make sure there two "
      )*                : any even amount of "
      [^"]*             : and then only non quotes
      $                 : until the end
     )                  : end of lookahead
    */
    regex = /( and | or |\(|\))(?=(?:[^"]*"[^"]*")*[^"]*$)/
    parseable = query.split(regex);
    parseable = parseable.filter(x => x.length>0);
    parseable = parseable.map(x => x.trim());
    
    opStack = [];
    valueStack = [];

    precedence = {
        '(': 3,
        'and': 2,
        'or': 1
    }

    while (parseable.length) {
        next = parseable.shift();
        //console.log('Next: '+next)
        //console.log(opStack)
        //console.log(valueStack)
        switch(next) {
            case '(':
                opStack.push(next)
                break;
            case ')':
                while (opStack.length && opStack.slice(-1)[0]  !== '(') {
                    valueStack.push(combine(opStack.pop(), valueStack.pop(), valueStack.pop()))
                }
                opStack.pop()
                break;
            case 'and':
            case 'or':
                while (opStack.length && (precedence[opStack.slice(-1)[0]] >= precedence[next])) {
                    valueStack.push(combine(opStack.pop(), valueStack.pop(), valueStack.pop()))
                }
                opStack.push(next)
                break;
            default:
                valueStack.push(objectify(next, email))
                break;
        }
    }
    while (opStack.length) {
        valueStack.push(combine(opStack.pop(), valueStack.pop(), valueStack.pop()))
    }
    query = valueStack.pop()
    if (query && Object.keys(query)[0] == '') {
        query['name'] = { '$regex': query[''] }
    }
    
    return query
}

// do query
doQuery = async function (req, res) {   
    // const {query, snapshot_id} = req.params;
    let {query, snapshotid} = req.body;
    console.log(req.body)
    let snapshot_id = snapshotid
    
    try {
        let user = await User.findById(req.userId, { email: 1 });
        let email = user.email

        builtQuery = parseQuery(query, email)
        if (builtQuery)
            builtQuery['snapshotId'] = snapshot_id;
        else 
            builtQuery = { snapshotId: snapshot_id };
        console.log('Input Query, Output Query')
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
checkACR = async (req, res) => {
    try {
        let {acr, snapshot_id, flag} = req.body;
        let user;
        if(flag){
            user = await User.findOneAndUpdate({ _id: req.userId }, { $set:{ access_control_req: acr }},
                { fields: 'email access_control_req groupsnapshot', returnDocument: 'after' });
            if (!user) {
                throw new Error('Could not find User in database.');
            }
        }
        else{
            user = await User.findById(req.userId, { email: 1 });
        }
        let email = user.email;
        let {query, AW, AR, DW, DR, Grp } = acr;

        if(AW.length === 0 && AR.length === 0 && DW.length === 0 && DR.length === 0)
            return res.status(200).json({ success: true, acr: acr, violations: [] });

        query = query? query: ""
        // Perform search query
        builtQuery = parseQuery(query, email);
        if (builtQuery)
            builtQuery['snapshotId'] = snapshot_id;
        else 
            builtQuery = { snapshotId: snapshot_id };
        files = await File.find( builtQuery );

        const snapshot = await FileSnapshot.findOne({ snapshotId: snapshot_id });
        if (!snapshot) {
            throw new Error('Unable to find FileSnapshot in database.');
        }

        const groups = user.groupsnapshot ? user.groupsnapshot : [];
        var snapshotTime = snapshot.createdAt
        if (Grp) {
            for (let value of groups) {
                const group = await GroupSnapshot.aggregate([
                    // Match the User's ID and the name of the group
                    {$match: {domain: value, user: req.userId}},
                    // Project a diff field that's the absolute difference along with the original doc.
                    {$project: {diff: {$abs: {$subtract: [snapshotTime, '$createdAt']}}, doc: '$$ROOT'}},
                    // Order the docs by diff
                    {$sort: {diff: 1}},
                    // Take the first one
                    {$limit: 1}
                ])
                if (AW.includes(value)) {
                    AW = [...new Set([...AW, ...group[0].doc.emails])]
                }
                if (AR.includes(value)) {
                    AR = [...new Set([...AR, ...group[0].doc.emails])]
                }
                if (DW.includes(value)) {
                    DW = [...new Set([...DW, ...group[0].doc.emails])]
                }
                if (DR.includes(value)) {
                    DR = [...new Set([...DR, ...group[0].doc.emails])]
                }

            }
        }

        // Check each permission for each file 
        let violations = []
        for(const file of files) {
            let violation = {}
                
            let violated_AW = [...new Set([...file.writable.filter(u => !AW.includes(u)),
                    ...file.readable.filter(u => !AW.includes(u))])];
            let violated_AR = file.readable.filter(u => !AR.includes(u));
            let violated_DR = [...new Set([...DR.filter(u => file.writable.includes(u)),
                    ...DR.filter(u => file.readable.includes(u))])];
            let violated_DW = DW.filter(u => file.writable.includes(u));

            if (violated_AW.length > 0)
                violation["AW"] = violated_AW;
            if (violated_AR.length > 0)
                violation["AR"] = violated_AR;
            if (violated_DW.length > 0)
                violation["DW"] = violated_DW;
            if (violated_DR.length > 0)
                violation["DR"] = violated_DR;
            if(Object.keys(violation).length > 0) {
                violation["path"] = file.path;
                violations.push(violation);
            }
                
        }
        res.status(200).json({ success: true, acr: acr, violations: violations });
    } catch(error) {
        console.error('Failed to update ACR: ' + error);
        res.status(400).json({ success: false, error: error });   
    }
}

addGroup = async(req, res) => {
    try{
        const {name, domain, emails} = req.body
        const userID = req.userId

        // Add New Group to Database
        let body = req.body
        body.user = userID
        
        const group = new GroupSnapshot(body);
        group.save()

        // Add as Unique Group to user's list of groups
        let user = await User.findById(req.userId, { email: 1 , groupsnapshot: 1});
        if(user.groupsnapshot.length === 0){
            user.groupsnapshot = [domain]
        }
        else if(user.groupsnapshot.indexOf(domain) === -1){
            user.groupsnapshot.push(domain)
        }
        user.save()

        res.status(200).json({ success: true, group: group });
    } catch(error) {
        console.error('Failed to add Group Snapshot: ' + error);
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
    checkACR,
    listSnapshots,
    buildQuery,
    doQuery,
    addGroup
};