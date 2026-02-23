import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import Autocomplete from "@mui/material/Autocomplete";

const DocumentsUploadModal = ({
  open,
  onClose,
  clients = [],
  activeClient = null,
  onSuccess,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientId, setClientId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ KEEP CLIENT IN SYNC
  useEffect(() => {
    if (open) {
      if (activeClient) {
        setClientId(activeClient.id);
      } else {
        setClientId("");
      }
      setSelectedFile(null);
      setError("");
    }
  }, [open, activeClient]);

  const handleUpload = async () => {
    if (!selectedFile || !clientId) {
      setError("Please select client and file");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("client_id", clientId);

    try {
      setLoading(true);
      setError("");

      await axios.post(
        `${process.env.REACT_APP_URL}/api/documents/upload`,
        formData,
        { withCredentials: true }
      );

      onSuccess?.();
      onClose();
    } catch {
      setError("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mx: 1,
        }}
      >
        <DialogTitle>Upload Document</DialogTitle>
        <IconButton onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <DialogContent>
        <Box
          sx={{
            border: "2px dashed #5A9BA5",
            borderRadius: 3,
            p: 4,
            textAlign: "center",
          }}
        >
          <FolderIcon sx={{ fontSize: 60, color: "#5A9BA5", mb: 1 }} />
          <Typography fontSize="0.95rem" color="text.secondary">
            Drop your documents or
          </Typography>

          <Button
            component="label"
            sx={{
              textTransform: "none",
              color: "#5A9BA5",
              fontWeight: 600,
              textDecoration: "underline",
              mb: 2,
            }}
          >
            Click to browse
            <input
              type="file"
              hidden
              onChange={(e) => setSelectedFile(e.target.files[0])}
            />
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Stack spacing={2}>
          <Box display="flex" flexDirection="column" gap={1}>
            <Autocomplete
              size="small"
              disabled={Boolean(activeClient)}
              options={clients}
              getOptionLabel={(option) =>
                option ? `PI - ${option.id} (${option.name})` : ""
              }
              value={
                activeClient
                  ? activeClient
                  : clients.find((c) => c.id === clientId) || null
              }
              onChange={(event, newValue) => {
                setClientId(newValue ? newValue.id : "");
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Patient"
                  placeholder="Search by name or ID"
                  variant="standard"
                />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <TextField
              size="small"
              variant="standard"
              disabled
              value={selectedFile?.name || "File Name"}
            />
          </Box>

          {error && (
            <Typography color="error" fontSize="0.85rem">
              {error}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={handleUpload}
            disabled={loading}
            sx={{
              bgcolor: "#5A9BA5",
              textTransform: "none",
              borderRadius: 2,
              py: 1.2,
              "&:hover": { bgcolor: "#4A8A94" },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Upload File"
            )}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default DocumentsUploadModal;
