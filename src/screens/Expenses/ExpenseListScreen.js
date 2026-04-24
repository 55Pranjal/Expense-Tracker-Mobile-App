import React, { useContext, useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const applyFilters = () => {
    loadExpenses({
      search: searchQuery,
      category: selectedCategory,
      startDate,
      endDate
    });
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setStartDate('');
    setEndDate('');
    loadExpenses({});
    setFilterModalVisible(false);
  };

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses({ search: searchQuery, category: selectedCategory, startDate, endDate });
    setRefreshing(false);
  }, [loadExpenses, searchQuery, selectedCategory, startDate, endDate]);

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
            <Text style={[styles.amountText, item.type === 'income' && styles.incomeText]}>
              {item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
            </Text>
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
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="#888" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search notes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={applyFilters}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}>
          <MaterialIcons name="filter-list" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

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

      <Modal visible={filterModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Expenses</Text>
              <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.filterLabel}>Category</Text>
            <View style={styles.chipContainer}>
              <TouchableOpacity
                style={[styles.chip, !selectedCategory && styles.chipActive]}
                onPress={() => setSelectedCategory('')}
              >
                <Text style={[styles.chipText, !selectedCategory && styles.chipTextActive]}>All</Text>
              </TouchableOpacity>
              {Object.keys(CATEGORY_COLORS).map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, selectedCategory === cat && styles.chipActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.chipText, selectedCategory === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.filterLabel}>Date Range (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.dateInput}
              placeholder="Start Date"
              value={startDate}
              onChangeText={setStartDate}
            />
            <TextInput
              style={styles.dateInput}
              placeholder="End Date"
              value={endDate}
              onChangeText={setEndDate}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  searchContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: 28,
    zIndex: 1,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 10,
    paddingLeft: 40,
    paddingRight: 16,
    fontSize: 16,
    marginRight: 12,
  },
  filterButton: {
    backgroundColor: primaryColor,
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: '#FF6B6B',
  },
  incomeText: {
    color: '#4ECDC4',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 12,
    marginTop: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#f9f9f9',
  },
  chipActive: {
    backgroundColor: primaryColor,
    borderColor: primaryColor,
  },
  chipText: {
    color: '#555',
  },
  chipTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateInput: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
  clearButton: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: primaryColor,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: primaryColor,
    fontSize: 16,
    fontWeight: 'bold',
  },
  applyButton: {
    flex: 1,
    backgroundColor: primaryColor,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
