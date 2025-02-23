import React from 'react';

export function OnView({children ,className , initial, animation , repeat}) {
    const elementRef = React.useRef()
    const [newClass,setNewClass] = React.useState(initial)

    const view =()=> {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setNewClass(animation)
                }
                else if(repeat){
                	setNewClass('invisible')
                }
            })
        })
        observer.observe(elementRef.current)
    }

    React.useEffect(() => {
        if (elementRef) view()
    }, [])

    return ( <div className={`${className} ${newClass}`} ref={elementRef}> {children} </div>)
    }


 export function OnScroll({children , className, initial, animation , y=50}){
 	const elementRef = React.useRef()
 	// const animateClass = `${isScrolled ? "color-bg-p color-white shadow-sm" : "color-bg-white color-black"}`
 	const [newClass,setNewClass] = React.useState(initial)

 	React.useEffect(()=>{
		const handleScroll = () =>{
			if (window.scrollY > y){
				setNewClass(animation);
			}
			else{
				setNewClass(initial)
			}
		}
		window.addEventListener('scroll',handleScroll,{passive:true})

		return ()=> window.removeEventListener('scroll',handleScroll)
	},[])

	return ( <div className={`${className} ${newClass}`} ref={elementRef}> {children} </div>)
 }


export function Typing({string}){
	const [word,setWord] = React.useState(string[0])

	React.useEffect(()=>{
		if(word.length < string.length) {
			const timer = setTimeout(()=>setWord((prev)=>prev + string[(prev.length-1) + 1]),150)
			return ()=> clearTimeout(timer)
		}
		else {setWord(string)}
		
	},[word])

	return(<span class="ease"> {word} </span>)
}




