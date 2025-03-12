import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';

const MediaReview = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { handleRequest, loading } = useApi();
    const { addNotification } = useNotification();
    const [entry, setEntry] = useState(null);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadEntry();
    }, [id]);

    const loadEntry = async () => {
        try {
            const data = await handleRequest(() => fetch(`/api/media-entries/${id}`));
            if (!data) {
                addNotification('Entry not found', 'error');
                navigate('/supervisor');
                return;
            }
            setEntry(data);
        } catch (error) {
            addNotification('Error loading entry', 'error');
            navigate('/supervisor');
        }
    };

    const handleApprove = async () => {
        if (isSubmitting) return;
        
        try {
            setIsSubmitting(true);
            await handleRequest(() => 
                fetch(`/api/media-entries/${id}/approve`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comment })
                })
            );
            addNotification('Entry approved successfully', 'success');
            navigate('/supervisor');
        } catch (error) {
            addNotification('Error approving entry', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReject = async () => {
        if (isSubmitting) return;

        if (!comment.trim()) {
            addNotification('Please provide a reason for rejection', 'warning');
            return;
        }

        try {
            setIsSubmitting(true);
            await handleRequest(() => 
                fetch(`/api/media-entries/${id}/reject`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comment })
                })
            );
            addNotification('Entry rejected successfully', 'success');
            navigate('/supervisor');
        } catch (error) {
            addNotification('Error rejecting entry', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading && !entry) {
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

    if (!entry) return null;

    return (
        <div className="container-fluid py-4">
            <Card title="Review Media Entry">
                <div className="row">
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <p className="form-control-static">{entry.title}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Publication</label>
                            <p className="form-control-static">{entry.publication}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Media Type</label>
                            <p className="form-control-static">{entry.media_type}</p>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="mb-3">
                            <label className="form-label">Date</label>
                            <p className="form-control-static">{entry.date}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Brand</label>
                            <p className="form-control-static">{entry.brand}</p>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Sentiment</label>
                            <p className="form-control-static">{entry.sentiment}</p>
                        </div>
                    </div>
                </div>

                <div className="mb-3">
                    <label className="form-label">Content</label>
                    <p className="form-control-static">{entry.content}</p>
                </div>

                {entry.page_link && (
                    <div className="mb-3">
                        <label className="form-label">Page Link</label>
                        <a href={entry.page_link} target="_blank" rel="noopener noreferrer" className="d-block">
                            {entry.page_link}
                        </a>
                    </div>
                )}

                <div className="mb-4">
                    <label className="form-label">Comment</label>
                    <textarea
                        className="form-control"
                        rows="3"
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add your review comments here..."
                        disabled={isSubmitting}
                    />
                </div>

                <div className="d-flex justify-content-end gap-2">
                    <button 
                        className="btn btn-light" 
                        onClick={() => navigate('/supervisor')}
                        disabled={isSubmitting}
                    >
                        Back
                    </button>
                    <button 
                        className="btn btn-danger" 
                        onClick={handleReject}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button 
                        className="btn btn-success" 
                        onClick={handleApprove}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Approving...' : 'Approve'}
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default MediaReview;