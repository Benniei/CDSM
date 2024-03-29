import React, {createContext, useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom'
import api from '../api'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

export const AuthActionType = {
    USER_LOGGED_IN: "USER_LOGGED_IN",
    USER_LOGIN: "USER_LOGIN",
    USER_LOGOUT: "USER_LOGOUT",
    USER_UPDATE_ACR: "USER_UPDATE_ACR",
    USER_TAKE_SNAPSHOT: "USER_TAKE_SNAPSHOT",
    USER_DO_SEARCH: "USER_DO_SEARCH"
}

function AuthContextProvider(props) {
    const [auth, setAuth] = useState({
        user: null,
        loggedIn: false
    });

    useEffect(() => {
        auth.getLoggedIn();
    }, []);

    const navigate = useNavigate();

    const authReducer = (action) => {
        const {type, payload} = action;
        switch(type) {
            case AuthActionType.USER_LOGGED_IN: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                });
            }
            case AuthActionType.USER_LOGIN: {
                return setAuth({
                    user: null,
                    loggedIn: payload.loggedIn
                })
            }
            case AuthActionType.USER_LOGOUT: {
                return setAuth({
                    user: null,
                    loggedIn: payload.loggedIn
                })
            }
            case AuthActionType.USER_UPDATE_ACR: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                })
            }
            case AuthActionType.USER_TAKE_SNAPSHOT: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                })
            }
            case AuthActionType.USER_DO_SEARCH: {
                return setAuth({
                    user: payload.user,
                    loggedIn: payload.loggedIn
                })
            }
            default: 
                return auth
        }
    }

    auth.getLoggedIn = async function () {
        const response = await api.getLoggedIn();
        if (response){
            if(response.status  === 200){
                if (response.data.status !== "ERROR") {
                    console.log("Logged in user: " + response.data.user)
                    console.log(response.data)
                    authReducer({
                        type: AuthActionType.USER_LOGGED_IN,
                        payload: {
                            loggedIn: true,
                            user: response.data.user
                        }
                    });
                }
            }
        }
    }

    auth.login = async function () { 
        authReducer({
            type: AuthActionType.USER_LOGIN,
            payload: {
                loggedIn: true
            }
        })
        navigate('/', {replace: true})
    }

    auth.logout = async function () {
        authReducer({
            type: AuthActionType.USER_LOGIN,
            payload: {
                loggedIn: false
            }
        })
        navigate('/', {replace: true})
    }

    auth.updateACR = async function(access_control_req) {
        let user = auth.user;
        user.access_control_req = access_control_req;
        authReducer({
            type: AuthActionType.USER_UPDATE_ACR,
            payload: {
                user: user,
                loggedIn: true
            }
        })
    }

    auth.takeSnapshot = async function(snapshotId) {
        let user = auth.user;
        if (user.filesnapshot) {
            user.filesnapshot.unshift(snapshotId);
        } else {
            user.filesnapshot = [snapshotId];
        } 
        authReducer({
            type: AuthActionType.USER_TAKE_SNAPSHOT,
            payload: {
                user: user,
                loggedIn: true
            }
        })
    }

    auth.doSearch = async function(query) {
        let user = auth.user;
        if (user.searchHistory) {
            user.searchHistory = user.searchHistory.filter(item=> item !== query);
            user.searchHistory.unshift(query);
            if(user.searchHistory.length > 10) 
                user.searchHistory = user.searchHistory.slice(0, 10);
        } else {
            user.searchHistory = [query];
        } 
        authReducer({
            type: AuthActionType.USER_DO_SEARCH,
            payload: {
                user: user,
                loggedIn: true
            }
        })
    }

    return (
        <AuthContext.Provider value={{
            auth
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export default AuthContext;
export { AuthContextProvider };