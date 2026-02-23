"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, Button,
    TextField, Alert, CircularProgress
} from '@mui/material';
import Navbar from '../../../components/layout/Navbar';
import axios from 'axios';

export default function OrganizerProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });

    const [formData, setFormData] = useState({
        organizerName: '', description: '', category: '',
        contactEmail: '', discordWebhookUrl: ''
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get('http://localhost:5000/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
                setFormData({
                    organizerName: res.data.organizerName || '',
                    description: res.data.description || '',
                    category: res.data.category || '',
                    contactEmail: res.data.contactEmail || '',
                    discordWebhookUrl: res.data.discordWebhookUrl || ''
                });
            } catch (error) {
                console.error("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');
        try {
            await axios.put('http://localhost:5000/api/users/profile', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg({ type: 'success', content: 'Profile updated successfully' });
        } catch (error) {
            setMsg({ type: 'error', content: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Organizer Profile</Typography>

                <Card sx={{ p: 3 }}>
                    <CardContent>
                        {msg.content && <Alert severity={msg.type as any} sx={{ mb: 3 }}>{msg.content}</Alert>}

                        <Box component="form" onSubmit={handleUpdate}>
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <TextField label="Organizer Name" fullWidth value={formData.organizerName} onChange={e => setFormData({ ...formData, organizerName: e.target.value })} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="Description" multiline rows={4} fullWidth value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Category" fullWidth value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Public Contact Email" fullWidth value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        label="Discord Webhook URL"
                                        fullWidth
                                        helperText="Paste your Discord channel webhook URL here to automatically post new events."
                                        value={formData.discordWebhookUrl}
                                        onChange={e => setFormData({ ...formData, discordWebhookUrl: e.target.value })}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Button variant="contained" type="submit" disabled={saving}>Save Changes</Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </React.Fragment>
    );
}
