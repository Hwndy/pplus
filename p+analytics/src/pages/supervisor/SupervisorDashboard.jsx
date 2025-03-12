import React from 'react';
import { Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import Sidebar from '../../components/layout/Sidebar';
import MediaApproval from './MediaApproval';
import MediaReview from './MediaReview';

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

const SupervisorDashboard = () => {
    return (
        <DashboardContainer>
            <Sidebar />
            <ContentWrapper>
                <Routes>
                    <Route path="/" element={<MediaApproval />} />
                    <Route path="/review/:id" element={<MediaReview />} />
                </Routes>
            </ContentWrapper>
        </DashboardContainer>
    );
};

export default SupervisorDashboard;