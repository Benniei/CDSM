// Local imports
const File = require('../models/file-model');
const User = require('../models/user-model');

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
    function objectify(op) {
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
            query[field] = toInvert ? { $ne: value } : value;
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
                    while (opStack.length && opStack.slice(-1)[0]  !== '(') {
                        valueStack.push(combine(opStack.pop(), valueStack.pop(), valueStack.pop()))
                    }
                    opStack.push(next)
                    break;
                default:
                    valueStack.push(objectify(next))
                    break;
            }
        }
        while (opStack.length) {
            valueStack.push(combine(opStack.pop(), valueStack.pop(), valueStack.pop()))
        }
        query = valueStack.pop()
        if (Object.keys(query)[0] == '') {
            query['name'] = { '$regex': query[''] }
        }
        return query
    }
    
    // const {query, snapshot_id} = req.params;
    let {query, snapshotid} = req.body;
    console.log(req.body)
    let snapshot_id = snapshotid
    
    try {
        let user = await User.findById(req.userId, { email: 1 });
        let email = user.email

        builtQuery = parseQuery(query, email)
        builtQuery['snapshotId'] = snapshot_id
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
    buildQuery,
    doQuery
};