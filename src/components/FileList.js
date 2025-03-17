import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  IconButton, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button,
  Paper
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';

const FileList = ({ type }) => {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [type]);

  const fetchFiles = async () => {
    try {
      const endpoint = type === 'resume' ? '/api/resumes' : '/api/job-descriptions';
      const response = await fetch(`http://localhost:3003${endpoint}`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error('Error fetching files:', error);
    }
  };

  const handleView = (file) => {
    setSelectedFile(file);
    setOpenDialog(true);
  };

  const handleDelete = async (id) => {
    try {
      const endpoint = type === 'resume' ? '/api/resumes' : '/api/job-descriptions';
      await fetch(`http://localhost:3003${endpoint}/${id}`, {
        method: 'DELETE'
      });
      fetchFiles(); // Refresh the list
    } catch (error) {
      console.error('Error deleting file:', error);
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

  return (
    <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        {type === 'resume' ? 'Uploaded Resumes' : 'Uploaded Job Descriptions'}
      </Typography>
      <List>
        {files.map((file) => (
          <ListItem
            key={file._id}
            secondaryAction={
              <Box>
                <IconButton edge="end" onClick={() => handleView(file)}>
                  <VisibilityIcon />
                </IconButton>
                <IconButton edge="end" onClick={() => handleDelete(file._id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            }
          >
            <ListItemText
              primary={file.fileName}
              secondary={formatDate(file.uploadDate)}
            />
          </ListItem>
        ))}
      </List>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
      >
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
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default FileList; 