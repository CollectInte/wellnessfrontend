import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Button,
  TextField,
  Paper,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  useMediaQuery,
  colors,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import { COLORS } from "./Themes";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const Documents = () => {
  const isMobile = useMediaQuery("(max-width:900px)");

  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");

  const [file, setFile] = useState(null);
  const [previewMap, setPreviewMap] = useState({});

  const [openPreview, setOpenPreview] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
    const [theme, setTheme] = useState({});
    const [loading, setLoading] = useState(true);
  
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
              console.log("Theme loaded:", json.data);
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

  /* ================= FILE TYPE ================= */
  const isImage = (n) => /\.(jpg|jpeg|png|gif|webp)$/i.test(n);
  const isPdf = (n) => /\.pdf$/i.test(n);

  /* ================= FETCH DOCUMENTS ================= */
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await axios.get(`${process.env.REACT_APP_URL}/api/documents`, {
      withCredentials: true,
    });
    setDocuments(res.data);
  };

  /* ================= ROLES ================= */
  useEffect(() => {
    if (documents.length) {
      setRoles([...new Set(documents.map((d) => d.role))]);
    }
  }, [documents]);

  useEffect(() => {
    setFilteredDocs(
      roleFilter === "all"
        ? documents
        : documents.filter((d) => d.role === roleFilter)
    );
  }, [roleFilter, documents]);

  /* ================= PREVIEW CACHE ================= */
  const fetchPreview = async (id) => {
    const res = await axios.get(
      `${process.env.REACT_APP_URL}/api/documents/view/${id}`,
      { withCredentials: true, responseType: "blob" }
    );
    return URL.createObjectURL(res.data);
  };

  useEffect(() => {
    if (!documents.length) return;
    let mounted = true;

    (async () => {
      const map = {};
      for (const doc of documents) {
        if (isImage(doc.file_name) || isPdf(doc.file_name)) {
          try {
            map[doc.id] = await fetchPreview(doc.id);
          } catch {}
        }
      }
      if (mounted) setPreviewMap(map);
    })();

    return () => (mounted = false);
  }, [documents]);

  /* ================= PREVIEW MODAL ================= */
  const handleOpenPreview = async (doc) => {
    try {
      const url = await fetchPreview(doc.id);
      setPreviewUrl(url);
      setActiveDoc(doc);
      setOpenPreview(true);
    } catch {
      showAlert("Unable to load preview", "error");
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setActiveDoc(null);
    setOpenPreview(false);
  };

  /* ================= DELETE ================= */
  const deleteDocument = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      await axios.delete(
        `${process.env.REACT_APP_URL}/api/documents/client/${id}`,
        { withCredentials: true }
      );

      setDocuments((p) => p.filter((d) => d.id !== id));
      showAlert("Document deleted successfully", "success");
    } catch (err) {
      showAlert("Failed to delete document", "error");
    }
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!file) {
      showAlert("Please select a file first", "warning");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("file", file);

      await axios.post(
        `${process.env.REACT_APP_URL}/api/documents/upload`,
        fd,
        { withCredentials: true }
      );

      setFile(null);
      fetchDocuments();
      showAlert("File uploaded successfully", "success");
    } catch (err) {
      console.error(err);

      const status = err.response?.status;

      if (status === 413) {
        showAlert("File too large. Maximum allowed size is 20 MB.", "error");
        return;
      }

      if (status === 400) {
        showAlert(
          err.response?.data?.message ||
            "Invalid request. Please check your input.",
          "warning",
        );
        return;
      }

      if (status === 401 || status === 403) {
        showAlert("Session expired. Please login again.", "error");
        // navigate("/login");
        return;
      }

      if (status === 404) {
        showAlert("Requested resource not found.", "info");
        return;
      }

      if (status === 500) {
        showAlert("Server error. Please try again later.", "error");
        return;
      }

      // Network / unknown error
      showAlert("Network error. Please check your connection.", "error");
    }
  };

  const [openUpload, setOpenUpload] = useState(false);

  const UploadContent = () => (
    <>
      <Typography
        sx={{
          fontSize: "18px",
          color: theme.text_color,
        }}
        fontWeight={600}
      >
        Upload New File
      </Typography>

      <Box
        mt={2}
        py={8}
        border="2px dashed"
        borderColor="divider"
        borderRadius={2}
        sx={{ cursor: "pointer" }}
        onDrop={(e) => {
          e.preventDefault();
          setFile(e.dataTransfer.files[0]);
        }}
        onClick={() => document.getElementById("fileInput").click()}
      >
        <UploadFileIcon sx={{ fontSize: "2.5rem", color: theme.primary_color }} />

        <Typography mt={1} fontSize="14px" sx={{color:theme.text_color}}>
          <b>Click to browse Files</b>
        </Typography>

        {file && (
          <Typography fontSize="12px" pt={2} sx={{color:theme.text_color}}>
            {file.name}
          </Typography>
        )}
      </Box>

      <Button
        fullWidth
        variant="contained"
        sx={{ mt: 2, bgcolor: theme.primary_color }}
        disabled={!file}
        onClick={() => {
          handleUpload();
          setOpenUpload(false);
        }}
      >
        Upload File
      </Button>

      <input
        hidden
        id="fileInput"
        type="file"
        accept="image/*,application/pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />
    </>
  );

  /* ================= ALERT SECTION  ================= */
  const [alert, setAlert] = useState({
    open: false,
    message: "",
    severity: "success", // success | error | warning | info
  });

  const showAlert = (message, severity = "success") => {
    setAlert({ open: true, message, severity });
  };

  const closeAlert = () => {
    setAlert((prev) => ({ ...prev, open: false }));
  };

  const actionBtnStyle = {
    width: 32,
    height: 32,
    borderRadius: 1.5,
    backgroundColor: COLORS.activeBg,
    color: COLORS.primary,

    "&:hover": {
      backgroundColor: COLORS.softBg,
    },

    "&.Mui-disabled": {
      backgroundColor: COLORS.activeBg,
      color: "#9ca3af", // muted icon
      opacity: 1, // prevent MUI fade
      cursor: "not-allowed",
    },
  };

  return (
    <Box
      px={{ xs: "none", md: 1 }}
      sx={{
        pt: 3.7,
      }}
    >
      {/* ================= HEADER ================= */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 2,
          borderTopRightRadius: { xs: 80, md: 40 },
          borderBottomRightRadius: 0,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          mb: 3,
          width: { xs: "100%", md: "50%" },
          backgroundColor: theme.sidebar_bg, // teal background
          color: theme.text_color,
          height: { xs: "auto", md: "15vh" },
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: "18px",
            }}
            fontWeight={600}
            lineHeight={1.2}
          >
            Select Type
          </Typography>
          <Typography
            sx={{
              color: "rgba(255,255,255,0.8)",
              fontSize: "10px",
            }}
          >
            To see the uploaded documents of you & doctor
          </Typography>
        </Box>

        <TextField
          select
          size="small"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          sx={{
            minWidth: 120,
            minHeight: 15,
            mt: { xs: 1.5, md: 0 },
            backgroundColor: COLORS.texWhite,
            borderRadius: 2,
            borderTopRightRadius: { xs: 80, md: 30 },
            borderBottomRightRadius: 0,
            "& .MuiOutlinedInput-root": {
              // borderRadius: 2,
              borderRadius: 2,
              borderTopRightRadius: { xs: 80, md: 30 },
              borderBottomRightRadius: 0,
            },
          }}
        >
          <MenuItem value="all">All</MenuItem>
          {roles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </Paper>

      {/* ================= MAIN ================= */}
      <Box
        display="flex"
        gap={3}
        flexDirection={{ xs: "column", md: "row" }}
        sx={{
          height: { xs: 450, md: 440 },
        }} // adjust header height
      >
        {isMobile && (
          <Box textAlign="center">
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: theme.primary_color,
                borderRadius: 3,
                // py: 1.2,
              }}
              onClick={() => setOpenUpload(true)}
            >
              Upload Document
            </Button>
          </Box>
        )}
        {/* ================= LEFT ================= */}
        <Box
          sx={{
            position: "relative",
            flex: { xs: 0, md: 6 },
            height: {
              xs: 380, // 📱 fixed mobile height
              md: 430, // 💻 desktop
            },
            borderRight: { xs: "none", md: `6px solid ${theme.primary_color}` },
          }}
        >
          {/* 🔹 SCROLLABLE CONTENT */}
          <Box
            sx={{
              height: "100%",
              overflowY: "auto",
              p: 1,

              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, 1fr)", // 📱 2 cards per row
                md: "repeat(4, 1fr)", // 💻 4 cards
              },
              gap: 1.5,

              "&::-webkit-scrollbar": {
                width: 6,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: COLORS.primary,
                borderRadius: 3,
              },
            }}
          >
            {filteredDocs.length === 0 && (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  mt: 6,
                  color: theme.text_color,
                }}
              >
                <Typography fontSize="16px" fontWeight={600} sx={{color:theme.text_color}}>
                  No documents have been uploaded
                </Typography>
                <Typography fontSize="12px" sx={{color:theme.text_color}}>
                  Upload a document to see it listed here
                </Typography>
              </Box>
            )}

            {filteredDocs
              .slice()
              .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
              .map((doc) => (
                <Card
                  key={doc.id}
                  sx={{
                    borderRadius: 3,
                    boxShadow: 2,
                    height: {
                      xs: 180,
                      md: 210,
                    },
                    width: { xs: "100%", md: 150 },
                    border: `2px solid ${theme.sidebar_bg}`,
                    transition: "0.3s",

                    "@media (hover: hover)": {
                      "&:hover": {
                        boxShadow: 6,
                        transform: "translateY(-4px)",
                      },
                    },
                  }}
                >
                  <CardContent sx={{ p: 1 }}>
                    {/* PREVIEW */}
                    <Box
                      sx={{
                        height: {
                          xs: 70,
                          md: 100,
                        },
                        bgcolor: "grey.100",
                        borderRadius: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 1,
                        overflow: "hidden",
                      }}
                    >
                      {isImage(doc.file_name) ? (
                        <img
                          src={previewMap[doc.id]}
                          alt=""
                          style={{
                            maxWidth: "100%",
                            maxHeight: "100%",
                            objectFit: "contain",
                          }}
                        />
                      ) : isPdf(doc.file_name) ? (
                        <iframe
                          src={previewMap[doc.id]}
                          title="pdf"
                          style={{
                            width: "100%",
                            height: "100%",
                            border: 0,
                          }}
                        />
                      ) : null}
                    </Box>
                    <Tooltip
                      arrow
                      title={doc.file_name}
                      placement="bottom"
                      enterTouchDelay={0}
                      leaveTouchDelay={3000}
                    >
                      <Typography fontWeight={600} fontSize={13} noWrap>
                        {doc.file_name}
                      </Typography>
                    </Tooltip>

                    <Typography variant="caption" color="text.secondary">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </Typography>

                    {/* ACTIONS */}
                    <Box
                      display="flex"
                      gap={{ xs: 0.1, md: 1 }}
                      mt={1}
                      justifyContent="center"
                    >
                      <Tooltip title="View" arrow>
                        <IconButton
                          size="small"
                          sx={actionBtnStyle}
                          onClick={() => handleOpenPreview(doc)}
                        >
                          <VisibilityIcon fontSize="small" sx={{color:theme.primary_color}} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Download" arrow>
                        <IconButton
                          size="small"
                          sx={actionBtnStyle}
                          href={`${process.env.REACT_APP_URL}/api/documents/${doc.id}`}
                        >
                          <DownloadForOfflineIcon fontSize="small" sx={{color:theme.primary_color}} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete" arrow>
                        <IconButton
                          size="small"
                          sx={actionBtnStyle}
                          disabled={doc.role !== "client"}
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <DeleteIcon fontSize="small" sx={{color:theme.primary_color}} />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              ))}
          </Box>
        </Box>

        {/* ================= RIGHT ================= */}
        {!isMobile && (
          <Box
            sx={{
              flex: 3,
              borderRadius: 3,
              textAlign: "center",
              position: "sticky",
              top: 20,
            }}
          >
            <UploadContent />
          </Box>
        )}
      </Box>

      {/* ================= PREVIEW MODAL ================= */}
      <Dialog
        open={openPreview}
        onClose={handleClosePreview}
        fullWidth
        maxWidth="md"
        fullScreen={isMobile}
      >
        <DialogTitle>
          {activeDoc?.file_name}
          <IconButton
            onClick={handleClosePreview}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {previewUrl &&
            (isPdf(activeDoc?.file_name) ? (
              <iframe
                src={previewUrl}
                title="preview"
                style={{ width: "100%", height: "70vh", border: 0 }}
              />
            ) : (
              <img
                src={previewUrl}
                alt=""
                style={{
                  width: "100%",
                  maxHeight: "70vh",
                  objectFit: "contain",
                }}
              />
            ))}
        </DialogContent>
      </Dialog>

      {/* ================= Upload MODAL in Mobile ================= */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} fullWidth>
        <DialogContent>
          <IconButton
            onClick={() => setOpenUpload(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>

          <Box textAlign="center" pt={4}>
            <UploadContent />
          </Box>
        </DialogContent>
      </Dialog>

      <Snackbar
        open={alert.open}
        autoHideDuration={4000}
        onClose={closeAlert}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeAlert}
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Documents;
