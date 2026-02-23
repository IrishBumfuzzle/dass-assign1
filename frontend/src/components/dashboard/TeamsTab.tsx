"use client";
import React, { useEffect, useState } from 'react';
import { Box, Typography, Card, CardContent, Grid, Button, Dialog, DialogTitle, DialogContent, TextField, List, ListItem, ListItemText, Chip } from '@mui/material';
import axios from 'axios';
import io from 'socket.io-client';

const socket = io("http://localhost:5000");

export default function TeamsTab() {
    const [teams, setTeams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Chat State
    const [chatOpen, setChatOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState<any>(null);
    const [messages, setMessages] = useState<any[]>([]);
    const [messageInput, setMessageInput] = useState("");
    const [currentUser, setCurrentUser] = useState<any>(null);

    // Online & Typing State
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
    const [fileBase64, setFileBase64] = useState<string | null>(null);

    useEffect(() => {
        fetchTeams();
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const parsedUser = JSON.parse(userStr);
            setCurrentUser(parsedUser);
            socket.emit("userOnline", parsedUser._id || parsedUser.id);
        }

        socket.on("receiveMessage", (message) => {
            setMessages((prev) => [...prev, message]);
            setTypingUsers([]); // Reset typing on message received
        });

        socket.on("updateOnlineUsers", (users) => {
            setOnlineUsers(users);
        });

        socket.on("userTyping", (data) => {
            if (data.isTyping) {
                setTypingUsers(prev => prev.includes(data.userName) ? prev : [...prev, data.userName]);
            } else {
                setTypingUsers(prev => prev.filter(u => u !== data.userName));
            }
        });

        return () => {
            socket.off("receiveMessage");
            socket.off("updateOnlineUsers");
            socket.off("userTyping");
        };
    }, []);

    const fetchTeams = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get('http://localhost:5000/api/teams/my-teams', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeams(res.data);
        } catch (error) {
            console.error("Failed to fetch teams");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenChat = async (team: any) => {
        setSelectedTeam(team);
        setChatOpen(true);
        socket.emit("joinTeamRoom", team._id);

        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`http://localhost:5000/api/teams/${team._id}/chat`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessages(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleSendMessage = () => {
        if ((!messageInput.trim() && !fileBase64) || !selectedTeam || !currentUser) return;

        const data = {
            teamId: selectedTeam._id,
            senderId: currentUser._id || currentUser.id,
            senderName: currentUser.name,
            text: messageInput || "Sent a file",
            fileUrl: fileBase64
        };

        socket.emit("sendMessage", data);
        socket.emit("stopTyping", { teamId: selectedTeam._id, userName: currentUser.name });
        setMessageInput("");
        setFileBase64(null);
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessageInput(e.target.value);
        if (selectedTeam && currentUser) {
            if (e.target.value.trim() !== '') {
                socket.emit("typing", { teamId: selectedTeam._id, userName: currentUser.name });
            } else {
                socket.emit("stopTyping", { teamId: selectedTeam._id, userName: currentUser.name });
            }
        }
    };

    if (loading) return <Typography>Loading teams...</Typography>;

    if (teams.length === 0) return (
        <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">You are not a part of any teams.</Typography>
        </Box>
    );

    return (
        <Box>
            <Grid container spacing={3}>
                {teams.map((team) => (
                    <Grid item xs={12} sm={6} md={4} key={team._id}>
                        <Card elevation={2}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold">{team.teamName}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    Event: {team.eventId?.name}
                                </Typography>
                                <Chip
                                    label={team.isComplete ? "Team Complete" : `Waiting for members (${team.members.length}/${team.maxTeamSize})`}
                                    color={team.isComplete ? "success" : "warning"}
                                    size="small"
                                    sx={{ mb: 2 }}
                                />

                                {!team.isComplete && (
                                    <Box sx={{ mb: 2, p: 1, bgcolor: '#f1f5f9', borderRadius: 1 }}>
                                        <Typography variant="caption" display="block">Invite Code:</Typography>
                                        <Typography variant="body1" fontWeight="bold" sx={{ fontFamily: 'monospace' }}>
                                            {team.inviteCode}
                                        </Typography>
                                    </Box>
                                )}

                                <Typography variant="subtitle2" gutterBottom>Members:</Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                                    {team.members.map((m: any) => {
                                        const isOnline = onlineUsers.includes(m.participantId._id);
                                        return (
                                            <Chip
                                                key={m._id}
                                                label={`${m.participantId.firstName} ${m.participantId.lastName}`}
                                                size="small"
                                                variant="outlined"
                                                color={isOnline ? "success" : "default"}
                                            />
                                        )
                                    })}
                                </Box>

                                <Button variant="contained" fullWidth onClick={() => handleOpenChat(team)}>
                                    Team Chat
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Chat Dialog */}
            <Dialog open={chatOpen} onClose={() => setChatOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Team Chat: {selectedTeam?.teamName}
                </DialogTitle>
                <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
                    <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
                        {messages.length === 0 ? (
                            <Typography color="text.secondary" textAlign="center" sx={{ mt: 4 }}>No messages yet. Start the conversation!</Typography>
                        ) : (
                            <List>
                                {messages.map((msg: any, i) => {
                                    const isMe = currentUser?._id === msg.senderId;
                                    return (
                                        <ListItem key={i} sx={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                                            <Box sx={{
                                                maxWidth: '70%',
                                                bgcolor: isMe ? 'primary.main' : '#f1f5f9',
                                                color: isMe ? 'white' : 'text.primary',
                                                p: 1.5,
                                                borderRadius: 2
                                            }}>
                                                <Typography variant="caption" display="block" sx={{ opacity: 0.8, mb: 0.5 }}>
                                                    {isMe ? 'You' : msg.senderName} • {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </Typography>
                                                <Typography variant="body1">{msg.text}</Typography>
                                                {msg.fileUrl && (
                                                    <Box sx={{ mt: 1 }}>
                                                        <img src={msg.fileUrl} alt="shared file" style={{ maxWidth: '100%', borderRadius: 4 }} />
                                                    </Box>
                                                )}
                                            </Box>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                        {typingUsers.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', ml: 2 }}>
                                {typingUsers.join(", ")} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                            </Typography>
                        )}
                    </Box>

                    {fileBase64 && (
                        <Box sx={{ mb: 1 }}>
                            <Chip label="Image Attached" color="success" size="small" onDelete={() => setFileBase64(null)} />
                        </Box>
                    )}

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button component="label" variant="outlined" sx={{ minWidth: 0, px: 2 }}>
                            📎
                            <input type="file" hidden accept="image/*" onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setFileBase64(reader.result as string);
                                    reader.readAsDataURL(file);
                                }
                            }} />
                        </Button>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Type a message..."
                            value={messageInput}
                            onChange={handleTyping}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                        />
                        <Button variant="contained" onClick={handleSendMessage} disabled={!messageInput.trim() && !fileBase64}>Send</Button>
                    </Box>
                </DialogContent>
            </Dialog>
        </Box>
    );
}
