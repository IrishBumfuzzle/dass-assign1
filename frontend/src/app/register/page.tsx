"use client";
import React, { useState } from 'react';
import {
    Container, Typography, TextField, Button, Box, Paper, Alert,
    FormControl, InputLabel, Select, MenuItem, Grid
} from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import ReCAPTCHA from 'react-google-recaptcha';

export default function RegisterPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '',
        contactNumber: '', collegeOrOrgName: '', type: 'IIIT'
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState<string | null>(null);

    const handleChange = (e: any) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!captchaToken) {
            setError('Please complete the CAPTCHA verification');
            return;
        }

        setLoading(true);

        const iiitEmailRegex = /@(research\.iiit\.ac\.in|students\.iiit\.ac\.in|iiit\.ac\.in)$/;
        if (formData.type === 'IIIT' && !iiitEmailRegex.test(formData.email)) {
            setError('IIIT users must use a valid IIIT email (students.iiit.ac.in, research.iiit.ac.in, or iiit.ac.in).');
            setLoading(false);
            return;
        }

        try {
            const res = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/auth/register', {
                ...formData,
                captcha: captchaToken,
                interests: [] // Can be added later in onboarding
            });

            const { token, role, _id, name, email } = res.data;

            // Store token and user info
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify({ _id, name, email, role }));

            router.push('/onboarding');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center">
                        Create Account
                    </Typography>
                    <Typography color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                        Join Felicity Event Manager to participate in amazing events!
                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="First Name" name="firstName" fullWidth required onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Last Name" name="lastName" fullWidth required onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12}>
                                <TextField label="Email Address" name="email" type="email" fullWidth required onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Password" name="password" type="password" fullWidth required onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField label="Contact Number" name="contactNumber" fullWidth required onChange={handleChange} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select
                                        label="Type"
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                    >
                                        <MenuItem value="IIIT">IIIT Student/Faculty</MenuItem>
                                        <MenuItem value="Non-IIIT">Non-IIIT / External</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12}>
                                <TextField label="College / Organization Name" name="collegeOrOrgName" fullWidth required onChange={handleChange} />
                            </Grid>

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                <ReCAPTCHA
                                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
                                    onChange={(token) => setCaptchaToken(token)}
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Button
                                    variant="contained"
                                    fullWidth
                                    size="large"
                                    type="submit"
                                    disabled={loading || !captchaToken}
                                    sx={{ mt: 2 }}
                                >
                                    {loading ? 'Creating Account...' : 'Register'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>

                    <Box textAlign="center" sx={{ mt: 2 }}>
                        <Button color="primary" onClick={() => router.push('/login')}>
                            Already have an account? Login
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </React.Fragment>
    );
}
