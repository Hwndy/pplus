import React, { useMemo } from 'react';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { Card } from '../common/Card';
import { CHART_COLORS } from '../../config/constants';

const MediaEntryChart = ({ data, type = 'sentiment', title }) => {
    const chartData = useMemo(() => {
        switch (type) {
            case 'sentiment':
                const sentimentCounts = data.reduce((acc, entry) => {
                    acc[entry.sentiment] = (acc[entry.sentiment] || 0) + 1;
                    return acc;
                }, {});

                return {
                    labels: ['Positive', 'Neutral', 'Negative'],
                    datasets: [{
                        data: [
                            sentimentCounts.positive || 0,
                            sentimentCounts.neutral || 0,
                            sentimentCounts.negative || 0
                        ],
                        backgroundColor: [
                            CHART_COLORS.success,
                            CHART_COLORS.warning,
                            CHART_COLORS.danger
                        ]
                    }]
                };

            case 'mediaType':
                const mediaTypeCounts = data.reduce((acc, entry) => {
                    acc[entry.media_type] = (acc[entry.media_type] || 0) + 1;
                    return acc;
                }, {});

                return {
                    labels: Object.keys(mediaTypeCounts),
                    datasets: [{
                        data: Object.values(mediaTypeCounts),
                        backgroundColor: Object.values(CHART_COLORS).slice(0, Object.keys(mediaTypeCounts).length)
                    }]
                };

            case 'trend':
                const dailyCounts = data.reduce((acc, entry) => {
                    const date = entry.entry_date.split('T')[0];
                    acc[date] = (acc[date] || 0) + 1;
                    return acc;
                }, {});

                return {
                    labels: Object.keys(dailyCounts),
                    datasets: [{
                        label: 'Daily Entries',
                        data: Object.values(dailyCounts),
                        borderColor: CHART_COLORS.primary,
                        tension: 0.4,
                        fill: false
                    }]
                };

            default:
                return null;
        }
    }, [data, type]);

    const renderChart = () => {
        switch (type) {
            case 'sentiment':
                return <Pie data={chartData} options={{ responsive: true }} />;
            case 'mediaType':
                return <Pie data={chartData} options={{ responsive: true }} />;
            case 'trend':
                return (
                    <Line 
                        data={chartData}
                        options={{
                            responsive: true,
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1
                                    }
                                }
                            }
                        }}
                    />
                );
            default:
                return null;
        }
    };

    return (
        <Card title={title}>
            <div style={{ height: '300px' }}>
                {renderChart()}
            </div>
        </Card>
    );
};

export default MediaEntryChart;