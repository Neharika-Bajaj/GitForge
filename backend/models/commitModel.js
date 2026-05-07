import mongoose from "mongoose";
import {Schema} from "mongoose";

const fileSchema = new Schema({
  fileName: {
    type: String,
    required: true,
  },
  content: {
    type: String,
  },
});


const commitSchema = new Schema({
  repo: {
    type: String,
    required: true,
  },

  author: {
    type: String,
    required: true,
  },

  commitId: {
    type: String,
    required: true,
    unique: true,
  },

  message: {
    type: String,
  },

  files: [fileSchema],

  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Commit", commitSchema);