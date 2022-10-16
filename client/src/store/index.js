import {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api'

export const GlobalStoreContext = createContext({})

export const GlobalStoreActionType = {
    GET_SNAPSHOT: "GET_SNAPSHOT"
}

function GlobalStoreContextProvider(props) {
    const [store, setStore] = useState({
        allItems: [],
        selectedDocuments: [],
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
                    currentSnapshot: payload
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