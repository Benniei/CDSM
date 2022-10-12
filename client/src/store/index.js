import {createContext, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import api from '../api'

export const GlobalStoreContext = createContext({})

export const GlobalStoreActionType = {

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
            default:
                return store;
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