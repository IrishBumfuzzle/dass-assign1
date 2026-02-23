"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, Button,
    TextField, Chip, Divider, Alert, CircularProgress
} from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';

const ALL_INTERESTS = [
    "Coding", "Music", "Dance", "Art", "Sports", "Gaming",
    "Literature", "Debate", "Photography", "Robotics", "Entrepreneurship",
    "AI", "Machine Learning", "Web Development", "Cybersecurity"
];

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState({ type: '', content: '' });

    // Personal info
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', contactNumber: '', collegeOrOrgName: '', password: ''
    });

    // Preferences
    const [interests, setInterests] = useState<string[]>([]);
    const [followedOrganizers, setFollowedOrganizers] = useState<string[]>([]);
    const [allOrganizers, setAllOrganizers] = useState<any[]>([]);

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const res = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users/profile', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setUser(res.data);
                setFormData({
                    firstName: res.data.firstName || '',
                    lastName: res.data.lastName || '',
                    contactNumber: res.data.contactNumber || '',
                    collegeOrOrgName: res.data.collegeOrOrgName || '',
                    password: ''
                });
                setInterests(res.data.interests || []);
                setFollowedOrganizers(res.data.followedOrganizers || []);

                // Fetch all organizers for the follow list
                const orgRes = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users/organizers');
                setAllOrganizers(orgRes.data);
            } catch (error) {
                console.error("Failed to fetch profile");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const toggleInterest = (interest: string) => {
        if (interests.includes(interest)) {
            setInterests(interests.filter(i => i !== interest));
        } else {
            setInterests([...interests, interest]);
        }
    };

    const handleFollowToggle = async (orgId: string) => {
        const token = localStorage.getItem('token');
        const isFollowing = followedOrganizers.includes(orgId);

        try {
            if (isFollowing) {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/unfollow/${orgId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFollowedOrganizers(followedOrganizers.filter(id => id !== orgId));
            } else {
                await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/follow/${orgId}`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setFollowedOrganizers([...followedOrganizers, orgId]);
            }
        } catch (error) {
            console.error("Follow/unfollow failed");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        const token = localStorage.getItem('token');
        try {
            const payload: any = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                contactNumber: formData.contactNumber,
                collegeOrOrgName: formData.collegeOrOrgName,
                interests: interests,
            };

            if (formData.password) {
                payload.password = formData.password;
            }

            await axios.put((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users/profile', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMsg({ type: 'success', content: 'Profile updated successfully' });
            setFormData({ ...formData, password: '' });
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
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>My Profile</Typography>

                {/* Non-editable info */}
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                    <Chip label={`Email: ${user?.email}`} size="small" />
                    <Chip label={`Type: ${user?.type}`} size="small" color="info" />
                    <Chip label={`Role: ${user?.role}`} size="small" color="secondary" />
                </Box>

                {msg.content && <Alert severity={msg.type as any} sx={{ mb: 3 }}>{msg.content}</Alert>}

                <Card sx={{ p: 3, mb: 4 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Personal Information</Typography>
                        <Box component="form" onSubmit={handleUpdate}>
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <TextField label="First Name" fullWidth value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Last Name" fullWidth value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="Contact Number" fullWidth value={formData.contactNumber} onChange={e => setFormData({ ...formData, contactNumber: e.target.value })} />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField label="College / Organization" fullWidth value={formData.collegeOrOrgName} onChange={e => setFormData({ ...formData, collegeOrOrgName: e.target.value })} />
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Security</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField label="New Password (leave blank to keep current)" type="password" fullWidth value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" fontWeight="bold" gutterBottom>Interests</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        These preferences influence the events shown to you
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                        {ALL_INTERESTS.map((interest) => (
                                            <Chip
                                                key={interest}
                                                label={interest}
                                                onClick={() => toggleInterest(interest)}
                                                variant={interests.includes(interest) ? "filled" : "outlined"}
                                                color={interests.includes(interest) ? "primary" : "default"}
                                                sx={{ cursor: 'pointer' }}
                                            />
                                        ))}
                                    </Box>
                                </Grid>

                                <Grid item xs={12}>
                                    <Button variant="contained" type="submit" disabled={saving}>
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </CardContent>
                </Card>

                {/* Followed Clubs */}
                <Card sx={{ p: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Followed Clubs / Organizers</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Follow clubs to see their events first when browsing
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {allOrganizers.map((org) => {
                                const isFollowing = followedOrganizers.includes(org._id);
                                return (
                                    <Chip
                                        key={org._id}
                                        label={org.organizerName}
                                        variant={isFollowing ? "filled" : "outlined"}
                                        color={isFollowing ? "secondary" : "default"}
                                        onClick={() => handleFollowToggle(org._id)}
                                        sx={{ cursor: 'pointer' }}
                                    />
                                );
                            })}
                            {allOrganizers.length === 0 && (
                                <Typography variant="body2" color="text.secondary">No organizers available yet.</Typography>
                            )}
                        </Box>
                    </CardContent>
                </Card>
            </Container>
        </React.Fragment>
    );
}
