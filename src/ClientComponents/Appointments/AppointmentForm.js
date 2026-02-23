import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  TextField,
  Button,
  Box,
  Typography,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  useMediaQuery,
  MenuItem,
  Divider,
  colors,
} from "@mui/material";
import dayjs from "dayjs";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import CommonCalendar from "../CommonCalendar";
import { COLORS } from "../Themes";
import { Backdrop, CircularProgress } from "@mui/material";

const AppointmentForm = ({ open, onClose, onSuccess }) => {
  const isMobile = useMediaQuery("(max-width:900px)");

  /* ---------------- STATE ---------------- */
  const [staff, setStaff] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctorsByBranch, setDoctorsByBranch] = useState([]);

  const [purpose, setPurpose] = useState("");
  const [selectedDate, setSelectedDate] = useState(dayjs());

  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [noSlots, setNoSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [errors, setErrors] = useState({});
  const [snack, setSnack] = useState({
    open: false,
    msg: "",
    type: "success",
  });

  const canShowSlots =
    selectedBranch && doctorId && selectedDate && !loadingSlots;

  /* ---------------- FETCH STAFF ---------------- */
  useEffect(() => {
    if (!open) return;

    const fetchStaff = async () => {
      try {
        const res = await axios.get(
          `${process.env.REACT_APP_URL}/api/staff/doctors/client`,
          { withCredentials: true },
        );
        console.log();

        const staffData = res?.data?.data || [];
        setStaff(staffData);

        const uniqueBranches = [
          ...new Set(
            staffData.filter((s) => s.branch).map((s) => s.branch.trim()),
          ),
        ];
        setBranches(uniqueBranches);
      } catch {
        setStaff([]);
        setBranches([]);
      }
    };

    fetchStaff();
  }, [open]);

  /* ---------------- FILTER DOCTORS ---------------- */
  useEffect(() => {
    if (!selectedBranch) {
      setDoctorsByBranch([]);
      setDoctorId("");
      return;
    }

    const doctors = staff.filter(
      (s) =>
        s.role === "doctor" &&
        s.status === 1 &&
        s.branch?.toLowerCase() === selectedBranch.toLowerCase(),
    );

    setDoctorsByBranch(doctors);
    setDoctorId("");

    if (doctors.length === 0) {
      showSnack("No doctors available for this branch", "info");
    }
  }, [selectedBranch, staff]);

  /* ---------------- FETCH SLOTS ---------------- */
  const fetchSlots = useCallback(async () => {
    if (!open || !selectedBranch || !doctorId || !selectedDate) return;

    try {
      setLoadingSlots(true);
      setNoSlots(false);
      setSlots([]);
      setSelectedSlot(null);

      const res = await axios.get(
        `${process.env.REACT_APP_URL}/api/staff/time-slots/unbooked/filter`,
        {
          params: {
            date: selectedDate.format("YYYY-MM-DD"),
            branch: selectedBranch,
            doctorId,
          },
          withCredentials: true,
        },
      );

      const slotList = Array.isArray(res?.data?.slots) ? res.data.slots : [];

      if (slotList.length === 0) {
        setNoSlots(true);
      } else {
        setSlots(slotList);
      }
    } catch {
      setNoSlots(true);
      setSlots([]);
      showSnack("Failed to load time slots", "error");
    } finally {
      setLoadingSlots(false);
    }
  }, [open, selectedDate, selectedBranch, doctorId]);

  useEffect(() => {
    fetchSlots();
  }, [fetchSlots]);

  /* ---------------- UTIL ---------------- */
  const formatTo12Hour = (time) =>
    dayjs(`${selectedDate.format("YYYY-MM-DD")} ${time}`).format("hh:mm A");

  const isSlotDisabled = (slot) => {
    if (selectedDate.isBefore(dayjs(), "day")) return true;

    if (selectedDate.isSame(dayjs(), "day")) {
      return dayjs(
        `${selectedDate.format("YYYY-MM-DD")} ${slot.slot_time_from}`,
      ).isBefore(dayjs());
    }
    return false;
  };

  const slotInstructionText = !selectedBranch
    ? "Please select a branch to continue"
    : !doctorId
      ? "Please select a doctor to view available slots"
      : "";

  /* ---------------- VALIDATION ---------------- */
  const validateForm = () => {
    const newErrors = {};

    if (!purpose.trim()) newErrors.purpose = "Purpose is required";
    if (!selectedBranch) newErrors.branch = "Select branch";
    if (!doctorId) newErrors.doctor = "Select doctor";
    if (!selectedSlot) newErrors.slot = "Select time slot";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      await axios.post(
        `${process.env.REACT_APP_URL}/appointment/appointment/request`,
        {
          doctorId,
          appointment_date: selectedDate.format("YYYY-MM-DD"),
          from_time: selectedSlot.slot_time_from,
          to_time: selectedSlot.slot_time_to,
          purpose: purpose.trim(),
          selected_branch: selectedBranch.trim(),
        },
        { withCredentials: true },
      );

      // CLOSE MODAL FIRST
      handleClose();

      // SHOW MESSAGE ON MAIN PAGE
      onSuccess?.({
        type: "success",
        msg: "Appointment booked successfully",
      });
    } catch {
      handleClose();

      onSuccess?.({
        type: "error",
        msg: "Booking failed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- CLOSE ---------------- */
  const handleClose = () => {
    setSelectedBranch("");
    setDoctorId("");
    setDoctorsByBranch([]);
    setPurpose("");
    setSelectedDate(dayjs());
    setSlots([]);
    setSelectedSlot(null);
    setErrors({});
    setNoSlots(false);
    setSnack({ open: false, msg: "", type: "success" });
    onClose();
  };

  const showSnack = (msg, type = "success") => {
    setSnack({ open: true, msg, type });
  };

  /* ---------------- UI ---------------- */
  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0, width: "100%" }}>
          <IconButton
            onClick={handleClose}
            sx={{
              color: COLORS.danger,
              position: "absolute",
              right: 12,
              top: { xs: 0, md: 12 },
            }}
          >
            <CloseIcon />
          </IconButton>

          <Box p={isMobile ? 1 : 1}>
            <Box
              display="flex"
              my={2}
              flexDirection={isMobile ? "column" : "row"}
              gap={3}
              justifyContent={"center"}
            >
              {/* LEFT */}
              <Box
                sx={{
                  flex: 0.4,
                }}
              >
                <Typography fontWeight={600} mb={1} textAlign={"center"}>
                  Select Date
                </Typography>

                <CommonCalendar
                  value={selectedDate}
                  onChange={setSelectedDate}
                  sx={{
                    width: "100%",
                  }}
                />
                <Typography variant="body2" color={COLORS.danger} mt={2}>
                  {slotInstructionText}
                </Typography>

                {canShowSlots && (
                  <>
                    <Typography fontWeight={600} mb={1}>
                      Available Time Slots
                    </Typography>

                    {loadingSlots && (
                      <Typography color="text.secondary">
                        Loading available slots...
                      </Typography>
                    )}

                    {noSlots && !loadingSlots && (
                      <Typography color="error">
                        No slots available for this date.
                      </Typography>
                    )}

                    {!loadingSlots && slots.length > 0 && (
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {slots.map((slot) => (
                          <Button
                            key={slot.id}
                            onClick={() => setSelectedSlot(slot)}
                            disabled={isSlotDisabled(slot)}
                            variant={
                              selectedSlot?.id === slot.id
                                ? "contained"
                                : "outlined"
                            }
                            sx={{
                              borderRadius: 20,
                              backgroundColor:
                                selectedSlot?.id === slot.id
                                  ? "#0f766e"
                                  : "#f3f4f6",
                              color:
                                selectedSlot?.id === slot.id
                                  ? "#fff"
                                  : "#0f766e",
                              border: "none",
                            }}
                          >
                            {formatTo12Hour(slot.slot_time_from)}
                          </Button>
                        ))}
                      </Box>
                    )}

                    {errors.slot && (
                      <Typography color="error" mt={1}>
                        {errors.slot}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
              {/* RIGHT */}
              {/* RIGHT – FORM */}
              <Box
                p={isMobile ? 2 : 0}
                sx={{
                  flex: 0.4,
                  backgroundColor: "#c7ded8",
                  borderRadius: 4,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: { xs: "100%", md: "100px" },
                }}
              >
                <Stack
                  spacing={2}
                  sx={{
                    mx: { xs: "1", md: 5 },
                  }}
                >
                  {/* BRANCH */}
                  <TextField
                    label="Purpose"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    error={!!errors.purpose}
                    helperText={errors.purpose}
                    fullWidth
                    size="small"
                  />
                  <TextField
                    select
                    label="Branch"
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    error={!!errors.branch}
                    helperText={errors.branch}
                    fullWidth
                    size="small"
                  >
                    {branches.map((branch) => (
                      <MenuItem key={branch} value={branch}>
                        {branch}
                      </MenuItem>
                    ))}
                  </TextField>
                  {/* DOCTOR */}
                  <TextField
                    select
                    label="Doctor"
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    disabled={!selectedBranch}
                    error={!!errors.doctor}
                    helperText={errors.doctor}
                    fullWidth
                    size="small"
                    sx={{
                      "& .MuiSelect-select": {
                        whiteSpace: "wrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                      },
                    }}
                  >
                    {doctorsByBranch.map((doc) => (
                      <MenuItem
                        key={doc.id}
                        value={doc.id}
                        sx={{
                          whiteSpace: "normal", // dropdown can wrap
                          wordBreak: "break-word",
                        }}
                      >
                        {doc.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  {/* SUBMIT */}
                  <Box textAlign="center">
                    <Button
                      onClick={handleSubmit}
                      disabled={!selectedSlot || submitting}
                      size="small"
                      sx={{
                        mt: 3,
                        backgroundColor: selectedSlot ? "#0f766e" : "#9ca3af",
                        color: "#fff",
                        borderRadius: "16px",
                        px: 3,
                        py: 0.6,
                        fontSize: "0.85rem",
                        textTransform: "capitalize",
                        cursor: submitting ? "not-allowed" : "pointer",
                        "&:hover": {
                          backgroundColor: selectedSlot ? "#115e59" : "#9ca3af",
                        },
                      }}
                    >
                      {submitting ? (
                        <CircularProgress size={18} sx={{ color: "#fff" }} />
                      ) : selectedSlot ? (
                        "Booking"
                      ) : (
                        "Select a slot to continue"
                      )}
                    </Button>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <Backdrop
          open={submitting}
          sx={{
            position: "absolute",
            zIndex: (theme) => theme.zIndex.modal + 1,
            backgroundColor: "rgba(255,255,255,0.8)",
          }}
        >
          <CircularProgress size={50} sx={{ color: "#0f766e" }} />
        </Backdrop>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snack.type}
          variant="filled"
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AppointmentForm;
