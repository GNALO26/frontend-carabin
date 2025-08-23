const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function(v) {
        return v.length >= 2;
      },
      message: 'Doit avoir au moins 2 options'
    }
  },
  correctAnswer: {
    type: Number,
    required: true
  },
  explanation: {
    type: String
  },
  imageUrl: {
    type: String
  }
});

module.exports = mongoose.model('Question', questionSchema);