import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Chip,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import api from './services/api';

export default function UpcomingAppointments() {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoleBasedAppointments();
  }, []);

  const fetchRoleBasedAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/appointment/role-based');

      if (res.data?.success) {
        console.log('API Response:', res.data.appointments);
        const filteredAppts = getTodayAndUpcomingAppointments(res.data.appointments);
        console.log('Filtered Appointments:', filteredAppts);
        setAppointments(filteredAppts);
      }
    } catch (error) {
      console.error('Failed to fetch role-based appointments:', error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  // OPTION 1: Show all today's appointments + future appointments
  const getTodayAndUpcomingAppointments = (appointmentsList) => {
    if (!appointmentsList?.length) return [];

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    return appointmentsList
      .filter((apt) => {
        if (!apt.appointment_date) return false;

        const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];

        // Show today's appointments and future appointments
        return aptDate >= currentDate;
      })
      .sort((a, b) => {
        if (a.appointment_date !== b.appointment_date) {
          return a.appointment_date.localeCompare(b.appointment_date);
        }
        return a.from_time.localeCompare(b.from_time);
      });
  };

  // OPTION 2: Only show pending/assigned appointments (not completed)
  const getActiveAppointments = (appointmentsList) => {
    if (!appointmentsList?.length) return [];

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];

    return appointmentsList
      .filter((apt) => {
        if (!apt.appointment_date) return false;

        const aptDate = new Date(apt.appointment_date).toISOString().split('T')[0];

        // Show today's and future appointments that are not completed
        return aptDate >= currentDate && apt.status !== 'completed' && apt.status !== 'cancelled';
      })
      .sort((a, b) => {
        if (a.appointment_date !== b.appointment_date) {
          return a.appointment_date.localeCompare(b.appointment_date);
        }
        return a.from_time.localeCompare(b.from_time);
      });
  };

  const formatTime = (time) => {
    if (!time || typeof time !== 'string') return '-';

    const [hours, minutes] = time.split(':');
    if (!hours || !minutes) return '-';

    const date = new Date();
    date.setHours(hours, minutes);

    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return '#4caf50';
      case 'assigned':
        return '#2196f3';
      case 'pending':
        return '#ff9800';
      case 'cancelled':
        return '#f44336';
      default:
        return '#757575';
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 2 }}>
      <CardContent sx={{ p: { xs: 2, md: 2} }}>
        <Typography
          sx={{
            fontSize: { xs: '0.9rem', md: '1rem' },
            fontWeight: 600,
            color: '#1a9b8e',
            mb: 2,
          }}
        >
          Today's Appointments |
        </Typography>

        <TableContainer sx={{ maxHeight: { xs: 240, md: 300 } }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    bgcolor: '#f8fafb',
                    fontWeight: 600,
                    color: '#1a9b8e',
                    fontSize: { xs: 10, md: 12 },
                    p: 0.5,
                  }}
                >
                  #
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8fafb',
                    fontWeight: 600,
                    color: '#1a9b8e',
                    fontSize: { xs: 10, md: 12 },
                    p: 0.5,
                  }}
                >
                  Patient Name
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8fafb',
                    fontWeight: 600,
                    color: '#1a9b8e',
                    fontSize: { xs: 10, md: 12 },
                    p: 0.5,
                  }}
                >
                  Appointed for
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8fafb',
                    fontWeight: 600,
                    color: '#1a9b8e',
                    fontSize: { xs: 10, md: 12 },
                    p: 0.5,
                  }}
                >
                  Time
                </TableCell>
                <TableCell
                  sx={{
                    bgcolor: '#f8fafb',
                    fontWeight: 600,
                    color: '#1a9b8e',
                    fontSize: { xs: 10, md: 12 },
                    p: 0.5,
                  }}
                >
                  Status
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : appointments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No appointments today
                  </TableCell>
                </TableRow>
              ) : (
                appointments.map((apt, idx) => (
                  <TableRow key={apt.id}>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' }, p: 0.5 }}>
                      {idx + 1}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' }, p: 0.5 }}>
                      {apt.client_name}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' }, p: 0.5 }}>
                      {apt.purpose || '-'}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' }, p: 0.5 }}>
                      {formatTime(apt.from_time)} - {formatTime(apt.to_time)}
                    </TableCell>
                    <TableCell sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' }, p: 0.5 }}>
                      <Chip
                        label={apt.status}
                        size="small"
                        sx={{
                          bgcolor: getStatusColor(apt.status),
                          color: 'white',
                          fontSize: '0.65rem',
                          height: 20,
                          textTransform: 'capitalize',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography
            onClick={() => navigate('/receptionist/dashboard/appointments')}
            sx={{
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#1a9b8e',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Read more →
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}