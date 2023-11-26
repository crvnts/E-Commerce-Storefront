import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import 'bootstrap/dist/css/bootstrap.css';

import './Login.css';
import LoadingScreen from '../LoadingScreen/LoadingScreen';


const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(false);
    const [forgotPasswordError, setForgotPasswordError] = useState('');
    const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [loadingSpinner, setLoadingSpinner] = useState('none');
    const navigate = useNavigate();


    useEffect( () => {
        $(window).on('load', function(){
            setTimeout(function() {
                $('.login-form').fadeIn('slow');
            }, 750);
        });
        return () => {
            console.log("unmounted");
        };
    }, []);



    const handleSubmit = (e) => {
        e.preventDefault();
        setError(false);
        fetch("/login", {
            method:"POST",
            cache: "no-cache",
            headers:{
                "Content-type":"application/json",
            },
            body:JSON.stringify({username: username, password: password})
        }).then(res => res.json()).then(res => {
            if(res['alert'] !== 'error'){
                if(res['isVerified']){
                    navigate("/home");
                }else{
                    navigate("/verify");
                }
            } else{
                setError(true);
            }
        });
    };

    const handleForgotPassword = (e) => {
        e.preventDefault();
        setLoadingSpinner('block');
        setForgotPasswordError('');
        fetch("/forgot-password", {
          method: "POST",
          cache: "no-cache",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({ email: email }),
        })
        .then(res => res.json())
        .then(res => {
          if (res.alert === 'success') {
            console.log("Password reset initiated successfully");
            setForgotPasswordSuccess(true);
            setLoadingSpinner('none');
          } else if (res.alert === 'error' && res.message === 'user_not_found') {
            setForgotPasswordError('Username not found. Please check the entered username.');
            setLoadingSpinner('none');
          } else {
            console.log("Error:", res.message);
            setForgotPasswordError('Email not found.');
            setLoadingSpinner('none');
          }
        })
        .catch(error => {
          console.error("Error:", error);
          setForgotPasswordError('Email not found.');
          setLoadingSpinner('none');
        });
      };


    return (
        <div className="login-body">
            <LoadingScreen />
            <div className="login-form" style={{ display: "none" }}>
                <form onSubmit={handleSubmit} className="container" action="/home" method="get">
                    <h1>Login</h1>

                    <div className="form-group">
                        <label htmlFor="username"><b>Username</b></label>
                        <input type="text" placeholder="Enter Username" name="username" className="form-control" onChange={(event) => setUsername(event.target.value)} required autoFocus />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password"><b>Password</b></label>
                        <input type="password" placeholder="Enter Password" name="password" className="form-control" onChange={(event) => setPassword(event.target.value)} required />
                    </div>

                    {(username && password) ? (
                        <button className="btn btn-primary btn-rounded" type="submit">Login</button>
                    ) : (
                        <button className="btn btn-primary btn-rounded" type="submit" disabled>Login</button>
                    )}

                    <hr />
                    <a className="btn btn-primary btn-rounded" type="submit" href="/registration">Register Here!</a>
                    {/* Toggle for showing/hiding forgot password form */}
                    <button
                        className="btn btn-primary btn-rounded"
                        type="button"
                        onClick={() => setShowForgotPassword(!showForgotPassword)}
                    >
                        Forgot Password?
                    </button>

                    {showForgotPassword && (
                        // Forgot password form
                        <div>
                            <label htmlFor="email"><b>Email</b></label>
                            <input type="email" placeholder="Enter Email" name="email" className="form-control" onChange={(event) => setEmail(event.target.value)} required />
                            <button className="btn btn-primary btn-rounded" type="button" onClick={handleForgotPassword}>Reset Password</button>
                            <div class="spinner-border" style={{marginLeft: "20px", marginTop: "5px", display: loadingSpinner}}>
                                <span class="sr-only"></span>
                            </div>
                            {forgotPasswordSuccess && (
                            <p style={{ color: "green" }}>Email sent successfully. Check your inbox for further instructions.</p>
                            )}
                            {forgotPasswordError && (
                            <p style={{ color: "red" }}>{forgotPasswordError}</p>
                            )}
                        </div>
                        )}

                    {error ? (
                        <p style={{ color: "red" }}>Incorrect username and/or password. Please try again</p>
                    ) : null}
                </form>
            </div>
        </div>
    );
};

export default Login;