const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  sender: {
    type: String,
  },
  receiver: {
    type: String,
  },

  text: {
    type: String,
    required: true,
  },
  img: {
    type: String,
  },
  time: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("PrivateChat", ChatSchema);
