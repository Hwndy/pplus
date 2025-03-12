import React from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const OutcomeInsights = () => {
    const lineData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
            {
                label: 'Media Coverage',
                data: [65, 59, 80, 81, 56, 95],
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1,
            },
        ],
    };

    const barData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [
            {
                label: 'Sentiment Analysis',
                data: [300, 150, 50],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(255, 99, 132, 0.6)',
                ],
            },
        ],
    };

    const pieData = {
        labels: ['Social Media', 'News Articles', 'Press Releases', 'Blogs'],
        datasets: [
            {
                data: [40, 30, 20, 10],
                backgroundColor: [
                    'rgba(255, 99, 132, 0.6)',
                    'rgba(54, 162, 235, 0.6)',
                    'rgba(255, 206, 86, 0.6)',
                    'rgba(75, 192, 192, 0.6)',
                ],
            },
        ],
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Outcome & Insights</h1>
                <a href="#" className="d-none d-sm-inline-block btn btn-sm btn-primary shadow-sm">
                    <i className="fas fa-download fa-sm text-white-50"></i> Download Report
                </a>
            </div>

            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Media Coverage Trend</h6>
                        </div>
                        <div className="card-body">
                            <Line data={lineData} />
                        </div>
                    </div>
                </div>

                <div className="col-xl-4 col-lg-5">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Content Distribution</h6>
                        </div>
                        <div className="card-body">
                            <Pie data={pieData} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Sentiment Analysis</h6>
                        </div>
                        <div className="card-body">
                            <Bar data={barData} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="row">
                <div className="col-lg-12">
                    <div className="card shadow mb-4">
                        <div className="card-header py-3">
                            <h6 className="m-0 font-weight-bold text-primary">Key Insights</h6>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-lg-6">
                                    <h4 className="small font-weight-bold">Media Coverage Growth <span className="float-right">60%</span></h4>
                                    <div className="progress mb-4">
                                        <div className="progress-bar bg-success" role="progressbar" style={{width: "60%"}}></div>
                                    </div>
                                </div>
                                <div className="col-lg-6">
                                    <h4 className="small font-weight-bold">Engagement Rate <span className="float-right">80%</span></h4>
                                    <div className="progress mb-4">
                                        <div className="progress-bar bg-info" role="progressbar" style={{width: "80%"}}></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutcomeInsights;