import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { ExpenseContext } from '../../context/ExpenseContext';
import { AuthContext } from '../../context/AuthContext';
import { CATEGORY_COLORS } from '../Expenses/ExpenseListScreen';

const primaryColor = '#6C63FF';

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);
  const { expenses, loading, error, loadExpenses } = useContext(ExpenseContext);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  }, [loadExpenses]);

  const { totalSpent, categoryStats } = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { totalSpent: 0, categoryStats: [] };
    }

    let total = 0;
    const statsMap = {};

    expenses.forEach(exp => {
      total += exp.amount;
      if (!statsMap[exp.category]) {
        statsMap[exp.category] = { amount: 0, count: 0 };
      }
      statsMap[exp.category].amount += exp.amount;
      statsMap[exp.category].count += 1;
    });

    const statsArray = Object.keys(statsMap).map(category => {
      const { amount, count } = statsMap[category];
      const percentage = total > 0 ? (amount / total) * 100 : 0;
      return {
        category,
        amount,
        count,
        percentage
      };
    }).sort((a, b) => b.amount - a.amount); // Sort by highest amount

    return { totalSpent: total, categoryStats: statsArray };
  }, [expenses]);

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
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
            <Text style={styles.subtitle}>Here is your expense summary</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <MaterialIcons name="logout" size={24} color="#FF6B6B" />
          </TouchableOpacity>
        </View>

        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Total Spent</Text>
          <Text style={styles.totalValue}>${totalSpent.toFixed(2)}</Text>
        </View>

        {categoryStats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="analytics" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No data available</Text>
            <Text style={styles.emptySubText}>Add some expenses to see your breakdown.</Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            <Text style={styles.sectionTitle}>Category Breakdown</Text>
            
            {categoryStats.map(stat => {
              const color = CATEGORY_COLORS[stat.category] || CATEGORY_COLORS.Other;
              return (
                <View key={stat.category} style={styles.statCard}>
                  <View style={styles.statHeader}>
                    <View style={styles.statHeaderLeft}>
                      <View style={[styles.colorDot, { backgroundColor: color }]} />
                      <Text style={styles.statCategory}>{stat.category}</Text>
                      <Text style={styles.statCount}>({stat.count} {stat.count === 1 ? 'item' : 'items'})</Text>
                    </View>
                    <Text style={styles.statAmount}>${stat.amount.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.progressContainer}>
                    <View 
                      style={[
                        styles.progressBar, 
                        { width: `${Math.min(stat.percentage, 100)}%`, backgroundColor: color }
                      ]} 
                    />
                  </View>
                  <Text style={styles.statPercentage}>{stat.percentage.toFixed(1)}%</Text>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

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
  scrollContent: {
    padding: 24,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  logoutButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  totalCard: {
    backgroundColor: primaryColor,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 32,
    elevation: 4,
    shadowColor: primaryColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  totalLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  totalValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 8,
  },
  statCount: {
    fontSize: 12,
    color: '#888',
  },
  statAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  statPercentage: {
    fontSize: 12,
    color: '#888',
    textAlign: 'right',
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
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginTop: 16,
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
