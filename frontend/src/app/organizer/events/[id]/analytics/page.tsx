"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, Paper, Button, CircularProgress,
    Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, InputAdornment, Grid, Card, CardContent, Chip
} from '@mui/material';
import Navbar from '../../../../../components/layout/Navbar';
import axios from 'axios';
import { useParams } from 'next/navigation';
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';

export default function EventAnalytics() {
    const params = useParams();
    const id = params?.id as string;
    const [tickets, setTickets] = useState<any[]>([]);
    const [eventDetails, setEventDetails] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [analytics, setAnalytics] = useState({
        totalRegistrations: 0,
        totalAttendance: 0,
        totalRevenue: 0,
    });

    // Image Modal State
    const [imgOpen, setImgOpen] = useState(false);
    const [selectedImg, setSelectedImg] = useState("");

    const fetchAnalytics = async (search?: string) => {
        const token = localStorage.getItem('token');
        try {
            const eventRes = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/events/${id}`);
            setEventDetails(eventRes.data);

            let url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tickets/event/${id}`;
            if (search) url += `?search=${search}`;

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data.tickets || res.data);
            if (res.data.analytics) {
                setAnalytics(res.data.analytics);
            }
        } catch (error) {
            console.error("Fetch error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        fetchAnalytics();
    }, [id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (id) fetchAnalytics(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const downloadCSV = () => {
        const headers = ["Ticket ID", "Participant Name", "Email", "Contact", "Team", "Registration Status", "Payment Status", "Attended", "Date"];
        const rows = tickets.map(t => [
            t._id,
            `${t.participantId?.firstName} ${t.participantId?.lastName}`,
            t.participantId?.email,
            t.participantId?.contactNumber,
            t.teamId?.teamName || 'N/A',
            t.status,
            t.paymentStatus,
            t.attended ? 'Yes' : 'No',
            new Date(t.registrationDate).toLocaleDateString()
        ]);

        let csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `event_analytics_${id}.csv`);
        document.body.appendChild(link);
        link.click();
    };

    const handleResolvePayment = async (ticketId: string, status: string) => {
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/tickets/${ticketId}/resolve-payment`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(tickets.map(t =>
                t._id === ticketId
                    ? { ...t, paymentStatus: status, status: status === 'Approved' ? 'Registered' : 'Rejected' }
                    : t
            ));
        } catch (error: any) {
            alert(error.response?.data?.message || "Failed to resolve payment");
        }
    };

    if (loading) return <Box sx={{ p: 4, textAlign: 'center' }}><CircularProgress /></Box>;

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Event Analytics: {eventDetails?.name}
                    </Typography>
                    <Button variant="outlined" startIcon={<DownloadIcon />} onClick={downloadCSV}>
                        Export CSV
                    </Button>
                </Box>

                {/* Analytics Cards */}
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">Total Registrations</Typography>
                                <Typography variant="h3" fontWeight="bold" color="primary.main">{analytics.totalRegistrations}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">Attendance</Typography>
                                <Typography variant="h3" fontWeight="bold" color="success.main">{analytics.totalAttendance}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Card>
                            <CardContent>
                                <Typography variant="overline" color="text.secondary">Revenue</Typography>
                                <Typography variant="h3" fontWeight="bold" color="info.main">₹{analytics.totalRevenue}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* Search */}
                <TextField
                    fullWidth
                    placeholder="Search by participant name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                    }}
                    sx={{ mb: 3 }}
                />

                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                    <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
                        <Tab label="Registrations" />
                        {eventDetails?.eventType === 'Merchandise' && <Tab label="Payment Approvals" />}
                    </Tabs>
                </Box>

                {tabValue === 0 && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Contact</strong></TableCell>
                                    <TableCell><strong>Team</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Payment</strong></TableCell>
                                    <TableCell><strong>Attended</strong></TableCell>
                                    <TableCell><strong>Date</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tickets.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell>{row.participantId?.firstName} {row.participantId?.lastName}</TableCell>
                                        <TableCell>{row.participantId?.email}</TableCell>
                                        <TableCell>{row.participantId?.contactNumber}</TableCell>
                                        <TableCell>{row.teamId?.teamName || '—'}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.status}
                                                size="small"
                                                color={row.status === 'Registered' ? 'success' : row.status === 'Pending' ? 'warning' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell>{row.paymentStatus}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.attended ? 'Yes' : 'No'}
                                                size="small"
                                                color={row.attended ? 'success' : 'default'}
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>{new Date(row.registrationDate).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

                {tabValue === 1 && eventDetails?.eventType === 'Merchandise' && (
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell><strong>Participant Name</strong></TableCell>
                                    <TableCell><strong>Selection</strong></TableCell>
                                    <TableCell><strong>Payment Proof</strong></TableCell>
                                    <TableCell><strong>Status</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tickets.map((row) => (
                                    <TableRow key={row._id}>
                                        <TableCell>{row.participantId?.firstName} {row.participantId?.lastName}</TableCell>
                                        <TableCell>
                                            Size: {row.merchandiseSelection?.size} | Color: {row.merchandiseSelection?.color}
                                        </TableCell>
                                        <TableCell>
                                            {row.paymentProofUrl ? (
                                                <Button size="small" variant="outlined" onClick={() => { setSelectedImg(row.paymentProofUrl); setImgOpen(true); }}>
                                                    View Proof
                                                </Button>
                                            ) : (
                                                <Typography variant="caption" color="error">No proof</Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={row.paymentStatus}
                                                size="small"
                                                color={row.paymentStatus === 'Pending' ? 'warning' : row.paymentStatus === 'Approved' ? 'success' : 'error'}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            {row.paymentStatus === 'Pending' && (
                                                <Box sx={{ display: 'flex', gap: 1 }}>
                                                    <Button size="small" variant="contained" color="success" onClick={() => handleResolvePayment(row._id, 'Approved')}>Approve</Button>
                                                    <Button size="small" variant="contained" color="error" onClick={() => handleResolvePayment(row._id, 'Rejected')}>Reject</Button>
                                                </Box>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}

            </Container>

            {/* Image Modal */}
            <Dialog open={imgOpen} onClose={() => setImgOpen(false)} maxWidth="md">
                <DialogTitle>Payment Proof</DialogTitle>
                <DialogContent>
                    {selectedImg ? <img src={selectedImg} alt="Payment Proof" style={{ maxWidth: '100%', maxHeight: '70vh' }} /> : "No Image"}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setImgOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
