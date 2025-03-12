import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import DataTable from '../../components/common/DataTable';
import { Bar, Line } from 'react-chartjs-2';

const MediaApproval = () => {
    const navigate = useNavigate();
    const { handleRequest } = useApi();
    const { addNotification } = useNotification();
    const [entries, setEntries] = useState([]);
    const [analytics, setAnalytics] = useState({
        partnershipData: [],
        monthlyTrends: []
    });

    useEffect(() => {
        loadEntries();
        loadAnalytics();
    }, []);

    const loadEntries = async () => {
        try {
            const data = await handleRequest(() => fetch('/api/media-entries/pending'));
            setEntries(data);
        } catch (error) {
            addNotification('Error loading entries', 'error');
        }
    };

    const loadAnalytics = async () => {
        try {
            const data = await handleRequest(() => fetch('/api/analytics/supervisor'));
            setAnalytics(data);
        } catch (error) {
            addNotification('Error loading analytics', 'error');
        }
    };

    const handleApprove = async (id) => {
        try {
            await handleRequest(() => 
                fetch(`/api/media-entries/${id}/approve`, { method: 'POST' })
            );
            addNotification('Entry approved successfully', 'success');
            loadEntries();
            loadAnalytics();
        } catch (error) {
            addNotification('Error approving entry', 'error');
        }
    };

    const handleReject = async (id) => {
        try {
            await handleRequest(() => 
                fetch(`/api/media-entries/${id}/reject`, { method: 'POST' })
            );
            addNotification('Entry rejected successfully', 'success');
            loadEntries();
            loadAnalytics();
        } catch (error) {
            addNotification('Error rejecting entry', 'error');
        }
    };

    const columns = [
        { field: 'user_id', header: 'User Id' },
        {
            field: 'user_name',
            header: 'User Name',
            render: (row) => (
                <div className="d-flex align-items-center">
                    <img
                        src={row.avatar || '/default-avatar.png'}
                        alt={row.user_name}
                        className="rounded-circle mr-2"
                        style={{ width: '30px', height: '30px' }}
                    />
                    {row.user_name}
                </div>
            )
        },
        { field: 'date', header: 'Date' },
        { field: 'gender', header: 'Gender' },
        { field: 'email_id', header: 'Email ID' },
        {
            field: 'actions',
            header: 'Action',
            render: (row) => (
                <div className="d-flex gap-2">
                    <button
                        className="btn btn-link"
                        onClick={() => navigate(`/supervisor/review/${row.id}`)}
                    >
                        <i className="fas fa-eye"></i>
                    </button>
                    <button
                        className="btn btn-link text-success"
                        onClick={() => handleApprove(row.id)}
                    >
                        <i className="fas fa-check"></i>
                    </button>
                    <button
                        className="btn btn-link text-danger"
                        onClick={() => handleReject(row.id)}
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="container-fluid py-4">
            <div className="row mb-4">
                <div className="col-12">
                    <Card>
                        <DataTable
                            data={entries}
                            columns={columns}
                            sortable
                            pagination
                        />
                    </Card>
                </div>
            </div>

            <div className="row">
                <div className="col-md-6 mb-4">
                    <Card title="Media Prominence on Partnership">
                        <Bar
                            data={{
                                labels: analytics.partnershipData.map(item => item.name),
                                datasets: [{
                                    label: 'Partnership Coverage',
                                    data: analytics.partnershipData.map(item => item.count),
                                    backgroundColor: '#36b9cc'
                                }]
                            }}
                            options={{
                                indexAxis: 'y',
                                scales: {
                                    x: { beginAtZero: true }
                                }
                            }}
                        />
                    </Card>
                </div>

                <div className="col-md-6 mb-4">
                    <Card title="Monthly Trend on Brand Media Exposure">
                        <Line
                            data={{
                                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                                datasets: [
                                    {
                                        label: 'Online Media',
                                        data: analytics.monthlyTrends.map(item => item.online),
                                        borderColor: '#4e73df',
                                        tension: 0.4
                                    },
                                    {
                                        label: 'Print Media',
                                        data: analytics.monthlyTrends.map(item => item.print),
                                        borderColor: '#1cc88a',
                                        tension: 0.4
                                    }
                                ]
                            }}
                            options={{
                                scales: {
                                    y: { beginAtZero: true }
                                }
                            }}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default MediaApproval;