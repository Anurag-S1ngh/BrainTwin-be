import mongoose from "mongoose";

const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    minlength: 2,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  contents: [
    {
      type: ObjectId,
      ref: "Content",
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

const ContentSchema = new Schema({
  title: {
    type: String,
    minlength: 1,
    maxlength: 100,
    required: true,
  },
  description: {
    type: String,
  },
  shareLink: {
    type: String,
  },
  url: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  userId: {
    type: ObjectId,
    ref: "User",
    required: true,
  },
});

export const UserModel = mongoose.model("User", UserSchema);
export const ContentModel = mongoose.model("Content", ContentSchema);
