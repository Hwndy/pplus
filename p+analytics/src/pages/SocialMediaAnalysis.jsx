import React from 'react';
import { Line, Pie, Bar } from 'react-chartjs-2';

const SocialMediaAnalysis = () => {
    const engagementData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Facebook',
                data: [4500, 5000, 4800, 5200, 5800, 6000],
                borderColor: '#4267B2',
                fill: false
            },
            {
                label: 'Twitter',
                data: [3800, 4200, 4000, 4500, 4800, 5200],
                borderColor: '#1DA1F2',
                fill: false
            },
            {
                label: 'LinkedIn',
                data: [2800, 3200, 3500, 3800, 4200, 4500],
                borderColor: '#0077B5',
                fill: false
            }
        ]
    };

    const platformShareData = {
        labels: ['Facebook', 'Twitter', 'LinkedIn', 'Instagram', 'YouTube'],
        datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: [
                '#4267B2',
                '#1DA1F2',
                '#0077B5',
                '#E1306C',
                '#FF0000'
            ]
        }]
    };

    const contentTypeData = {
        labels: ['Photos', 'Videos', 'Links', 'Text Posts', 'Stories'],
        datasets: [{
            label: 'Engagement by Content Type',
            data: [8500, 12000, 5500, 3500, 6500],
            backgroundColor: 'rgba(78, 115, 223, 0.8)'
        }]
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Social Media Analysis</h1>
                <div className="btn-group">
                    <button className="btn btn-sm btn-primary shadow-sm mr-2">
                        <i className="fas fa-sync fa-sm text-white-50 mr-1"></i> Refresh Data
                    </button>
                    <button className="btn btn-sm btn-primary shadow-sm">
                        <i className="fas fa-download fa-sm text-white-50 mr-1"></i> Export Report
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
                                        Total Followers</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">258K</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-users fa-2x text-gray-300"></i>
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
                                        Engagement Rate</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">5.2%</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-heart fa-2x text-gray-300"></i>
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
                                        Post Reach</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">1.2M</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-eye fa-2x text-gray-300"></i>
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
                                        Total Posts</div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">486</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-comments fa-2x text-gray-300"></i>
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
                            <h6 className="m-0 font-weight-bold text-primary">Engagement Trends</h6>
                        </div>
                        <div className="card-body">
                            <Line data={engagementData} />
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Platform Distribution</h6>
                        </div>
                        <div className="card-body">
                            <Pie data={platformShareData} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Content Performance</h6>
                        </div>
                        <div className="card-body">
                            <Bar data={contentTypeData} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaAnalysis;