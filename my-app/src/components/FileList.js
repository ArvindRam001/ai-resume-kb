import React, { useState, useEffect, useCallback } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Radio,
  Typography,
  Paper
} from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';

const FileList = ({ type, onFileSelect }, ref) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const endpoint = type === 'resume' ? '/api/resumes' : '/api/job-descriptions';
      const response = await fetch(`http://localhost:3003${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching files:', error);
      setFiles([]);
    }
  }, [type]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleView = (file) => {
    setSelectedFile(file);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      const endpoint = type === 'resume' ? '/api/resumes' : '/api/job-descriptions';
      const response = await fetch(`http://localhost:3003${endpoint}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      await fetchFiles(); // Refresh the list
      if (selectedFile && selectedFile._id === id) {
        setSelectedFile(null);
        if (onFileSelect) {
          onFileSelect(null);
        }
      }
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleSelect = (file) => {
    setSelectedFile(file);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Add a method to refresh the file list
  const refreshFiles = useCallback(() => {
    fetchFiles();
  }, [fetchFiles]);

  // Expose the refresh method
  React.useImperativeHandle(
    ref,
    () => ({
      refreshFiles
    }),
    [refreshFiles]
  );

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {type === 'resume' ? 'Uploaded résumés' : 'Uploaded job descriptions'}
      </Typography>
      <List>
        {Array.isArray(files) && files.length > 0 ? (
          files.map((file) => (
            <ListItem
              key={file._id}
              sx={{
                bgcolor: selectedFile && selectedFile._id === file._id ? 'action.selected' : 'transparent',
                '&:hover': { bgcolor: 'action.hover' },
                borderRadius: 1,
                mb: 1
              }}
            >
              <Radio
                checked={selectedFile && selectedFile._id === file._id}
                onChange={() => handleSelect(file)}
              />
              <ListItemText
                primary={file.fileName}
                secondary={formatDate(file.uploadDate)}
                sx={{ ml: 1 }}
              />
              <IconButton onClick={() => handleView(file)} aria-label="View file">
                <VisibilityIcon />
              </IconButton>
              <IconButton onClick={() => handleDelete(file._id)} aria-label="Delete file">
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))
        ) : (
          <ListItem>
            <ListItemText primary="No files uploaded yet" />
          </ListItem>
        )}
      </List>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedFile?.fileName}
          <Typography variant="body2" color="textSecondary">
            Uploaded on {selectedFile && formatDate(selectedFile.uploadDate)}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Typography
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'monospace',
              fontSize: '0.9rem'
            }}
          >
            {selectedFile?.text}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default React.forwardRef(FileList); 