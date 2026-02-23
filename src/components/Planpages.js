import React, { useState, useEffect } from 'react';
import {
  Box, Modal, Typography, Button, TextField, Select, MenuItem, FormControl,
  InputLabel, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, IconButton, Chip, Stack, Alert, CircularProgress
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [theme, setTheme] = useState({});
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    client_id: '',
    trainer_id: '',
    plan_type: '5_days',
    start_date: '',
    end_date: '',
    start_time: '09:00',
    duration_minutes: 60,
    amount: '',
    payment_status: 'pending',
    auto_generate_sessions: true
  });

  // Fetch plans on mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${process.env.REACT_APP_URL}/api/plans`, {
        credentials: 'include'
      });
      const result = await response.json();
      if (result.success) {
        setPlans(result.plans);
      }
    } catch (err) {
      setError('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  const fetchTheme = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/api/theme`, {
        method: "GET",
        credentials: "include",
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        alert("Failed to load theme", "error");
        setTheme({});
      } else {
        setTheme({ ...(json.data || {}) });
      }
    } catch (err) {
      console.error(err);
      alert("Network error while loading theme", "error");
      setTheme({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreatePlan = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_URL}/api/plans/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert('Plan created successfully!');
      setOpenCreate(false);
      fetchPlans();
      setFormData({
        client_id: '',
        trainer_id: '',
        plan_type: '5_days',
        start_date: '',
        end_date: '',
        start_time: '09:00',
        duration_minutes: 60,
        amount: '',
        payment_status: 'pending',
        auto_generate_sessions: true
      });
    } catch (err) {
      alert(err.message);
    }
  };

  const handleUpdatePlan = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/plans/update/${selectedPlan.plan_id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            regenerate_sessions: false
          })
        }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert('Plan updated successfully!');
      setOpenEdit(false);
      fetchPlans();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this plan? This will also delete associated sessions.')) {
      return;
    }


    try {
      const response = await fetch(
        `${process.env.REACT_APP_URL}/api/plans/delete/${planId}`,
        { method: 'DELETE', credentials: 'include' }
      );

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      alert('Plan deleted successfully!');
      fetchPlans();
    } catch (err) {
      alert(err.message);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      trainer_id: '',
      plan_type: '5_days',
      start_date: '',
      end_date: '',
      start_time: '09:00',
      duration_minutes: 60,
      amount: '',
      payment_status: 'pending',
      auto_generate_sessions: true
    });
  };

  const handleEdit = (plan) => {
    setSelectedPlan(plan);
    setFormData({
      client_id: plan.client_id,
      trainer_id: plan.trainer_id,
      plan_type: plan.plan_type,
      start_date: plan.start_date,
      end_date: plan.end_date,
      start_time: '09:00', // Default, fetch from sessions if needed
      duration_minutes: plan.session_duration_minutes || 60,
      amount: plan.amount || '',
      payment_status: plan.payment_status,
      auto_generate_sessions: false
    });
    setOpenEdit(true);
  };

  const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '95vw', sm: '90vw', md: '600px' },
    maxHeight: '90vh',
    bgcolor: theme.app_bg,
    boxShadow: 24,
    borderRadius: 2,
    p: { xs: 2, sm: 4 },
    overflowY: 'auto'
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography sx={{ textAlign: "center", color: theme.text_color }} variant="h4" gutterBottom>Client Training Plans</Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{color:theme.text_color}}>
          Total Plans: {plans.length}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
          sx={{ backgroundColor: theme.primary_color, color: theme.text_color }}
        >
          Create Plan
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            maxHeight: 400,  // ✅ Fixed max height
            overflow: 'auto'  // ✅ Scrollable
          }}
        >
          <Table stickyHeader size='small'>  {/* ✅ FIXED HEADERS */}
            <TableHead>
              <TableRow>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Plan Type
                </TableCell>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Client
                </TableCell>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Trainer
                </TableCell>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Period
                </TableCell>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Duration
                </TableCell>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Amount
                </TableCell>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Status
                </TableCell>
                <TableCell sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: theme.primary_color, color: theme.text_color, fontWeight: 'bold' }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ backgroundColor: theme.app_bg, color: theme.text_color }}>
              {plans.map((plan) => (
                <TableRow sx={{ color: theme.text_color }} key={plan.plan_id} hover>
                  <TableCell>
                    <Chip
                      label={plan.plan_type === '5_days' ? '5 Days/Week' : '3 Days/Week'}
                      size="small"
                      sx={{ backgroundColor: theme.primary_color, color: theme.text_color }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: theme.text_color }}>{plan.client_name}</TableCell>
                  <TableCell sx={{ color: theme.text_color }}>{plan.trainer_name}</TableCell>
                  <TableCell sx={{ color: theme.text_color }}>
                    {plan.start_date} → {plan.end_date}
                  </TableCell>
                  <TableCell sx={{ color: theme.text_color }}>{plan.session_duration_minutes} min</TableCell>
                  <TableCell sx={{ color: theme.text_color }}>₹{plan.amount || '0'}</TableCell>
                  <TableCell sx={{ color: theme.text_color }}>
                    <Chip
                      label={plan.payment_status.toUpperCase()}
                      color={plan.payment_status === 'paid' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={() => handleEdit(plan)} color="primary">
                      <EditIcon sx={{ color: theme.primary_color }} />
                    </IconButton>
                    <IconButton onClick={() => handleDeletePlan(plan.plan_id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

      )}

      {/* CREATE PLAN MODAL */}
      <Modal open={openCreate} onClose={() => { setOpenCreate(false); resetForm(); }}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ color: theme.text_color }}>Create Training Plan</Typography>
            <IconButton onClick={() => { setOpenCreate(false); resetForm(); }}>
              <CloseIcon sx={{ color: theme.primary_color }} />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            <TextField
              label="Client ID *"
              name="client_id"
              value={formData.client_id}
              onChange={handleInputChange}
              sx={{
                // Input text color
                "& .MuiInputBase-input": {
                  color: theme.text_color,
                },

                // Label default
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.text_color,
                },

                // Outline default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },
              }}
              fullWidth
              required
            />
            <TextField
              label="Trainer ID *"
              name="trainer_id"
              value={formData.trainer_id}
              onChange={handleInputChange}
              sx={{
                // Input text color
                "& .MuiInputBase-input": {
                  color: theme.text_color,
                },

                // Label default
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.text_color,
                },

                // Outline default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },
              }}
              fullWidth
              required
            />
            <FormControl sx={{
              m: 1,
              minWidth: 120,

              // 🔹 Underline default
              "& .MuiInput-underline:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline hover
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline focused
              "& .MuiInput-underline:after": {
                borderBottomColor: theme.text_color,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },
              m: 1, minWidth: 120
            }} fullWidth>
              <InputLabel sx={{
                color: theme.text_color,
                "&.Mui-focused": {
                  color: theme.text_color,
                },
              }}>Plan Type *</InputLabel>
              <Select name="plan_type" value={formData.plan_type} onChange={handleInputChange} sx={{
                // 🔹 Selected text color
                "& .MuiSelect-select": {
                  color: theme.text_color,
                },

                // 🔹 Dropdown arrow color
                "& .MuiSvgIcon-root": {
                  color: theme.text_color,
                },
              }}>
                <MenuItem value="5_days">5 Days/Week</MenuItem>
                <MenuItem value="3_days">3 Days/Week</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date *"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                sx={{
                      minWidth: 160,

                      // 🔹 Label
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.text_color,
                      },

                      // 🔹 Input text
                      "& .MuiOutlinedInput-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Chrome fix (important for date input)
                      "& input": {
                        WebkitTextFillColor: theme.text_color,
                      },

                      // 🔹 Default border
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Hover border
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Focus border
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                        borderWidth: 2,
                      },

                      // 🔹 Calendar icon color (important)
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                          ? "invert(1)"
                          : "invert(0)",
                        cursor: "pointer",
                      },

                      // 🔹 Smooth transition
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                      },
                    }}
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date *"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                sx={{
                      minWidth: 160,

                      // 🔹 Label
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.text_color,
                      },

                      // 🔹 Input text
                      "& .MuiOutlinedInput-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Chrome fix (important for date input)
                      "& input": {
                        WebkitTextFillColor: theme.text_color,
                      },

                      // 🔹 Default border
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Hover border
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Focus border
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                        borderWidth: 2,
                      },

                      // 🔹 Calendar icon color (important)
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                          ? "invert(1)"
                          : "invert(0)",
                        cursor: "pointer",
                      },

                      // 🔹 Smooth transition
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                      },
                    }}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            {/* <TextField
              label="Session Start Time *"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleInputChange}
              required
              InputLabelProps={{ shrink: true }}
            /> */}
            <TextField
              label="Duration (minutes)"
              name="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={handleInputChange}
              sx={{
                // Input text color
                "& .MuiInputBase-input": {
                  color: theme.text_color,
                },

                // Label default
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.text_color,
                },

                // Outline default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },
              }}
            />
            <TextField label="Amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} sx={{
              // Input text color
              "& .MuiInputBase-input": {
                color: theme.text_color,
              },

              // Label default
              "& .MuiInputLabel-root": {
                color: theme.text_color,
              },

              // Label when focused
              "& .MuiInputLabel-root.Mui-focused": {
                color: theme.text_color,
              },

              // Outline default
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },

              // Outline hover
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },

              // Outline focused
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },
            }} />
            <FormControl sx={{
              m: 1,
              minWidth: 120,

              // 🔹 Underline default
              "& .MuiInput-underline:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline hover
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline focused
              "& .MuiInput-underline:after": {
                borderBottomColor: theme.text_color,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },
              m: 1, minWidth: 120
            }} fullWidth>
              <InputLabel sx={{
                color: theme.text_color,
                "&.Mui-focused": {
                  color: theme.text_color,
                },
              }}>Payment Status</InputLabel>
              <Select name="payment_status" value={formData.payment_status} onChange={handleInputChange} sx={{
                // 🔹 Selected text color
                "& .MuiSelect-select": {
                  color: theme.text_color,
                },

                // 🔹 Dropdown arrow color
                "& .MuiSvgIcon-root": {
                  color: theme.text_color,
                },
              }}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button onClick={() => { setOpenCreate(false); resetForm(); }} variant="outlined" sx={{color:theme.primary_color,borderColor:theme.primary_color}}>
              Cancel
            </Button>
            <Button onClick={handleCreatePlan} variant="contained" sx={{ backgroundColor: theme.primary_color, color: theme.text_color }}>
              Create Plan
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* EDIT PLAN MODAL */}
      <Modal open={openEdit} onClose={() => setOpenEdit(false)}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{color:theme.text_color}}>Edit Plan</Typography>
            <IconButton onClick={() => setOpenEdit(false)}>
              <CloseIcon sx={{color:theme.primary_color}} />
            </IconButton>
          </Box>

          <Stack spacing={2}>
            {/* Same form fields as create modal */}
            <TextField label="Client ID" name="client_id" value={formData.client_id} onChange={handleInputChange} sx={{
                // Input text color
                "& .MuiInputBase-input": {
                  color: theme.text_color,
                },

                // Label default
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.text_color,
                },

                // Outline default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },
              }} fullWidth />
            <TextField label="Trainer ID" name="trainer_id" value={formData.trainer_id} onChange={handleInputChange} sx={{
                // Input text color
                "& .MuiInputBase-input": {
                  color: theme.text_color,
                },

                // Label default
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.text_color,
                },

                // Outline default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },
              }} fullWidth />
            <FormControl sx={{
              m: 1,
              minWidth: 120,

              // 🔹 Underline default
              "& .MuiInput-underline:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline hover
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline focused
              "& .MuiInput-underline:after": {
                borderBottomColor: theme.text_color,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },
              m: 1, minWidth: 120
            }} fullWidth>
              <InputLabel sx={{
                color: theme.text_color,
                "&.Mui-focused": {
                  color: theme.text_color,
                },
              }}>Plan Type *</InputLabel>
              <Select name="plan_type" value={formData.plan_type} onChange={handleInputChange} sx={{
                // 🔹 Selected text color
                "& .MuiSelect-select": {
                  color: theme.text_color,
                },

                // 🔹 Dropdown arrow color
                "& .MuiSvgIcon-root": {
                  color: theme.text_color,
                },
              }}>
                <MenuItem value="5_days">5 Days/Week</MenuItem>
                <MenuItem value="3_days">3 Days/Week</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Start Date *"
                name="start_date"
                type="date"
                value={formData.start_date}
                onChange={handleInputChange}
                sx={{
                      minWidth: 160,

                      // 🔹 Label
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.text_color,
                      },

                      // 🔹 Input text
                      "& .MuiOutlinedInput-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Chrome fix (important for date input)
                      "& input": {
                        WebkitTextFillColor: theme.text_color,
                      },

                      // 🔹 Default border
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Hover border
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Focus border
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                        borderWidth: 2,
                      },

                      // 🔹 Calendar icon color (important)
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                          ? "invert(1)"
                          : "invert(0)",
                        cursor: "pointer",
                      },

                      // 🔹 Smooth transition
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                      },
                    }}
                required
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="End Date *"
                name="end_date"
                type="date"
                value={formData.end_date}
                onChange={handleInputChange}
                sx={{
                      minWidth: 160,

                      // 🔹 Label
                      "& .MuiInputLabel-root": {
                        color: theme.text_color,
                      },
                      "& .MuiInputLabel-root.Mui-focused": {
                        color: theme.text_color,
                      },

                      // 🔹 Input text
                      "& .MuiOutlinedInput-input": {
                        color: theme.text_color,
                      },

                      // 🔹 Chrome fix (important for date input)
                      "& input": {
                        WebkitTextFillColor: theme.text_color,
                      },

                      // 🔹 Default border
                      "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Hover border
                      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                      },

                      // 🔹 Focus border
                      "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        borderColor: theme.text_color,
                        borderWidth: 2,
                      },

                      // 🔹 Calendar icon color (important)
                      "& input[type='date']::-webkit-calendar-picker-indicator": {
                        filter: theme.app_bg === "#000000" || theme.app_bg === "black"
                          ? "invert(1)"
                          : "invert(0)",
                        cursor: "pointer",
                      },

                      // 🔹 Smooth transition
                      "& .MuiOutlinedInput-root": {
                        transition: "all 0.3s ease",
                      },
                    }}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            {/* <TextField
              label="Session Start Time *"
              name="start_time"
              type="time"
              value={formData.start_time}
              onChange={handleInputChange}
              required
              InputLabelProps={{ shrink: true }}
            /> */}
            <TextField
              label="Duration (minutes)"
              name="duration_minutes"
              type="number"
              value={formData.duration_minutes}
              onChange={handleInputChange}
              sx={{
                // Input text color
                "& .MuiInputBase-input": {
                  color: theme.text_color,
                },

                // Label default
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.text_color,
                },

                // Outline default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },
              }}
            />
            <TextField label="Amount" name="amount" type="number" value={formData.amount} onChange={handleInputChange} sx={{
                // Input text color
                "& .MuiInputBase-input": {
                  color: theme.text_color,
                },

                // Label default
                "& .MuiInputLabel-root": {
                  color: theme.text_color,
                },

                // Label when focused
                "& .MuiInputLabel-root.Mui-focused": {
                  color: theme.text_color,
                },

                // Outline default
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline hover
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },

                // Outline focused
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: theme.text_color,
                },
              }} />
            <FormControl sx={{
              m: 1,
              minWidth: 120,

              // 🔹 Underline default
              "& .MuiInput-underline:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline hover
              "& .MuiInput-underline:hover:before": {
                borderBottomColor: theme.text_color,
              },

              // 🔹 Underline focused
              "& .MuiInput-underline:after": {
                borderBottomColor: theme.text_color,
              },
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.text_color,
              },
              m: 1, minWidth: 120
            }} fullWidth>
              <InputLabel sx={{
                color: theme.text_color,
                "&.Mui-focused": {
                  color: theme.text_color,
                },
              }}>Payment Status</InputLabel>
              <Select name="payment_status" value={formData.payment_status} onChange={handleInputChange} sx={{
                // 🔹 Selected text color
                "& .MuiSelect-select": {
                  color: theme.text_color,
                },

                // 🔹 Dropdown arrow color
                "& .MuiSvgIcon-root": {
                  color: theme.text_color,
                },
              }}>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
              </Select>
            </FormControl>
            {/* ... rest of form fields same as create modal */}
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
            <Button onClick={() => setOpenEdit(false)} variant="outlined" sx={{color:theme.primary_color,borderColor:theme.primary_color}}>Cancel</Button>
            <Button onClick={handleUpdatePlan} variant="contained" sx={{ backgroundColor: theme.primary_color, color: theme.text_color }}>
              Update Plan
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default PlansPage;
