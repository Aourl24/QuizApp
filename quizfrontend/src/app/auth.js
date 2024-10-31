import React from 'react'
import {postData} from './endpoints.js'

export function useAuth(){
	const [isAuthenticated , setIsAuthenticated] = React.useState()
	const [user,setUser] = React.useState()

	// React.useEffect(()=>{
	// 	try{
	// 	postData('checkuser').then((res)=>{
	// 		setIsAuthenticated(res.status ? res.status : false)
	// 		setUser(res.user ? res.user : null)
	// 	}).catch(()=>{setIsAuthenticated(false); setUser(null)})
	// }
	// catch(error){
	// 	console.log(error)
	// }
	// },[])

	return {isAuthenticated , user}
}
