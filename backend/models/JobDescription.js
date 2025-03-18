const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: ''
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JobDescription', jobDescriptionSchema); 