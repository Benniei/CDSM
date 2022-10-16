import {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api'

export const GlobalStoreContext = createContext({})

export const GlobalStoreActionType = {
    GET_SNAPSHOT: "GET_SNAPSHOT",
    OPEN_QUERY_BUILDER: "OPEN_QUERY_BUILDER",
    CLOSE_QUERY_BUILDER: "CLOSE_QUERY_BUILDER"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        allItems: [],
        selectedDocuments: [],
        queryBuilder: false,
        currentSnapshot: null
    });

    const navigate = useNavigate();

    const storeReducer = (action) => {
        const {type, payload} = action;
        switch(type){
            case GlobalStoreActionType.GET_SNAPSHOT: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: [],
                    queryBuilder: false,
                    currentSnapshot: payload
                })
            }
            case GlobalStoreActionType.OPEN_QUERY_BUILDER: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDocuments,
                    queryBuilder: true,
                    currentSnapshot: store.currentSnapshot
                })
            }
            case GlobalStoreActionType.CLOSE_QUERY_BUILDER: {
                return setStore({
                    allItems: store.allItems,
                    selectedDocuments: store.selectedDOcuments,
                    queryBuilder: false,
                    currentSnapshot: store.currentSnapshot
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
        console.log("queryBuilder")
        storeReducer({
            type: GlobalStoreActionType.OPEN_QUERY_BUILDER
        });
    }

    store.closeQueryBuilder = async function () {
        storeReducer({
            type: GlobalStoreActionType.CLOSE_QUERY_BUILDER
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