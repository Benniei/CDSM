// Imports from React
import {createContext, useContext, useState} from 'react';

// Local imports
import api from '../api';
import AuthContext from '../auth/index.js';

export const GlobalStoreContext = createContext({});

export const GlobalStoreActionType = {
    GET_FOLDER: "GET_FOLDER",
    GET_DRIVE: "GET_DRIVE",
    SHOW_SEARCH: "SHOW_SEARCH",
    OPEN_QUERY_BUILDER: "OPEN_QUERY_BUILDER",
    OPEN_TAKE_SNAPSHOT_MODAL: "OPEN_TAKE_SNAPSHOT_MODAL",
    CLOSE_TAKE_SNAPSHOT_MODAL: "CLOSE_TAKE_SNAPSHOT_MODAL",
    OPEN_UPDATE_SHARING: "OPEN_UPDATE_SHARING",
    OPEN_AC_MODAL: "OPEN_AC_MODAL",
    CLOSE_MODAL: "CLOSE_MODAL",
    OPEN_AC_SEARCH: "OPEN_AC_SEARCH",
    OPEN_ACCESS: "OPEN_ACCESS",
    OPEN_ANALYZE: "OPEN_ANALYZE",
    SET_DRIVES: "SET_DRIVES",
    OPEN_ANALYZE_VIEW: "OPEN_ANALYZE_VIEW",
    UPDATE_SHARING: "UPDATE_SHARING",
    SET_VIOLATIONS: "SET_VIOLATIONS"
};

