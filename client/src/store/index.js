import {createContext, useState} from 'react';
import api from '../api'
import AuthContext from '../auth/index.js';
import {useContext} from 'react';

export const GlobalStoreContext = createContext({})

export const GlobalStoreActionType = {
    GET_FOLDER: "GET_FOLDER",
    GET_DRIVE: "GET_DRIVE",
    OPEN_QUERY_BUILDER: "OPEN_QUERY_BUILDER",
    OPEN_TAKE_SNAPSHOT_MODAL: "OPEN_TAKE_SNAPSHOT_MODAL",
    OPEN_UPDATE_SHARING: "OPEN_UPDATE_SHARING",
    OPEN_AC_MODAL: "OPEN_AC_MODAL",
    CLOSE_MODAL: "CLOSE_MODAL",
    OPEN_AC_SEARCH: "OPEN_AC_SEARCH",
    OPEN_DRIVE: "OPEN_DRIVE",
    OPEN_ACCESS: "OPEN_ACCESS",
    OPEN_ANALYZE: "OPEN_ANALYZE"
}

function GlobalStoreContextProvider(props) {
    const {auth} = useContext(AuthContext);

    const [store, setStore] = useState({
        allItems: [],
        selectedDocuments: [],
        currentSnapshot: "",
        queryBuilder: false,
        takeSnapshotModal: false,
        updateSharingModal: false,
        accessModal: false,
        openDrive: "My Drive",
        openAccess: false,
        openAnalyze: false,
        path: []
    });

    const storeReducer = (action) => {
        const {type, payload} = action;
        switch(type){
            case GlobalStoreActionType.GET_FOLDER: {
                return setStore({
                    allItems: payload.folder,
                    selectedDocuments: [],
                    currentSnapshot: payload.id,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: payload.path
                })
            }
            case GlobalStoreActionType.GET_DRIVE: {
                return setStore({
                    allItems: payload.folder,
                    selectedDocuments: [],
                    currentSnapshot: payload.snapshotid,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: payload.driveName,
                    openAccess: false,
                    openAnalyze: false,
                    path: []
                })
            }
            case GlobalStoreActionType.OPEN_QUERY_BUILDER: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: true,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path
                })
            }
            case GlobalStoreActionType.OPEN_TAKE_SNAPSHOT_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: true,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path
                })
            }
            case GlobalStoreActionType.OPEN_UPDATE_SHARING: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: true,
                    accessModal: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path
                })
            }
            case GlobalStoreActionType.OPEN_AC_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: true,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path
                })
            }
            case GlobalStoreActionType.OPEN_AC_SEARCH: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: true,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: true,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path
                })
            }
            case GlobalStoreActionType.CLOSE_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze,
                    path: store.path
                })
            }
            
            case GlobalStoreActionType.OPEN_ACCESS: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: null,
                    openAccess: true,
                    openAnalyze: false,
                    path: []
                })
            }
            case GlobalStoreActionType.OPEN_ANALYZE: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: null,
                    openAccess: false,
                    openAnalyze: true,
                    path: []
                })
            }
            case GlobalStoreActionType.OPEN_DRIVE: {
                return setStore({
                    allItems: [],
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    accessModal: false,
                    openDrive: payload,
                    openAccess: false,
                    openAnalyze: false,
                    path: []
                })
            }
            default:
                return store;
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
            let folderId = snapshot.myDrive;
            store.getFolder(snapshot.snapshotId, folderId, null);
        }
    }

    store.getFolder = async function(snapshotid, folderid, folderName, prevFile) {
        console.log("Get Folder " + folderName.name + " with ID " + folderid + " from Snapshot " + snapshotid)
        const response = await api.getFolder(auth.user, snapshotid, folderid);
        if(response.status === 200) {
            let path;
            if(prevFile > -1){
                path = store.path.filter((item, index) => index <= prevFile)
            }
            else{
                path = [...store.path, folderName]
            }
            let snapshot = {
                folder: response.data.folder,
                id: snapshotid,
                path: path
            };
            // console.log(snapshot)
            storeReducer({
                type:GlobalStoreActionType.GET_FOLDER,
                payload: snapshot
            })
        }
    }

    store.getDrive = async function(snapshotid, driveID, driveName) {
        console.log("Get " + driveName + " with ID " + driveID + " from Snapshot " + driveID)
        const response = await api.getFolder(auth.user, snapshotid, driveID);
        if(response.status === 200) {
            let snapshot = {
                folder: response.data.folder,
                snapshotid: snapshotid,
                driveName: driveName
            };
            // console.log(snapshot)
            storeReducer({
                type:GlobalStoreActionType.GET_DRIVE,
                payload: snapshot
            })
        }
    }

    /**
     * The user retrieves a snapshot and sets it to 
     * the current snapshot.
     */
    store.getSnapshot = async function(id, driveName) {
        console.log("Get Snapshot " + id + " in " + driveName)
        const response = await api.getSnapshot({id: id});
        if(response.status === 200) {
            let snapshot = response.data;
            // TODO: CHANGE snapshot.myDrive To support other drives
            console.log(snapshot)
            if(driveName === "My Drive" && snapshot.myDrive){
                store.getDrive(id, snapshot.myDrive, driveName);
                return;
            }
            if(driveName === "Shared With Me" && snapshot.sharedDrive )
                store.getDrive(id, snapshot.shareDrive, driveName);
        }
    }


    /**!SECTION Functions for managing the view/state of the application */
    store.openQueryBuilder = async function () {
        console.log("Open Query Builder");
        storeReducer({
            type: GlobalStoreActionType.OPEN_QUERY_BUILDER
        });
    }

    store.openTakeSnapshot = async function () {
        console.log("Open Take Snapshot Modal")
        storeReducer({
            type: GlobalStoreActionType.OPEN_TAKE_SNAPSHOT_MODAL
        });
    }

    store.openUpdateSharing = async function () {
        console.log("Open Update Sharing Modal")
        storeReducer({
            type: GlobalStoreActionType.OPEN_UPDATE_SHARING
        });
    }

    store.openCreateAccessControl = async function () { 
        console.log("Open Access Control Modal")
        storeReducer({
            type: GlobalStoreActionType.OPEN_AC_MODAL
        })
    }

    store.openAccessControlSearch = async function () {
        console.log("Open Query Builder with Access Control")
        storeReducer({
            type: GlobalStoreActionType.OPEN_AC_SEARCH
        })
    }

    store.closeModal = async function () {
        if(store.accessModal && store.queryBuilder)
            storeReducer({
                type: GlobalStoreActionType.OPEN_AC_MODAL
            });
        else
            storeReducer({
                type: GlobalStoreActionType.CLOSE_MODAL
            });
    }

    store.openDriveView = async function (driveName) {
        storeReducer({
            type:GlobalStoreActionType.OPEN_DRIVE,
            payload: driveName
        })
    }

    store.openAccessView = async function () { 
        console.log("Open Access Control Policy View")
        storeReducer({
            type: GlobalStoreActionType.OPEN_ACCESS
        })
    }

    store.openAnalyzeView = async function () {
        console.log("Open Analyze View")
        storeReducer({
            type:GlobalStoreActionType.OPEN_ANALYZE
        })
    }


    return (
        <GlobalStoreContext.Provider value={{
            store
        }}>
            {props.children}
        </GlobalStoreContext.Provider>
    );
}

export default GlobalStoreContext;
export { GlobalStoreContextProvider };