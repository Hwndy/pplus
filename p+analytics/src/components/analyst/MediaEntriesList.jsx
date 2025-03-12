import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import DataTable from '../common/DataTable';
import { formatDate, formatNumber } from '../../utils/formatters';

const MediaEntriesList = () => {
    const { handleRequest, loading } = useApi();
    const [entries, setEntries] = useState([]);

    const columns = [
        { field: 'entry_date', header: 'Date', type: 'date' },
        { field: 'brand', header: 'Brand' },
        { field: 'publication', header: 'Publication' },
        { field: 'title', header: 'Title' },
        { field: 'media_type', header: 'Media Type' },
        { field: 'sentiment', header: 'Sentiment' },
        {
            field: 'actions',
            header: 'Actions',
            render: (row) => (
                <div className="btn-group">
                    <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleEdit(row.id)}
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(row.id)}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    useEffect(() => {
        loadEntries();
    }, []);

    const loadEntries = async () => {
        try {
            const data = await handleRequest(() => fetch('/api/media-entries'));
            setEntries(data);
        } catch (error) {
            console.error('Error loading entries:', error);
        }
    };

    const handleEdit = (id) => {
        // Implement edit functionality
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this entry?')) {
            try {
                await handleRequest(() => 
                    fetch(`/api/media-entries/${id}`, { method: 'DELETE' })
                );
                loadEntries();
            } catch (error) {
                console.error('Error deleting entry:', error);
            }
        }
    };

    return (
        <div className="card shadow mb-4">
            <div className="card-header py-3 d-flex justify-content-between align-items-center">
                <h6 className="m-0 font-weight-bold text-primary">Media Entries</h6>
            </div>
            <div className="card-body">
                <DataTable
                    columns={columns}
                    data={entries}
                    loading={loading}
                    searchable
                    sortable
                    exportable
                />
            </div>
        </div>
    );
};

export default MediaEntriesList;