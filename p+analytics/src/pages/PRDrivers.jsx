import React from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';

const PRDrivers = () => {
    const driverData = {
        labels: ['Product Launch', 'Corporate News', 'Industry Events', 'CSR Initiatives', 'Leadership Updates'],
        datasets: [{
            label: 'Media Coverage by Driver',
            data: [350, 275, 200, 180, 150],
            backgroundColor: [
                'rgba(78, 115, 223, 0.8)',
                'rgba(54, 185, 204, 0.8)',
                'rgba(246, 194, 62, 0.8)',
                'rgba(28, 200, 138, 0.8)',
                'rgba(231, 74, 59, 0.8)'
            ],
            borderWidth: 1
        }]
    };

    const impactData = {
        labels: ['High Impact', 'Medium Impact', 'Low Impact'],
        datasets: [{
            data: [45, 35, 20],
            backgroundColor: [
                'rgba(28, 200, 138, 0.8)',
                'rgba(246, 194, 62, 0.8)',
                'rgba(231, 74, 59, 0.8)'
            ]
        }]
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">PR Drivers Analysis</h1>
                <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                    <i className="fas fa-download fa-sm text-white-50"></i> Generate Report
                </a>
            </div>

            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Key PR Drivers</h6>
                        </div>
                        <div className="card-body">
                            <Bar data={driverData} options={{
                                scales: {
                                    y: {
                                        beginAtZero: true
                                    }
                                }
                            }} />
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Impact Distribution</h6>
                        </div>
                        <div className="card-body">
                            <Doughnut data={impactData} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Driver Performance Metrics</h6>
                        </div>
                        <div className="card-body">
                            <div className="table-responsive">
                                <table className="table table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Driver</th>
                                            <th>Coverage Count</th>
                                            <th>Sentiment Score</th>
                                            <th>Engagement Rate</th>
                                            <th>Impact Level</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>Product Launch</td>
                                            <td>350</td>
                                            <td>8.5/10</td>
                                            <td>75%</td>
                                            <td><span className="badge badge-success">High</span></td>
                                        </tr>
                                        <tr>
                                            <td>Corporate News</td>
                                            <td>275</td>
                                            <td>7.8/10</td>
                                            <td>68%</td>
                                            <td><span className="badge badge-warning">Medium</span></td>
                                        </tr>
                                        <tr>
                                            <td>Industry Events</td>
                                            <td>200</td>
                                            <td>8.2/10</td>
                                            <td>72%</td>
                                            <td><span className="badge badge-success">High</span></td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PRDrivers;