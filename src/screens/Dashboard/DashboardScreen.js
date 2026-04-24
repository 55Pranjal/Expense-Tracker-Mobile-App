import React, { useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { PieChart, LineChart } from 'react-native-chart-kit';
import { ExpenseContext } from '../../context/ExpenseContext';
import { AuthContext } from '../../context/AuthContext';
import { CATEGORY_COLORS } from '../Expenses/ExpenseListScreen';

const primaryColor = '#6C63FF';
const screenWidth = Dimensions.get('window').width;

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

  const exportToCSV = async () => {
    try {
      if (!expenses || expenses.length === 0) {
        Alert.alert('No Data', 'There are no expenses to export.');
        return;
      }

      const header = 'Date,Type,Category,Amount,Note\n';
      const rows = expenses.map(e => {
        const date = new Date(e.date).toISOString().split('T')[0];
        const type = e.type || 'expense';
        const category = e.category || '';
        const amount = e.amount;
        const note = e.note ? `"${e.note.replace(/"/g, '""')}"` : '';
        return `${date},${type},${category},${amount},${note}`;
      }).join('\n');
      
      const csvData = header + rows;
      
      if (Platform.OS === 'web') {
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'expenses.csv';
        link.click();
      } else {
        const fileUri = `${FileSystem.documentDirectory}expenses.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvData);

        const canShare = await Sharing.isAvailableAsync();
        if (canShare) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Expenses',
            UTI: 'public.comma-separated-values-text'
          });
        } else {
          Alert.alert('Export Complete', `File saved to: ${fileUri}`);
        }
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to export data.');
    }
  };

  const { totalExpense, totalIncome, balance, categoryStats, pieChartData, lineChartData } = useMemo(() => {
    if (!expenses || expenses.length === 0) {
      return { totalExpense: 0, totalIncome: 0, balance: 0, categoryStats: [], pieChartData: [], lineChartData: null };
    }

    let expTotal = 0;
    let incTotal = 0;
    const statsMap = {};

    const today = new Date();
    const last7Days = Array.from({length: 7}, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyExpenseMap = {};
    last7Days.forEach(dateStr => dailyExpenseMap[dateStr] = 0);

    expenses.forEach(item => {
      const isIncome = item.type === 'income';
      if (isIncome) {
        incTotal += item.amount;
      } else {
        expTotal += item.amount;
        if (!statsMap[item.category]) {
          statsMap[item.category] = { amount: 0, count: 0 };
        }
        statsMap[item.category].amount += item.amount;
        statsMap[item.category].count += 1;

        const expDate = new Date(item.date).toISOString().split('T')[0];
        if (dailyExpenseMap[expDate] !== undefined) {
          dailyExpenseMap[expDate] += item.amount;
        }
      }
    });

    const statsArray = Object.keys(statsMap).map(category => {
      const { amount, count } = statsMap[category];
      const percentage = expTotal > 0 ? (amount / expTotal) * 100 : 0;
      return {
        category,
        amount,
        count,
        percentage
      };
    }).sort((a, b) => b.amount - a.amount);

    const pieChartData = statsArray.map(stat => ({
      name: stat.category,
      amount: stat.amount,
      color: CATEGORY_COLORS[stat.category] || CATEGORY_COLORS.Other,
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    }));

    const lineChartData = {
      labels: last7Days.map(d => {
        const [, m, day] = d.split('-');
        return `${m}/${day}`;
      }),
      datasets: [
        {
          data: last7Days.map(d => dailyExpenseMap[d])
        }
      ]
    };

    return { 
      totalExpense: expTotal, 
      totalIncome: incTotal, 
      balance: incTotal - expTotal,
      categoryStats: statsArray,
      pieChartData,
      lineChartData
    };
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
          <View style={{ flex: 1, marginRight: 16 }}>
            <Text style={styles.greeting} numberOfLines={1}>Hello, {user?.name || 'User'}!</Text>
            <Text style={styles.subtitle} numberOfLines={1}>Here is your expense summary</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={exportToCSV} style={styles.iconButton}>
              <MaterialIcons name="file-download" size={24} color={primaryColor} />
            </TouchableOpacity>
            <TouchableOpacity onPress={logout} style={[styles.iconButton, { marginLeft: 8 }]}>
              <MaterialIcons name="logout" size={24} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
          
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <MaterialIcons name="arrow-downward" size={16} color="#4ECDC4" />
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryValueIncome}>+${totalIncome.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <MaterialIcons name="arrow-upward" size={16} color="#FF6B6B" />
              <Text style={styles.summaryLabel}>Expense</Text>
              <Text style={styles.summaryValueExpense}>-${totalExpense.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {categoryStats.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="analytics" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No data available</Text>
            <Text style={styles.emptySubText}>Add some expenses to see your breakdown.</Text>
          </View>
        ) : (
          <View style={styles.statsContainer}>
            {lineChartData && (
              <View style={styles.chartContainer}>
                <Text style={styles.sectionTitle}>Expense Trends (Last 7 Days)</Text>
                <LineChart
                  data={lineChartData}
                  width={screenWidth - 48}
                  height={220}
                  yAxisLabel="$"
                  chartConfig={{
                    backgroundColor: '#ffffff',
                    backgroundGradientFrom: '#ffffff',
                    backgroundGradientTo: '#ffffff',
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
                    labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                    style: { borderRadius: 16 },
                    propsForDots: { r: "6", strokeWidth: "2", stroke: "#6C63FF" }
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </View>
            )}

            <View style={styles.chartContainer}>
              <Text style={styles.sectionTitle}>Category Breakdown</Text>
              <PieChart
                data={pieChartData}
                width={screenWidth - 48}
                height={200}
                chartConfig={{ color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})` }}
                accessor={"amount"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                absolute
              />
            </View>

            <Text style={styles.sectionTitle}>Details</Text>
            
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  balanceCard: {
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
  balanceLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryDivider: {
    width: 1,
    height: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  summaryLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  summaryValueIncome: {
    color: '#4ECDC4',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
  },
  summaryValueExpense: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 4,
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
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    alignItems: 'center',
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