function GlobalStoreContextProvider(props) {
    const {auth} = useContext(AuthContext);

    const [store, setStore] = useState({
        allItems: [],
        currentSnapshot: "",
        queryBuilder: false,
        takeSnapshotModal: false,
        updateSharingModal: false,
        accessModal: false,
        search: false,
        openDrive: "MyDrive",
        openAccess: false,
        openAnalyze: false,
        path: [],
        parents: [],
        otherDrive: [],
        groups: {},
        analyze: [],
        sharingResult: [],
        violations: []
    });

    const storeReducer = (action) => {
        const {type, payload} = action;
        switch(type) {
            case GlobalStoreActionType.GET_FOLDER: {
                return setStore({
                    allItems: payload.folder,
                    currentSnapshot: payload.id,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: payload.path,
                    parents: payload.parents,
                    otherDrive: store.otherDrive,
                    groups: {},
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.GET_DRIVE: {
                return setStore({
                    allItems: payload.folder,
                    currentSnapshot: payload.snapshotid,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: payload.driveName,
                    openAccess: false,
                    openAnalyze: false,
                    path: [],
                    parents: payload.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.SET_DRIVES: {
                return setStore({
                    allItems: payload.folder,
                    currentSnapshot: payload.snapshotid,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: payload.driveName,
                    openAccess: false,
                    openAnalyze: false,
                    path: [],
                    parents: payload.parents,
                    otherDrive: payload.otherDrive,
                    groups: payload.groups,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.SHOW_SEARCH: {
                return setStore({
                    allItems: payload.folder,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: true,
                    openDrive: store.openDrive,
                    openAccess: false,
                    openAnalyze: false,
                    path: null,
                    parents: payload.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.OPEN_QUERY_BUILDER: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: true,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: store.search,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: store.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.OPEN_TAKE_SNAPSHOT_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: true,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: store.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.CLOSE_TAKE_SNAPSHOT_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: store.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.OPEN_UPDATE_SHARING: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: true,
                    accessModal: false,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: store.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.OPEN_AC_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: true,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: [],
                    otherDrive: store.otherDrive,
                    groups: {},
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.UPDATE_SHARING: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: true,
                    accessModal: false,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: store.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    sharingResult: payload,
                    violations: []
                });
            }
            case GlobalStoreActionType.OPEN_AC_SEARCH: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: true,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: true,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: [],
                    otherDrive: store.otherDrive,
                    groups: {},
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.CLOSE_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path,
                    parents: store.parents,
                    otherDrive: store.otherDrive,
                    groups: store.groups,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            
            case GlobalStoreActionType.OPEN_ACCESS: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: null,
                    openAccess: true,
                    openAnalyze: false,
                    path: [],
                    parents: [],
                    otherDrive: store.otherDrive,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.OPEN_ANALYZE: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: false,
                    openAnalyze: true,
                    path: [],
                    parents: [],
                    otherDrive: store.otherDrive,
                    analyze: [],
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.OPEN_ANALYZE_VIEW: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: store.openDrive,
                    openAccess: false,
                    openAnalyze: true,
                    path: [],
                    parents: [],
                    otherDrive: store.otherDrive,
                    analyze: payload,
                    sharingResult: [],
                    violations: []
                });
            }
            case GlobalStoreActionType.SET_VIOLATIONS: {
                return setStore({
                    allItems: store.allItems,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    search: false,
                    openDrive: null,
                    openAccess: true,
                    openAnalyze: false,
                    path: [],
                    parents: [],
                    otherDrive: store.otherDrive,
                    analyze: [],
                    sharingResult: [],
                    violations: payload
                });
            }
            default:
                return store;
        }
    };

    // Identifies deviant permissions of all files in a given FileSnapshot
    store.analyzeDeviantPermissions = async function(snapshotId, threshold) {
        console.log(`Analyzing deviant file sharing permissions for snapshot '${snapshotId}' with a threshold value of ${threshold}.`);
        const response = await api.analyzeDeviantPermissions({ threshold: threshold }, snapshotId);
        if (response.status === 200) {
            const analysis = response.data.analysis;
            console.log(analysis)
            storeReducer({
                type:GlobalStoreActionType.OPEN_ANALYZE_VIEW,
                payload: analysis
            });
        }
    }

    // Identifies file-folder differences of all files in a given FileSnapshot
    store.analyzeFileFolderDifferences = async function(snapshotId) {
        console.log(`Analyzing file-folder differences for snapshot '${snapshotId}'.`);
        const response = await api.analyzeFileFolderDifferences(snapshotId);
        if (response.status === 200) {
            const analysis = response.data.analysis;
            storeReducer({
                type:GlobalStoreActionType.OPEN_ANALYZE_VIEW,
                payload: analysis
            });
        }
    }
    
    // Identifies file sharing permission changes between two FileSnapshots
    store.analyzeSnapshots = async function(snapshot1Id, snapshot2Id) {
        console.log(`Analyzing file sharing differences between snapshots '${snapshot1Id}' and '${snapshot2Id}'`);
        const response = await api.analyzeSnapshots(snapshot1Id, snapshot2Id);
        if (response.status === 200) {
            const analysis = response.data.analysis;
            storeReducer({
                type:GlobalStoreActionType.OPEN_ANALYZE_VIEW,
                payload: analysis
            });
        }
    }

    /**
     * The user clicks on the Take Snapshot button.
     * This creates a snapshot that will be sent to 
     * MongoDB.
     */
    store.takeSnapshot = async function() {
        const response = await api.takeSnapshot(auth.user);
        if(response.status === 200) {
            let snapshot = response.data.fileSnapshot;
            // Retrieve fileId of root folder of 'My Drive' file collection
            let driveIds = snapshot.driveIds;
            let driveID = Object.keys(driveIds).find((key) => driveIds[key] === "MyDrive");
            auth.takeSnapshot(snapshot.snapshotId);
            storeReducer({
                type:GlobalStoreActionType.CLOSE_TAKE_SNAPSHOT_MODAL
            });
            store.getDrive(snapshot.snapshotId, driveID, "MyDrive");
        }
    };

    /**
    * The user retrieves a snapshot and sets it to 
    * the current snapshot.
    */
    store.getSnapshot = async function(snapshotId, driveName) {
        console.log(`Get snapshot '${snapshotId}' in drive '${driveName}'`);
        const response = await api.getSnapshot({ id: snapshotId });
        if (response.status === 200) {
            let snapshot = response.data.snapshot;
            let driveIds = snapshot.driveIds;
            let driveId = Object.keys(driveIds).find((key) => driveIds[key] === driveName);
            let groups = response.data.groups;
            if (driveName === 'MyDrive') {
                let otherDrives = []
                for (const property in driveIds){
                    if (driveIds[property] !== "MyDrive" && driveIds[property] !== "SharedWithMe")
                        otherDrives.push([driveIds[property], property])
                }
                console.log(otherDrives)
                const response = await api.getFolder(auth.user, snapshotId, driveId);
                if (response.status === 200) {
                    let snapshot = {
                        folder: response.data.folder,
                        snapshotid: snapshotId,
                        driveName: driveName,
                        otherDrive: otherDrives,
                        groups: groups
                    };
                    storeReducer({
                        type:GlobalStoreActionType.SET_DRIVES,
                        payload: snapshot
                    });
                }
                
            }
            else if (driveId && !store.search) {
                store.getDrive(snapshotId, driveId, driveName);
            }
        }
    };

    /**
     * The user gets all the Files in the Snapshot
     */
    store.getFiles = async function(snapshotId, fileIds) {
        console.log(`Getting files ${fileIds} in snapshot '${snapshotId}'`);
        const response = await api.getFiles({ fileIds: fileIds }, snapshotId);
        if (response.status === 200) {
            // TODO: do something with files
            console.log(response.data.files);
        }
    };

    store.getFolder = async function(snapshotId, folderId, folderName, prevFile) {
        console.log(`Get folder '${folderName.name}' (${folderId}) from snapshot '${snapshotId}'`);
        const response = await api.getFolder(auth.user, snapshotId, folderId);
        if (response.status === 200) {
            let path;
            if (prevFile > -1) {
                path = store.path.filter((item, index) => index <= prevFile);
            }
            else{
                path = [...store.path, folderName];
            }
            console.log(response.data)
            let snapshot = {
                folder: response.data.folder,
                id: snapshotId,
                path: path,
                parents: [{fileId: folderId, permissionsRaw: response.data.perms}]
            };
            console.log(snapshot);
            storeReducer({
                type:GlobalStoreActionType.GET_FOLDER,
                payload: snapshot
            });
        }
    };

    store.getDrive = async function(snapshotId, driveID, driveName) {
        console.log(`Get drive '${driveName}' (${driveID}) from snapshot '${snapshotId}'`);
        const response = await api.getFolder(auth.user, snapshotId, driveID);
        if (response.status === 200) {
            let snapshot = {
                folder: response.data.folder,
                snapshotid: snapshotId,
                driveName: driveName
            };
            storeReducer({
                type:GlobalStoreActionType.GET_DRIVE,
                payload: snapshot
            });
        }
    };

    store.buildQuery = async function(query) {
        console.log(`Building query: ${query}`);
        const response = await api.buildQuery({ query: query, snapshotid: store.currentSnapshot });
        if (response.status === 200) {
            let query = response.data.query;
            auth.doSearch(query);
            store.doQuery(query);
        }
    };

    store.doQuery = async function(query) {
        console.log(`Doing query: ${query}`);
        const response = await api.doQuery({ query: query, snapshotid: String(store.currentSnapshot) });
        if (response.status === 200) {
            let snapshot = {
                folder: response.data.files,
                snapshotid: response.data.snapshot_id
            };
            // Get Unique Parent ids (Used Primarily for Search when there are multiple files)
            let allParents=[]
            snapshot.folder.map((file) => allParents.indexOf(file.parent) === -1? allParents.push(file.parent): null)
            const response2 = await api.getFiles({fileIds: allParents}, store.currentSnapshot);
            if(response.status === 200) {
                snapshot.parents = response2.data.files
                storeReducer({
                    type:GlobalStoreActionType.SHOW_SEARCH,
                    payload: snapshot
                });
            }
        }
    };

    store.updateACR = async function(access_control_req) {
        const response = await api.checkACR({acr: access_control_req, snapshot_id: store.currentSnapshot, flag: true});
        if (response.status === 200) {
            let acr = response.data.acr;
            console.log(response.data.violations);
            auth.updateACR(acr);
            storeReducer({
                type:GlobalStoreActionType.SET_VIOLATIONS,
                payload: response.data.violations
            });
        }
    };

    store.updateGroups = async function(domain, emails) {
        let payload = {
            domain: domain,
            emails: emails
        }
        const response = await api.addGroup(payload)
        if(response.status === 200) {
            console.log(response.data)
        }
    }

    store.updateSharing = async function(payload){
        const response = await api.updateSharing(payload);
        if(response.status === 200) {
            console.log(response.data)
            // storeReducer({
            //     type: GlobalStoreActionType.UPDATE_SHARING,
            //     payload: response.data.confirm // in the for of [success], [fail]
            // });
        }
    }

    /**!SECTION Functions for managing the view/state of the application */
    store.openQueryBuilder = async function () {
        console.log("Open Query Builder");
        storeReducer({
            type: GlobalStoreActionType.OPEN_QUERY_BUILDER
        });
    };

    store.openTakeSnapshot = async function () {
        console.log("Open Take Snapshot Modal");
        storeReducer({
            type: GlobalStoreActionType.OPEN_TAKE_SNAPSHOT_MODAL
        });
    };

    store.openUpdateSharing = async function () {
        console.log("Open Update Sharing Modal");
        storeReducer({
            type: GlobalStoreActionType.OPEN_UPDATE_SHARING
        });
    };

    store.openCreateAccessControl = async function () { 
        console.log("Open Access Control Modal");
        storeReducer({
            type: GlobalStoreActionType.OPEN_AC_MODAL
        });
    };

    store.openAccessControlSearch = async function () {
        console.log("Open Query Builder with Access Control");
        storeReducer({
            type: GlobalStoreActionType.OPEN_AC_SEARCH
        });
    };

    store.closeModal = async function () {
        if(store.accessModal && store.queryBuilder)
            storeReducer({
                type: GlobalStoreActionType.OPEN_AC_MODAL
            });
        else
            storeReducer({
                type: GlobalStoreActionType.CLOSE_MODAL
            });
    };

    store.openAccessView = async function () { 
        console.log("Open Access Control Policy View");
        const response = await api.checkACR({acr: auth.user.access_control_req, snapshot_id: store.currentSnapshot, flag: false});
        if (response.status === 200) {
            console.log(response.data.violations);
            storeReducer({
                type:GlobalStoreActionType.SET_VIOLATIONS,
                payload: response.data.violations
            });
        }
    };

    store.openAnalyzeView = async function () {
        console.log("Open Analyze View");
        storeReducer({
            type:GlobalStoreActionType.OPEN_ANALYZE
        });
    };

    return (
        <GlobalStoreContext.Provider value={{ store }}>
            { props.children }
        </GlobalStoreContext.Provider>
    );
};

export default GlobalStoreContext;
export { GlobalStoreContextProvider };