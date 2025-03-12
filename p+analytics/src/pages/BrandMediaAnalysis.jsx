import React from 'react';
import { Line, Radar } from 'react-chartjs-2';

const BrandMediaAnalysis = () => {
    const mediaReachData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Online News',
                data: [1200, 1900, 1500, 2100, 1800, 2500],
                borderColor: 'rgb(75, 192, 192)',
                fill: false
            },
            {
                label: 'Social Media',
                data: [2000, 2500, 2200, 3000, 2800, 3500],
                borderColor: 'rgb(255, 99, 132)',
                fill: false
            }
        ]
    };

    const brandAttributesData = {
        labels: ['Innovation', 'Trust', 'Quality', 'Leadership', 'Sustainability', 'Customer Focus'],
        datasets: [{
            label: 'Brand Attributes',
            data: [85, 75, 90, 80, 70, 85],
            backgroundColor: 'rgba(78, 115, 223, 0.5)',
            borderColor: 'rgba(78, 115, 223, 1)',
            pointBackgroundColor: 'rgba(78, 115, 223, 1)'
        }]
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Brand Media Analysis</h1>
                <div>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm mr-2">
                        <i className="fas fa-filter fa-sm text-white-50"></i> Filter Data
                    </a>
                    <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                        <i className="fas fa-download fa-sm text-white-50"></i> Export Report
                    </a>
                </div>
            </div>

            <div className="row">
                <div className="col-xl-3 col-md-6 mb-4">
                    <div className="card border-left-primary shadow h-100 py-2">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Media Mentions</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">15,480</div>
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
                                        Share of Voice</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">45%</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-chart-pie fa-2x text-gray-300"></i>
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
                                        Sentiment Score</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">8.5/10</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-smile fa-2x text-gray-300"></i>
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
                                        Media Value</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">$2.4M</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-dollar-sign fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Media Reach Trends</h6>
                        </div>
                        <div className="card-body">
                            <Line data={mediaReachData} />
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Brand Attributes</h6>
                        </div>
                        <div className="card-body">
                            <Radar data={brandAttributesData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BrandMediaAnalysis;