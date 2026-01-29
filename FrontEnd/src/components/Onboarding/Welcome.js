import React from 'react';

import Logo from "../../assets/images/logo/white-v.svg";
import { NavLink } from 'react-router-dom';
import { Link, useNavigate } from "react-router-dom";

import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button } from 'antd';

function Welcome(props) {


    const navigate = useNavigate();

    const handleSignOut = () => {
        localStorage.clear();
        navigate('/login');
    }

    return (
        <div className='auth-wrap'>
            <div className='left-col'>
                <div>
                    <img src={Logo} />
                    <h3>Streamline Your Finances: Welcome to Effortless Invoicing & Accounting!</h3>
                </div>
            </div>
            <div className='right-col'>
                <div className='header'>

                    <Button onClick={handleSignOut}>Sign Out</Button>

                </div>
                <div className='auth-form-wrap'>
                    <div className='section-title' style={{ marginBottom: "50px" }}>
                        <h2>Welcome to Hisaaber</h2>
                        <p>Get Ready to Experience Effortless Invoicing and Streamlined Accounting</p>
                    </div>

                    <ul className='list-actions'>
                        <li>
                            <NavLink to="/register-company">
                                <span>Register your company</span>
                                <ChevronRightIcon />
                            </NavLink>
                        </li>
                        <li>
                            <NavLink>
                                <span>Join a company</span>
                                <ChevronRightIcon />
                            </NavLink>
                        </li>
                    </ul>


                </div>
            </div>
        </div>
    );
}

export default Welcome;