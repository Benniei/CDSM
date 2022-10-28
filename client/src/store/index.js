import {createContext, useState} from 'react';
import api from '../api'

export const GlobalStoreContext = createContext({})

export const GlobalStoreActionType = {
    GET_SNAPSHOT: "GET_SNAPSHOT",
    OPEN_QUERY_BUILDER: "OPEN_QUERY_BUILDER",
    OPEN_TAKE_SNAPSHOT_MODAL: "OPEN_TAKE_SNAPSHOT_MODAL",
    OPEN_UPDATE_SHARING: "OPEN_UPDATE_SHARING",
    CLOSE_MODAL: "CLOSE_MODAL",
    OPEN_DRIVE: "OPEN_DRIVE",
    OPEN_ACCESS: "OPEN_ACCESS",
    OPEN_ANALYZE: "OPEN_ANALYZE"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        allItems: [],
        selectedDocuments: [],
        currentSnapshot: null,
        queryBuilder: false,
        takeSnapshotModal: false,
        updateSharingModal: false,
        openDrive: "My Drive",
        openAccess: false,
        openAnalyze: false
    });

    const storeReducer = (action) => {
        const {type, payload} = action;
        switch(type){
            case GlobalStoreActionType.GET_SNAPSHOT: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: [],
                    currentSnapshot: payload,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false
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
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze
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
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze
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
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze
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
                    openDrive: store.openDrive,
                    openAccess: store.openAccess,
                    openAnalyze: store.openAnalyze
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
                    openDrive: null,
                    openAccess: true,
                    openAnalyze: false
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
                    openDrive: null,
                    openAccess: false,
                    openAnalyze: true
                })
            }
            case GlobalStoreActionType.OPEN_DRIVE: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false,
                    openDrive: payload,
                    openAccess: false,
                    openAnalyze: false
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

    }

    /**
     * The user retrieves a snapshot and sets it to 
     * the current snapshot.
     */
    store.getSnapshot = async function(id) {
        const response = await api.getSnapshot({id: id});
        if(response.status === 200) {
            let snapshot = response.data;
            storeReducer({
                type:GlobalStoreActionType.GET_SNAPSHOT,
                payload: snapshot
            })
        }
    }

    store.openQueryBuilder = async function () {
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

    store.closeModal = async function () {
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
        console.log("open Access View")
        storeReducer({
            type: GlobalStoreActionType.OPEN_ACCESS
        })
    }

    store.openAnalyzeView = async function () {
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