import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { Card, Chip, Button } from 'react-native-paper';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DatabaseService } from '../database/DatabaseService';
import { spacing, typography } from '../constants/theme';

const { width } = Dimensions.get('window');
const chartWidth = width - spacing.lg * 2;

export default function ProgressScreen({ navigation }) {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [workoutData, setWorkoutData] = useState([]);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalSets: 0,
    averageDuration: 0,
    weeklyAverage: 0,
  });
  const [chartData, setChartData] = useState({
    workoutsPerWeek: null,
    muscleGroupDistribution: null,
    durationTrend: null,
  });

  useEffect(() => {
    loadProgressData();
  }, [selectedPeriod]);

  const loadProgressData = async () => {
    try {
      const workouts = await DatabaseService.getWorkouts(50); // Get more data for analysis
      setWorkoutData(workouts);
      calculateStats(workouts);
      generateChartData(workouts);
    } catch (error) {
      console.error('Error loading progress data:', error);
    }
  };

  const calculateStats = (workouts) => {
    const totalWorkouts = workouts.length;
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
    const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

    // Calculate weekly average
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentWorkouts = workouts.filter(
      w => new Date(w.date) >= oneWeekAgo
    );

    setStats({
      totalWorkouts,
      totalSets: 0, // Would need to calculate from workout exercises
      averageDuration,
      weeklyAverage: recentWorkouts.length,
    });
  };

  const generateChartData = (workouts) => {
    if (workouts.length === 0) {
      setChartData({
        workoutsPerWeek: null,
        muscleGroupDistribution: null,
        durationTrend: null,
      });
      return;
    }

    // Generate workouts per week chart
    const weeklyData = generateWeeklyData(workouts);
    const workoutsPerWeek = {
      labels: weeklyData.labels,
      datasets: [
        {
          data: weeklyData.data,
          color: (opacity = 1) => `rgba(102, 126, 255, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    // Generate duration trend
    const durationData = workouts.slice(0, 10).reverse();
    const durationTrend = {
      labels: durationData.map((_, index) => `W${index + 1}`),
      datasets: [
        {
          data: durationData.map(w => w.duration || 0),
          color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
          strokeWidth: 3,
        },
      ],
    };

    // Mock muscle group distribution (would need exercise data)
    const muscleGroupDistribution = [
      { name: 'Chest', population: 25, color: '#FF6B6B', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Back', population: 20, color: '#4ECDC4', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Legs', population: 30, color: '#45B7D1', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Arms', population: 15, color: '#FECA57', legendFontColor: '#333', legendFontSize: 12 },
      { name: 'Core', population: 10, color: '#FF9FF3', legendFontColor: '#333', legendFontSize: 12 },
    ];

    setChartData({
      workoutsPerWeek,
      muscleGroupDistribution,
      durationTrend,
    });
  };

  const generateWeeklyData = (workouts) => {
    const weeks = [];
    const data = [];
    const labels = [];

    // Get last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekWorkouts = workouts.filter(w => {
        const workoutDate = new Date(w.date);
        return workoutDate >= weekStart && workoutDate <= weekEnd;
      });

      weeks.push({ start: weekStart, end: weekEnd, count: weekWorkouts.length });
      data.push(weekWorkouts.length);
      labels.push(`${weekStart.getMonth() + 1}/${weekStart.getDate()}`);
    }

    return { labels, data };
  };

  const formatDuration = (minutes) => {
    if (!minutes) return '0min';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}min`;
  };

  const chartConfig = {
    backgroundGradientFrom: '#FFFFFF',
    backgroundGradientTo: '#FFFFFF',
    color: (opacity = 1) => `rgba(102, 126, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.7,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
      fontFamily: 'Poppins-Regular',
    },
    propsForVerticalLabels: {
      fontSize: 10,
    },
  };

  const periods = [
    { key: 'week', label: 'Week' },
    { key: 'month', label: 'Month' },
    { key: 'year', label: 'Year' },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Progress</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
          <Ionicons name="settings-outline" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selection */}
        <View style={styles.periodSelector}>
          {periods.map((period) => (
            <Chip
              key={period.key}
              mode={selectedPeriod === period.key ? 'flat' : 'outlined'}
              selected={selectedPeriod === period.key}
              onPress={() => setSelectedPeriod(period.key)}
              style={[
                styles.periodChip,
                selectedPeriod === period.key && styles.selectedPeriodChip,
              ]}
              textStyle={[
                styles.periodChipText,
                selectedPeriod === period.key && styles.selectedPeriodChipText,
              ]}
            >
              {period.label}
            </Chip>
          ))}
        </View>

        {/* Stats Overview */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Ionicons name="fitness" size={24} color="#667EFF" />
              </View>
              <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.statNumber}>{formatDuration(stats.averageDuration)}</Text>
              <Text style={styles.statLabel}>Avg Duration</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Ionicons name="calendar" size={24} color="#FF9800" />
              </View>
              <Text style={styles.statNumber}>{stats.weeklyAverage}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </Card.Content>
          </Card>

          <Card style={styles.statCard}>
            <Card.Content style={styles.statContent}>
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={24} color="#E91E63" />
              </View>
              <Text style={styles.statNumber}>
                {stats.totalWorkouts > 0 ? '+12%' : '0%'}
              </Text>
              <Text style={styles.statLabel}>vs Last Month</Text>
            </Card.Content>
          </Card>
        </View>

        {/* Workout Frequency Chart */}
        {chartData.workoutsPerWeek && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Workout Frequency</Text>
              <Text style={styles.chartSubtitle}>Workouts per week</Text>
              <LineChart
                data={chartData.workoutsPerWeek}
                width={chartWidth - 32}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withDots={true}
                withShadow={false}
                withInnerLines={false}
                withOuterLines={false}
              />
            </Card.Content>
          </Card>
        )}

        {/* Duration Trend Chart */}
        {chartData.durationTrend && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Duration Trend</Text>
              <Text style={styles.chartSubtitle}>Average workout duration (minutes)</Text>
              <LineChart
                data={chartData.durationTrend}
                width={chartWidth - 32}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                }}
                bezier
                style={styles.chart}
                withDots={true}
                withShadow={false}
                withInnerLines={false}
                withOuterLines={false}
              />
            </Card.Content>
          </Card>
        )}

        {/* Muscle Group Distribution */}
        {chartData.muscleGroupDistribution && (
          <Card style={styles.chartCard}>
            <Card.Content>
              <Text style={styles.chartTitle}>Muscle Group Focus</Text>
              <Text style={styles.chartSubtitle}>Distribution of exercises by muscle group</Text>
              <PieChart
                data={chartData.muscleGroupDistribution}
                width={chartWidth - 32}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                style={styles.pieChart}
              />
            </Card.Content>
          </Card>
        )}

        {/* Personal Records Section */}
        <Card style={styles.recordsCard}>
          <Card.Content>
            <View style={styles.recordsHeader}>
              <Text style={styles.chartTitle}>Personal Records</Text>
              <Button
                mode="outlined"
                compact
                onPress={() => {}}
                style={styles.viewAllButton}
              >
                View All
              </Button>
            </View>
            <View style={styles.recordsList}>
              <View style={styles.recordItem}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordExercise}>Bench Press</Text>
                  <Text style={styles.recordDate}>2 days ago</Text>
                </View>
                <View style={styles.recordValue}>
                  <Text style={styles.recordWeight}>185 lbs</Text>
                  <View style={styles.recordBadge}>
                    <Text style={styles.recordBadgeText}>PR</Text>
                  </View>
                </View>
              </View>

              <View style={styles.recordItem}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordExercise}>Squats</Text>
                  <Text style={styles.recordDate}>1 week ago</Text>
                </View>
                <View style={styles.recordValue}>
                  <Text style={styles.recordWeight}>225 lbs</Text>
                  <View style={styles.recordBadge}>
                    <Text style={styles.recordBadgeText}>PR</Text>
                  </View>
                </View>
              </View>

              <View style={styles.recordItem}>
                <View style={styles.recordInfo}>
                  <Text style={styles.recordExercise}>Pull-ups</Text>
                  <Text style={styles.recordDate}>3 days ago</Text>
                </View>
                <View style={styles.recordValue}>
                  <Text style={styles.recordWeight}>15 reps</Text>
                  <View style={styles.recordBadge}>
                    <Text style={styles.recordBadgeText}>PR</Text>
                  </View>
                </View>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Empty State */}
        {workoutData.length === 0 && (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="bar-chart-outline" size={64} color="#B0B0B0" />
              <Text style={styles.emptyTitle}>No data yet</Text>
              <Text style={styles.emptySubtitle}>
                Start logging workouts to see your progress here!
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Log Workout')}
                style={styles.emptyButton}
                contentStyle={styles.emptyButtonContent}
              >
                Log Your First Workout
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: 60,
    paddingBottom: spacing.lg,
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  headerTitle: {
    ...typography.h3,
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  periodChip: {
    backgroundColor: '#FFFFFF',
  },
  selectedPeriodChip: {
    backgroundColor: '#667EFF',
  },
  periodChipText: {
    color: '#667EFF',
  },
  selectedPeriodChipText: {
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  statCard: {
    flex: 1,
    minWidth: (width - spacing.lg * 2 - spacing.md) / 2,
    elevation: 1,
    borderRadius: 12,
  },
  statContent: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statNumber: {
    ...typography.h3,
    color: '#333333',
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: '#666666',
    textAlign: 'center',
    marginTop: 2,
  },
  chartCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  chartTitle: {
    ...typography.h4,
    color: '#333333',
    marginBottom: 4,
  },
  chartSubtitle: {
    ...typography.body2,
    color: '#666666',
    marginBottom: spacing.lg,
  },
  chart: {
    marginVertical: spacing.sm,
    borderRadius: 12,
  },
  pieChart: {
    marginVertical: spacing.sm,
  },
  recordsCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.xl,
  },
  recordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  viewAllButton: {
    borderRadius: 20,
  },
  recordsList: {
    gap: spacing.md,
  },
  recordItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  recordInfo: {
    flex: 1,
  },
  recordExercise: {
    ...typography.body1,
    color: '#333333',
    fontWeight: '600',
  },
  recordDate: {
    ...typography.caption,
    color: '#666666',
    marginTop: 2,
  },
  recordValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recordWeight: {
    ...typography.body1,
    color: '#333333',
    fontWeight: 'bold',
  },
  recordBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 8,
  },
  recordBadgeText: {
    ...typography.caption,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  emptyCard: {
    elevation: 1,
    borderRadius: 16,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    ...typography.h4,
    color: '#333333',
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    ...typography.body2,
    color: '#666666',
    textAlign: 'center',
    marginTop: spacing.sm,
    marginHorizontal: spacing.lg,
  },
  emptyButton: {
    marginTop: spacing.lg,
    borderRadius: 24,
  },
  emptyButtonContent: {
    paddingHorizontal: spacing.lg,
  },
});
