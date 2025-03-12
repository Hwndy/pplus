import React from 'react';
import { Bar, HorizontalBar } from 'react-chartjs-2';

const PublicationAnalysis = () => {
    const topPublicationsData = {
        labels: ['Forbes', 'TechCrunch', 'Bloomberg', 'Reuters', 'WSJ'],
        datasets: [{
            label: 'Article Count',
            data: [45, 38, 35, 32, 28],
            backgroundColor: 'rgba(78, 115, 223, 0.8)'
        }]
    };

    const publicationTypeData = {
        labels: ['Online News', 'Print Media', 'Industry Journals', 'Blogs', 'News Agencies'],
        datasets: [{
            label: 'Distribution by Type',
            data: [40, 25, 15, 12, 8],
            backgroundColor: [
                'rgba(78, 115, 223, 0.8)',
                'rgba(54, 185, 204, 0.8)',
                'rgba(246, 194, 62, 0.8)',
                'rgba(28, 200, 138, 0.8)',
                'rgba(231, 74, 59, 0.8)'
            ]
        }]
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Publication Analysis</h1>
                <div>
                    <button className="btn btn-sm btn-primary shadow-sm mr-2">
                        <i className="fas fa-calendar fa-sm text-white-50 mr-1"></i> Date Range
                    </button>
                    <button className="btn btn-sm btn-primary shadow-sm">
                        <i className="fas fa-download fa-sm text-white-50 mr-1"></i> Export
                    </button>
                </div>
            </div>

            <div className="row">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Publications</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">842</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-newspaper fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-success shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Tier 1 Coverage</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">178</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-star fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-info shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-info text-uppercase mb-1">
                                        Average Reach</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">125K</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-users fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-warning shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Engagement Rate</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">4.8%</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-chart-line fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3 d-flex flex-row align-items-center justify-content-between">
                            <h6 className="m-0 font-weight-bold text-primary">Top Publications</h6>
                        </div>
                        <div className="card-body">
                            <Bar data={topPublicationsData} />
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Publication Types</h6>
                        </div>
                        <div className="card-body">
                            <HorizontalBar data={publicationTypeData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PublicationAnalysis;