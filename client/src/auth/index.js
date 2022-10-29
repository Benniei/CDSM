import React, {createContext, useEffect, useState} from "react";
import {useNavigate} from 'react-router-dom'
import api from '../api'

const AuthContext = createContext();
console.log("create AuthContext: " + AuthContext);

export const AuthActionType = {
    USER_LOGGED_IN: "USER_LOGGED_IN",
    USER_LOGIN: "USER_LOGIN",
    USER_LOGOUT: "USER_LOGOUT"
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