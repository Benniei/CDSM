// Import modules
import axios from 'axios';

// Configure Axios
axios.defaults.withCredentials = true;
const api = axios.create({
    baseURL: process.env.REACT_APP_URL
});

// Authentication related requests
export const getLoggedIn = () => api.get('/loggedIn').then(response => {
   return response;
}).catch(error => {
   return error.response;
});

// Snapshot related requests
export const getSnapshot = (payload) => api.post('/snapshot', payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

export const takeSnapshot = (payload) => api.post('/snapshot/create', payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

// File related requests
export const getFiles = (payload, snapshotId) => api.post(`/snapshot/${snapshotId}/files`, payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

export const getFolder = (payload, snapshotId, folderId) => api.post(`/snapshot/${snapshotId}/${folderId}`, payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

// Query related requests
export const buildQuery = (payload) => api.post('/buildQuery', payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

export const doQuery = (payload) => api.post('/doQuery', payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

// User related requests
export const updateACR = (payload) => api.post('/acr', payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});
 
const apis = {
   buildQuery,
   doQuery,
   getFiles,
   getFolder,
   getLoggedIn,
   getSnapshot,
   takeSnapshot,
   updateACR
};

export default apis;