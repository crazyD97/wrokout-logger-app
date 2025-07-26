import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card, Button, Chip } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DatabaseService } from '../database/DatabaseService';
import { spacing, typography } from '../constants/theme';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    weeklyWorkouts: 0,
  });
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, workoutsData] = await Promise.all([
        DatabaseService.getWorkoutStats(),
        DatabaseService.getWorkouts(5),
      ]);
      setStats(statsData);
      setRecentWorkouts(workoutsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <LinearGradient
        colors={['#667EFF', '#4A5FE7']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good morning!</Text>
            <Text style={styles.userName}>Ready to crush your workout?</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={40} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Ionicons name="fitness" size={24} color="#667EFF" />
            </View>
            <View>
              <Text style={styles.statNumber}>{stats.totalWorkouts}</Text>
              <Text style={styles.statLabel}>Total Workouts</Text>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.statCard}>
          <Card.Content style={styles.statContent}>
            <View style={styles.statIcon}>
              <Ionicons name="calendar" size={24} color="#4CAF50" />
            </View>
            <View>
              <Text style={styles.statNumber}>{stats.weeklyWorkouts}</Text>
              <Text style={styles.statLabel}>This Week</Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Log Workout')}
          >
            <LinearGradient
              colors={['#667EFF', '#4A5FE7']}
              style={styles.actionButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons name="add" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Start Workout</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Progress')}
          >
            <View style={styles.actionButtonSecondary}>
              <Ionicons name="analytics" size={24} color="#667EFF" />
              <Text style={styles.actionButtonSecondaryText}>View Progress</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Workouts */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Workouts</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Calendar')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {recentWorkouts.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="fitness-outline" size={48} color="#B0B0B0" />
              <Text style={styles.emptyTitle}>No workouts yet</Text>
              <Text style={styles.emptySubtitle}>
                Start your fitness journey by logging your first workout!
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Log Workout')}
                style={styles.emptyButton}
                contentStyle={styles.emptyButtonContent}
              >
                Log First Workout
              </Button>
            </Card.Content>
          </Card>
        ) : (
          recentWorkouts.map((workout) => (
            <Card key={workout.id} style={styles.workoutCard}>
              <Card.Content style={styles.workoutContent}>
                <View style={styles.workoutHeader}>
                  <View>
                    <Text style={styles.workoutName}>{workout.name}</Text>
                    <Text style={styles.workoutDate}>
                      {formatDate(workout.date)}
                    </Text>
                  </View>
                  <View style={styles.workoutMeta}>
                    <Chip
                      mode="outlined"
                      compact
                      style={styles.durationChip}
                      textStyle={styles.chipText}
                    >
                      {formatDuration(workout.duration)}
                    </Chip>
                  </View>
                </View>
                {workout.notes && (
                  <Text style={styles.workoutNotes} numberOfLines={2}>
                    {workout.notes}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: spacing.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...typography.body1,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  userName: {
    ...typography.h3,
    color: '#FFFFFF',
    marginTop: 4,
  },
  profileButton: {
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: -20,
    gap: spacing.md,
  },
  statCard: {
    flex: 1,
    elevation: 2,
    borderRadius: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statNumber: {
    ...typography.h2,
    color: '#333333',
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: '#666666',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.h4,
    color: '#333333',
  },
  seeAllText: {
    ...typography.body2,
    color: '#667EFF',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  actionButtonText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  actionButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    backgroundColor: '#F0F2FF',
    borderRadius: 16,
    gap: spacing.sm,
  },
  actionButtonSecondaryText: {
    ...typography.body1,
    color: '#667EFF',
    fontWeight: '600',
  },
  workoutCard: {
    marginBottom: spacing.md,
    elevation: 1,
    borderRadius: 12,
  },
  workoutContent: {
    paddingVertical: spacing.md,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutName: {
    ...typography.h4,
    color: '#333333',
  },
  workoutDate: {
    ...typography.body2,
    color: '#666666',
    marginTop: 2,
  },
  workoutMeta: {
    alignItems: 'flex-end',
  },
  durationChip: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  chipText: {
    ...typography.caption,
    color: '#4CAF50',
    fontWeight: '600',
  },
  workoutNotes: {
    ...typography.body2,
    color: '#666666',
    marginTop: spacing.sm,
    fontStyle: 'italic',
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
    marginTop: spacing.md,
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
