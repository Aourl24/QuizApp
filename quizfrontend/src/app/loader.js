import React from 'react'
import { useRouter ,useSearchParams,usePathname } from 'next/navigation'

export function Loader({children}){
    const path = usePathname()
    const [loader,setLoader] = React.useState(true)

      React.useEffect(()=>{
        const timer = setTimeout(()=>setLoader(false),1000)
        return ()=>{setLoader(true);clearTimeout(timer)}
    },[path])

      if(loader){
	return(<div class="vh-100">
			<div className="modal d-flex align-items-center vh-100 " style={{ backgroundColor: "rgba(100,100,100,0.9)" }}>
            <div className="modal-dialog modal-dialog-centered w-100 h-100 p-3">
            <div class="modal-content no-border" style={{ backgroundColor: "rgba(100,100,100,0)" }}>
                <div className="row p-md-4 p-3">
                	<div class="col center color-white"><i class="spinner-border p-5"></i></div>
                </div>
             </div>
            </div>
           </div>
           </div>
		)
}
else{
    return(<> <h1></h1> {children} </>)
}
}