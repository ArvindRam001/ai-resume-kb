const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', resumeSchema); 