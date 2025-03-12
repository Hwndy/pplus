import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
    return (
        <ul className="navbar-nav bg-gradient-primary sidebar sidebar-dark accordion" id="accordionSidebar">
            <Link className="sidebar-brand d-flex align-items-center justify-content-center" to="/">
                <div className="sidebar-brand-text mx-3">
                    <img src="/img/admin-logo.png" alt="logo" />
                </div>
            </Link>

            <hr className="sidebar-divider my-0" />
            <div className="nac-space"></div>

            <li className="nav-item">
                <Link className="nav-link active" to="/">
                    <img src="/img/excutive.png" alt="" />
                    <span>Executive Summary</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link collapsed" to="/swot-analysis">
                    <img src="/img/swot.png" alt="" />
                    <span>SWOT Analysis</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link collapsed" to="/outcome-insights">
                    <img src="/img/outcome.png" alt="" />
                    <span>Outcome & Insights</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link" to="/pr-drivers">
                    <img src="/img/pr-driver.png" alt="" />
                    <span>PR Drivers</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link" to="/brand-media-analysis">
                    <img src="/img/brand-media.png" alt="" />
                    <span>Brand Media Analysis</span>
                </Link>
            </li>

            <li className="nav-item">
                <Link className="nav-link" to="/publication-analysis">
                    <img src="/img/publication.png" alt="" />
                    <span>Publication Analysis</span>
                </Link>
            </li>

            <li className="nav-item">
                <a className="nav-link collapsed" href="#" data-toggle="collapse" data-target="#collapseUtilities">
                    <img src="/img/socail.png" alt="" />
                    <span>Social Media Analysis</span>
                </a>
                <div id="collapseUtilities" className="collapse" aria-labelledby="headingUtilities"
                    data-parent="#accordionSidebar">
                    <div className="bg-white py-2 collapse-inner rounded sub-nav">
                        <Link className="collapse-item sub-active" to="#"><i className="fas fa-fw fa-minus"></i> Colors</Link>
                        <Link className="collapse-item" to="#"><i className="fas fa-fw fa-minus"></i> Custom</Link>
                        <Link className="collapse-item" to="#"><i className="fas fa-fw fa-minus"></i> Colors</Link>
                        <Link className="collapse-item" to="#"><i className="fas fa-fw fa-minus"></i> Custom</Link>
                    </div>
                </div>
            </li>

            {/* ... Other menu items ... */}

            <div className="text-center d-none d-md-inline">
                <button className="rounded-circle border-0" id="sidebarToggle"></button>
            </div>
        </ul>
    );
};

export default Sidebar;