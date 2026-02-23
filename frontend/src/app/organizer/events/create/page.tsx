"use client";
import React, { useState } from 'react';
import {
    Container, Typography, Box, Stepper, Step, StepLabel, Button,
    TextField, FormControl, InputLabel, Select, MenuItem,
    Grid, Paper, IconButton, FormControlLabel, Checkbox
} from '@mui/material';
import Navbar from '../../../../components/layout/Navbar';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

const steps = ['Basic Info', 'Details & Config', 'Review & Publish'];

interface CustomField {
    label: string;
    fieldType: string;
    options: string;
    required: boolean;
    order: number;
}

export default function CreateEvent() {
    const router = useRouter();
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Form State
    const [basicInfo, setBasicInfo] = useState({
        name: '', description: '', eventType: 'Normal',
        startDate: '', endDate: '', deadline: '',
        registrationLimit: '', fee: '', eligibility: 'Open to All',
        isTeamEvent: false, maxTeamSize: 1
    });

    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [merchDetails, setMerchDetails] = useState({ sizes: '', colors: '', stock: '', imageUrl: '', purchaseLimitPerParticipant: '1' });

    const handleNext = () => {
        if (activeStep === steps.length - 1) return; // Don't auto-submit
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const addCustomField = () => {
        setCustomFields([...customFields, { label: '', fieldType: 'text', options: '', required: false, order: customFields.length }]);
    };

    const updateCustomField = (index: number, field: string, value: any) => {
        const newFields: any = [...customFields];
        newFields[index][field] = value;
        setCustomFields(newFields);
    };

    const removeCustomField = (index: number) => {
        setCustomFields(customFields.filter((_, i) => i !== index).map((f, i) => ({ ...f, order: i })));
    };

    const moveField = (index: number, direction: 'up' | 'down') => {
        const newFields = [...customFields];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= newFields.length) return;
        [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
        setCustomFields(newFields.map((f, i) => ({ ...f, order: i })));
    };

    const handleSubmit = async (publishStatus: 'Draft' | 'Published') => {
        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const payload: any = {
                ...basicInfo,
                registrationLimit: Number(basicInfo.registrationLimit) || undefined,
                fee: Number(basicInfo.fee) || 0,
                status: publishStatus,
            };

            if (basicInfo.eventType === 'Normal') {
                payload.customFormFields = customFields.map((f) => ({
                    label: f.label,
                    fieldType: f.fieldType,
                    options: f.fieldType === 'dropdown' ? f.options.split(',').map(o => o.trim()) : [],
                    required: f.required,
                    order: f.order,
                }));
                if (basicInfo.isTeamEvent) {
                    payload.isTeamEvent = true;
                    payload.maxTeamSize = Number(basicInfo.maxTeamSize) || 1;
                }
            } else {
                payload.merchandiseDetails = {
                    sizes: merchDetails.sizes.split(',').map(s => s.trim()).filter(Boolean),
                    colors: merchDetails.colors.split(',').map(s => s.trim()).filter(Boolean),
                    stock: Number(merchDetails.stock),
                    imageUrl: merchDetails.imageUrl,
                    purchaseLimitPerParticipant: Number(merchDetails.purchaseLimitPerParticipant) || 1,
                };
            }

            await axios.post((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000') + '/api/events', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            router.push('/organizer/dashboard');
        } catch (error) {
            console.error("Failed to create event", error);
            alert("Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <React.Fragment>
            <Navbar />
            <Container maxWidth="md" sx={{ py: 5 }}>
                <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>Create New Event</Typography>

                <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                    {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <Paper sx={{ p: 4 }}>
                    {/* Step 1: Basic Info */}
                    {activeStep === 0 && (
                        <Grid container spacing={3}>
                            <Grid item xs={12}>
                                <TextField label="Event Name" fullWidth required value={basicInfo.name} onChange={e => setBasicInfo({ ...basicInfo, name: e.target.value })} />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField label="Description" multiline rows={3} fullWidth required value={basicInfo.description} onChange={e => setBasicInfo({ ...basicInfo, description: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Type</InputLabel>
                                    <Select value={basicInfo.eventType} label="Type" onChange={(e) => setBasicInfo({ ...basicInfo, eventType: e.target.value })}>
                                        <MenuItem value="Normal">Normal Event</MenuItem>
                                        <MenuItem value="Merchandise">Merchandise</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Eligibility</InputLabel>
                                    <Select value={basicInfo.eligibility} label="Eligibility" onChange={(e) => setBasicInfo({ ...basicInfo, eligibility: e.target.value })}>
                                        <MenuItem value="Open to All">Open to All</MenuItem>
                                        <MenuItem value="IIIT Only">IIIT Only</MenuItem>
                                        <MenuItem value="IIIT Students Only">IIIT Students Only</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Start Date" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={basicInfo.startDate} onChange={e => setBasicInfo({ ...basicInfo, startDate: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="End Date" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={basicInfo.endDate} onChange={e => setBasicInfo({ ...basicInfo, endDate: e.target.value })} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Registration Deadline" type="datetime-local" fullWidth InputLabelProps={{ shrink: true }} value={basicInfo.deadline} onChange={e => setBasicInfo({ ...basicInfo, deadline: e.target.value })} />
                            </Grid>
                        </Grid>
                    )}

                    {/* Step 2: Specific Config */}
                    {activeStep === 1 && (
                        <Box>
                            {basicInfo.eventType === 'Normal' ? (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Registration Constraints</Typography>
                                    <Grid container spacing={2} sx={{ mb: 3 }}>
                                        <Grid item xs={6}><TextField label="Limit (0 for unlimited)" type="number" fullWidth value={basicInfo.registrationLimit} onChange={e => setBasicInfo({ ...basicInfo, registrationLimit: e.target.value })} /></Grid>
                                        <Grid item xs={6}><TextField label="Fee (₹)" type="number" fullWidth value={basicInfo.fee} onChange={e => setBasicInfo({ ...basicInfo, fee: e.target.value })} /></Grid>
                                    </Grid>

                                    <Typography variant="h6" gutterBottom>Team Configuration</Typography>
                                    <Grid container spacing={2} sx={{ mb: 3, alignItems: 'center' }}>
                                        <Grid item xs={6}>
                                            <FormControl fullWidth>
                                                <InputLabel>Is Team Event?</InputLabel>
                                                <Select value={basicInfo.isTeamEvent ? 'Yes' : 'No'} label="Is Team Event?" onChange={(e) => setBasicInfo({ ...basicInfo, isTeamEvent: e.target.value === 'Yes' })}>
                                                    <MenuItem value="No">No (Individual)</MenuItem>
                                                    <MenuItem value="Yes">Yes</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                        {basicInfo.isTeamEvent && (
                                            <Grid item xs={6}>
                                                <TextField label="Max Team Size" type="number" fullWidth value={basicInfo.maxTeamSize} onChange={e => setBasicInfo({ ...basicInfo, maxTeamSize: Number(e.target.value) })} />
                                            </Grid>
                                        )}
                                    </Grid>

                                    <Typography variant="h6" gutterBottom>Custom Form Fields</Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        Define registration form fields. Use arrows to reorder.
                                    </Typography>
                                    {customFields.map((field, index) => (
                                        <Grid container spacing={1} key={index} sx={{ mb: 2, alignItems: 'center' }}>
                                            <Grid item xs={3}>
                                                <TextField label="Field Label" size="small" fullWidth value={field.label} onChange={e => updateCustomField(index, 'label', e.target.value)} />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Type</InputLabel>
                                                    <Select value={field.fieldType} label="Type" onChange={e => updateCustomField(index, 'fieldType', e.target.value)}>
                                                        <MenuItem value="text">Text</MenuItem>
                                                        <MenuItem value="number">Number</MenuItem>
                                                        <MenuItem value="email">Email</MenuItem>
                                                        <MenuItem value="dropdown">Dropdown</MenuItem>
                                                        <MenuItem value="checkbox">Checkbox</MenuItem>
                                                        <MenuItem value="file">File Upload</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            {field.fieldType === 'dropdown' && (
                                                <Grid item xs={2}>
                                                    <TextField label="Options (comma-sep)" size="small" fullWidth value={field.options} onChange={e => updateCustomField(index, 'options', e.target.value)} />
                                                </Grid>
                                            )}
                                            <Grid item xs={field.fieldType === 'dropdown' ? 2 : 4}>
                                                <FormControlLabel
                                                    control={<Checkbox checked={field.required} onChange={e => updateCustomField(index, 'required', e.target.checked)} />}
                                                    label="Required"
                                                />
                                            </Grid>
                                            <Grid item xs={3} sx={{ display: 'flex', gap: 0.5 }}>
                                                <IconButton size="small" onClick={() => moveField(index, 'up')} disabled={index === 0}><ArrowUpwardIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" onClick={() => moveField(index, 'down')} disabled={index === customFields.length - 1}><ArrowDownwardIcon fontSize="small" /></IconButton>
                                                <IconButton size="small" color="error" onClick={() => removeCustomField(index)}><DeleteIcon fontSize="small" /></IconButton>
                                            </Grid>
                                        </Grid>
                                    ))}
                                    <Button startIcon={<AddCircleIcon />} onClick={addCustomField}>Add Field</Button>
                                </Box>
                            ) : (
                                <Box>
                                    <Typography variant="h6" gutterBottom>Merchandise Details</Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}><TextField label="Sizes (comma separated, e.g. S, M, L)" fullWidth value={merchDetails.sizes} onChange={e => setMerchDetails({ ...merchDetails, sizes: e.target.value })} /></Grid>
                                        <Grid item xs={12}><TextField label="Colors (comma separated)" fullWidth value={merchDetails.colors} onChange={e => setMerchDetails({ ...merchDetails, colors: e.target.value })} /></Grid>
                                        <Grid item xs={4}><TextField label="Initial Stock" type="number" fullWidth value={merchDetails.stock} onChange={e => setMerchDetails({ ...merchDetails, stock: e.target.value })} /></Grid>
                                        <Grid item xs={4}><TextField label="Price (₹)" type="number" fullWidth value={basicInfo.fee} onChange={e => setBasicInfo({ ...basicInfo, fee: e.target.value })} /></Grid>
                                        <Grid item xs={4}><TextField label="Limit per Person" type="number" fullWidth value={merchDetails.purchaseLimitPerParticipant} onChange={e => setMerchDetails({ ...merchDetails, purchaseLimitPerParticipant: e.target.value })} /></Grid>
                                        <Grid item xs={12}><TextField label="Image URL" fullWidth value={merchDetails.imageUrl} onChange={e => setMerchDetails({ ...merchDetails, imageUrl: e.target.value })} /></Grid>
                                    </Grid>
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Step 3: Review & Publish */}
                    {activeStep === 2 && (
                        <Box>
                            <Typography variant="h6" gutterBottom>Review Event</Typography>
                            <Box sx={{ bgcolor: '#f8fafc', p: 3, borderRadius: 2 }}>
                                <Typography><strong>Name:</strong> {basicInfo.name}</Typography>
                                <Typography><strong>Type:</strong> {basicInfo.eventType}</Typography>
                                <Typography><strong>Eligibility:</strong> {basicInfo.eligibility}</Typography>
                                <Typography><strong>Fee:</strong> ₹{basicInfo.fee || 0}</Typography>
                                <Typography><strong>Start:</strong> {basicInfo.startDate}</Typography>
                                <Typography><strong>End:</strong> {basicInfo.endDate}</Typography>
                                <Typography><strong>Deadline:</strong> {basicInfo.deadline}</Typography>
                                {basicInfo.isTeamEvent && <Typography><strong>Team Size:</strong> {basicInfo.maxTeamSize}</Typography>}
                                {customFields.length > 0 && <Typography><strong>Custom Fields:</strong> {customFields.length} fields defined</Typography>}
                            </Box>

                            <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
                                <Button
                                    variant="outlined"
                                    size="large"
                                    onClick={() => handleSubmit('Draft')}
                                    disabled={loading}
                                >
                                    Save as Draft
                                </Button>
                                <Button
                                    variant="contained"
                                    size="large"
                                    onClick={() => handleSubmit('Published')}
                                    disabled={loading}
                                    sx={{ bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                                >
                                    {loading ? 'Publishing...' : 'Publish Event'}
                                </Button>
                            </Box>
                        </Box>
                    )}

                    {activeStep < 2 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            <Button disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>Back</Button>
                            <Button variant="contained" onClick={handleNext}>Next</Button>
                        </Box>
                    )}
                    {activeStep === 2 && (
                        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mt: 2 }}>
                            <Button onClick={handleBack}>Back to Edit</Button>
                        </Box>
                    )}
                </Paper>
            </Container>
        </React.Fragment>
    );
}
