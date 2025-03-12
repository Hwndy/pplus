import React, { useState } from 'react';
import Card from '../../components/common/Card';
import Table from '../../components/common/Table';
import Modal from '../../components/common/Modal';

const AnalystDashboard = () => {
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
    const [entryType, setEntryType] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        mediaType: '',
        source: '',
        date: '',
        reach: '',
        sentiment: 'neutral',
        attachments: []
    });

    const columns = [
        { field: 'title', header: 'Title' },
        { field: 'mediaType', header: 'Media Type' },
        { field: 'submissionDate', header: 'Submitted On' },
        { field: 'status', header: 'Status' },
        { field: 'supervisorComment', header: 'Supervisor Comment' }
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add submission logic here
        setIsEntryModalOpen(false);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: [...prev.attachments, ...files]
        }));
    };

    return (
        <div className="container-fluid">
            <div className="d-sm-flex align-items-center justify-content-between mb-4">
                <h1 className="h3 mb-0 text-gray-800">Data Entry Dashboard</h1>
                <button 
                    className="btn btn-primary"
                    onClick={() => setIsEntryModalOpen(true)}
                >
                    New Entry
                </button>
            </div>

            <div className="row">
                <div className="col-xl-4 col-md-6 mb-4">
                    <Card className="border-left-primary h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                        Total Entries
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">45</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-database fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-xl-4 col-md-6 mb-4">
                    <Card className="border-left-success h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-success text-uppercase mb-1">
                                        Approved Entries
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">32</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-check-circle fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="col-xl-4 col-md-6 mb-4">
                    <Card className="border-left-warning h-100">
                        <div className="card-body">
                            <div className="row no-gutters align-items-center">
                                <div className="col mr-2">
                                    <div className="text-xs font-weight-bold text-warning text-uppercase mb-1">
                                        Pending Review
                                    </div>
                                    <div className="h5 mb-0 font-weight-bold text-gray-800">13</div>
                                </div>
                                <div className="col-auto">
                                    <i className="fas fa-clock fa-2x text-gray-300"></i>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <Card title="Recent Entries">
                <Table 
                    columns={columns}
                    data={[]} // Add your entries data here
                />
            </Card>

            <Modal
                isOpen={isEntryModalOpen}
                onClose={() => setIsEntryModalOpen(false)}
                title="New Data Entry"
                size="lg"
            >
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Media Type</label>
                        <select
                            className="form-control"
                            value={formData.mediaType}
                            onChange={(e) => setFormData({...formData, mediaType: e.target.value})}
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="news">News Article</option>
                            <option value="social">Social Media</option>
                            <option value="press">Press Release</option>
                            <option value="blog">Blog Post</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea
                            className="form-control"
                            rows="4"
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <div className="form-group col-md-6">
                            <label>Source</label>
                            <input
                                type="text"
                                className="form-control"
                                value={formData.source}
                                onChange={(e) => setFormData({...formData, source: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group col-md-6">
                            <label>Date</label>
                            <input
                                type="date"
                                className="form-control"
                                value={formData.date}
                                onChange={(e) => setFormData({...formData, date: e.target.value})}
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Attachments</label>
                        <input
                            type="file"
                            className="form-control-file"
                            multiple
                            onChange={handleFileUpload}
                        />
                    </div>
                    <div className="form-group">
                        <label>Sentiment</label>
                        <select
                            className="form-control"
                            value={formData.sentiment}
                            onChange={(e) => setFormData({...formData, sentiment: e.target.value})}
                        >
                            <option value="positive">Positive</option>
                            <option value="neutral">Neutral</option>
                            <option value="negative">Negative</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary">
                        Submit for Review
                    </button>
                </form>
            </Modal>
        </div>
    );
};

export default AnalystDashboard;