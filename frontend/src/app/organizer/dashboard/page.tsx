"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, Button,
    Chip, Divider, CircularProgress
} from '@mui/material';
import Navbar from '../../../components/layout/Navbar';
import axios from 'axios';
import { Event } from '../../../types';
import { useRouter } from 'next/navigation';
import AddIcon from '@mui/icons-material/Add';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import EditIcon from '@mui/icons-material/Edit';

export default function OrganizerDashboard() {
    const router = useRouter();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState({
        totalEvents: 0,
        totalRegistrations: 0,
        totalRevenue: 0,
        totalAttendance: 0,
        totalMerchSales: 0,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        const fetchMyEvents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/events/my-events', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setEvents(response.data);
            } catch (error) {
                console.error("Error fetching events:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchSummary = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/events/analytics-summary', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSummary(res.data);
            } catch (error) {
                console.error("Error fetching analytics summary:", error);
            }
        };

        fetchMyEvents();
        fetchSummary();
    }, [router]);

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    const now = new Date();

    return (
        <React.Fragment>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: '#f8fafc', py: 5 }}>
                <Container maxWidth="lg">
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography variant="h4" fontWeight="bold" color="text.primary">
                            Organizer Dashboard
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => router.push('/organizer/events/create')}
                            sx={{ bgcolor: '#0f172a', '&:hover': { bgcolor: '#1e293b' } }}
                        >
                            Create Event
                        </Button>
                    </Box>

                    {/* Analytics Summary */}
                    <Grid container spacing={3} sx={{ mb: 5 }}>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ bgcolor: 'white', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="overline" color="text.secondary">Total Events</Typography>
                                    <Typography variant="h3" fontWeight="bold">{summary.totalEvents}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ bgcolor: 'white', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="overline" color="text.secondary">Registrations</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="primary.main">{summary.totalRegistrations}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ bgcolor: 'white', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="overline" color="text.secondary">Revenue</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="success.main">₹{summary.totalRevenue}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ bgcolor: 'white', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="overline" color="text.secondary">Attendance</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="info.main">{summary.totalAttendance}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid item xs={12} sm={6} md={2.4}>
                            <Card sx={{ bgcolor: 'white', borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="overline" color="text.secondary">Merch Sales</Typography>
                                    <Typography variant="h3" fontWeight="bold" color="secondary.main">{summary.totalMerchSales}</Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Typography variant="h5" sx={{ mb: 3 }}>Your Events</Typography>

                    {events.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 5, bgcolor: 'white', borderRadius: 2 }}>
                            <Typography color="text.secondary">You haven&apos;t created any events yet.</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {events.map((event) => {
                                const isPast = new Date(event.endDate) < now;
                                const isOngoing = new Date(event.startDate) <= now && new Date(event.endDate) >= now;
                                const status = event.status === 'Draft' ? 'Draft'
                                    : isPast ? 'Completed'
                                        : isOngoing ? 'Ongoing'
                                            : 'Upcoming';
                                const statusColor = event.status === 'Draft' ? 'default' as const
                                    : isPast ? 'default' as const
                                        : isOngoing ? 'success' as const
                                            : 'primary' as const;

                                return (
                                    <Grid item xs={12} md={6} lg={4} key={event._id}>
                                        <Card elevation={2} sx={{ borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                                            <Box sx={{
                                                height: 8,
                                                bgcolor: event.status === 'Draft' ? '#94a3b8'
                                                    : event.eventType === 'Merchandise' ? '#db2777' : '#2563eb'
                                            }} />
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Chip label={status} color={statusColor} size="small" />
                                                    <Chip label={event.eventType} variant="outlined" size="small" />
                                                </Box>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                                                    {event.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                    {new Date(event.startDate).toLocaleDateString()}
                                                </Typography>

                                                {event.status === 'Draft' && (
                                                    <Chip label="Not Published" size="small" variant="outlined" color="warning" sx={{ mb: 1 }} />
                                                )}

                                                <Divider sx={{ my: 1 }} />
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                                    <Button
                                                        size="small"
                                                        startIcon={<EditIcon />}
                                                        onClick={() => router.push(`/organizer/events/${event._id}/edit`)}
                                                        disabled={event.status === 'Closed'}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="small"
                                                        startIcon={<AnalyticsIcon />}
                                                        onClick={() => router.push(`/organizer/events/${event._id}/analytics`)}
                                                    >
                                                        Analytics
                                                    </Button>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    )}
                </Container>
            </Box>
        </React.Fragment>
    );
}
