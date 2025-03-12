import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.ul`
  background: linear-gradient(${({ theme }) => theme.colors.primary}, ${({ theme }) => theme.colors.info});
  color: ${({ theme }) => theme.colors.white};
  width: 14rem;
  padding: ${({ theme }) => theme.spacing.md} 0;
  display: flex;
  flex-direction: column;
`;

const SidebarBrand = styled.div`
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.white};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const SidebarDivider = styled.hr`
  border-color: rgba(255, 255, 255, 0.15);
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

const NavItem = styled.li`
  list-style: none;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  
  &:hover {
    color: ${({ theme }) => theme.colors.white};
    background: rgba(255, 255, 255, 0.1);
  }
  
  i {
    margin-right: ${({ theme }) => theme.spacing.md};
    width: 1.25rem;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Content = styled.div`
  flex: 1;
`;

const Topbar = styled.nav`
  background: ${({ theme }) => theme.colors.white};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  display: flex;
  justify-content: flex-end;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const UserDropdown = styled.div`
  position: relative;
  
  .dropdown-menu {
    position: absolute;
    right: 0;
    top: 100%;
    background: ${({ theme }) => theme.colors.white};
    box-shadow: ${({ theme }) => theme.shadows.md};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    min-width: 10rem;
    padding: ${({ theme }) => theme.spacing.xs} 0;
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
  
  .dropdown-item {
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
    color: ${({ theme }) => theme.colors.gray};
    text-decoration: none;
    display: flex;
    align-items: center;
    
    &:hover {
      background: ${({ theme }) => theme.colors.light};
    }
    
    i {
      margin-right: ${({ theme }) => theme.spacing.sm};
    }
  }
`;

const DashboardLayout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {console.log('User role:', user.role);
console.log('Nav items:', getNavItems());
console.log('User data:', user);
        logout();
        navigate('/login');
    };

    const getNavItems = () => {
        switch (user.role) {
            case 'admin':
                return [
                    { to: '/admin', icon: 'fa-tachometer-alt', text: 'Dashboard' },
                    { to: '/admin/users', icon: 'fa-users', text: 'User Management' },
                    { to: '/admin/analytics', icon: 'fa-chart-line', text: 'Analytics' },
                    { to: '/admin/settings', icon: 'fa-cog', text: 'Settings' }
                ];
            case 'supervisor':
                return [
                    { to: '/supervisor', icon: 'fa-tachometer-alt', text: 'Dashboard' },
                    { to: '/supervisor/reviews', icon: 'fa-clipboard-list', text: 'Reviews' },
                    { to: '/supervisor/analysts', icon: 'fa-users', text: 'My Analysts' }
                ];
            case 'analyst':
                return [
                    { to: '/analyst', icon: 'fa-tachometer-alt', text: 'Dashboard' },
                    { to: '/analyst/entries', icon: 'fa-file-alt', text: 'Data Entry' },
                    { to: '/analyst/submissions', icon: 'fa-clipboard-check', text: 'My Submissions' }
                ];
            default:
                return [
                    { to: '/dashboard', icon: 'fa-tachometer-alt', text: 'Dashboard' },
                    { to: '/dashboard/reports', icon: 'fa-chart-bar', text: 'Reports' }
                ];
        }
    };

    return (
        <Wrapper>
            <Sidebar className="navbar-nav sidebar sidebar-dark accordion">
                <SidebarBrand>
                    <i className="fas fa-chart-line fa-2x mr-3"></i>
                    <span>PR Analytics</span>
                </SidebarBrand>

                <SidebarDivider />

                {getNavItems().map((item, index) => (
                    <NavItem key={index}>
                        <NavLink to={item.to}>
                            <i className={`fas ${item.icon}`}></i>
                            <span>{item.text}</span>
                        </NavLink>
                    </NavItem>
                ))}

                <SidebarDivider className="d-none d-md-block" />
            </Sidebar>

            <ContentWrapper>
                <Content>
                    <Topbar>
                        <UserDropdown>
                            <a className="nav-link dropdown-toggle" href="#" role="button" data-toggle="dropdown">
                                <span className="mr-2 d-none d-lg-inline text-gray-600 small">
                                    {user?.name}
                                </span>
                            </a>
                            <div className="dropdown-menu shadow animated--grow-in">
                                <a className="dropdown-item" href="#" onClick={handleLogout}>
                                    <i className="fas fa-sign-out-alt fa-sm fa-fw text-gray-400"></i>
                                    Logout
                                </a>
                            </div>
                        </UserDropdown>
                    </Topbar>

                    {children}
                </Content>
            </ContentWrapper>
        </Wrapper>
    );
};

export default DashboardLayout;