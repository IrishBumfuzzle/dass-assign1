"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Button, TextField, Grid, Paper,
    FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Chip
} from '@mui/material';
import Navbar from '../../../../../components/layout/Navbar';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';

export default function EditEventPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [event, setEvent] = useState<any>(null);
    const [msg, setMsg] = useState({ type: '', content: '' });

    // Editable fields
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState('');
    const [registrationLimit, setRegistrationLimit] = useState('');
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (!id) return;
        const fetchEvent = async () => {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events/${id}`);
                setEvent(res.data);
                setDescription(res.data.description);
                setDeadline(res.data.deadline ? new Date(res.data.deadline).toISOString().slice(0, 16) : '');
                setRegistrationLimit(res.data.registrationLimit?.toString() || '');
                setStatus(res.data.status);
            } catch (error) {
                console.error("Failed to fetch event");
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id]);

    const handleSave = async () => {
        setSaving(true);
        const token = localStorage.getItem('token');
        try {
            const payload: any = { description };

            if (event.status === 'Draft') {
                // Draft: can change everything
                payload.deadline = deadline;
                payload.registrationLimit = Number(registrationLimit) || undefined;
                payload.status = status;
            } else if (event.status === 'Published') {
                // Published: limited changes
                if (deadline) payload.deadline = deadline;
                if (registrationLimit) payload.registrationLimit = Number(registrationLimit);
                if (status && ['Ongoing', 'Closed'].includes(status)) payload.status = status;
            } else if (event.status === 'Ongoing') {
                // Ongoing: status to Closed only
                if (status === 'Closed') payload.status = 'Closed';
            }

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events/${id}`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg({ type: 'success', content: 'Event updated successfully!' });
        } catch (error: any) {
            setMsg({ type: 'error', content: error.response?.data?.message || 'Failed to update event' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    if (!event) return <Box sx={{ p: 4, textAlign: 'center' }}>Event not found.</Box>;

    const isDraft = event.status === 'Draft';
    const isPublished = event.status === 'Published';
    const isOngoing = event.status === 'Ongoing';
    const isClosed = event.status === 'Closed';

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h4" fontWeight="bold">Edit Event</Typography>
                    <Chip
                        label={`Status: ${event.status}`}
                        color={isDraft ? 'default' : isPublished ? 'primary' : isOngoing ? 'success' : 'error'}
                    />
                </Box>

                {msg.content && <Alert severity={msg.type as any} sx={{ mb: 3 }}>{msg.content}</Alert>}

                {isClosed && (
                    <Alert severity="info" sx={{ mb: 3 }}>This event is closed. No edits are allowed.</Alert>
                )}

                {event.formLocked && (
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Form fields are locked because registrations have been received.
                    </Alert>
                )}

                <Paper sx={{ p: 4 }}>
                    {/* Non-editable display */}
                    <Box sx={{ mb: 4, p: 2, bgcolor: '#f8fafc', borderRadius: 2 }}>
                        <Typography variant="subtitle2" color="text.secondary">Event Name</Typography>
                        <Typography variant="h6" fontWeight="bold">{event.name}</Typography>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Type</Typography>
                        <Typography>{event.eventType}</Typography>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>Dates</Typography>
                        <Typography>{new Date(event.startDate).toLocaleString()} — {new Date(event.endDate).toLocaleString()}</Typography>
                    </Box>

                    <Grid container spacing={3}>
                        {/* Description - always editable except Closed */}
                        <Grid item xs={12}>
                            <TextField
                                label="Description"
                                multiline
                                rows={4}
                                fullWidth
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                disabled={isClosed}
                            />
                        </Grid>

                        {/* Deadline & Limit - editable in Draft/Published */}
                        {(isDraft || isPublished) && (
                            <>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Registration Deadline"
                                        type="datetime-local"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        value={deadline}
                                        onChange={e => setDeadline(e.target.value)}
                                        helperText={isPublished ? "Can only extend deadline" : ""}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Registration Limit"
                                        type="number"
                                        fullWidth
                                        value={registrationLimit}
                                        onChange={e => setRegistrationLimit(e.target.value)}
                                        helperText={isPublished ? "Can only increase limit" : ""}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Status transition */}
                        {!isClosed && (
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select value={status} label="Status" onChange={e => setStatus(e.target.value)}>
                                        {isDraft && <MenuItem value="Draft">Draft</MenuItem>}
                                        {isDraft && <MenuItem value="Published">Published (Go Live)</MenuItem>}
                                        {isPublished && <MenuItem value="Published">Published</MenuItem>}
                                        {isPublished && <MenuItem value="Ongoing">Ongoing</MenuItem>}
                                        {isPublished && <MenuItem value="Closed">Closed</MenuItem>}
                                        {isOngoing && <MenuItem value="Ongoing">Ongoing</MenuItem>}
                                        {isOngoing && <MenuItem value="Closed">Closed</MenuItem>}
                                    </Select>
                                </FormControl>
                            </Grid>
                        )}

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button variant="text" onClick={() => router.push('/organizer/dashboard')}>Cancel</Button>
                                <Button
                                    variant="contained"
                                    onClick={handleSave}
                                    disabled={saving || isClosed}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </React.Fragment>
    );
}
