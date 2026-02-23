import {
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  FormControl,
  Select,
  MenuItem,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { useState, useEffect, useMemo } from "react";
import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';

import ClientDocuments from "./ClientsDocuments";
import { ArrowRightIcon } from "@mui/x-date-pickers";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '0px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function ClientsCards({ data }) {
  const [selectedClient, setSelectedClient] = useState(null);
  const [open, setOpen] = React.useState(false);
  const [docs, setDocs] = useState([]);
  const [theme, setTheme] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedCompliance, setSelectedCompliance] = useState("");
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);


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



  useEffect(() => {
    if (open) fetchDocs();
  }, [open]);

  const fetchDocs = async () => {
    try {
      const res = await fetch(process.env.REACT_APP_DOCUMENTREQUIREMENT_ADMINFETCH);
      const json = await res.json();
      setDocs(json.data || []);
    } catch (err) {
      console.error("Failed to fetch docs", err);
    }
  };

  // -----------------------------
  // Unique compliance types
  // -----------------------------
  const complianceTypes = useMemo(() => {
    const map = new Map();
    docs.forEach((d) => {
      if (!map.has(d.compliance_type_id)) {
        map.set(d.compliance_type_id, d.compliance_type_name);
      }
    });
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [docs]);

  // -----------------------------
  // Filter documents by compliance
  // -----------------------------
  const filteredDocs = useMemo(() => {
    if (!selectedCompliance) return [];
    return docs.filter(
      (d) => d.compliance_type_id === selectedCompliance
    );
  }, [docs, selectedCompliance]);


  return (
    <>
      {!selectedClient ? (
        <Grid container spacing={2} p={2}>
          <Grid item size={12} mt={1}>
            <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', color: theme.text_color }}>
              Clients List
            </Typography>
          </Grid>
          {/* <Grid item size={12} sx={{ textAlign: "end" }}>
            <Button variant="outlined" onClick={handleOpen} >
              Documents Requirements Check
            </Button>
          </Grid> */}
          {data.map((client) => (
            <Grid item xs={12} md={4} key={client.client_id}>
              <Card sx={{ cursor: "pointer", backgroundColor: theme.sidebar_bg, color: theme.text_color }} onClick={() => setSelectedClient(client)}>
                <CardContent>
                  <Typography variant="h6" sx={{ color: theme.text_color }}>
                    <AccountCircleIcon sx={{ color: theme.text_color, fontSize: "24px" }} /> {client.client_name}
                  </Typography>

                  <Typography variant="body2" sx={{color:theme.text_color}}>
                    Client ID: {client.client_id}
                  </Typography>

                  <Typography variant="body2">
                    Documents: {client.documents.length}
                  </Typography>

                  <Button
                    sx={{ mt: 1, color: theme.text_color, textTransform: "none", fontSize: "100" }}
                    size="small"
                    onClick={() => setSelectedClient(client)}
                  >
                    View Documents <ArrowRightIcon />
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <ClientDocuments
          client={selectedClient}
          onBack={() => setSelectedClient(null)}
        />
      )}
      {/* <Modal open={open} onClose={handleClose}>
        <Box sx={style}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            📄 Document Requirements
          </Typography> */}

      {/* Compliance Dropdown */}
      {/* <FormControl fullWidth sx={{ mb: 3 }}>
            <Select
              displayEmpty
              value={selectedCompliance}
              onChange={(e) => setSelectedCompliance(e.target.value)}
            >
              <MenuItem value="">
                <em>Select Compliance Type</em>
              </MenuItem>
              {complianceTypes.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl> */}

      {/* Documents List */}
      {/* {selectedCompliance && (
            <>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                {filteredDocs.length === 0 ? (
                  <Typography>No documents found</Typography>
                ) : (
                  filteredDocs.map((doc, index) => (
                    <ListItem key={doc.id}>
                      <ListItemText
                        primary={`${index + 1}. ${doc.document_name}`}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </>
          )}
        </Box>
      </Modal> */}
    </>
  );
}
