"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, Chip, CircularProgress, Button
} from '@mui/material';
import Navbar from '../../../components/layout/Navbar';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Event } from '../../../types';

export default function OrganizerDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    const [organizer, setOrganizer] = useState<any>(null);
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        const fetchData = async () => {
            try {
                
                const orgRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/users/organizers/${id}`);
                setOrganizer(orgRes.data);

                
                
                
                
                
                
                const eventsRes = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/events');
                const orgEvents = eventsRes.data.filter((e: any) => e.organizerId._id === id || e.organizerId === id);
                setEvents(orgEvents);

            } catch (error) {
                console.error("Error");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;
    if (!organizer) return <Box sx={{ p: 4, textAlign: 'center' }}>Organizer not found.</Box>;

    const now = new Date();

    return (
        <React.Fragment>
            <Navbar />
            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 8 }}>
                {}
                <Box sx={{ bgcolor: 'white', py: 6, borderBottom: '1px solid #e2e8f0' }}>
                    <Container maxWidth="lg">
                        <Typography variant="h3" fontWeight="bold" gutterBottom>{organizer.organizerName}</Typography>
                        <Chip label={organizer.category || 'General'} color="secondary" sx={{ mr: 2 }} />
                        <Typography variant="body1" color="text.secondary" paragraph sx={{ mt: 2, maxWidth: '800px' }}>
                            {organizer.description}
                        </Typography>
                        <Typography variant="body2">Contact: {organizer.contactEmail}</Typography>
                    </Container>
                </Box>

                <Container maxWidth="lg" sx={{ mt: 4 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>Events</Typography>
                    <Grid container spacing={3}>
                        {events.length === 0 ? (
                            <Typography sx={{ p: 2, color: 'text.secondary' }}>No events found.</Typography>
                        ) : (
                            events.map((event) => {
                                const isPast = new Date(event.endDate) < now;
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={event._id}>
                                        <Card sx={{
                                            opacity: isPast ? 0.7 : 1,
                                            cursor: 'pointer',
                                            transition: '0.3s',
                                            '&:hover': { transform: 'translateY(-4px)' }
                                        }} onClick={() => router.push(`/events/${event._id}`)}>
                                            <Box sx={{ height: 6, bgcolor: isPast ? 'grey' : '#2563eb' }} />
                                            <CardContent>
                                                <Typography variant="overline" color={isPast ? "text.secondary" : "success.main"}>
                                                    {isPast ? 'Past Event' : 'Upcoming'}
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" noWrap>{event.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {new Date(event.startDate).toLocaleDateString()}
                                                </Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            })
                        )}
                    </Grid>
                </Container>
            </Box>
        </React.Fragment>
    );
}
