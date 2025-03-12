import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { useNotification } from '../../context/NotificationContext';
import DataTable from '../../components/common/DataTable';
import DeleteConfirmation from '../../components/common/DeleteConfirmation';

const UserManagement = () => {
    const navigate = useNavigate();
    const { handleRequest } = useApi();
    const { addNotification } = useNotification();
    const [users, setUsers] = useState([]);
    const [deleteUser, setDeleteUser] = useState(null);
    const [filters, setFilters] = useState({
        gender: '',
        role: '',
        sortDirection: ''
    });

    useEffect(() => {
        loadUsers();
    }, [filters]);

    const loadUsers = async () => {
        try {
            const data = await handleRequest(() => fetch('/api/users'));
            setUsers(data);
        } catch (error) {
            addNotification('Error loading users', 'error');
        }
    };

    const handleDelete = async () => {
        if (!deleteUser) return;

        try {
            await handleRequest(() => 
                fetch(`/api/users/${deleteUser.id}`, { method: 'DELETE' })
            );
            addNotification('User deleted successfully', 'success');
            setDeleteUser(null);
            loadUsers();
        } catch (error) {
            addNotification('Error deleting user', 'error');
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
        { field: 'role', header: 'Role' },
        {
            field: 'actions',
            header: 'Action',
            render: (row) => (
                <div className="d-flex">
                    <button
                        className="btn btn-link"
                        onClick={() => navigate(`/admin/users/edit/${row.id}`)}
                    >
                        <i className="fas fa-edit"></i>
                    </button>
                    <button
                        className="btn btn-link text-danger"
                        onClick={() => setDeleteUser(row)}
                    >
                        <i className="fas fa-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="container-fluid py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1 className="h3">Users</h1>
                <div className="d-flex gap-3">
                    <button 
                        className="btn btn-primary"
                        onClick={() => navigate('/admin/users/create')}
                    >
                        Create
                    </button>
                    <button className="btn btn-outline-primary">
                        Export
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-body">
                    <div className="d-flex justify-content-between mb-3">
                        <input
                            type="text"
                            className="form-control w-25"
                            placeholder="Search..."
                        />
                        <div className="d-flex gap-3">
                            <select 
                                className="form-select"
                                value={filters.gender}
                                onChange={(e) => setFilters({...filters, gender: e.target.value})}
                            >
                                <option value="">All Gender</option>
                                <option value="Female">Female</option>
                                <option value="Male">Male</option>
                            </select>
                            <select 
                                className="form-select"
                                value={filters.role}
                                onChange={(e) => setFilters({...filters, role: e.target.value})}
                            >
                                <option value="">All Roles</option>
                                <option value="Admin">Admin</option>
                                <option value="Supervisor">Supervisor</option>
                                <option value="Analyst">Analyst</option>
                                <option value="Company">Company</option>
                            </select>
                        </div>
                    </div>

                    <DataTable
                        data={users}
                        columns={columns}
                        sortable
                        pagination
                    />
                </div>
            </div>

            <DeleteConfirmation
                show={!!deleteUser}
                onClose={() => setDeleteUser(null)}
                onConfirm={handleDelete}
                title="Delete User"
                message={`Are you sure you want to delete ${deleteUser?.user_name}?`}
            />
        </div>
    );
};

export default UserManagement;