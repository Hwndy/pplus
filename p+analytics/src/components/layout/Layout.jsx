import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';
import LogoutModal from '../modals/LogoutModal';

const Layout = ({ children }) => {
    return (
        <div id="page-top">
            <div id="wrapper">
                <Sidebar />
                <div id="content-wrapper" className="d-flex flex-column">
                    <div id="content">
                        <Navbar />
                        {children}
                    </div>
                    <Footer />
                </div>
            </div>
            
            <a className="scroll-to-top rounded" href="#page-top">
                <i className="fas fa-angle-up"></i>
            </a>

            <LogoutModal />
        </div>
    );
};

export default Layout;