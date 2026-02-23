"use client";
import React, { useState, useEffect } from 'react';
import {
    Container, Typography, Box, Button, Chip, Paper, Grid, CircularProgress, Divider
} from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const INTERESTS = [
    "Coding", "Music", "Dance", "Art", "Sports", "Gaming",
    "Literature", "Debate", "Photography", "Robotics", "Entrepreneurship",
    "AI", "Machine Learning", "Web Development", "Cybersecurity"
];

export default function OnboardingPage() {
    const router = useRouter();
    const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
    const [selectedOrganizers, setSelectedOrganizers] = useState<string[]>([]);
    const [organizers, setOrganizers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [orgLoading, setOrgLoading] = useState(true);

    useEffect(() => {
        const fetchOrganizers = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/users/organizers');
                setOrganizers(res.data);
            } catch (error) {
                console.error("Failed to fetch organizers");
            } finally {
                setOrgLoading(false);
            }
        };
        fetchOrganizers();
    }, []);

    const toggleInterest = (interest: string) => {
        if (selectedInterests.includes(interest)) {
            setSelectedInterests(selectedInterests.filter(i => i !== interest));
        } else {
            setSelectedInterests([...selectedInterests, interest]);
        }
    };

    const toggleOrganizer = (orgId: string) => {
        if (selectedOrganizers.includes(orgId)) {
            setSelectedOrganizers(selectedOrganizers.filter(id => id !== orgId));
        } else {
            setSelectedOrganizers([...selectedOrganizers, orgId]);
        }
    };

    const handleComplete = async (skip = false) => {
        setLoading(true);
        const token = localStorage.getItem('token');
        try {
            if (!skip) {
                // Save interests
                if (selectedInterests.length > 0) {
                    await axios.put('http://localhost:5000/api/users/profile', { interests: selectedInterests }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
                // Follow selected organizers
                for (const orgId of selectedOrganizers) {
                    await axios.put(`http://localhost:5000/api/users/follow/${orgId}`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }
            router.push('/dashboard');
        } catch (error) {
            console.error("Failed to save preferences");
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 8 }}>
                <Paper sx={{ p: 5 }}>
                    <Box sx={{ textAlign: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold" gutterBottom>Welcome to Fest event manager! 🎉</Typography>
                        <Typography color="text.secondary" paragraph>
                            Let us know what you&apos;re interested in so we can recommend the best events for you.
                        </Typography>
                    </Box>

                    {/* Interests Section */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Areas of Interest
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Select topics that interest you (multiple selection allowed)
                    </Typography>
                    <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                        {INTERESTS.map((interest) => (
                            <Chip
                                key={interest}
                                label={interest}
                                onClick={() => toggleInterest(interest)}
                                variant={selectedInterests.includes(interest) ? "filled" : "outlined"}
                                color={selectedInterests.includes(interest) ? "primary" : "default"}
                                sx={{
                                    fontSize: '0.95rem',
                                    p: 0.5,
                                    cursor: 'pointer',
                                    transition: '0.2s',
                                    '&:hover': { transform: 'scale(1.05)' }
                                }}
                            />
                        ))}
                    </Box>

                    <Divider sx={{ my: 3 }} />

                    {/* Follow Organizers Section */}
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                        Clubs / Organizers to Follow
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Follow clubs to see their events first
                    </Typography>
                    {orgLoading ? (
                        <Box sx={{ textAlign: 'center', py: 2 }}><CircularProgress size={24} /></Box>
                    ) : (
                        <Box sx={{ mb: 4, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
                            {organizers.map((org) => (
                                <Chip
                                    key={org._id}
                                    label={org.organizerName}
                                    onClick={() => toggleOrganizer(org._id)}
                                    variant={selectedOrganizers.includes(org._id) ? "filled" : "outlined"}
                                    color={selectedOrganizers.includes(org._id) ? "secondary" : "default"}
                                    sx={{
                                        fontSize: '0.95rem',
                                        p: 0.5,
                                        cursor: 'pointer',
                                        transition: '0.2s',
                                        '&:hover': { transform: 'scale(1.05)' }
                                    }}
                                />
                            ))}
                            {organizers.length === 0 && (
                                <Typography variant="body2" color="text.secondary">No organizers available yet.</Typography>
                            )}
                        </Box>
                    )}

                    <Grid container spacing={2} justifyContent="center" sx={{ mt: 4 }}>
                        <Grid item>
                            <Button variant="text" onClick={() => handleComplete(true)} disabled={loading}>
                                Skip for now
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={() => handleComplete(false)}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : `Continue (${selectedInterests.length} interests, ${selectedOrganizers.length} clubs)`}
                            </Button>
                        </Grid>
                    </Grid>
                </Paper>
            </Container>
        </React.Fragment>
    );
}
