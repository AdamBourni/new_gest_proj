

import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loginSuccess, setLoginSuccess] = useState(false); // Move this inside the component
    const navigate = useNavigate();

    useEffect(() => {
        if (loginSuccess) {
            const role = localStorage.getItem('userRole');
            // Redirect the user to the appropriate page based on their role
            switch (role) {
                case 'team_lead':
                    navigate('/demande');
                    break;
                case 'developer':
                    navigate('/reponse');
                    break;
                case 'admin':
                    navigate('/check-collection');
                    break;
                case 'amoa':
                    navigate('/Check-MOA');
                    break;
                default:
                    navigate('/'); // Default redirect if the role is not recognized
            }
        }
    }, [loginSuccess, navigate]);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const response = await axios.patch(`${apiUrl}api/auth/login`, values);
            const { token, role } = response.data;

            localStorage.setItem('authToken', token);
            localStorage.setItem('userRole', role);

            message.success('Login successful!');
            setLoading(false);
            setLoginSuccess(true); // Set login success state to trigger the useEffect hook
        } catch (error) {
            if (error.response) {
                message.error(error.response.data.message);
            } else {
                message.error('Login failed. Please try again later.');
            }
            setLoading(false);
        }
    };
    return (
        <Form form={form} onFinish={onFinish} layout="vertical">
            <Form.Item
                name="email"
                label="Email"
                rules={[{ required: true, message: 'Please input your email!' }]}
            >
                <Input placeholder="Enter your email" />
            </Form.Item>
            <Form.Item
                name="password"
                label="Password"
                rules={[{ required: true, message: 'Please input your password!' }]}
            >
                <Input.Password placeholder="Enter your password" />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                    Log In
                </Button>
            </Form.Item>
        </Form>
    );
};

export default LoginForm;
