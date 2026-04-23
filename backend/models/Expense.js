import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  amount: Number,
  category: String,
  note: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model("Expense", expenseSchema);