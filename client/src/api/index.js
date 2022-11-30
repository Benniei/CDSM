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
export const analyzeDeviantPermissions = (payload, snapshotId) => api.post(`/snapshot/${snapshotId}/deviantPermissions`, payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

export const analyzeFileFolderDifferences = (snapshotId) => api.post(`/snapshot/${snapshotId}/fileFolderDifferences`).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

export const analyzeSnapshots = (snapshot1Id, snapshot2Id) => api.post(`/snapshots/${snapshot1Id}/${snapshot2Id}/analyze`).then(response => {
   return response;
}).catch(error => {
   return error.response;
});

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

export const addGroup = (payload) => api.post('/addGroup', payload).then(response => {
   return response;
}).catch(error => {
   return error.response;
});
 
const apis = {
   analyzeDeviantPermissions,
   analyzeFileFolderDifferences,
   analyzeSnapshots,
   buildQuery,
   doQuery,
   getFiles,
   getFolder,
   getLoggedIn,
   getSnapshot,
   takeSnapshot,
   updateACR,
   addGroup
};

export default apis;