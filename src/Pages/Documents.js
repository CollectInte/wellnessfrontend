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
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import DownloadForOfflineIcon from "@mui/icons-material/DownloadForOffline";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CloseIcon from "@mui/icons-material/Close";
import axios from "axios";
import ServiceDocumentsDialog from "./ServiceDocumentsDialog";

const Documents = () => {
  const isMobile = useMediaQuery("(max-width:900px)");

  const [documents, setDocuments] = useState([]);
  const [roleFilter, setRoleFilter] = useState("all");
  const [roles, setRoles] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const [openPreview, setOpenPreview] = useState(false);
  const [activeDoc, setActiveDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [openservicesDocuments, setOpenServicesDocuments] = useState(false);
  const [previewMap, setPreviewMap] = useState({});

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    const res = await axios.get(
      `${process.env.REACT_APP_URL}/api/documents/client`,
      { withCredentials: true }
    );
    setDocuments(res.data);
  };

  const isImage = (n) => /\.(jpg|jpeg|png|gif|webp)$/i.test(n);
  const isPdf = (n) => /\.pdf$/i.test(n);

  /* ================= FILTER ================= */
  useEffect(() => {
    if (documents.length) {
      setRoles([...new Set(documents.map((d) => d.uploaded_by_role))]);
    }
  }, [documents]);

  useEffect(() => {
    setFilteredDocs(
      roleFilter === "all"
        ? documents
        : documents.filter((d) => d.uploaded_by_role === roleFilter)
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
    if (!documents || documents.length === 0) return;

    let isMounted = true; // prevent state update after unmount

    const loadPreviews = async () => {
      const map = {};

      for (const doc of documents) {
        if (isImage(doc.file_name) || isPdf(doc.file_name)) {
          try {
            const previewUrl = await fetchPreview(doc.id);
            if (previewUrl && isMounted) {
              map[doc.id] = previewUrl;
            }
          } catch (err) {
            // 404 or 403 → file missing or no access
            console.warn(
              `Preview not available for doc ${doc.id}`,
              err.response?.status
            );
          }
        }
      }

      if (isMounted) {
        setPreviewMap(map);
      }
    };

    loadPreviews();

    return () => {
      isMounted = false;
    };
  }, [documents]);


  /* ================= PREVIEW MODAL ================= */
  const handleOpenPreview = async (doc) => {
    const url = await fetchPreview(doc.id);
    setPreviewUrl(url);
    setActiveDoc(doc);
    setOpenPreview(true);
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

      // ✅ update UI only if delete succeeds
      setDocuments((p) => p.filter((d) => d.id !== id));
    } catch (err) {
      console.error("Delete failed:", err);

      alert(
        err.response?.data?.message ||
        "Unable to delete document. Please try again."
      );
    }
  };

  /* ================= UPLOAD ================= */
  const handleUpload = async () => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    await axios.post(`${process.env.REACT_APP_URL}/api/documents/upload`, fd, {
      withCredentials: true,
    });
    setFile(null);
    fetchDocuments();
  };

  return (
    <Box
      sx={{
        px: { xs: 0, md: 2 },
        py: { xs: 2, md: 4 },
        minHeight: "100vh",
      }}
    >
      {/* HEADER */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        alignItems="center"
        justifyContent="space-between"
        gap={2}
      >
        <Typography fontSize={{ xs: 22, md: 26 }} fontWeight={600}>
          Documents
        </Typography>

        <Box
          sx={{
            display: "flex",
            // border: "solid red 2px",
            flexDirection: { xs: "row", md: "row" },
            alignItems: "center",
            gap: 1,
          }}
        >
          <TextField
            select
            size="small"
            label="Uploaded By"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            sx={{
              minWidth: { xs: "50%", md: 180 },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            {roles.map((r) => (
              <MenuItem key={r} value={r}>
                {r} uploaded
              </MenuItem>
            ))}
          </TextField>

          <Button
            fullWidth
            sx={{
              bgcolor: "#2563eb",
              color: "#fff",
              fontSize: { xs: 10, md: 20 },
              width: { xs: "60%", md: "auto" },
            }}
            onClick={() => setOpenServicesDocuments(true)}
          >
            Documents Required
          </Button>
        </Box>
      </Box>

      {/* MAIN */}
      <Box
        mt={3}
        display="flex"
        flexDirection={{ xs: "column", md: "row" }}
        gap={3}
      >
        {/* LEFT */}
        <Paper
          sx={{
            flex: 8,
            bgcolor: "#EEF3FF",
            maxHeight: { xs: "50vh", md: "70vh" },
            overflowY: { xs: "auto", md: "auto" },
            p: 2,
          }}
        >
          <Box display="flex" flexWrap="wrap" gap={2}>
            {filteredDocs.map((doc) => (
              <Box key={doc.id} width={{ xs: "100%", sm: "48%", md: "31%" }}>
                <Card
                  sx={{
                    borderRadius: 3,
                    height: { xs: 280, md: 320 },
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <CardContent
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Tooltip title={doc.file_name}>
                        <Typography
                          fontWeight={600}
                          sx={{
                            maxWidth: 200,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            mx: "auto",
                          }}
                        >
                          {doc.file_name}
                        </Typography>
                      </Tooltip>

                      <IconButton
                        sx={{
                          color: "#2563eb",
                        }}
                        href={`${process.env.REACT_APP_URL}/api/documents/${doc.id}`}
                      >
                        <DownloadForOfflineIcon />
                      </IconButton>
                    </Box>
                    {(isImage(doc.file_name) || isPdf(doc.file_name)) && (
                      <Box
                        sx={{
                          height: { xs: 160, md: 200 },
                          // my: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          overflow: "hidden",
                          borderRadius: 2,
                          bgcolor: "#f8fafc",
                        }}
                      >
                        {isImage(doc.file_name) ? (
                          <Box
                            component="img"
                            src={previewMap[doc.id]}
                            alt=""
                            sx={{
                              maxWidth: "100%",
                              maxHeight: "100%",
                              objectFit: "contain",
                            }}
                          />
                        ) : (
                          <Box
                            sx={{
                              width: "100%",
                              height: "100%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <iframe
                              src={previewMap[doc.id]}
                              title="pdf"
                              style={{
                                width: "100%",
                                height: "100%",
                                border: "none",
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    )}

                    <Box
                      display="flex"
                      flexDirection="row" // ✅ ALWAYS row
                      alignItems="center"
                      justifyContent="space-between"
                      gap={1}
                      sx={{
                        my: 1,
                      }}
                    >
                      {/* PREVIEW */}
                      <IconButton
                        onClick={() => handleOpenPreview(doc)}
                        sx={{ color: "green" }}
                      >
                        <VisibilityIcon />
                      </IconButton>

                      {/* INFO */}
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column", // text stacked
                          flex: 1,
                          mx: 1,
                          minWidth: 0, // 🔥 VERY IMPORTANT for mobile
                        }}
                      >
                        <Typography
                          sx={{
                            fontSize: { xs: 13, md: 14 },
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          Uploaded by {doc.uploaded_by_role}
                        </Typography>

                        <Typography variant="caption" sx={{ color: "#6b7280" }}>
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </Typography>
                      </Box>

                      {/* DELETE */}
                      <Tooltip
                        title={
                          doc.uploaded_by_role === "client"
                            ? "Delete Document"
                            : "No access"
                        }
                      >
                        <span>
                          <IconButton
                            disabled={doc.uploaded_by_role !== "client"}
                            onClick={() => deleteDocument(doc.id)}
                            sx={{ color: "red" }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* RIGHT */}
        <Paper
          sx={{
            flex: 3,
            p: 2,
            border: "1px solid #2563eb",
          }}
        >
          <Typography
            textAlign="center"
            fontWeight={500}
            fontSize={{ xs: 18, md: 28 }}
          >
            Upload New File
          </Typography>

          <Box
            mt={2}
            p={3}
            border="2px dashed #ccc"
            borderRadius={2}
            textAlign="center"
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setFile(e.dataTransfer.files[0]);
            }}
            sx={{ cursor: "pointer" }}
            onClick={() => document.getElementById("fileInput").click()}
          >
            <UploadFileIcon fontSize="large" />
            <Typography>Drop or browse</Typography>
            {file && <Typography>{file.name}</Typography>}
          </Box>

          <Button
            fullWidth
            sx={{ mt: 2 }}
            variant="contained"
            disabled={!file}
            onClick={handleUpload}
          >
            Upload
          </Button>

          <input
            hidden
            id="fileInput"
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </Paper>
      </Box>

      {/* PREVIEW */}
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
                style={{ width: "100%", height: "70vh" }}
                title="preview"
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

      <ServiceDocumentsDialog
        open={openservicesDocuments}
        onClose={() => setOpenServicesDocuments(false)}
      />
    </Box>
  );
};

export default Documents;
