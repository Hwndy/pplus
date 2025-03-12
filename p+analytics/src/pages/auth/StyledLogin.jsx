import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.md};
`;

const Card = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  overflow: hidden;
  width: 100%;
  max-width: 1000px;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const Column = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    flex: 0 0 100%;
  }
`;

const LoginImage = styled.div`
  background-image: url('/assets/img/login-bg.jpg');
  background-position: center;
  background-size: cover;
  min-height: 400px;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    display: none;
  }
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSize.h4};
  color: ${({ theme }) => theme.colors.dark};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const Form = styled.form`
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Input = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.gray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  
  &:focus {
    border-color: ${({ theme }) => theme.colors.primary};
    outline: none;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Button = styled.button`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.typography.fontSize.base};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary}cc;
  }
`;

const Divider = styled.hr`
  margin: ${({ theme }) => theme.spacing.lg} 0;
  border-color: ${({ theme }) => theme.colors.gray}33;
`;

const LinkText = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  
  &:hover {
    text-decoration: underline;
  }
`;

const LinkContainer = styled.div`
  text-align: center;
  margin-top: ${({ theme }) => theme.spacing.sm};
`;

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        // Add login logic here
        navigate('/');
    };

    return (
        <Container>
            <Card>
                <Row>
                    <Column>
                        <LoginImage />
                    </Column>
                    <Column>
                        <Title>Welcome Back!</Title>
                        <Form onSubmit={handleSubmit}>
                            <FormGroup>
                                <Input
                                    type="email"
                                    placeholder="Enter Email Address..."
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({
                                        ...credentials,
                                        email: e.target.value
                                    })}
                                />
                            </FormGroup>
                            <FormGroup>
                                <Input
                                    type="password"
                                    placeholder="Password"
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({
                                        ...credentials,
                                        password: e.target.value
                                    })}
                                />
                            </FormGroup>
                            <CheckboxGroup>
                                <input type="checkbox" id="remember" />
                                <label htmlFor="remember">Remember Me</label>
                            </CheckboxGroup>
                            <Button type="submit">Login</Button>
                        </Form>
                        <Divider />
                        <LinkContainer>
                            <LinkText to="/forgot-password">Forgot Password?</LinkText>
                        </LinkContainer>
                        <LinkContainer>
                            <LinkText to="/register">Create an Account!</LinkText>
                        </LinkContainer>
                    </Column>
                </Row>
            </Card>
        </Container>
    );
};

export default Login;