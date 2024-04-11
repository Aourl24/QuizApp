import axios from 'axios'
import Cookies from 'js-cookie'

const host = '192.168.215.92:8000'
export const endpoint = `http://${host}/`//'http://127.0.0.1:8000/'
export const endpath = endpoint.trim().replace(/\/$/, '')
export const wsEndpoint = `ws:/${host}/quizroom/`;
axios.defaults.baseURL = endpoint

export const api = [{
    name: 'signup',
    url: 'signup'
}, {
    name: 'login',
    url: 'login'
}, {
    name: 'checkuser',
    url: 'checkuser'
}]

export function getData(e) {
	 const sessionid = Cookies.get('sessionid')
    const path = api.find((x) => x.name === e.trim())
    const response = async () => {
        var resp = await axios.get(path.url,
        	{headers: {
               'Cookie': `sessionid=${sessionid}` // Include session ID in request headers
            }}
        	);
        return resp.data
    }
    return response()
}

export async function postData(e, data) {
    const token = Cookies.get('token'); // Use 'csrftoken' instead of 'X-CSRFToken'
    const path = api.find((x) => x.name === e.trim());
    if(token){
    	var headers = {headers: {
                'Content-Type': 'application/json',
               'Authorization':`JWT ${token}`
            }}

    	}

    else{
    	var headers = {headers:{'Content-Type':'application/json'}} 
    }

    try {
        const resp = await axios.post(`${path.url}`, data, headers);
        return resp.data;
    } catch (error) {
        if(error.response.status === 401){
        	Cookies.remove('token')
        }
    }
}

export function joinPath(e) {
    if (e.startsWith('http')) {
        return e
    } else {
        const path = endpath + e
        return path
    }
}