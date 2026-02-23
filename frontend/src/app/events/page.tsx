"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent, TextField,
    MenuItem, InputAdornment, Chip, Button
} from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import SearchIcon from '@mui/icons-material/Search';

export default function BrowseEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [keyword, setKeyword] = useState('');
    const [eventType, setEventType] = useState('All');
    const [sort, setSort] = useState('date');
    const [eligibility, setEligibility] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [showFollowed, setShowFollowed] = useState(false);
    const [followedIds, setFollowedIds] = useState<string[]>([]);

    // Fetch user's followed organizers
    useEffect(() => {
        const fetchFollowed = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const res = await axios.get('http://localhost:5000/api/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setFollowedIds(res.data.followedOrganizers || []);
                } catch (e) { /* ignore */ }
            }
        };
        fetchFollowed();
    }, []);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                let query = `?sort=${sort}`;
                if (keyword) query += `&keyword=${keyword}`;
                if (eventType !== 'All') query += `&type=${eventType}`;
                if (eligibility) query += `&eligibility=${eligibility}`;
                if (startDate) query += `&startDate=${startDate}`;
                if (endDate) query += `&endDate=${endDate}`;
                if (showFollowed && followedIds.length > 0) {
                    query += `&followedClubs=${followedIds.join(',')}`;
                }

                // Pass userId for preference-based ordering
                const userStr = localStorage.getItem('user');
                if (userStr) {
                    const user = JSON.parse(userStr);
                    query += `&userId=${user._id}`;
                }

                const res = await axios.get(`http://localhost:5000/api/events${query}`);
                setEvents(res.data);
            } catch (error) {
                console.error("Fetch error");
            } finally {
                setLoading(false);
            }
        };

        const timer = setTimeout(() => {
            fetchEvents();
        }, 300); // Debounce

        return () => clearTimeout(timer);
    }, [keyword, eventType, sort, eligibility, startDate, endDate, showFollowed, followedIds]);

    return (
        <React.Fragment>
            <Navbar />
            <Box sx={{ bgcolor: '#f8fafc', minHeight: '100vh', pb: 5 }}>
                {/* Filter Section */}
                <Box sx={{ bgcolor: 'white', borderBottom: '1px solid #e2e8f0', py: 4, mb: 4 }}>
                    <Container maxWidth="lg">
                        <Typography variant="h4" fontWeight="bold" gutterBottom>Browse Events</Typography>

                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    placeholder="Search events or organizers..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Type"
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="All">All Types</MenuItem>
                                    <MenuItem value="Normal">Normal</MenuItem>
                                    <MenuItem value="Merchandise">Merchandise</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Sort By"
                                    value={sort}
                                    onChange={(e) => setSort(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="date">Date (Soonest)</MenuItem>
                                    <MenuItem value="trending">Trending (Top 5)</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <TextField
                                    select
                                    fullWidth
                                    label="Eligibility"
                                    value={eligibility}
                                    onChange={(e) => setEligibility(e.target.value)}
                                    size="small"
                                >
                                    <MenuItem value="">All</MenuItem>
                                    <MenuItem value="Open to All">Open to All</MenuItem>
                                    <MenuItem value="IIIT">IIIT Only</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={6} md={2}>
                                <Button
                                    variant={showFollowed ? "contained" : "outlined"}
                                    fullWidth
                                    onClick={() => setShowFollowed(!showFollowed)}
                                    disabled={followedIds.length === 0}
                                    size="small"
                                    sx={{ height: '40px' }}
                                >
                                    {showFollowed ? '✓ Followed' : 'Followed Clubs'}
                                </Button>
                            </Grid>
                        </Grid>

                        {/* Date Range Filter */}
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    label="From Date"
                                    type="date"
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </Grid>
                            <Grid item xs={6} md={3}>
                                <TextField
                                    label="To Date"
                                    type="date"
                                    fullWidth
                                    size="small"
                                    InputLabelProps={{ shrink: true }}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </Grid>
                            {(startDate || endDate || eligibility || showFollowed) && (
                                <Grid item xs={12} md={3}>
                                    <Button size="small" onClick={() => { setStartDate(''); setEndDate(''); setEligibility(''); setShowFollowed(false); }}>
                                        Clear Filters
                                    </Button>
                                </Grid>
                            )}
                        </Grid>
                    </Container>
                </Box>

                <Container maxWidth="lg">
                    {loading ? (
                        <Typography>Loading...</Typography>
                    ) : events.length === 0 ? (
                        <Box textAlign="center" py={10}>
                            <Typography variant="h6" color="text.secondary">No events found matching your criteria.</Typography>
                        </Box>
                    ) : (
                        <Grid container spacing={3}>
                            {events.map((event) => {
                                const isPast = new Date(event.endDate) < new Date();
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={event._id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                transition: '0.3s',
                                                '&:hover': { transform: 'translateY(-5px)', boxShadow: 4 },
                                                cursor: 'pointer',
                                                opacity: isPast ? 0.7 : 1
                                            }}
                                            onClick={() => router.push(`/events/${event._id}`)}
                                        >
                                            <Box sx={{
                                                height: 140,
                                                bgcolor: event.eventType === 'Merchandise' ? '#fce7f3' : '#e0f2fe',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '3rem'
                                            }}>
                                                {event.eventType === 'Merchandise' ? '🛍️' : '📅'}
                                            </Box>
                                            <CardContent sx={{ flexGrow: 1 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {new Date(event.startDate).toDateString()}
                                                    </Typography>
                                                    <Chip
                                                        label={event.eventType}
                                                        size="small"
                                                        color={event.eventType === 'Merchandise' ? 'secondary' : 'primary'}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                                <Typography variant="h6" fontWeight="bold" gutterBottom noWrap title={event.name}>
                                                    {event.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                                    by {event.organizerId?.organizerName || 'Unknown'}
                                                </Typography>

                                                {event.fee > 0 && (
                                                    <Typography variant="body2" color="primary" fontWeight="bold">
                                                        ₹{event.fee}
                                                    </Typography>
                                                )}

                                                {/* Tags */}
                                                <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {event.tags?.slice(0, 3).map((tag: string) => (
                                                        <Chip key={tag} label={tag} size="small" sx={{ fontSize: '0.7rem' }} />
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                )
                            })}
                        </Grid>
                    )}
                </Container>
            </Box>
        </React.Fragment>
    );
}
