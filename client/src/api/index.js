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
 export const getSnapshot = (id) => api.get('/snapshot/' + id)
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
getLoggedIn
};

export default apis;