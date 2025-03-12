import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import { Card } from '../../components/common/Card';
import FormField from '../../components/common/FormField';

const UserForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const { handleRequest, loading } = useApi();
    const { addNotification } = useNotification();
    const [avatar, setAvatar] = useState(null);
    const [previewUrl, setPreviewUrl] = useState('');

    const [formData, setFormData] = useState({
        user_id: '',
        user_name: '',
        email_id: '',
        gender: 'Female',
        role: '',
        date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        if (id) {
            loadUser();
        }
    }, [id]);

    const loadUser = async () => {
        try {
            const data = await handleRequest(() => fetch(`/api/users/${id}`));
            setFormData(data);
            if (data.avatar) {
                setPreviewUrl(data.avatar);
            }
        } catch (error) {
            addNotification('Error loading user', 'error');
            navigate('/admin');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const formPayload = new FormData();
            Object.keys(formData).forEach(key => {
                formPayload.append(key, formData[key]);
            });
            if (avatar) {
                formPayload.append('avatar', avatar);
            }

            await handleRequest(() => 
                fetch(`/api/users${id ? `/${id}` : ''}`, {
                    method: id ? 'PUT' : 'POST',
                    body: formPayload
                })
            );

            addNotification(
                `User ${id ? 'updated' : 'created'} successfully`, 
                'success'
            );
            navigate('/admin');
        } catch (error) {
            addNotification(`Error ${id ? 'updating' : 'creating'} user`, 'error');
        }
    };

    return (
        <div className="container-fluid py-4">
            <Card title={id ? 'Edit User' : 'Create User'}>
                <form onSubmit={handleSubmit}>
                    <div className="row">
                        <div className="col-md-4 text-center mb-4">
                            <div className="avatar-upload">
                                <img
                                    src={previewUrl || '/default-avatar.png'}
                                    alt="User Avatar"
                                    className="rounded-circle mb-3"
                                    style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                />
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleAvatarChange}
                                    className="d-none"
                                    id="avatarInput"
                                />
                                <label 
                                    htmlFor="avatarInput" 
                                    className="btn btn-outline-primary btn-sm"
                                >
                                    Change Photo
                                </label>
                            </div>
                        </div>

                        <div className="col-md-8">
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <FormField
                                        label="User ID"
                                        name="user_id"
                                        value={formData.user_id}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <FormField
                                        label="User Name"
                                        name="user_name"
                                        value={formData.user_name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <FormField
                                        type="email"
                                        label="Email ID"
                                        name="email_id"
                                        value={formData.email_id}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <FormField
                                        type="select"
                                        label="Role"
                                        name="role"
                                        value={formData.role}
                                        onChange={handleChange}
                                        options={[
                                            { value: 'admin', label: 'Admin' },
                                            { value: 'supervisor', label: 'Supervisor' },
                                            { value: 'analyst', label: 'Analyst' },
                                            { value: 'company', label: 'Company' }
                                        ]}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Gender</label>
                                    <div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="gender"
                                                value="Female"
                                                checked={formData.gender === 'Female'}
                                                onChange={handleChange}
                                                id="female"
                                            />
                                            <label className="form-check-label" htmlFor="female">
                                                Female
                                            </label>
                                        </div>
                                        <div className="form-check form-check-inline">
                                            <input
                                                type="radio"
                                                className="form-check-input"
                                                name="gender"
                                                value="Male"
                                                checked={formData.gender === 'Male'}
                                                onChange={handleChange}
                                                id="male"
                                            />
                                            <label className="form-check-label" htmlFor="male">
                                                Male
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 mb-3">
                                    <FormField
                                        type="date"
                                        label="Date"
                                        name="date"
                                        value={formData.date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <button
                            type="button"
                            className="btn btn-light"
                            onClick={() => navigate('/admin')}
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default UserForm;