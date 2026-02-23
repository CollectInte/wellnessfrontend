import React, { useEffect, useState } from "react";
import api from "./services/api";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";

export default function ServiceDocumentsDialog({ open, onClose }) {
  const [services, setServices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const res = await api.get("/api/getcompliancetypes");
      setServices(res.data.data || []);
      console.log("services are",services);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

const handleServiceChange = async (e) => {
  const serviceId = e.target.value;
  setSelectedService(serviceId);
  setLoading(true);

  try {
    const res = await api.get("/api/getdocrequirements");

    const allDocs = res.data.data || [];

    // ✅ FILTER BY compliance_type_id
    const filteredDocs = allDocs.filter(
      (doc) => Number(doc.compliance_type_id) === Number(serviceId)
    );

    setDocuments(filteredDocs);
  } catch (err) {
    console.error("Failed to fetch documents", err);
  } finally {
    setLoading(false);
  }
};



  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
    >
     <DialogTitle
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  }}
>
  Service Document Requirements

  <IconButton
    edge="end"
    onClick={onClose}
    aria-label="close"
  >
    <CloseIcon />
  </IconButton>
</DialogTitle>


      <DialogContent>
        {/* Service Dropdown */}
        <FormControl fullWidth size="small" sx={{ mt: 1 }}>
          <InputLabel>Select Service</InputLabel>
          <Select
            label="Select Service"
            value={selectedService}
            onChange={handleServiceChange}
          >
            {Array.isArray(services) &&
                services.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                    {s.name}
                    </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Documents List */}
        <Box mt={3}>
          {loading && <CircularProgress size={24} />}

          {!loading && documents.length === 0 && selectedService && (
            <Typography fontSize={13} color="text.secondary">
              No documents required
            </Typography>
          )}

          {!loading && documents.length > 0 && (
            <List dense>
              {documents.map((doc) => (
                <ListItem key={doc.id}>
                  <ListItemIcon>
                    <DescriptionIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={doc.document_name}
                    secondary={doc.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
}
