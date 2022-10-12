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
 

const apis = {
test
};

export default apis;