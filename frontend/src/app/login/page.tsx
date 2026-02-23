"use client";
import React, { useState } from 'react';
import { Container, Typography, TextField, Button, Box, Paper, Alert, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

export default function LoginPage() {
    const router = useRouter();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password Reset State
    const [resetOpen, setResetOpen] = useState(false);
    const [resetData, setResetData] = useState({ email: '', reason: '' });
    const [resetStatus, setResetStatus] = useState({ loading: false, error: '', success: '' });

    // CAPTCHA State
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const handleResetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setResetData({ ...resetData, [e.target.name]: e.target.value });
    };

    const handleResetSubmit = async () => {
        setResetStatus({ loading: true, error: '', success: '' });
        try {
            await axios.post((process.env.NEXT_PUBLIC_API_URL || '') + '/api/auth/password-reset', resetData);
            setResetStatus({ loading: false, error: '', success: 'Password reset request submitted successfully. Contact Admin.' });
            setTimeout(() => setResetOpen(false), 3000);
        } catch (err: any) {
            setResetStatus({ loading: false, error: err.response?.data?.message || 'Failed to submit request', success: '' });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!captchaToken) {
            setError('Please complete the CAPTCHA verification');
            return;
        }

        setLoading(true);

        try {
            const res = await axios.post((process.env.NEXT_PUBLIC_API_URL || '') + '/api/auth/login', { ...credentials, captcha: captchaToken });
            const { token, role, _id, name, email } = res.data;

            // Store token and user info
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ _id, name, email, role }));

            // Redirect based on role
            if (role === 'Organizer') {
                router.push('/organizer/dashboard');
            } else if (role === 'Admin') {
                router.push('/admin/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="sm" sx={{ mt: 8 }}>
                <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold">Login</Typography>
                    <Typography color="text.secondary" sx={{ mb: 3 }}>
                        Welcome back to CampusEvents
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Email Address"
                            name="email"
                            fullWidth
                            margin="normal"
                            required
                            type="email"
                            value={credentials.email}
                            onChange={handleChange}
                        />
                        <TextField
                            label="Password"
                            name="password"
                            fullWidth
                            margin="normal"
                            required
                            type="password"
                            value={credentials.password}
                            onChange={handleChange}
                        />

                        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                            <ReCAPTCHA
                                sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                onChange={(token) => setCaptchaToken(token)}
                            />
                        </Box>

                        <Button
                            variant="contained"
                            fullWidth
                            size="large"
                            type="submit"
                            disabled={loading || !captchaToken}
                            sx={{ mt: 3, mb: 2 }}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </Button>
                    </form>

                    <Button color="primary" onClick={() => router.push('/register')}>
                        Don't have an account? Sign Up
                    </Button>
                    <Box mt={1}>
                        <Button color="secondary" onClick={() => setResetOpen(true)}>
                            Organizer Forgot Password?
                        </Button>
                    </Box>
                </Paper>
            </Container>

            {/* Password Reset Dialog for Organizers */}
            <Dialog open={resetOpen} onClose={() => setResetOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Organizer Password Reset Request</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                        Submit a request to the Admin to reset your password. The Admin will review and provide a new password.
                    </Typography>
                    {resetStatus.error && <Alert severity="error" sx={{ mb: 2 }}>{resetStatus.error}</Alert>}
                    {resetStatus.success && <Alert severity="success" sx={{ mb: 2 }}>{resetStatus.success}</Alert>}

                    <TextField
                        autoFocus
                        margin="dense"
                        name="email"
                        label="Organizer Email Address"
                        type="email"
                        fullWidth
                        variant="outlined"
                        value={resetData.email}
                        onChange={handleResetChange}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        name="reason"
                        label="Reason for Reset"
                        type="text"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={resetData.reason}
                        onChange={handleResetChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setResetOpen(false)} color="inherit">Cancel</Button>
                    <Button onClick={handleResetSubmit} variant="contained" disabled={resetStatus.loading || !resetData.email || !resetData.reason}>
                        {resetStatus.loading ? 'Submitting...' : 'Submit Request'}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
