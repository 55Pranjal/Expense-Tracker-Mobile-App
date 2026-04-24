import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  budgets: [{
    category: String,
    limit: Number
  }]
});

export default mongoose.model("User", userSchema);