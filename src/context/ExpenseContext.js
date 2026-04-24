import React, { createContext, useState, useContext, useCallback } from 'react';
import api from '../services/api';
import { AuthContext } from './AuthContext';

export const ExpenseContext = createContext();

export const ExpenseProvider = ({ children }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const { logout } = useContext(AuthContext);

  const handleError = (err) => {
    if (err.response?.status === 401) {
      logout();
    }
    const msg = err.response?.data?.message || err.message || 'An error occurred';
    setError(msg);
    throw new Error(msg);
  };

  const loadExpenses = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      const url = `/expenses${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      const data = response.data;
      setExpenses(Array.isArray(data) ? data : data.expenses || []);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [logout]);

  const addExpense = async (expenseData) => {
    setError(null);
    try {
      const response = await api.post('/expenses', expenseData);
      setExpenses((prev) => [response.data, ...prev]);
      return response.data;
    } catch (err) {
      handleError(err);
    }
  };

  const editExpense = async (id, expenseData) => {
    setError(null);
    try {
      const response = await api.put(`/expenses/${id}`, expenseData);
      setExpenses((prev) =>
        prev.map((exp) => (exp._id === id ? response.data : exp))
      );
      return response.data;
    } catch (err) {
      handleError(err);
    }
  };

  const removeExpense = async (id) => {
    setError(null);
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses((prev) => prev.filter((exp) => exp._id !== id));
    } catch (err) {
      handleError(err);
    }
  };

  return (
    <ExpenseContext.Provider
      value={{
        expenses,
        loading,
        error,
        loadExpenses,
        addExpense,
        editExpense,
        removeExpense,
      }}
    >
      {children}
    </ExpenseContext.Provider>
  );
};
