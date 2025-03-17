import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Radio,
  Box
} from '@mui/material';
import { Visibility as VisibilityIcon, Delete as DeleteIcon } from '@mui/icons-material';

const FileList = ({ type, onSelect, selectedFile, files, onDelete }) => {
  const [viewFile, setViewFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const handleView = (file) => {
    setViewFile(file);
    setOpenDialog(true);
  };

  const handleDelete = async (file) => {
    try {
      const response = await fetch(`http://localhost:3003/api/${type === 'resume' ? 'resumes' : 'job-descriptions'}/${file._id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (selectedFile && selectedFile._id === file._id) {
          onSelect(null);
        }
        // Call the parent's refresh function
        await onDelete();
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleClose = () => {
    setOpenDialog(false);
    setViewFile(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ mt: 2, mb: 3 }}>
      <List>
        {files.map((file) => (
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
              onChange={() => onSelect(file)}
            />
            <ListItemText
              primary={file.fileName}
              secondary={formatDate(file.uploadDate)}
              sx={{ ml: 1 }}
            />
            <IconButton onClick={() => handleView(file)}>
              <VisibilityIcon />
            </IconButton>
            <IconButton onClick={() => handleDelete(file)}>
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>

      <Dialog open={openDialog} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>File Content</DialogTitle>
        <DialogContent>
          <DialogContentText component="div" sx={{ whiteSpace: 'pre-wrap' }}>
            {viewFile?.text}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default FileList; 