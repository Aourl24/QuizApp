"use client"
import React from "react"
import {getData,postData} from '../endpoints.js'
import {isAuthenticated,user} from '../auth.js'

function App(props){
	return(
			<div>
				{!isAuthenticated ? <Profile /> : <div class="center sz-18">You are not allowed to view this page</div>}
			</div>
		)
}

function Profile(props){

const [profile,setProfile] = React.useState()

React.useEffect(()=>{
	var resp = postData('profile',{user:user?.id}).then((res)=>setProfile(res.data))
},[])

if(!profile){
	return(<div class="w-100 center"><div class="spinner-border"></div></div>)
}

return(
		<div>
			Your Profile {profile.name}
		</div>
	)
}


export default App;