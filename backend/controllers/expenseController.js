import Expense from "../models/Expense.js";

// @route   POST /api/expenses
export const addExpense = async (req, res) => {
  try {
    const { amount, category, note, date, type } = req.body;

    const expense = await Expense.create({
      userId: req.user,
      amount,
      category,
      note,
      type: type || 'expense',
      date,
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ msg: "Error adding expense", error: error.message });
  }
};

// @route   GET /api/expenses
export const getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category, search } = req.query;
    let query = { userId: req.user };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.note = { $regex: search, $options: "i" };
    }

    const expenses = await Expense.find(query).sort({
      date: -1,
    });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ msg: "Error fetching expenses", error: error.message });
  }
};

// @route   PUT /api/expenses/:id
export const updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    // ensure user owns expense
    if (expense.userId.toString() !== req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updatedExpense);
  } catch (error) {
    res.status(500).json({ msg: "Error updating expense", error: error.message });
  }
};

// @route   DELETE /api/expenses/:id
export const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ msg: "Expense not found" });
    }

    if (expense.userId.toString() !== req.user) {
      return res.status(401).json({ msg: "Unauthorized" });
    }

    await expense.deleteOne();

    res.json({ msg: "Expense deleted" });
  } catch (error) {
    res.status(500).json({ msg: "Error deleting expense", error: error.message });
  }
};