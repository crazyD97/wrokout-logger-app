import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Card, Button, Chip } from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DatabaseService } from '../database/DatabaseService';
import { spacing, typography } from '../constants/theme';

export default function CalendarScreen({ navigation }) {
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
          dotColor: '#667EFF',
          customStyles: {
            container: {
              backgroundColor: workoutsByDate[date].length > 1 ? '#667EFF' : 'transparent',
              borderRadius: 15,
            },
            text: {
              color: workoutsByDate[date].length > 1 ? '#FFFFFF' : '#333333',
              fontWeight: 'bold',
            },
          },
        };
      });

      // Mark selected date
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#667EFF',
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
    updatedMarked[selectedDate] = {
      ...updatedMarked[selectedDate],
      selected: true,
      selectedColor: '#667EFF',
      selectedTextColor: '#FFFFFF',
    };

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
    const name = workoutName.toLowerCase();
    if (name.includes('push') || name.includes('chest')) return '#FF6B6B';
    if (name.includes('pull') || name.includes('back')) return '#4ECDC4';
    if (name.includes('leg') || name.includes('squat')) return '#45B7D1';
    if (name.includes('cardio') || name.includes('run')) return '#54A0FF';
    if (name.includes('core') || name.includes('abs')) return '#FF9FF3';
    return '#FECA57';
  };

  const getMonthStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    let monthlyWorkouts = 0;
    let totalDuration = 0;
    
    Object.entries(workoutData).forEach(([date, workouts]) => {
      const workoutDate = new Date(date);
      if (workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear) {
        monthlyWorkouts += workouts.length;
        totalDuration += workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
      }
    });

    return {
      workouts: monthlyWorkouts,
      duration: totalDuration,
      average: monthlyWorkouts > 0 ? Math.round(totalDuration / monthlyWorkouts) : 0,
    };
  };

  const monthStats = getMonthStats();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Workout Calendar</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('Log Workout')}>
          <Ionicons name="add" size={24} color="#333333" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Monthly Stats */}
        <Card style={styles.statsCard}>
          <Card.Content>
            <Text style={styles.statsTitle}>This Month</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{monthStats.workouts}</Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatDuration(monthStats.duration)}</Text>
                <Text style={styles.statLabel}>Total Time</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{formatDuration(monthStats.average)}</Text>
                <Text style={styles.statLabel}>Avg Duration</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Calendar */}
        <Card style={styles.calendarCard}>
          <Card.Content>
            <Calendar
              current={selectedDate}
              onDayPress={onDayPress}
              markedDates={markedDates}
              markingType="custom"
              theme={{
                backgroundColor: '#FFFFFF',
                calendarBackground: '#FFFFFF',
                textSectionTitleColor: '#667EFF',
                selectedDayBackgroundColor: '#667EFF',
                selectedDayTextColor: '#FFFFFF',
                todayTextColor: '#667EFF',
                dayTextColor: '#333333',
                textDisabledColor: '#CCCCCC',
                dotColor: '#667EFF',
                selectedDotColor: '#FFFFFF',
                arrowColor: '#667EFF',
                disabledArrowColor: '#CCCCCC',
                monthTextColor: '#333333',
                indicatorColor: '#667EFF',
                textDayFontFamily: 'Poppins-Regular',
                textMonthFontFamily: 'Poppins-SemiBold',
                textDayHeaderFontFamily: 'Poppins-Regular',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 14,
              }}
            />
          </Card.Content>
        </Card>

        {/* Selected Date Info */}
        <View style={styles.selectedDateSection}>
          <Text style={styles.selectedDateTitle}>{formatDate(selectedDate)}</Text>
          
          {selectedWorkouts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Card.Content style={styles.emptyContent}>
                <Ionicons name="calendar-outline" size={48} color="#B0B0B0" />
                <Text style={styles.emptyTitle}>No workouts on this day</Text>
                <Text style={styles.emptySubtitle}>
                  Why not add one to keep your streak going?
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
            <View style={styles.workoutsList}>
              {selectedWorkouts.map((workout) => (
                <Card key={workout.id} style={styles.workoutCard}>
                  <Card.Content>
                    <View style={styles.workoutHeader}>
                      <View style={styles.workoutInfo}>
                        <View style={styles.workoutTitleRow}>
                          <View
                            style={[
                              styles.workoutTypeIndicator,
                              { backgroundColor: getWorkoutTypeColor(workout.name) },
                            ]}
                          />
                          <Text style={styles.workoutName}>{workout.name}</Text>
                        </View>
                        <View style={styles.workoutMeta}>
                          <Chip
                            mode="outlined"
                            compact
                            style={styles.durationChip}
                            textStyle={styles.chipText}
                            icon="time"
                          >
                            {formatDuration(workout.duration)}
                          </Chip>
                          {workout.start_time && (
                            <Chip
                              mode="outlined"
                              compact
                              style={styles.timeChip}
                              textStyle={styles.chipText}
                              icon="clock"
                            >
                              {workout.start_time.slice(0, 5)}
                            </Chip>
                          )}
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.viewButton}
                        onPress={() => {
                          // Navigate to workout details
                        }}
                      >
                        <Ionicons name="chevron-forward" size={20} color="#667EFF" />
                      </TouchableOpacity>
                    </View>
                    {workout.notes && (
                      <Text style={styles.workoutNotes} numberOfLines={2}>
                        {workout.notes}
                      </Text>
                    )}
                  </Card.Content>
                </Card>
              ))}
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('Progress')}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="analytics"
          >
            View Progress
          </Button>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Log Workout')}
            style={styles.actionButton}
            contentStyle={styles.actionButtonContent}
            icon="add"
          >
            New Workout
          </Button>
        </View>
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
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
    color: '#333333',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  statsCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  statsTitle: {
    ...typography.h4,
    color: '#333333',
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.h3,
    color: '#667EFF',
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: '#666666',
    marginTop: 2,
  },
  calendarCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  selectedDateSection: {
    marginBottom: spacing.lg,
  },
  selectedDateTitle: {
    ...typography.h4,
    color: '#333333',
    marginBottom: spacing.md,
  },
  workoutsList: {
    gap: spacing.md,
  },
  workoutCard: {
    elevation: 1,
    borderRadius: 12,
  },
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  workoutInfo: {
    flex: 1,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  workoutTypeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: spacing.sm,
  },
  workoutName: {
    ...typography.h4,
    color: '#333333',
    flex: 1,
  },
  workoutMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  durationChip: {
    backgroundColor: '#E8F5E8',
    borderColor: '#4CAF50',
  },
  timeChip: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
  },
  viewButton: {
    padding: spacing.sm,
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
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    borderRadius: 24,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm,
  },
});
