'use client';

import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

const API_URL = process.env.REACT_APP_URL;

export default function Passwordrepository() {
    const [clients, setClients] = useState([]);
    const [repositories, setRepositories] = useState([]);
    const [selectedClient, setSelectedClient] = useState(null);

    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState({
        portalname: "",
        username: "",
        password: ""
    });

    /* ---------------- FETCH CLIENTS ---------------- */
    const fetchClients = async () => {
        const res = await fetch(process.env.REACT_APP_CLIENT_FETCH, {
            credentials: "include"
        });
        const data = await res.json();
        setClients(data.data);
    };

    /* ---------------- FETCH REPOSITORIES ---------------- */
    const fetchRepositories = async (clientId) => {
        const res = await fetch(
            `${API_URL}/api/repository/client/${clientId}`,
            { credentials: "include" }
        );
        const data = await res.json();
        setRepositories(data);
    };

    useEffect(() => {
        fetchClients();
    }, []);

    /* ---------------- VIEW REPOS ---------------- */
    const handleViewRepositories = (client) => {
        setSelectedClient(client);
        fetchRepositories(client.id);
    };

    /* ---------------- FORM ---------------- */
    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const openCreate = () => {
        setEditingId(null);
        setForm({ portalname: "", username: "", password: "" });
        setOpen(true);
    };

    const openEdit = (row) => {
        setEditingId(row.id);
        setForm({
            portalname: row.portalname,
            username: row.username,
            password: row.password
        });
        setOpen(true);
    };

    /* ---------------- SAVE ---------------- */
    const handleSubmit = async () => {
        const url = editingId
            ? `${API_URL}/api/repository/${editingId}`
            : `${API_URL}/api/repository`;

        const method = editingId ? "PUT" : "POST";

        await fetch(url, {
            method,
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...form,
                client_id: selectedClient.id   // 🔥 auto attach client
            })
        });

        setOpen(false);
        fetchRepositories(selectedClient.id);
    };

    /* ---------------- DELETE ---------------- */
    const handleDelete = async (id) => {
        if (!window.confirm("Delete this credential?")) return;

        await fetch(`${API_URL}/api/repository/${id}`, {
            method: "DELETE",
            credentials: "include"
        });

        fetchRepositories(selectedClient.id);
    };

    /* ---------------- UI ---------------- */
    return (
        <Box p={3} mt={15}>
            {!selectedClient ? (
                /* ============ CLIENT CARDS ============ */
                <Grid container spacing={2}>
                    {clients.length > 0 ? (
                        clients.map((client) => (
                            <Grid item xs={12} sm={6} md={4} key={client.id}>
                                <Typography variant="h5" gutterBottom>Clients</Typography>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{client.name}</Typography>
                                        <Typography color="textSecondary">ID: {client.id}</Typography>
                                        <Button
                                            variant="contained"
                                            sx={{ mt: 2, textTransform: 'none' }}
                                            onClick={() => handleViewRepositories(client)}
                                        >
                                            View Repositories
                                        </Button>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    ) : (<Typography variant="h5" gutterBottom>No Clients Found</Typography>)}

                </Grid>
            ) : (
                /* ============ REPOSITORY TABLE ============ */
                <>
                    <Box display="flex" justifyContent="space-between" mb={2}>
                        <Typography variant="h6">
                            Repositories — {selectedClient.name}
                        </Typography>

                        <Box>
                            <Button onClick={() => setSelectedClient(null)} sx={{ mr: 1 }}>
                               <ArrowBackIcon /> Back
                            </Button>
                            <Button variant="contained" sx={{ textTransform: 'none' }} onClick={openCreate}>
                                Add Credentials
                            </Button>
                        </Box>
                    </Box>

                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Portal</TableCell>
                                    <TableCell>Username</TableCell>
                                    <TableCell>Password</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>

                            <TableBody>
                                {repositories.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} align="center">
                                            No credentials found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    repositories.map((row) => (
                                        <TableRow key={row.id}>
                                            <TableCell>{row.portalname}</TableCell>
                                            <TableCell>{row.username}</TableCell>
                                            <TableCell>{row.password}</TableCell>
                                            <TableCell align="center">
                                                <IconButton onClick={() => openEdit(row)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton
                                                    color="error"
                                                    onClick={() => handleDelete(row.id)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}

            {/* ============ MODAL ============ */}
            <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
                <DialogTitle>
                    {editingId ? "Edit Credentials" : "Add Credentials"}
                </DialogTitle>

                <DialogContent>
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Portal Name"
                        name="portalname"
                        value={form.portalname}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Username"
                        name="username"
                        value={form.username}
                        onChange={handleChange}
                    />
                    <TextField
                        fullWidth
                        margin="dense"
                        label="Password"
                        name="password"
                        type="password"
                        value={form.password}
                        onChange={handleChange}
                    />
                </DialogContent>

                <DialogActions>
                    <Button sx={{ textTransform: 'none' }} onClick={() => setOpen(false)}>Cancel</Button>
                    <Button variant="contained" sx={{ textTransform: 'none' }} onClick={handleSubmit}>
                        {editingId ? "Update" : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
