import axios from 'axios'

axios.defaults.withCredentials=true;
let ip = 'localhost:4000'
const api = axios.create({
    baseURL: 'http://' + ip
})

export const test = () => api.get('/test')
.then(response => {
    return response
 })
 .catch(error => {
    return error.response;
 });

 /* Authentication */
 

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
test
};

export default apis;