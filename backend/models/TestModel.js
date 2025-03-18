const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: String,
});

const TestModel = mongoose.model('Test', testSchema);

module.exports = TestModel;