import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Line, Bar } from 'react-chartjs-2';
import { useApi } from '../../hooks/useApi';
import DateRangePicker from '../common/DateRangePicker';

const MediaAnalytics = () => {
    const { handleRequest, loading } = useApi();
    const [analyticsData, setAnalyticsData] = useState({
        ceoInterviews: [],
        partnershipProminence: [],
        monthlyTrends: [],
        weeklyTrends: []
    });

    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        endDate: new Date()
    });

    useEffect(() => {
        loadAnalytics();
    }, [dateRange]);

    const loadAnalytics = async () => {
        try {
            const data = await handleRequest(() => 
                fetch(`/api/analytics/media?startDate=${dateRange.startDate.toISOString()}&endDate=${dateRange.endDate.toISOString()}`)
            );
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        }
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom'
            },
            tooltip: {
                mode: 'index',
                intersect: false
            }
        }
    };

    const barOptions = {
        ...chartOptions,
        indexAxis: 'y',
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false
                }
            },
            y: {
                grid: {
                    display: false
                }
            }
        }
    };

    const lineOptions = {
        ...chartOptions,
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    borderDash: [2],
                    drawBorder: false
                }
            },
            x: {
                grid: {
                    display: false
                }
            }
        }
    };

    if (loading) {
        return (
            <div className="container-fluid py-4">
                <Card>
                    <div className="d-flex justify-content-center align-items-center p-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <Card>
                        <DateRangePicker
                            startDate={dateRange.startDate}
                            endDate={dateRange.endDate}
                            onChange={setDateRange}
                        />
                    </Card>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <Card title="CEOs with Media Interview Prominence">
                        <div style={{ height: '300px' }}>
                            <Bar
                                data={{
                                    labels: analyticsData.ceoInterviews.map(item => item.name),
                                    datasets: [{
                                        label: 'Interview Count',
                                        data: analyticsData.ceoInterviews.map(item => item.count),
                                        backgroundColor: '#4e73df',
                                    }]
                                }}
                                options={barOptions}
                            />
                        </div>
                    </Card>
                </div>

                <div className="col-md-6 mb-4">
                    <Card title="Media Prominence on Partnership">
                        <div style={{ height: '300px' }}>
                            <Bar
                                data={{
                                    labels: analyticsData.partnershipProminence.map(item => item.name),
                                    datasets: [{
                                        label: 'Partnership Coverage',
                                        data: analyticsData.partnershipProminence.map(item => item.count),
                                        backgroundColor: '#36b9cc',
                                    }]
                                }}
                                options={barOptions}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <Card title="Monthly Trend on Brand Media Exposure">
                        <div style={{ height: '300px' }}>
                            <Line
                                data={{
                                    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                    datasets: [
                                        {
                                            label: 'Online Media',
                                            data: analyticsData.monthlyTrends.map(item => item.online),
                                            borderColor: '#4e73df',
                                            tension: 0.4,
                                            fill: false
                                        },
                                        {
                                            label: 'Print Media',
                                            data: analyticsData.monthlyTrends.map(item => item.print),
                                            borderColor: '#1cc88a',
                                            tension: 0.4,
                                            fill: false
                                        }
                                    ]
                                }}
                                options={lineOptions}
                            />
                        </div>
                    </Card>
                </div>

                <div className="col-md-6 mb-4">
                    <Card title="Weekly Trend on Brand Media Exposure">
                        <div style={{ height: '300px' }}>
                            <Line
                                data={{
                                    labels: ['Week1', 'Week2', 'Week3', 'Week4', 'Week5'],
                                    datasets: [
                                        {
                                            label: 'Online Media',
                                            data: analyticsData.weeklyTrends.map(item => item.online),
                                            borderColor: '#4e73df',
                                            tension: 0.4,
                                            fill: false
                                        },
                                        {
                                            label: 'Print Media',
                                            data: analyticsData.weeklyTrends.map(item => item.print),
                                            borderColor: '#1cc88a',
                                            tension: 0.4,
                                            fill: false
                                        }
                                    ]
                                }}
                                options={lineOptions}
                            />
                        </div>
                    </Card>
                </div>
            </div>

            <div className="d-flex justify-content-end mt-4">
                <button 
                    className="btn btn-primary" 
                    onClick={() => window.print()}
                    disabled={loading}
                >
                    Download Report
                </button>
            </div>
        </div>
    );
};

export default MediaAnalytics;