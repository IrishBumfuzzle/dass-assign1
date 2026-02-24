"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Grid, Card, CardContent,
    Button, Chip, Dialog, DialogTitle, DialogContent, Tabs, Tab
} from '@mui/material';
import Navbar from '../../components/layout/Navbar';
import axios from 'axios';
import { Ticket } from '../../types';
import { useRouter } from 'next/navigation';
import TeamsTab from '../../components/dashboard/TeamsTab';
import { QRCodeSVG } from 'qrcode.react';

export default function Dashboard() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [tabValue, setTabValue] = useState(0);

    
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }

        
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            if (user.role === 'Organizer') {
                router.push('/organizer/dashboard');
                return;
            }
            if (user.role === 'Admin') {
                router.push('/admin/dashboard');
                return;
            }
        }

        const fetchTickets = async () => {
            try {
                const response = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/tickets/my-tickets', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTickets(response.data);
            } catch (error) {
                console.error("Error fetching tickets:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [router]);

    const handleOpenTicket = (ticket: Ticket) => {
        setSelectedTicket(ticket);
    };

    const handleCloseTicket = () => {
        setSelectedTicket(null);
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}>Loading your dashboard...</Box>;

    return (
        <React.Fragment>
            <Navbar />
            <Box sx={{ minHeight: '100vh', bgcolor: '#f3f4f6', py: 4 }}>
                <Container maxWidth="lg">
                    <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', color: '#1f2937' }}>
                        My Dashboard
                    </Typography>

                    <Box sx={{ mt: 4 }}>
                        <Typography variant="h5" sx={{ mb: 2, color: '#4b5563', fontWeight: 'bold' }}>
                            Your Registrations
                        </Typography>

                        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }} variant="scrollable" scrollButtons="auto">
                            <Tab label="Upcoming" />
                            <Tab label="All History" />
                            <Tab label="Normal" />
                            <Tab label="Merchandise" />
                            <Tab label="Completed" />
                            <Tab label="Cancelled/Rejected" />
                            <Tab label="My Teams" />
                        </Tabs>

                        {(() => {
                            if (tabValue === 6) {
                                return <TeamsTab />;
                            }
                            const now = new Date();
                            let filtered = tickets;
                            if (tabValue === 0) { 
                                filtered = tickets.filter(t => t.eventId && new Date(t.eventId.startDate) > now && t.status !== 'Cancelled' && t.status !== 'Rejected');
                            } else if (tabValue === 2) { 
                                filtered = tickets.filter(t => t.eventId?.eventType === 'Normal');
                            } else if (tabValue === 3) { 
                                filtered = tickets.filter(t => t.eventId?.eventType === 'Merchandise');
                            } else if (tabValue === 4) { 
                                filtered = tickets.filter(t => t.eventId && new Date(t.eventId.endDate) < now && t.status !== 'Cancelled' && t.status !== 'Rejected');
                            } else if (tabValue === 5) { 
                                filtered = tickets.filter(t => t.status === 'Cancelled' || t.status === 'Rejected');
                            }

                            if (filtered.length === 0) {
                                return (
                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                        <Typography color="text.secondary">No events found in this category.</Typography>
                                        <Button variant="outlined" sx={{ mt: 2 }} onClick={() => router.push('/events')}>Browse Events</Button>
                                    </Box>
                                );
                            }

                            return (
                                <Grid container spacing={3}>
                                    {filtered.map((ticket) => (
                                        <Grid item xs={12} sm={6} md={4} key={ticket._id}>
                                            <Card
                                                elevation={2}
                                                sx={{
                                                    borderRadius: '12px',
                                                    cursor: 'pointer',
                                                    transition: '0.2s',
                                                    '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
                                                }}
                                                onClick={() => handleOpenTicket(ticket)}
                                            >
                                                <Box sx={{
                                                    height: 120,
                                                    background: ticket.eventId?.eventType === 'Merchandise'
                                                        ? 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)'
                                                        : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white'
                                                }}>
                                                    <Typography variant="h3" sx={{ opacity: 0.2 }}>
                                                        {ticket.eventId?.eventType === 'Merchandise' ? '🛍️' : '🎟️'}
                                                    </Typography>
                                                </Box>
                                                <CardContent>
                                                    <Chip
                                                        label={ticket.eventId?.eventType}
                                                        size="small"
                                                        sx={{ mb: 1, bgcolor: '#f1f5f9', fontWeight: 'bold' }}
                                                    />
                                                    <Typography variant="h6" fontWeight="bold" noWrap>{ticket.eventId?.name}</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        by {ticket.eventId?.organizerId?.organizerName || 'Unknown'}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                                        {ticket.eventId && new Date(ticket.eventId.startDate).toLocaleDateString()}
                                                    </Typography>
                                                    {ticket.teamId && (
                                                        <Typography variant="caption" color="primary" display="block">
                                                            Team: {(ticket.teamId as any)?.teamName || 'Team'}
                                                        </Typography>
                                                    )}

                                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <Chip
                                                            label={ticket.status}
                                                            color={ticket.status === 'Registered' ? 'success' : ticket.status === 'Pending' ? 'warning' : ticket.status === 'Cancelled' || ticket.status === 'Rejected' ? 'error' : 'default'}
                                                            size="small"
                                                            variant="outlined"
                                                        />
                                                        <Typography variant="caption" color="text.secondary">
                                                            ID: {ticket._id.substring(ticket._id.length - 6)}
                                                        </Typography>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ))}
                                </Grid>
                            );
                        })()}
                    </Box>
                </Container>
            </Box>

            {}
            <Dialog open={Boolean(selectedTicket)} onClose={handleCloseTicket} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ textAlign: 'center', fontWeight: 'bold' }}>
                    Event Ticket
                </DialogTitle>
                <DialogContent sx={{ textAlign: 'center', py: 4 }}>
                    {selectedTicket && (
                        <Box>
                            <Box sx={{ border: '2px dashed #ccc', p: 3, borderRadius: 2, bgcolor: '#fff' }}>
                                <Typography variant="h4" color="primary" gutterBottom>
                                    {selectedTicket.eventId?.name}
                                </Typography>
                                <Typography variant="subtitle1" gutterBottom>
                                    Organized by {selectedTicket.eventId?.organizerId?.organizerName || 'Unknown'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {selectedTicket.eventId && new Date(selectedTicket.eventId.startDate).toLocaleString()}
                                </Typography>
                                <Typography variant="body1" sx={{ fontFamily: 'monospace', bgcolor: '#eee', p: 1, borderRadius: 1, my: 2 }}>
                                    Ticket ID: {selectedTicket._id}
                                </Typography>

                                {selectedTicket.teamId && (
                                    <Typography variant="body2" color="primary" sx={{ mb: 1 }}>
                                        Team: {(selectedTicket.teamId as any)?.teamName || 'Team'}
                                    </Typography>
                                )}

                                {selectedTicket.merchandiseSelection && selectedTicket.eventId?.eventType === 'Merchandise' && (
                                    <Box sx={{ mt: 2, textAlign: 'left' }}>
                                        <Typography variant="body2" fontWeight="bold">Merchandise Details:</Typography>
                                        <Typography variant="body2">
                                            Size: {selectedTicket.merchandiseSelection.size},
                                            Color: {selectedTicket.merchandiseSelection.color}
                                        </Typography>
                                    </Box>
                                )}

                                <Chip
                                    label={`Status: ${selectedTicket.status}`}
                                    color={selectedTicket.status === 'Registered' ? 'success' : selectedTicket.status === 'Pending' ? 'warning' : 'error'}
                                    sx={{ mt: 2 }}
                                />
                            </Box>

                            {}
                            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                                {selectedTicket.qrCodeData ? (
                                    <img src={selectedTicket.qrCodeData} alt="QR Code" style={{ width: 200, height: 200 }} />
                                ) : (
                                    <QRCodeSVG
                                        value={JSON.stringify({
                                            ticketId: selectedTicket._id,
                                            eventName: selectedTicket.eventId?.name,
                                            eventType: selectedTicket.eventId?.eventType,
                                        })}
                                        size={200}
                                        level="M"
                                    />
                                )}
                            </Box>
                            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                                Show this QR code at the entry
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>
        </React.Fragment>
    );
}
