import React, { useState } from 'react';
import { EngagementChart, MediaDistributionChart, SentimentAnalysisChart, MetricsChart } from '../../components/dashboard/ChartComponents';
import Card from '../../components/common/Card';
import DateRangePicker from '../../components/common/DateRangePicker';
import NoData from '../../components/common/NoData';

const UserDashboard = () => {
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    const handleDateChange = (range) => {
        setDateRange(range);
        // Add logic to fetch data based on date range
    };

    const metrics = [
        {
            title: 'Total Media Coverage',
            value: '2,453',
            change: '+15%',
            trend: 'up',
            icon: 'fa-newspaper',
            color: 'primary'
        },
        {
            title: 'Share of Voice',
            value: '45.3%',
            change: '+8%',
            trend: 'up',
            icon: 'fa-bullhorn',
            color: 'success'
        },
        {
            title: 'Sentiment Score',
            value: '8.5/10',
            change: '+5%',
            trend: 'up',
            icon: 'fa-smile',
            color: 'info'
        },
        {
            title: 'Media Value',
            value: '$2.4M',
            change: '+12%',
            trend: 'up',
            icon: 'fa-dollar-sign',
            color: 'warning'
        }
    ];

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Analytics Dashboard</h1>
                <DateRangePicker onDateChange={handleDateChange} />
            </div>

            <div className="row">
                {metrics.map((metric, index) => (
                    <div key={index} className="col-xl-3 col-md-6 mb-4">
                        <Card className={`border-left-${metric.color} h-100`}>
                            <div className="card-body">
                                <div className="row no-gutters align-items-center">
                                    <div className="col mr-2">
                                        <div className={`text-xs font-weight-bold text-${metric.color} text-uppercase mb-1`}>
                                            {metric.title}
                                        </div>
                                        <div className="h5 mb-0 font-weight-bold text-gray-800">
                                            {metric.value}
                                        </div>
                                        <div className="mt-2 small">
                                            <span className={`text-${metric.trend === 'up' ? 'success' : 'danger'} mr-2`}>
                                                <i className={`fas fa-arrow-${metric.trend}`}></i> {metric.change}
                                            </span>
                                            <span className="text-muted">Since last month</span>
                                        </div>
                                    </div>
                                    <div className="col-auto">
                                        <i className={`fas ${metric.icon} fa-2x text-gray-300`}></i>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                ))}
            </div>

            <div className="row">
                <div className="col-xl-8 col-lg-7">
                    <div className="mb-4">
                        <EngagementChart />
                    </div>
                    <div className="mb-4">
                        <MetricsChart />
                    </div>
                </div>
                <div className="col-xl-4 col-lg-5">
                    <div className="mb-4">
                        <MediaDistributionChart />
                    </div>
                    <div className="mb-4">
                        <SentimentAnalysisChart />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;