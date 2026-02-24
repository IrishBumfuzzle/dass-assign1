"use client";
import React, { useEffect, useState } from 'react';
import {
    Container, Typography, Box, Tabs, Tab, Button,
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Dialog, DialogTitle, DialogContent, TextField, IconButton, DialogActions, Alert
} from '@mui/material';
import Navbar from '../../../components/layout/Navbar';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div role="tabpanel" hidden={value !== index} {...other}>
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function AdminDashboard() {
    const [value, setValue] = useState(0);
    const [organizers, setOrganizers] = useState<any[]>([]);
    const [passwordResets, setPasswordResets] = useState<any[]>([]);
    const [openDialog, setOpenDialog] = useState(false);

    
    const [createdCredentials, setCreatedCredentials] = useState<{ email: string; password: string } | null>(null);

    
    const [resolveDialog, setResolveDialog] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<any>(null);
    const [adminComment, setAdminComment] = useState('');
    const [generatedPassword, setGeneratedPassword] = useState('');

    
    const [newOrg, setNewOrg] = useState({
        organizerName: '', email: '', password: '',
        contactEmail: '', discordWebhookUrl: '', category: '', description: ''
    });

    useEffect(() => {
        fetchOrganizers();
        fetchPasswordResets();
    }, []);

    const fetchOrganizers = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/admin/organizers', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrganizers(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchPasswordResets = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/admin/password-resets', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPasswordResets(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateOrganizer = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/admin/organizers', newOrg, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            setCreatedCredentials({
                email: res.data.email,
                password: res.data.generatedPassword,
            });
            fetchOrganizers();
            setNewOrg({ organizerName: '', email: '', password: '', contactEmail: '', discordWebhookUrl: '', category: '', description: '' });
        } catch (error) {
            alert("Failed to create organizer");
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/organizers/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchOrganizers();
        } catch (error) {
            alert("Failed to delete");
        }
    };

    const handleResolve = async (status: string) => {
        if (!selectedRequest) return;
        const token = localStorage.getItem('token');
        try {
            const res = await axios.put(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/password-resets/${selectedRequest._id}`, { status, adminComments: adminComment }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (status === 'Approved') {
                setGeneratedPassword(res.data.request.newPassword);
            } else {
                setResolveDialog(false);
                setAdminComment('');
                setSelectedRequest(null);
            }
            fetchPasswordResets();
        } catch (error) {
            alert("Failed to resolve request");
        }
    };

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="lg" sx={{ py: 5 }}>
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>Admin Dashboard</Typography>

                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={value} onChange={(e, v) => setValue(v)}>
                        <Tab label="Manage Clubs/Organizers" />
                        <Tab label="Password Reset Requests" />
                    </Tabs>
                </Box>

                <CustomTabPanel value={value} index={0}>
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="contained" startIcon={<PersonAddIcon />} onClick={() => { setOpenDialog(true); setCreatedCredentials(null); }}>
                            Add Organizer
                        </Button>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                <TableRow>
                                    <TableCell><strong>Name</strong></TableCell>
                                    <TableCell><strong>Email</strong></TableCell>
                                    <TableCell><strong>Category</strong></TableCell>
                                    <TableCell><strong>Discord Webhook?</strong></TableCell>
                                    <TableCell><strong>Actions</strong></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {organizers.map((org) => (
                                    <TableRow key={org._id}>
                                        <TableCell>{org.organizerName}</TableCell>
                                        <TableCell>{org.email}</TableCell>
                                        <TableCell>{org.category || '-'}</TableCell>
                                        <TableCell>
                                            {org.discordWebhookUrl ?
                                                <Typography color="success.main" variant="body2">Yes</Typography> :
                                                <Typography color="text.secondary" variant="body2">No</Typography>
                                            }
                                        </TableCell>
                                        <TableCell>
                                            <IconButton color="error" onClick={() => handleDelete(org._id, org.organizerName)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CustomTabPanel>

                <CustomTabPanel value={value} index={1}>
                    {passwordResets.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                            <Typography variant="h6">No password reset requests.</Typography>
                        </Paper>
                    ) : (
                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead sx={{ bgcolor: '#f1f5f9' }}>
                                    <TableRow>
                                        <TableCell><strong>Organizer Name</strong></TableCell>
                                        <TableCell><strong>Reason</strong></TableCell>
                                        <TableCell><strong>Status</strong></TableCell>
                                        <TableCell><strong>Date</strong></TableCell>
                                        <TableCell><strong>Actions</strong></TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {passwordResets.map((req) => (
                                        <TableRow key={req._id}>
                                            <TableCell>{req.organizerId?.organizerName}</TableCell>
                                            <TableCell>{req.reason}</TableCell>
                                            <TableCell>
                                                <Typography color={req.status === 'Pending' ? 'warning.main' : req.status === 'Approved' ? 'success.main' : 'error.main'}>
                                                    {req.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                                            <TableCell>
                                                {req.status === 'Pending' && (
                                                    <Button variant="outlined" size="small" onClick={() => { setSelectedRequest(req); setResolveDialog(true); }}>
                                                        Resolve
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </CustomTabPanel>
            </Container>

            {}
            <Dialog open={openDialog} onClose={() => { setOpenDialog(false); setCreatedCredentials(null); }} fullWidth maxWidth="sm">
                <DialogTitle>Add New Organizer</DialogTitle>
                <DialogContent>
                    {createdCredentials ? (
                        <Box>
                            <Alert severity="success" sx={{ mb: 2 }}>Organizer created successfully!</Alert>
                            <Typography variant="body1" gutterBottom>Share these credentials with the organizer:</Typography>
                            <Box sx={{ p: 2, bgcolor: '#f1f5f9', borderRadius: 1, fontFamily: 'monospace', mb: 2 }}>
                                <Typography><strong>Email:</strong> {createdCredentials.email}</Typography>
                                <Typography><strong>Password:</strong> {createdCredentials.password}</Typography>
                            </Box>
                            <Alert severity="warning">Please copy and share these credentials securely. The password will not be shown again.</Alert>
                        </Box>
                    ) : (
                        <>
                            <TextField
                                margin="dense" label="Organizer Name *" fullWidth
                                value={newOrg.organizerName}
                                onChange={(e) => setNewOrg({ ...newOrg, organizerName: e.target.value })}
                            />
                            <TextField
                                margin="dense" label="Email (auto-generated if blank)" fullWidth
                                value={newOrg.email}
                                onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
                                helperText="Leave blank to auto-generate from organizer name"
                            />
                            <TextField
                                margin="dense" label="Password (auto-generated if blank)" type="password" fullWidth
                                value={newOrg.password}
                                onChange={(e) => setNewOrg({ ...newOrg, password: e.target.value })}
                                helperText="Leave blank to auto-generate a secure password"
                            />
                            <TextField
                                margin="dense" label="Category" fullWidth
                                value={newOrg.category}
                                onChange={(e) => setNewOrg({ ...newOrg, category: e.target.value })}
                            />
                            <TextField
                                margin="dense" label="Description" fullWidth multiline rows={2}
                                value={newOrg.description}
                                onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
                            />
                            <TextField
                                margin="dense" label="Contact Email (Optional)" fullWidth
                                value={newOrg.contactEmail}
                                onChange={(e) => setNewOrg({ ...newOrg, contactEmail: e.target.value })}
                            />
                            <TextField
                                margin="dense" label="Discord Webhook URL" fullWidth
                                helperText="Event notifications will be sent here"
                                value={newOrg.discordWebhookUrl}
                                onChange={(e) => setNewOrg({ ...newOrg, discordWebhookUrl: e.target.value })}
                            />
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {createdCredentials ? (
                        <Button variant="contained" onClick={() => { setOpenDialog(false); setCreatedCredentials(null); }}>Done</Button>
                    ) : (
                        <>
                            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                            <Button variant="contained" onClick={handleCreateOrganizer}>Create</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            {}
            <Dialog open={resolveDialog} onClose={() => { setResolveDialog(false); setGeneratedPassword(''); }} fullWidth maxWidth="sm">
                <DialogTitle>Resolve Password Reset</DialogTitle>
                <DialogContent>
                    {!generatedPassword ? (
                        <>
                            <Typography variant="body1" paragraph>
                                Review request from <strong>{selectedRequest?.organizerId?.organizerName}</strong>
                            </Typography>
                            <TextField
                                margin="dense" label="Admin Comments" fullWidth multiline rows={3}
                                value={adminComment} onChange={(e) => setAdminComment(e.target.value)}
                            />
                        </>
                    ) : (
                        <>
                            <Typography variant="h6" color="success.main" paragraph>Request Approved</Typography>
                            <Typography variant="body1">New Password for the organizer:</Typography>
                            <Box sx={{ p: 2, bgcolor: '#eee', borderRadius: 1, fontFamily: 'monospace', fontSize: '1.2rem', my: 2, textAlign: 'center' }}>
                                {generatedPassword}
                            </Box>
                            <Typography variant="caption" color="error">
                                Please share this password securely with the organizer. It will not be shown again.
                            </Typography>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    {!generatedPassword ? (
                        <>
                            <Button onClick={() => setResolveDialog(false)}>Cancel</Button>
                            <Button color="error" variant="outlined" onClick={() => handleResolve('Rejected')}>Reject</Button>
                            <Button color="success" variant="contained" onClick={() => handleResolve('Approved')}>Approve & Generate</Button>
                        </>
                    ) : (
                        <Button variant="contained" onClick={() => { setResolveDialog(false); setGeneratedPassword(''); setSelectedRequest(null); }}>Done</Button>
                    )}
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}
