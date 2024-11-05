
export default function Loader(){
	return(
			<div className="modal d-flex align-items-center " style={{ backgroundColor: "rgba(100,100,100,0.9)" }}>
            <div className="modal-dialog modal-dialog-centered w-100 h-100 p-3">
            <div class="modal-content no-border" style={{ backgroundColor: "rgba(100,100,100,0)" }}>
                <div className="row p-md-4 p-3">
                	<div class="col center color-white"><i class="spinner-border p-5"></i></div>
                </div>
             </div>
            </div>
           </div>
		)
}