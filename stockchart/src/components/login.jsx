import React, { Component } from 'react'
import {GoogleLogin} from 'react-google-login'
import {useNavigate , Navigate} from  'react-router-dom'
import loginimg from '../images/loginbg.jpg'
import bg from '../images/bg.jpg'

// Main login page
function LoginPage(props){
    const navigate = useNavigate()
    const handleLogin = (googleData) =>{
        console.log(googleData.googleId)
        props.setterFunc(googleData.googleId)
        navigate("/portfolio", {googleID : googleData.googleId})
    }
    const handleLoginFailure = () =>{
        navigate("/login")
    }
     return ( <div>
                <img src = {bg} style = {{maxWidth : '100%', maxHeight : "100vh" , aspectRatio :  1}}></img>
                <div style={{
                    position: 'absolute', left: '50%', top: '50%',
                    transform: 'translate(-50%, -50%)'}}
                ><GoogleLogin 
                    clientId='437083341130-f8kunsbdl0b606ml89te6p5favuvrn09.apps.googleusercontent.com'
                    buttonText="Login with Google"
                    onSuccess={handleLogin}
                    onFailure={handleLoginFailure}
                    cookiePolicy={'single_host_origin'} className = "text-black h1"></GoogleLogin>
                </div> 
            </div>); 
 }
 
export default LoginPage;