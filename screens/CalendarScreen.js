import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Button, Chip, useTheme } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DatabaseService } from '../database/DatabaseService';
import { spacing, typography } from '../constants/theme';

export default function CalendarScreen({ navigation }) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [workoutData, setWorkoutData] = useState({});
  const [markedDates, setMarkedDates] = useState({});
  const [selectedWorkouts, setSelectedWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  useEffect(() => {
    updateSelectedWorkouts();
  }, [selectedDate, workoutData]);

  const loadWorkoutData = async () => {
    try {
      // Get workouts for the last 3 months
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 3);
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);

      const workouts = await DatabaseService.getWorkoutsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );

      const workoutsByDate = {};
      const marked = {};

      workouts.forEach(workout => {
        const date = workout.date;
        if (!workoutsByDate[date]) {
          workoutsByDate[date] = [];
        }
        workoutsByDate[date].push(workout);

        // Mark the date on calendar
        marked[date] = {
          marked: true,
          dotColor: theme.colors.primary,
          customStyles: {
            container: {
              backgroundColor: workoutsByDate[date].length > 1 ? theme.colors.primary : 'transparent',
              borderRadius: 15,
            },
            text: {
              color: workoutsByDate[date].length > 1 ? '#FFFFFF' : theme.colors.onSurface,
              fontWeight: 'bold',
            },
          },
        };
      });

      // Mark selected date
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF',
      };

      setWorkoutData(workoutsByDate);
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error loading workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSelectedWorkouts = () => {
    const workouts = workoutData[selectedDate] || [];
    setSelectedWorkouts(workouts);

    // Update marked dates to highlight selected date
    const updatedMarked = { ...markedDates };
    
    // Remove previous selection
    Object.keys(updatedMarked).forEach(date => {
      if (updatedMarked[date].selected) {
        updatedMarked[date] = {
          ...updatedMarked[date],
          selected: false,
          selectedColor: undefined,
          selectedTextColor: undefined,
        };
      }
    });

    // Add new selection
    if (updatedMarked[selectedDate]) {
      updatedMarked[selectedDate] = {
        ...updatedMarked[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF',
      };
    } else {
      updatedMarked[selectedDate] = {
        selected: true,
        selectedColor: theme.colors.primary,
        selectedTextColor: '#FFFFFF',
      };
    }

    setMarkedDates(updatedMarked);
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDuration = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getWorkoutTypeColor = (workoutName) => {
    const colors = {
      'Push': theme.colors.primary,
      'Pull': theme.colors.secondary,
      'Legs': '#4CAF50',
      'Cardio': '#FF9800',
      'Core': '#9C27B0',
    };

    for (const [type, color] of Object.entries(colors)) {
      if (workoutName.includes(type)) {
        return color;
      }
    }
    return theme.colors.primary;
  };

  const getMonthStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    let totalWorkouts = 0;
    let totalDuration = 0;

    Object.keys(workoutData).forEach(date => {
      const workoutDate = new Date(date);
      if (workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear) {
        workoutData[date].forEach(workout => {
          totalWorkouts++;
          totalDuration += workout.duration || 0;
        });
      }
    });

    return { totalWorkouts, totalDuration };
  };

  const monthStats = getMonthStats();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Calendar</Text>
        <View style={styles.headerStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{monthStats.totalWorkouts}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Workouts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>{formatDuration(monthStats.totalDuration)}</Text>
            <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Duration</Text>
          </View>
        </View>
      </View>

      {/* Calendar */}
      <View style={[styles.calendarContainer, { backgroundColor: theme.colors.surface }]}>
        <Calendar
          onDayPress={onDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: theme.colors.surface,
            calendarBackground: theme.colors.surface,
            textSectionTitleColor: theme.colors.onSurface,
            selectedDayBackgroundColor: theme.colors.primary,
            selectedDayTextColor: '#FFFFFF',
            todayTextColor: theme.colors.primary,
            dayTextColor: theme.colors.onSurface,
            textDisabledColor: theme.colors.onSurfaceDisabled,
            dotColor: theme.colors.primary,
            selectedDotColor: '#FFFFFF',
            arrowColor: theme.colors.primary,
            monthTextColor: theme.colors.onSurface,
            indicatorColor: theme.colors.primary,
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
        />
      </View>

      {/* Selected Date Workouts */}
      <ScrollView style={styles.workoutsContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.workoutsHeader}>
          <Text style={[styles.workoutsTitle, { color: theme.colors.onSurface }]}>
            {formatDate(selectedDate)}
          </Text>
          <Text style={[styles.workoutsSubtitle, { color: theme.colors.onSurfaceVariant }]}>
            {selectedWorkouts.length} workout{selectedWorkouts.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {selectedWorkouts.length === 0 ? (
          <Card style={[styles.emptyCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content style={styles.emptyContent}>
              <Ionicons name="calendar-outline" size={48} color={theme.colors.onSurfaceVariant} />
              <Text style={[styles.emptyTitle, { color: theme.colors.onSurface }]}>No workouts</Text>
              <Text style={[styles.emptySubtitle, { color: theme.colors.onSurfaceVariant }]}>
                No workouts scheduled for this date
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Log Workout')}
                style={styles.emptyButton}
                contentStyle={styles.emptyButtonContent}
              >
                Log Workout
              </Button>
            </Card.Content>
          </Card>
        ) : (
          selectedWorkouts.map((workout, index) => (
            <Card key={workout.id} style={[styles.workoutCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content style={styles.workoutContent}>
                <View style={styles.workoutHeader}>
                  <View style={styles.workoutInfo}>
                    <Text style={[styles.workoutName, { color: theme.colors.onSurface }]}>{workout.name}</Text>
                    <Text style={[styles.workoutTime, { color: theme.colors.onSurfaceVariant }]}>
                      {workout.start_time} - {workout.end_time}
                    </Text>
                  </View>
                  <View style={styles.workoutMeta}>
                    <Chip
                      mode="outlined"
                      compact
                      style={[styles.durationChip, { backgroundColor: theme.colors.secondaryContainer }]}
                      textStyle={[styles.chipText, { color: theme.colors.secondary }]}
                    >
                      {formatDuration(workout.duration)}
                    </Chip>
                  </View>
                </View>
                {workout.notes && (
                  <Text style={[styles.workoutNotes, { color: theme.colors.onSurfaceVariant }]} numberOfLines={2}>
                    {workout.notes}
                  </Text>
                )}
              </Card.Content>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    paddingHorizontal: spacing.lg,
    elevation: 2,
  },
  headerTitle: {
    ...typography.h3,
    marginBottom: spacing.md,
  },
  headerStats: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h2,
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    marginTop: 2,
  },
  calendarContainer: {
    margin: spacing.lg,
    borderRadius: 16,
    elevation: 2,
    overflow: 'hidden',
  },
  workoutsContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  workoutsHeader: {
    marginBottom: spacing.lg,
  },
  workoutsTitle: {
    ...typography.h4,
  },
  workoutsSubtitle: {
    ...typography.body2,
    marginTop: 2,
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
  workoutInfo: {
    flex: 1,
  },
  workoutName: {
    ...typography.h4,
  },
  workoutTime: {
    ...typography.body2,
    marginTop: 2,
  },
  workoutMeta: {
    alignItems: 'flex-end',
  },
  durationChip: {
    borderColor: 'transparent',
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  workoutNotes: {
    ...typography.body2,
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
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.body2,
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
