import React from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { CHART_COLORS } from '../../config/constants';
import Card from '../common/Card';

export const EngagementChart = ({ data }) => {
    const chartData = {
        labels: data?.labels || [],
        datasets: [{
            label: 'Engagement Rate',
            data: data?.values || [],
            fill: false,
            borderColor: CHART_COLORS.primary,
            tension: 0.4
        }]
    };

    return (
        <Card title="Engagement Trends">
            <Line 
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }}
                height={300}
            />
        </Card>
    );
};

export const MediaDistributionChart = ({ data }) => {
    const chartData = {
        labels: data?.labels || [],
        datasets: [{
            data: data?.values || [],
            backgroundColor: Object.values(CHART_COLORS)
        }]
    };

    return (
        <Card title="Media Distribution">
            <Doughnut 
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false
                }}
                height={300}
            />
        </Card>
    );
};

export const SentimentAnalysisChart = ({ data }) => {
    const chartData = {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            data: data || [0, 0, 0],
            backgroundColor: [
                CHART_COLORS.success,
                CHART_COLORS.warning,
                CHART_COLORS.danger
            ]
        }]
    };

    return (
        <Card title="Sentiment Analysis">
            <Pie 
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false
                }}
                height={300}
            />
        </Card>
    );
};

export const MetricsChart = ({ data }) => {
    const chartData = {
        labels: data?.labels || [],
        datasets: [{
            label: 'Metrics Overview',
            data: data?.values || [],
            backgroundColor: CHART_COLORS.info
        }]
    };

    return (
        <Card title="Key Metrics">
            <Bar 
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }}
                height={300}
            />
        </Card>
    );
};