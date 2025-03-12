import React from 'react';
import Card from '../common/Card';

const StatCards = () => {
    const stats = [
        {
            title: 'Total Media Coverage',
            value: '2,453',
            icon: 'fa-newspaper',
            color: 'primary',
            percentage: '+15%',
            trend: 'up'
        },
        {
            title: 'Share of Voice',
            value: '45.3%',
            icon: 'fa-chart-pie',
            color: 'success',
            percentage: '+8%',
            trend: 'up'
        },
        {
            title: 'Sentiment Score',
            value: '8.5/10',
            icon: 'fa-smile',
            color: 'info',
            percentage: '+5%',
            trend: 'up'
        },
        {
            title: 'Media Value',
            value: '$2.4M',
            icon: 'fa-dollar-sign',
            color: 'warning',
            percentage: '-3%',
            trend: 'down'
        }
    ];

    return (
        <div className="row">
            {stats.map((stat, index) => (
                <div key={index} className="col-xl-3 col-md-6 mb-4">
                    <Card className={`border-left-${stat.color} h-100`}>
                        <div className="row no-gutters align-items-center">
                            <div className="col mr-2">
                                <div className={`text-xs font-weight-bold text-${stat.color} text-uppercase mb-1`}>
                                    {stat.title}
                                </div>
                                <div className="h5 mb-0 font-weight-bold text-gray-800">
                                    {stat.value}
                                </div>
                                <div className="mt-2 small">
                                    <span className={`text-${stat.trend === 'up' ? 'success' : 'danger'} mr-2`}>
                                        <i className={`fas fa-${stat.trend === 'up' ? 'arrow-up' : 'arrow-down'}`}></i>
                                        {stat.percentage}
                                    </span>
                                    <span className="text-muted">Since last month</span>
                                </div>
                            </div>
                            <div className="col-auto">
                                <i className={`fas ${stat.icon} fa-2x text-gray-300`}></i>
                            </div>
                        </div>
                    </Card>
                </div>
            ))}
        </div>
    );
};

export default StatCards;