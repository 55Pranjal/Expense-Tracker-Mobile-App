import React, { useContext, useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ExpenseContext } from '../../context/ExpenseContext';

const primaryColor = '#6C63FF';

export const CATEGORY_COLORS = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Shopping: '#45B7D1',
  Entertainment: '#F9CA24',
  Health: '#6AB04C',
  Bills: '#EB4D4B',
  Education: '#22A6B3',
  Other: '#95A5A6',
};

export default function ExpenseListScreen({ navigation }) {
  const { expenses, loading, error, loadExpenses, removeExpense } = useContext(ExpenseContext);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [loadExpenses]);

  const handleDelete = (id) => {
    Alert.alert(
      "Delete Expense",
      "Are you sure you want to delete this expense?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: () => removeExpense(id)
        }
      ]
    );
  };

  const renderExpenseItem = ({ item }) => {
    const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.Other;
    
    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => navigation.navigate('AddEditExpense', { expense: item })}
      >
        <View style={[styles.categoryIndicator, { backgroundColor: categoryColor }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
          </View>
          <Text style={styles.dateText}>{new Date(item.date).toLocaleDateString()}</Text>
          {item.note ? (
            <Text style={styles.noteText} numberOfLines={1}>{item.note}</Text>
          ) : null}
        </View>
        <TouchableOpacity 
          style={styles.deleteButton} 
          onPress={() => handleDelete(item._id)}
        >
          <MaterialIcons name="delete-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (loading && !refreshing) return null;
    
    return (
      <View style={styles.emptyContainer}>
        <MaterialIcons name="receipt" size={64} color="#ccc" />
        <Text style={styles.emptyText}>No expenses yet.</Text>
        <Text style={styles.emptySubText}>Tap the + button to add one.</Text>
      </View>
    );
  };

  if (loading && !refreshing && expenses.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (error && expenses.length === 0) {
    return (
      <View style={styles.centered}>
        <MaterialIcons name="error-outline" size={48} color="red" />
        <Text style={styles.errorText}>Failed to load expenses</Text>
        <Text style={styles.errorSubText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadExpenses}>
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))}
        keyExtractor={(item) => item._id}
        renderItem={renderExpenseItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyComponent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
        }
      />
      
      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('AddEditExpense')}
      >
        <MaterialIcons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'hidden',
  },
  categoryIndicator: {
    width: 6,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: primaryColor,
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#555',
  },
  deleteButton: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: primaryColor,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  errorSubText: {
    fontSize: 14,
    color: 'red',
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 24,
    backgroundColor: primaryColor,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
