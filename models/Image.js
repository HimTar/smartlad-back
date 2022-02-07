const mongoose = require("mongoose");

const ImageSchema = new mongoose.Schema({
  contentType: {
    type: String,
    required: true,
  },
  image: {
    type: Buffer,
  },
});

module.exports = mongoose.model("Image", ImageSchema);
