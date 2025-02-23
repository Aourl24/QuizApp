"use client";
import Cookies from 'js-cookie';
import React from 'react';
import axios from 'axios'
import { useRouter ,useSearchParams,usePathname } from 'next/navigation'

export const AuthContext = React.createContext()

export function Auth({children , excludedPath=[], redirect='/login'}){
	const path = usePathname()
	const router = useRouter()
	const token = Cookies.get('token')
	const cachedata = Cookies.get('data')
	
	const [login,setLogin] = React.useState(token ? true : false)
	const [message , setMessage] = React.useState()
	const [data, setData] = React.useState(token && JSON.parse(cachedata))

	const loginUser = (url='login' , data) =>{
		postData(url,data).then((res)=>{
			if (res.msg) {setMessage(res.msg)}
			if(res.status){
				setLogin(res.status)
				setData(res)
				Cookies.set('token',res.token)
				Cookies.set('data',JSON.stringify(res))
		}
	}).catch((err)=>{
			setMessage(err.toString());setLogin(false)})
}
	
	const logoutUser = (url='logout')=>{
		axios.get(url)
	}


	if(excludedPath.includes(path) && !login){
		router.push(redirect)
		return(<div class="sz-24">Permission Denied</div>)
	}

	return(<AuthContext.Provider value={{login,message,loginUser,setLogin,data ,setMessage}}>{children}</AuthContext.Provider>)
}


export async function postData(path,data) {
    const token = Cookies.get('token'); // Use 'csrftoken' instead of 'X-CSRFToken'
    const api_host = '127.0.0.1:8000'
    if(token && token != null ){
    	var headers = {headers: {
                'Content-Type': 'application/json',
               'Authorization':`JWT ${token}`
            }}

    	}

    else{
    	var headers = {headers:{'Content-Type':'application/json'}} 
    }

    try {
        const resp = await axios.post(`${path}`, data, headers);
        return resp.data;
    } catch (error) {
		        
    }
}