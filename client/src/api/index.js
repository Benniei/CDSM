import axios from 'axios'

axios.defaults.withCredentials=true;
const api = axios.create({
    baseURL: process.env.REACT_APP_URL
})

export const test = () => api.get('/test')
.then(response => {
    return response
 })
 .catch(error => {
    return error.response;
 });

 /* Authentication */
 export const getLoggedIn = () => api.get(`/loggedIn`)
.then(response => {
    return response
 })
 .catch(error => {
    return error.response
 });

 /* Snapshot */
 export const getSnapshot = (payload) => api.post('/snapshot', payload)
 .then(response => {
    return response
 })
 .catch(error => {
    return error.response;
 });

/* Snapshot */
export const getFolder = (payload, id, folderid) => api.post('/snapshot/' + id + '/' + folderid, payload)
.then(response => {
   return response
})
.catch(error => {
   return error.response;
});

 export const takeSnapshot = (payload) => api.post('/snapshot/create', payload)
 .then(response => {
    return response
 })
 .catch(error => {
    return error.response;
 });
 
const apis = {
test,
getLoggedIn,
getSnapshot,
getFolder,
takeSnapshot,
};

export default apis;