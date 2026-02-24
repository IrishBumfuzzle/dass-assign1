"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, Button,
    CircularProgress
} from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function OrganizersListPage() {
    const router = useRouter();
    const [organizers, setOrganizers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [followed, setFollowed] = useState<string[]>([]); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users/organizers');
                setOrganizers(res.data);

                
                const token = localStorage.getItem('token');
                if (token) {
                    const profileRes = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFollowed(profileRes.data.followedOrganizers || []);
                }
            } catch (error) {
                console.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleFollow = async (id: string) => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        try { 
            const isFollowing = followed.includes(id);
            setFollowed(prev => isFollowing ? prev.filter(fid => fid !== id) : [...prev, id]);

            await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/follow/${id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (error) {
            console.error("Follow failed");
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 5 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Clubs & Organizers</Typography>

                <Grid container spacing={3}>
                    {organizers.map((org) => {
                        const isFollowing = followed.includes(org._id);
                        return (
                            <Grid item xs={12} sm={6} md={4} key={org._id}>
                                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <Box sx={{ height: 100, bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Typography variant="h3">🏛️</Typography>
                                    </Box>
                                    <CardContent sx={{ flexGrow: 1 }}>
                                        <Typography variant="h6" fontWeight="bold" gutterBottom>{org.organizerName}</Typography>
                                        <Typography variant="subtitle2" color="primary" gutterBottom>{org.category || 'General'}</Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph sx={{
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {org.description || 'No description provided.'}
                                        </Typography>

                                        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                            <Button
                                                variant={isFollowing ? "outlined" : "contained"}
                                                fullWidth
                                                color={isFollowing ? "inherit" : "primary"}
                                                onClick={() => handleFollow(org._id)}
                                            >
                                                {isFollowing ? 'Unfollow' : 'Follow'}
                                            </Button>
                                            <Button
                                                variant="text"
                                                fullWidth
                                                onClick={() => router.push(`/organizers/${org._id}`)}
                                            >
                                                Details
                                            </Button>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )
                    })}
                </Grid>
            </Container>
        </React.Fragment>
    );
}
