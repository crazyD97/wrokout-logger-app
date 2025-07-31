import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Card,
  Button,
  TextInput,
  Modal,
  Portal,
  List,
  Chip,
  IconButton,
  Divider,
  useTheme,
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DatabaseService } from '../database/DatabaseService';
import { spacing, typography } from '../constants/theme';
import eventBus from '../utils/EventBus';

export default function LogWorkoutScreen({ navigation }) {
  const theme = useTheme();
  const [workoutName, setWorkoutName] = useState('');
  const [workoutNotes, setWorkoutNotes] = useState('');
  const [exercises, setExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [isWorkoutActive, setIsWorkoutActive] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [currentWorkoutId, setCurrentWorkoutId] = useState(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      const exerciseData = await DatabaseService.getExercises();
      setExercises(exerciseData);
    } catch (error) {
      console.error('Error loading exercises:', error);
    }
  };

  const startWorkout = () => {
    if (!workoutName.trim()) {
      Alert.alert('Error', 'Please enter a workout name');
      return;
    }
    setIsWorkoutActive(true);
    setStartTime(new Date());
  };

  const addExercise = (exercise) => {
    const exerciseToAdd = {
      ...exercise,
      sets: [{ reps: '', weight: '', completed: false }],
    };
    setSelectedExercises([...selectedExercises, exerciseToAdd]);
    setShowExerciseModal(false);
  };

  const removeExercise = (index) => {
    const updated = selectedExercises.filter((_, i) => i !== index);
    setSelectedExercises(updated);
  };

  const addSet = (exerciseIndex) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets.push({ reps: '', weight: '', completed: false });
    setSelectedExercises(updated);
  };

  const updateSet = (exerciseIndex, setIndex, field, value) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex][field] = value;
    setSelectedExercises(updated);
  };

  const toggleSetComplete = (exerciseIndex, setIndex) => {
    const updated = [...selectedExercises];
    updated[exerciseIndex].sets[setIndex].completed =
      !updated[exerciseIndex].sets[setIndex].completed;
    setSelectedExercises(updated);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const updated = [...selectedExercises];
    if (updated[exerciseIndex].sets.length > 1) {
      updated[exerciseIndex].sets.splice(setIndex, 1);
      setSelectedExercises(updated);
    }
  };

  const finishWorkout = async () => {
    try {
      const endTime = new Date();
      const duration = Math.round((endTime - startTime) / 1000 / 60); // minutes

      const workout = {
        name: workoutName,
        date: new Date().toISOString().split('T')[0],
        startTime: startTime.toTimeString().slice(0, 5),
        endTime: endTime.toTimeString().slice(0, 5),
        duration,
        notes: workoutNotes,
      };

      const workoutId = await DatabaseService.createWorkout(workout);
      setCurrentWorkoutId(workoutId);

      // Add exercises to workout
      for (const exercise of selectedExercises) {
        await DatabaseService.addExerciseToWorkout(workoutId, exercise);
      }

      eventBus.emit('workout:added');

      Alert.alert(
        'Workout Complete!',
        `Great job! You completed your workout in ${duration} minutes.`,
        [
          {
            text: 'View Progress',
            onPress: () => navigation.navigate('Progress'),
          },
          {
            text: 'Home',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );

      // Reset state
      setIsWorkoutActive(false);
      setWorkoutName('');
      setWorkoutNotes('');
      setSelectedExercises([]);
      setStartTime(null);
      setCurrentWorkoutId(null);
    } catch (error) {
      console.error('Error finishing workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const cancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? All progress will be lost.',
      [
        { text: 'Keep Working Out', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            setIsWorkoutActive(false);
            setWorkoutName('');
            setWorkoutNotes('');
            setSelectedExercises([]);
            setStartTime(null);
          },
        },
      ]
    );
  };

  const formatElapsedTime = () => {
    if (!startTime) return '00:00';
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const groupedExercises = exercises.reduce((acc, exercise) => {
    const category = exercise.category_name;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(exercise);
    return acc;
  }, {});

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
            {isWorkoutActive ? 'Active Workout' : 'Log Workout'}
          </Text>
        </View>
        {isWorkoutActive && (
          <View style={styles.timerContainer}>
            <Text style={[styles.timerText, { color: theme.colors.primary }]}>{formatElapsedTime()}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Setup */}
        {!isWorkoutActive && (
          <Card style={[styles.setupCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>Workout Details</Text>
              <TextInput
                label="Workout Name"
                value={workoutName}
                onChangeText={setWorkoutName}
                style={styles.input}
                placeholder="e.g., Push Day, Full Body, etc."
                theme={theme}
              />
              <TextInput
                label="Notes (Optional)"
                value={workoutNotes}
                onChangeText={setWorkoutNotes}
                style={styles.input}
                multiline
                numberOfLines={3}
                placeholder="Any notes about this workout..."
                theme={theme}
              />
              <Button
                mode="contained"
                onPress={startWorkout}
                style={styles.startButton}
                contentStyle={styles.startButtonContent}
                icon="play"
              >
                Start Workout
              </Button>
            </Card.Content>
          </Card>
        )}

        {/* Active Workout */}
        {isWorkoutActive && (
          <>
            {/* Workout Info */}
            <Card style={[styles.workoutInfoCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Text style={[styles.workoutTitle, { color: theme.colors.onSurface }]}>{workoutName}</Text>
                {workoutNotes && (
                  <Text style={[styles.workoutNotes, { color: theme.colors.onSurfaceVariant }]}>{workoutNotes}</Text>
                )}
                <View style={styles.workoutStats}>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: theme.colors.primary }]}>{selectedExercises.length}</Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Exercises</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={[styles.statNumber, { color: theme.colors.secondary }]}>
                      {selectedExercises.reduce((total, ex) => total + ex.sets.length, 0)}
                    </Text>
                    <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]}>Sets</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Exercise List */}
            {selectedExercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} style={[styles.exerciseCard, { backgroundColor: theme.colors.surface }]}>
                <Card.Content>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseInfo}>
                      <View style={styles.exerciseIconRow}>
                        <Ionicons name={exercise.icon || 'barbell'} size={28} color={theme.colors.primary} style={{ marginRight: spacing.sm }} />
                        <Text style={[styles.exerciseName, { color: theme.colors.onSurface }]}>{exercise.name}</Text>
                      </View>
                      <Text style={[styles.exerciseMuscles, { color: theme.colors.onSurfaceVariant }]}>{exercise.muscle_groups}</Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => removeExercise(exerciseIndex)}
                      iconColor={theme.colors.error}
                    />
                  </View>

                  {/* Sets */}
                  <View style={styles.setsContainer}>
                    <View style={styles.setHeader}>
                      <Text style={[styles.setHeaderText, { color: theme.colors.onSurfaceVariant }]}>Set</Text>
                      <Text style={[styles.setHeaderText, { color: theme.colors.onSurfaceVariant }]}>Reps</Text>
                      <Text style={[styles.setHeaderText, { color: theme.colors.onSurfaceVariant }]}>Weight</Text>
                      <Text style={[styles.setHeaderText, { color: theme.colors.onSurfaceVariant }]}>✓</Text>
                      <Text style={[styles.setHeaderText, { color: theme.colors.onSurfaceVariant }]}>Remove</Text>
                    </View>
                    {exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setRow}>
                        <Text style={[styles.setNumber, { color: theme.colors.onSurface }]}>{setIndex + 1}</Text>
                        <TextInput
                          value={set.reps}
                          onChangeText={(value) =>
                            updateSet(exerciseIndex, setIndex, 'reps', value)
                          }
                          style={[styles.setInput, { backgroundColor: theme.colors.surfaceVariant }]}
                          keyboardType="numeric"
                          placeholder="0"
                          theme={theme}
                        />
                        <TextInput
                          value={set.weight}
                          onChangeText={(value) =>
                            updateSet(exerciseIndex, setIndex, 'weight', value)
                          }
                          style={[styles.setInput, { backgroundColor: theme.colors.surfaceVariant }]}
                          keyboardType="numeric"
                          placeholder="0"
                          theme={theme}
                        />
                        <TouchableOpacity
                          style={[
                            styles.completeButton,
                            {
                              backgroundColor: set.completed ? theme.colors.primary : theme.colors.surfaceVariant,
                            },
                          ]}
                          onPress={() => toggleSetComplete(exerciseIndex, setIndex)}
                        >
                          <Ionicons
                            name={set.completed ? 'checkmark' : 'ellipse-outline'}
                            size={16}
                            color={set.completed ? '#FFFFFF' : theme.colors.onSurfaceVariant}
                          />
                        </TouchableOpacity>
                        <IconButton
                          icon="remove-circle"
                          size={20}
                          onPress={() => removeSet(exerciseIndex, setIndex)}
                          iconColor={theme.colors.error}
                          style={{ marginLeft: -8 }}
                        />
                      </View>
                    ))}
                    <Button
                      mode="outlined"
                      onPress={() => addSet(exerciseIndex)}
                      style={styles.addSetButton}
                      icon="add-circle"
                    >
                      Add Set
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}

            {/* Add Exercise Button */}
            <Card style={[styles.addExerciseCard, { backgroundColor: theme.colors.surface }]}>
              <Card.Content>
                <Button
                  mode="outlined"
                  onPress={() => setShowExerciseModal(true)}
                  style={styles.addExerciseButton}
                  icon="plus"
                >
                  Add Exercise
                </Button>
              </Card.Content>
            </Card>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <Button
                mode="outlined"
                onPress={cancelWorkout}
                style={[styles.actionButton, { borderColor: theme.colors.error }]}
                textColor={theme.colors.error}
              >
                Cancel Workout
              </Button>
              <Button
                mode="contained"
                onPress={finishWorkout}
                style={styles.actionButton}
                icon="check"
              >
                Finish Workout
              </Button>
            </View>
          </>
        )}
      </ScrollView>

      {/* Exercise Selection Modal */}
      <Portal>
        <Modal
          visible={showExerciseModal}
          onDismiss={() => setShowExerciseModal(false)}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Select Exercise</Text>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setShowExerciseModal(false)}
              iconColor={theme.colors.onSurface}
            />
          </View>
          <ScrollView style={styles.modalContent}>
            {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
              <View key={category} style={styles.categorySection}>
                <Text style={[styles.categoryTitle, { color: theme.colors.primary }]}>{category}</Text>
                {categoryExercises.map((exercise) => (
                  <TouchableOpacity
                    key={exercise.id}
                    style={[styles.exerciseItem, { backgroundColor: theme.colors.surfaceVariant }]}
                    onPress={() => addExercise(exercise)}
                  >
                    <View>
                      <Text style={[styles.exerciseItemName, { color: theme.colors.onSurface }]}>{exercise.name}</Text>
                      <Text style={[styles.exerciseItemMuscles, { color: theme.colors.onSurfaceVariant }]}>
                        {exercise.muscle_groups}
                      </Text>
                    </View>
                    <Ionicons name="add" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
    elevation: 2,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerTitle: {
    ...typography.h4,
  },
  timerContainer: {
    backgroundColor: 'rgba(102, 126, 255, 0.1)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  timerText: {
    ...typography.body1,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  setupCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  input: {
    marginBottom: spacing.md,
  },
  startButton: {
    marginTop: spacing.md,
    borderRadius: 24,
  },
  startButtonContent: {
    paddingHorizontal: spacing.lg,
  },
  workoutInfoCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  workoutTitle: {
    ...typography.h3,
    marginBottom: spacing.sm,
  },
  workoutNotes: {
    ...typography.body2,
    marginBottom: spacing.md,
    fontStyle: 'italic',
  },
  workoutStats: {
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
  exerciseCard: {
    elevation: 1,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    ...typography.h4,
  },
  exerciseMuscles: {
    ...typography.body2,
    marginTop: 2,
  },
  exerciseIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  setsContainer: {
    gap: spacing.sm,
  },
  setHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  setHeaderText: {
    ...typography.caption,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  setNumber: {
    ...typography.body2,
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
  },
  completeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addSetButton: {
    marginTop: spacing.sm,
    borderRadius: 20,
  },
  addExerciseCard: {
    elevation: 1,
    borderRadius: 12,
    marginBottom: spacing.lg,
  },
  addExerciseButton: {
    borderRadius: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    borderRadius: 24,
  },
  modal: {
    margin: spacing.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    ...typography.h4,
  },
  modalContent: {
    padding: spacing.lg,
  },
  categorySection: {
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    ...typography.h4,
    marginBottom: spacing.md,
  },
  exerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  exerciseItemName: {
    ...typography.body1,
    fontWeight: '600',
  },
  exerciseItemMuscles: {
    ...typography.caption,
    marginTop: 2,
  },
});
