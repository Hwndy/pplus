import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/layout/Sidebar';
import UserManagement from './UserManagement';
import UserForm from './UserForm';

const DashboardContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.light};
`;

const ContentWrapper = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.md};
  overflow-x: hidden;
`;

const AdminDashboard = () => {
    return (
        <DashboardContainer>
            <Sidebar />
            <ContentWrapper>
                <Routes>
                    <Route path="/" element={<UserManagement />} />
                    <Route path="/users/create" element={<UserForm />} />
                    <Route path="/users/edit/:id" element={<UserForm />} />
                </Routes>
            </ContentWrapper>
        </DashboardContainer>
    );
};

export default AdminDashboard;