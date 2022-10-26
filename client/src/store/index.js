import {createContext, useState} from 'react';
import api from '../api'

export const GlobalStoreContext = createContext({})

export const GlobalStoreActionType = {
    GET_SNAPSHOT: "GET_SNAPSHOT",
    OPEN_QUERY_BUILDER: "OPEN_QUERY_BUILDER",
    OPEN_TAKE_SNAPSHOT_MODAL: "OPEN_TAKE_SNAPSHOT_MODAL",
    OPEN_UPDATE_SHARING: "OPEN_UPDATE_SHARING",
    CLOSE_MODAL: "CLOSE_MODAL"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        allItems: [],
        selectedDocuments: [],
        currentSnapshot: null,
        queryBuilder: false,
        takeSnapshotModal: false,
        updateSharingModal: false
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
                    updateSharingModal: false
                })
            }
            case GlobalStoreActionType.OPEN_TAKE_SNAPSHOT_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: true,
                    updateSharingModal: false
                })
            }
            case GlobalStoreActionType.OPEN_UPDATE_SHARING: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: true,
                    takeSnapshotModal: true,
                    updateSharingModal: true
                })
            }
            case GlobalStoreActionType.CLOSE_MODAL: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDOcuments,
                    currentSnapshot: store.currentSnapshot,
                    queryBuilder: false,
                    takeSnapshotModal: false,
                    updateSharingModal: false
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
        storeReducer({
            type: GlobalStoreActionType.OPEN_TAKE_SNAPSHOT_MODAL
        });
    }

    store.openUpdateSharing = async function () {
        storeReducer({
            type: GlobalStoreActionType.OPEN_UPDATE_SHARING
        });
    }

    store.closeModal = async function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_MODAL
        });
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