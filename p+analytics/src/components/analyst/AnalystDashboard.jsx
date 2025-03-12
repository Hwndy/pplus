import React, { useState } from 'react';
import MediaEntryForm from './MediaEntryForm';
import MediaEntriesList from './MediaEntriesList';
import { Card } from '../common/Card';
import { DateRangePicker } from '../common/DateRangePicker';
import { useApi } from '../../hooks/useApi';

const AnalystDashboard = () => {
    const [view, setView] = useState('list'); // 'list' or 'form'
    const [dateRange, setDateRange] = useState({
        startDate: new Date().setDate(1),
        endDate: new Date()
    });
    const { handleRequest, loading } = useApi();

    const handleDateChange = (newRange) => {
        setDateRange(newRange);
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Media Analysis Dashboard</h1>
                <button
                    className="btn btn-primary"
                    onClick={() => setView(view === 'list' ? 'form' : 'list')}
                >
                    {view === 'list' ? 'Add New Entry' : 'View Entries'}
                </button>
            </div>

            {view === 'list' && (
                <>
                    <div className="row">
                        <div className="col-12 mb-4">
                            <Card>
                                <DateRangePicker onDateChange={handleDateChange} />
                            </Card>
                        </div>
                    </div>
                    <MediaEntriesList dateRange={dateRange} />
                </>
            )}

            {view === 'form' && (
                <div className="row">
                    <div className="col-12">
                        <Card title="New Media Entry">
                            <MediaEntryForm 
                                onSuccess={() => setView('list')}
                            />
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalystDashboard;