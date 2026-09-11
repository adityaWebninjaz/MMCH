import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  IconButton,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CloudUpload as IconUpload,
  Check as IconCheck,
  Description as IconFileText,
  GetApp as IconDownload,
  Visibility as IconEye,
  Close as IconX
} from '@mui/icons-material';
import { getEmployeeDocuments, uploadEmployeeDocument, fetchDocumentBlob } from '../../Services/hrEmployeeService';

const DOCUMENT_SLOTS = [
  {
    key: 'APPOINTMENT_LETTER',
    aliases: ['APPOINTMENT_LETTER', 'APPOINTMENT', 'OFFER_LETTER'],
    title: 'Appointment Letter',
    subtitle: 'Max file size 10 MB · PDF/JPG/PNG format'
  },
  {
    key: 'ID_PROOF',
    aliases: ['ID_PROOF', 'AADHAAR', 'PAN', 'AADHAAR_PAN', 'ID_PROOF_AADHAAR_PAN'],
    title: 'ID Proof (Aadhaar / PAN)',
    subtitle: 'Max file size 10 MB · PDF, JPG, or PNG'
  },
  {
    key: 'PASSPORT',
    aliases: ['PASSPORT', 'PASSPORT_SIZE_PHOTOGRAPH', 'PASSPORT_PHOTO', 'PHOTOGRAPH', 'PHOTO'],
    title: 'Passport-size Photograph',
    subtitle: 'Max file size 10 MB · JPG/PNG (150×200px)'
  },
  {
    key: 'MARKSHEET_10TH',
    aliases: ['MARKSHEET_10TH', 'XTH_MARKSHEET', '10TH_MARKSHEET', '10_MARKSHEET'],
    title: 'Xth Marksheet',
    subtitle: 'Max file size 10 MB · PDF/JPG/PNG format'
  },
  {
    key: 'MARKSHEET_12TH',
    aliases: ['MARKSHEET_12TH', 'XIITH_MARKSHEET', '12TH_MARKSHEET', '12_MARKSHEET'],
    title: 'XIIth Marksheet',
    subtitle: 'Max file size 10 MB · PDF, JPG, or PNG'
  },
  {
    key: 'PASSBOOK',
    aliases: ['PASSBOOK', 'BANK_PASSBOOK'],
    title: 'Passbook',
    subtitle: 'Max file size 10 MB · JPG/PNG (150×200px)'
  },
  {
    key: 'CANCELLED_CHEQUE',
    aliases: ['CANCELLED_CHEQUE', 'CHEQUE'],
    title: 'Cancelled Cheque',
    subtitle: 'Max file size 10 MB · PDF/JPG/PNG format'
  }
];

const normalizeDocType = (typeStr) => {
  if (!typeStr || typeof typeStr !== 'string') return '';
  return typeStr.toUpperCase().replace(/[\s_-]+/g, '_');
};

const formatFileSize = (bytes) => {
  if (!bytes || isNaN(bytes) || Number(bytes) === 0) return '';
  const num = Number(bytes);
  if (num < 1024) return `${num} B`;
  if (num < 1024 * 1024) return `${(num / 1024).toFixed(1)} KB`;
  return `${(num / (1024 * 1024)).toFixed(1)} MB`;
};

const DocumentsTab = ({ employeeId, employee, documents }) => {
  const empId = employeeId || employee?.id || employee?.userId || employee?.employeeId || employee?.empId;
  const fileInputRefs = useRef({});

  const [loading, setLoading] = useState(false);
  const [apiDocuments, setApiDocuments] = useState([]);
  const [uploadingKey, setUploadingKey] = useState(null);

  // Preview Modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [previewBlobUrl, setPreviewBlobUrl] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Snackbar Toast
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const fetchDocuments = async () => {
    if (!empId) return;
    setLoading(true);
    try {
      const res = await getEmployeeDocuments(empId);
      if (res?.success && Array.isArray(res.data)) {
        setApiDocuments(res.data);
      } else {
        setApiDocuments([]);
      }
    } catch (err) {
      console.error('Failed to fetch employee documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [empId]);

  // Map API documents to slots or extra list
  const getDocumentMap = () => {
    const docMap = {};
    const extraDocs = [];

    const rawList = [];
    if (Array.isArray(apiDocuments) && apiDocuments.length > 0) {
      rawList.push(...apiDocuments);
    } else if (Array.isArray(documents) && documents.length > 0) {
      rawList.push(...documents);
    } else if (documents && typeof documents === 'object') {
      Object.keys(documents).forEach((key) => {
        rawList.push({
          doc_type: key,
          original_name: documents[key]?.name || `${key}.pdf`,
          file_url: documents[key]?.url || documents[key]?.file_url || ''
        });
      });
    }

    rawList.forEach((doc) => {
      const typeKey = doc.doc_type || doc.docType || doc.type || doc.name || '';
      const norm = normalizeDocType(typeKey);

      let matchedSlotKey = null;
      for (const slot of DOCUMENT_SLOTS) {
        if (slot.key === norm || slot.aliases.some((alias) => normalizeDocType(alias) === norm)) {
          matchedSlotKey = slot.key;
          break;
        }
      }

      if (matchedSlotKey) {
        docMap[matchedSlotKey] = doc;
      } else {
        extraDocs.push(doc);
      }
    });

    return { docMap, extraDocs };
  };

  const { docMap, extraDocs } = getDocumentMap();

  const handleFileSelect = async (slotKey, e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!empId) {
      showToast('Employee ID not found', 'error');
      return;
    }

    setUploadingKey(slotKey);
    try {
      const res = await uploadEmployeeDocument(empId, slotKey, file);
      if (res?.success) {
        showToast('Document uploaded successfully!', 'success');
        fetchDocuments();
      } else {
        showToast(res?.error || 'Failed to upload document', 'error');
      }
    } catch (err) {
      showToast('An error occurred during upload', 'error');
    } finally {
      setUploadingKey(null);
      if (e.target) e.target.value = '';
    }
  };

  const handleViewDocument = async (docItem, fallbackTitle) => {
    if (!docItem) return;
    const fileUrl = docItem.file_url || docItem.url || docItem.path;
    const title = docItem.original_name || fallbackTitle || docItem.doc_type || 'Document';

    setPreviewDoc({ ...docItem, title });
    setPreviewOpen(true);
    setPreviewLoading(true);
    setPreviewBlobUrl(null);

    if (fileUrl) {
      const blobUrl = await fetchDocumentBlob(fileUrl);
      if (blobUrl) {
        setPreviewBlobUrl(blobUrl);
      }
    }
    setPreviewLoading(false);
  };

  const handleDownloadDocument = async (docItem) => {
    if (!docItem) return;
    const fileUrl = docItem.file_url || docItem.url || docItem.path;
    const fileName = docItem.original_name || `${docItem.doc_type || 'document'}.pdf`;

    if (!fileUrl) {
      showToast('Document URL not available', 'error');
      return;
    }

    try {
      const blobUrl = await fetchDocumentBlob(fileUrl);
      if (blobUrl) {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        showToast('Failed to download document', 'error');
      }
    } catch (err) {
      showToast('Error downloading document', 'error');
    }
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewDoc(null);
    if (previewBlobUrl) {
      URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
          Uploaded Documents
        </Typography>
        {empId && (
          <Tooltip title="Refresh Documents">
            <IconButton size="small" onClick={fetchDocuments} disabled={loading}>
              <RefreshIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={32} sx={{ color: '#644EE5' }} />
        </Box>
      ) : (
        <Grid container spacing={2.5}>
          {DOCUMENT_SLOTS.map((slot) => {
            const uploadedDoc = docMap[slot.key];
            const isUploaded = !!uploadedDoc;
            const isUploading = uploadingKey === slot.key;

            const sizeText = uploadedDoc?.size_bytes ? formatFileSize(uploadedDoc.size_bytes) : '';
            const fileNameText = uploadedDoc?.original_name || (sizeText ? `Uploaded (${sizeText})` : 'Document Uploaded');

            return (
              <Grid item xs={12} sm={6} md={4} key={slot.key}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: isUploaded ? '#CBD5E1' : '#E2E8F0',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    bgcolor: isUploaded ? '#FAFAFA' : '#FFFFFF',
                    transition: 'all 0.2s ease-in-out',
                    minHeight: '74px',
                    boxSizing: 'border-box',
                    '&:hover': {
                      borderColor: '#94A3B8',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  {/* Left: Icon + Title & Subtitle */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '8px',
                        bgcolor: isUploaded ? '#DCFCE7' : '#F8FAFC',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid',
                        borderColor: isUploaded ? '#86EFAC' : '#E2E8F0'
                      }}
                    >
                      {isUploaded ? (
                        <IconCheck sx={{ fontSize: 18, color: '#16A34A' }} />
                      ) : (
                        <IconUpload sx={{ fontSize: 18, color: '#64748B' }} />
                      )}
                    </Box>

                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: '#0F172A',
                          lineHeight: 1.3
                        }}
                      >
                        {slot.title}
                      </Typography>
                      <Typography
                        noWrap
                        sx={{
                          fontSize: '11px',
                          color: isUploaded ? '#16A34A' : '#64748B',
                          lineHeight: 1.3,
                          mt: 0.3
                        }}
                      >
                        {isUploaded ? fileNameText : slot.subtitle}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Right Action Button */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
                    <input
                      type="file"
                      ref={(el) => (fileInputRefs.current[slot.key] = el)}
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={(e) => handleFileSelect(slot.key, e)}
                    />

                    {isUploaded ? (
                      <>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<IconEye sx={{ fontSize: 16 }} />}
                          onClick={() => handleViewDocument(uploadedDoc, slot.title)}
                          sx={{
                            height: '32px',
                            px: 1.5,
                            fontSize: '12px',
                            fontWeight: 600,
                            textTransform: 'none',
                            borderRadius: '6px',
                            color: '#644EE5',
                            borderColor: '#644EE5',
                            bgcolor: '#FFFFFF',
                            '&:hover': {
                              bgcolor: '#F5F3FF',
                              borderColor: '#5038ED'
                            }
                          }}
                        >
                          View
                        </Button>
                        <Tooltip title="Download Document">
                          <IconButton
                            size="small"
                            onClick={() => handleDownloadDocument(uploadedDoc)}
                            sx={{ color: '#64748B', '&:hover': { color: '#0F172A', bgcolor: '#F1F5F9' } }}
                          >
                            <IconDownload sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        disabled={isUploading}
                        onClick={() => fileInputRefs.current[slot.key]?.click()}
                        sx={{
                          height: '32px',
                          px: 1.8,
                          fontSize: '12px',
                          fontWeight: 600,
                          textTransform: 'none',
                          borderRadius: '6px',
                          color: '#644EE5',
                          borderColor: '#E2E8F0',
                          bgcolor: '#FFFFFF',
                          '&:hover': {
                            borderColor: '#644EE5',
                            bgcolor: '#F5F3FF'
                          }
                        }}
                      >
                        {isUploading ? <CircularProgress size={14} color="inherit" /> : 'Upload'}
                      </Button>
                    )}
                  </Box>
                </Paper>
              </Grid>
            );
          })}

          {/* Extra uploaded documents that don't match standard 7 slots */}
          {extraDocs.map((doc, idx) => {
            const sizeText = doc.size_bytes ? formatFileSize(doc.size_bytes) : '';
            const docTitle = doc.original_name || doc.doc_type || `Document ${idx + 1}`;

            return (
              <Grid item xs={12} sm={6} md={4} key={doc.id || idx}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    border: '1px solid #CBD5E1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1.5,
                    bgcolor: '#FAFAFA',
                    minHeight: '74px',
                    boxSizing: 'border-box'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0, flex: 1 }}>
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: '8px',
                        bgcolor: '#DCFCE7',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        border: '1px solid #86EFAC'
                      }}
                    >
                      <IconFileText sx={{ fontSize: 18, color: '#16A34A' }} />
                    </Box>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography noWrap sx={{ fontSize: '13px', fontWeight: 600, color: '#0F172A' }}>
                        {docTitle}
                      </Typography>
                      <Typography noWrap sx={{ fontSize: '11px', color: '#16A34A', mt: 0.3 }}>
                        {sizeText ? `Uploaded (${sizeText})` : 'Uploaded'}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<IconEye sx={{ fontSize: 16 }} />}
                      onClick={() => handleViewDocument(doc, docTitle)}
                      sx={{
                        height: '32px',
                        px: 1.5,
                        fontSize: '12px',
                        fontWeight: 600,
                        textTransform: 'none',
                        borderRadius: '6px',
                        color: '#644EE5',
                        borderColor: '#644EE5',
                        bgcolor: '#FFFFFF',
                        '&:hover': { bgcolor: '#F5F3FF' }
                      }}
                    >
                      View
                    </Button>
                    <IconButton size="small" onClick={() => handleDownloadDocument(doc)}>
                      <IconDownload sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Document View Preview Dialog */}
      <Dialog open={previewOpen} onClose={handleClosePreview} maxWidth="md" fullWidth>
        <DialogTitle
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #E2E8F0'
          }}
        >
          <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
            {previewDoc?.title || 'Document Preview'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {previewDoc && (
              <IconButton size="small" onClick={() => handleDownloadDocument(previewDoc)} title="Download Document">
                <IconDownload sx={{ fontSize: 20 }} />
              </IconButton>
            )}
            <IconButton size="small" onClick={handleClosePreview}>
              <IconX sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '350px' }}>
          {previewLoading ? (
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={36} sx={{ color: '#644EE5', mb: 1.5 }} />
              <Typography sx={{ fontSize: '13px', color: '#64748B' }}>Loading document...</Typography>
            </Box>
          ) : previewBlobUrl ? (
            previewDoc?.mime_type?.includes('image') ||
            (previewDoc?.original_name && /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(previewDoc.original_name)) ? (
              <Box
                component="img"
                src={previewBlobUrl}
                alt={previewDoc?.title || 'Document Image'}
                sx={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  objectFit: 'contain',
                  borderRadius: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.1)'
                }}
              />
            ) : (
              <iframe
                src={previewBlobUrl}
                title={previewDoc?.title || 'Document PDF'}
                width="100%"
                height="550px"
                style={{ border: 'none', borderRadius: '8px' }}
              />
            )
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <IconFileText sx={{ fontSize: 48, color: '#94A3B8', mb: 1.5 }} />
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#334155', mb: 0.5 }}>
                Unable to preview document online
              </Typography>
              <Typography sx={{ fontSize: '12px', color: '#64748B', mb: 2 }}>
                You can download the document to view it on your device.
              </Typography>
              <Button
                variant="contained"
                startIcon={<IconDownload sx={{ fontSize: 16 }} />}
                onClick={() => handleDownloadDocument(previewDoc)}
                sx={{ bgcolor: '#644EE5', textTransform: 'none', '&:hover': { bgcolor: '#5038ED' } }}
              >
                Download Document
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #E2E8F0' }}>
          <Button onClick={handleClosePreview} variant="outlined" sx={{ textTransform: 'none', color: '#64748B', borderColor: '#CBD5E1' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Toast */}
      <Snackbar open={toast.open} autoHideDuration={4000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', fontWeight: 500 }}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

DocumentsTab.propTypes = {
  employeeId: PropTypes.string,
  employee: PropTypes.object,
  documents: PropTypes.oneOfType([PropTypes.array, PropTypes.object])
};

export default DocumentsTab;
