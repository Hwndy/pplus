import React from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
    return (
        <body className="bg-gradient-primary signup-login-main">
            <div className="containers">
                <div className="row justify-content-center">
                    <div className="col-xl-12 col-lg-12 col-md-9 padd-zero">
                        <div className="card o-hiddens border-0 shadow-lg">
                            <div className="card-body p-0">
                                <div className="row">
                                    <div className="col-lg-6">
                                        <div className="p-5 padd-top">
                                            <div className="text-left">
                                                <img src="/img/logo.png" alt="logo" />
                                                <h1 className="h4 text-gray-900 mb-4">Welcome Back</h1>
                                                <p>Welcome back! Please Enter Your Details.</p>
                                            </div>
                                            <form className="user">
                                                <div className="form-group">
                                                    <label>Email</label>
                                                    <input 
                                                        type="email" 
                                                        className="form-control form-control-user"
                                                        id="exampleInputEmail"
                                                        placeholder="Enter Email Address..."
                                                    />
                                                </div>
                                                <div className="form-group">
                                                    <label>Password</label>
                                                    <input 
                                                        type="password" 
                                                        className="form-control form-control-user"
                                                        id="exampleInputPassword"
                                                        placeholder="Password"
                                                    />
                                                </div>
                                                <button className="btn btn-primary btn-user btn-block">
                                                    Login
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </body>
    );
};

export default Login;