"use client";
import React from 'react';
import Link from 'next/link';
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem, Avatar } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const isAuthenticated = typeof window !== 'undefined' && localStorage.getItem('token');
    const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    const user = userStr ? JSON.parse(userStr) : null;
    const userRole = user?.role;

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        }
        handleClose();
    };

    const getNavLinks = () => {
        if (!isAuthenticated || !userRole) return null;

        if (userRole === 'Participant') {
            return (
                <>
                    <Button color="inherit" component={Link} href="/dashboard">Dashboard</Button>
                    <Button color="inherit" component={Link} href="/events">Browse Events</Button>
                    <Button color="inherit" component={Link} href="/organizers">Clubs/Organizers</Button>
                </>
            );
        }

        if (userRole === 'Organizer') {
            return (
                <>
                    <Button color="inherit" component={Link} href="/organizer/dashboard">Dashboard</Button>
                    <Button color="inherit" component={Link} href="/organizer/events/create">Create Event</Button>
                    <Button color="inherit" component={Link} href="/organizer/profile">Profile</Button>
                </>
            );
        }

        if (userRole === 'Admin') {
            return (
                <>
                    <Button color="inherit" component={Link} href="/admin/dashboard">Dashboard</Button>
                </>
            );
        }

        return null;
    };

    const getProfileLink = () => {
        if (userRole === 'Organizer') return '/organizer/profile';
        if (userRole === 'Admin') return '/admin/dashboard';
        return '/profile';
    };

    return (
        <AppBar position="static" sx={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #3b82f6 100%)', boxShadow: 'none' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
                    <Link href="/" style={{ textDecoration: 'none', color: 'white' }}>
                        Fest event manager
                    </Link>
                </Typography>

                {isAuthenticated ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getNavLinks()}

                        <Button color="inherit" onClick={handleLogout} sx={{ ml: 1 }}>
                            Logout
                        </Button>

                        <Box>
                            <Avatar
                                onClick={handleMenu}
                                sx={{ cursor: 'pointer', bgcolor: 'secondary.main', width: 36, height: 36, fontSize: 14 }}
                            >
                                {user?.name?.charAt(0) || 'U'}
                            </Avatar>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleClose}
                            >
                                <MenuItem onClick={() => { router.push(getProfileLink()); handleClose(); }}>Profile</MenuItem>
                                <MenuItem onClick={handleLogout}>Logout</MenuItem>
                            </Menu>
                        </Box>
                    </Box>
                ) : (
                    <Box>
                        <Button color="inherit" component={Link} href="/login">Login</Button>
                        <Button variant="contained" color="secondary" sx={{ ml: 2, borderRadius: '20px' }} component={Link} href="/register">Sign Up</Button>
                    </Box>
                )}

            </Toolbar>
        </AppBar>
    );
}
