"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Button, Chip, Divider,
    TextField, MenuItem, Alert, CircularProgress,
    FormControl,
    InputLabel,
    Select
} from '@mui/material';
import Navbar from '../../../components/layout/Navbar';
import axios from 'axios';
import { Event } from '../../../types';
import { useParams, useRouter } from 'next/navigation';

export default function EventDetailsPage() {
    const params = useParams(); 
    const router = useRouter();
    const id = params?.id as string; 

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [registering, setRegistering] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    
    const [teamMode, setTeamMode] = useState<'create' | 'join'>('create');
    const [teamName, setTeamName] = useState('');
    const [inviteCode, setInviteCode] = useState('');

    
    const [formData, setFormData] = useState<Record<string, string>>({});
    const [merchSelection, setMerchSelection] = useState({ size: '', color: '' });
    const [paymentProofBase64, setPaymentProofBase64] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;

        const fetchEvent = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events/${id}`);
                setEvent(res.data);
            } catch (err) {
                setError("Failed to load event details.");
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [id]);

    const handleRegister = async () => {
        setError(null);
        setSuccess(null);
        setRegistering(true);

        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try {
            if (event?.eventType === 'Normal' && event?.isTeamEvent) {
                if (teamMode === 'create') {
                    await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/teams/create', {
                        eventId: event._id,
                        teamName: teamName
                    }, { headers: { Authorization: `Bearer ${token}` } });
                } else {
                    await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/teams/join', {
                        inviteCode: inviteCode
                    }, { headers: { Authorization: `Bearer ${token}` } });
                }
            } else {
                if (event?.eventType === 'Merchandise' && !paymentProofBase64) {
                    setError("Payment proof is required for merchandise events.");
                    setRegistering(false);
                    return;
                }

                await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/tickets', {
                    eventId: event?._id,
                    formData: formData,
                    merchandiseSelection: event?.eventType === 'Merchandise' ? merchSelection : undefined,
                    paymentProofUrl: paymentProofBase64
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            setSuccess("Successfully registered!");
            setTimeout(() => router.push('/dashboard'), 2000); 
        } catch (err: any) {
            setError(err.response?.data?.message || "Registration failed.");
        } finally {
            setRegistering(false);
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    if (!event) return <Box sx={{ p: 4, textAlign: 'center' }}>Event not found.</Box>;

    const isMerch = event.eventType === 'Merchandise';
    const isOutOfStock = isMerch && (event.merchandiseDetails?.stock || 0) <= 0;
    const isDeadlinePassed = new Date(event.deadline) < new Date();

    return (
        <React.Fragment>
            <Navbar />
            <Box sx={{ bgcolor: '#fff', minHeight: '100vh', pb: 8 }}>
                {}
                <Box sx={{
                    bgcolor: '#1e293b',
                    color: 'white',
                    py: 8,
                    textAlign: 'center',
                    background: isMerch
                        ? 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://source.unsplash.com/random/1600x900/?fashion)'
                        : 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.7)), url(https://source.unsplash.com/random/1600x900/?event)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}>
                    <Container maxWidth="md">
                        <Chip label={event.eventType} color="secondary" sx={{ mb: 2 }} />
                        <Typography variant="h2" fontWeight="bold" gutterBottom>{event.name}</Typography>
                        <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Organized by {event.organizerId?.organizerName || 'Unknown'}
                        </Typography>
                    </Container>
                </Box>

                <Container maxWidth="md" sx={{ mt: -4 }}>
                    <Box sx={{ bgcolor: 'white', borderRadius: 2, boxShadow: 3, p: 4 }}>
                        {}
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={8}>
                                <Typography variant="h5" gutterBottom fontWeight="bold">Description</Typography>
                                <Typography paragraph color="text.secondary">{event.description}</Typography>

                                <Divider sx={{ my: 3 }} />

                                <Typography variant="h6" gutterBottom>Event Details</Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Start Date</Typography>
                                        <Typography>{new Date(event.startDate).toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">End Date</Typography>
                                        <Typography>{new Date(event.endDate).toLocaleString()}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Fee</Typography>
                                        <Typography>{event.fee > 0 ? `$${event.fee}` : 'Free'}</Typography>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="subtitle2" color="text.secondary">Deadline</Typography>
                                        <Typography color={isDeadlinePassed ? 'error' : 'inherit'}>
                                            {new Date(event.deadline).toLocaleDateString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </Grid>

                            {}
                            <Grid item xs={12} md={4}>
                                <Box sx={{ bgcolor: '#f9fafb', p: 3, borderRadius: 2, border: '1px solid #e5e7eb' }}>
                                    <Typography variant="h6" gutterBottom fontWeight="bold">Register</Typography>

                                    {event.eventType === 'Normal' && event.isTeamEvent && (
                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="subtitle2" color="primary">Team Event (Max Size: {event.maxTeamSize})</Typography>
                                            <Box sx={{ display: 'flex', gap: 1, my: 1 }}>
                                                <Button variant={teamMode === 'create' ? 'contained' : 'outlined'} size="small" onClick={() => setTeamMode('create')}>Create Team</Button>
                                                <Button variant={teamMode === 'join' ? 'contained' : 'outlined'} size="small" onClick={() => setTeamMode('join')}>Join Team</Button>
                                            </Box>
                                            {teamMode === 'create' ? (
                                                <TextField label="Team Name" size="small" fullWidth required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
                                            ) : (
                                                <TextField label="Invite Code" size="small" fullWidth required value={inviteCode} onChange={(e) => setInviteCode(e.target.value)} />
                                            )}
                                        </Box>
                                    )}

                                    {isMerch ? (
                                        <>
                                            <FormControl fullWidth sx={{ mb: 2 }} size="small">
                                                <InputLabel>Size</InputLabel>
                                                <Select
                                                    label="Size"
                                                    value={merchSelection.size}
                                                    onChange={(e) => setMerchSelection({ ...merchSelection, size: e.target.value })}
                                                >
                                                    {event.merchandiseDetails?.sizes.map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                            <FormControl fullWidth sx={{ mb: 2 }} size="small">
                                                <InputLabel>Color</InputLabel>
                                                <Select
                                                    label="Color"
                                                    value={merchSelection.color}
                                                    onChange={(e) => setMerchSelection({ ...merchSelection, color: e.target.value })}
                                                >
                                                    {event.merchandiseDetails?.colors.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                            <Typography variant="caption" display="block" sx={{ mb: 2 }}>
                                                Stock Available: {event.merchandiseDetails?.stock}
                                            </Typography>
                                            <Button variant="outlined" component="label" fullWidth sx={{ mb: 2 }}>
                                                Upload Payment Proof
                                                <input type="file" hidden accept="image/*" onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => {
                                                            setPaymentProofBase64(reader.result as string);
                                                        };
                                                        reader.readAsDataURL(file);
                                                    }
                                                }} />
                                            </Button>
                                            {paymentProofBase64 && <Typography variant="caption" color="success.main" display="block" sx={{ mb: 2 }}>✓ Image attached</Typography>}
                                        </>
                                    ) : (
                                        event.customFormFields?.map((field) => (
                                            <TextField
                                                key={field.label}
                                                label={field.label}
                                                type={field.fieldType === 'number' ? 'number' : 'text'}
                                                fullWidth
                                                size="small"
                                                required={field.required}
                                                sx={{ mb: 2 }}
                                                onChange={(e) => setFormData({ ...formData, [field.label]: e.target.value })}
                                            />
                                        ))
                                    )}

                                    {(!event.isTeamEvent || event.eventType !== 'Normal') && isOutOfStock && <Typography color="error">Out of Stock</Typography>}

                                    <Button
                                        variant="contained"
                                        fullWidth
                                        size="large"
                                        disabled={isDeadlinePassed || isOutOfStock || registering}
                                        onClick={handleRegister}
                                        sx={{
                                            bgcolor: isDeadlinePassed ? 'grey' : '#2563eb',
                                            '&:hover': { bgcolor: '#1d4ed8' }
                                        }}
                                    >
                                        {registering ? 'Processing...' :
                                            isOutOfStock ? 'Out of Stock' :
                                                isDeadlinePassed ? 'Registration Closed' : 'Register Now'}
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                </Container>
            </Box>
        </React.Fragment>
    );
}
