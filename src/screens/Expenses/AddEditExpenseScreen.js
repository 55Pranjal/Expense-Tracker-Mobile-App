import React, { useState, useContext, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { ExpenseContext } from '../../context/ExpenseContext';
import { CATEGORY_COLORS } from './ExpenseListScreen';

const primaryColor = '#6C63FF';
const CATEGORIES = Object.keys(CATEGORY_COLORS);

export default function AddEditExpenseScreen({ route, navigation }) {
  const { addExpense, editExpense } = useContext(ExpenseContext);
  const expenseToEdit = route.params?.expense;
  const isEditMode = !!expenseToEdit;

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    navigation.setOptions({
      title: isEditMode ? 'Edit Expense' : 'Add Expense'
    });

    if (isEditMode) {
      setAmount(expenseToEdit.amount.toString());
      setCategory(expenseToEdit.category);
      setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      setNote(expenseToEdit.note || '');
    }
  }, [expenseToEdit, navigation, isEditMode]);

  const validate = () => {
    let isValid = true;
    let newErrors = {};

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
      isValid = false;
    }

    if (!category) {
      newErrors.category = 'Please select a category';
      isValid = false;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!date || !dateRegex.test(date)) {
      newErrors.date = 'Date must be in YYYY-MM-DD format';
      isValid = false;
    } else {
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        newErrors.date = 'Invalid date';
        isValid = false;
      }
    }

    if (note.length > 200) {
      newErrors.note = 'Note must be less than 200 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setSaving(true);
    
    const expenseData = {
      amount: parseFloat(amount),
      category,
      date,
      note: note.trim()
    };

    try {
      if (isEditMode) {
        await editExpense(expenseToEdit._id, expenseData);
      } else {
        await addExpense(expenseData);
      }
      navigation.goBack();
    } catch (err) {
      setErrors({ form: 'Failed to save expense. Please try again.' });
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {errors.form ? <Text style={styles.errorTextCenter}>{errors.form}</Text> : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={[styles.input, errors.amount && styles.inputError]}
            placeholder="0.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={(text) => { setAmount(text); setErrors({...errors, amount: null}); }}
          />
          {errors.amount ? <Text style={styles.errorText}>{errors.amount}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Category</Text>
          <View style={styles.chipContainer}>
            {CATEGORIES.map(cat => (
              <TouchableOpacity
                key={cat}
                style={[
                  styles.chip,
                  category === cat && { backgroundColor: CATEGORY_COLORS[cat] || primaryColor, borderColor: CATEGORY_COLORS[cat] || primaryColor }
                ]}
                onPress={() => { setCategory(cat); setErrors({...errors, category: null}); }}
              >
                <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput
            style={[styles.input, errors.date && styles.inputError]}
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={(text) => { setDate(text); setErrors({...errors, date: null}); }}
          />
          {errors.date ? <Text style={styles.errorText}>{errors.date}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.noteHeader}>
            <Text style={styles.label}>Note (Optional)</Text>
            <Text style={[styles.charCount, note.length > 200 && styles.errorText]}>
              {note.length}/200
            </Text>
          </View>
          <TextInput
            style={[styles.input, styles.textArea, errors.note && styles.inputError]}
            placeholder="Add a note..."
            multiline
            numberOfLines={4}
            value={note}
            onChangeText={(text) => { setNote(text); setErrors({...errors, note: null}); }}
          />
          {errors.note ? <Text style={styles.errorText}>{errors.note}</Text> : null}
        </View>

        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Expense</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 40,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  errorTextCenter: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  chipText: {
    color: '#555',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  charCount: {
    fontSize: 12,
    color: '#888',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: primaryColor,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
