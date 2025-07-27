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
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { DatabaseService } from '../database/DatabaseService';
import { spacing, typography } from '../constants/theme';

export default function LogWorkoutScreen({ navigation }) {
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
      const duration = Math.round((endTime - startTime) / (1000 * 60)); // Duration in minutes

      const workout = {
        name: workoutName,
        date: new Date().toISOString().split('T')[0],
        startTime: startTime.toTimeString().split(' ')[0],
        endTime: endTime.toTimeString().split(' ')[0],
        duration,
        notes: workoutNotes,
      };

      const workoutId = await DatabaseService.createWorkout(workout);

      // Add exercises to workout
      for (const exercise of selectedExercises) {
        const repsData = exercise.sets.map(set => `${set.reps}`).join(',');
        const weightData = exercise.sets.map(set => `${set.weight || 0}`).join(',');
        
        await DatabaseService.addExerciseToWorkout(workoutId, {
          exerciseId: exercise.id,
          sets: exercise.sets.length,
          reps: repsData,
          weight: weightData,
          notes: '',
        });
      }

      Alert.alert(
        'Workout Completed!',
        `Great job! You completed your ${workoutName} workout in ${duration} minutes.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setWorkoutName('');
              setWorkoutNotes('');
              setSelectedExercises([]);
              setIsWorkoutActive(false);
              setStartTime(null);
              navigation.navigate('Home');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving workout:', error);
      Alert.alert('Error', 'Failed to save workout. Please try again.');
    }
  };

  const cancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? All progress will be lost.',
      [
        { text: 'Continue Workout', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            setWorkoutName('');
            setWorkoutNotes('');
            setSelectedExercises([]);
            setIsWorkoutActive(false);
            setStartTime(null);
          },
        },
      ]
    );
  };

  const formatElapsedTime = () => {
    if (!startTime) return '00:00';
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isWorkoutActive ? 'Active Workout' : 'Log Workout'}
          </Text>
        </View>
        {isWorkoutActive && (
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>{formatElapsedTime()}</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Workout Setup */}
        {!isWorkoutActive && (
          <Card style={styles.setupCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>Workout Details</Text>
              <TextInput
                label="Workout Name"
                value={workoutName}
                onChangeText={setWorkoutName}
                style={styles.input}
                placeholder="e.g., Push Day, Full Body, etc."
              />
              <TextInput
                label="Notes (Optional)"
                value={workoutNotes}
                onChangeText={setWorkoutNotes}
                style={styles.input}
                multiline
                numberOfLines={3}
                placeholder="Any notes about this workout..."
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
            <Card style={styles.workoutInfoCard}>
              <Card.Content>
                <Text style={styles.workoutTitle}>{workoutName}</Text>
                {workoutNotes && (
                  <Text style={styles.workoutNotes}>{workoutNotes}</Text>
                )}
                <View style={styles.workoutStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>{selectedExercises.length}</Text>
                    <Text style={styles.statLabel}>Exercises</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statNumber}>
                      {selectedExercises.reduce((total, ex) => total + ex.sets.length, 0)}
                    </Text>
                    <Text style={styles.statLabel}>Sets</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>

            {/* Exercise List */}
            {selectedExercises.map((exercise, exerciseIndex) => (
              <Card key={exerciseIndex} style={styles.exerciseCard}>
                <Card.Content>
                  <View style={styles.exerciseHeader}>
                    <View style={styles.exerciseInfo}>
                      <Text style={styles.exerciseName}>{exercise.name}</Text>
                      <Text style={styles.exerciseMuscles}>{exercise.muscle_groups}</Text>
                    </View>
                    <IconButton
                      icon="close"
                      size={20}
                      onPress={() => removeExercise(exerciseIndex)}
                    />
                  </View>

                  {/* Sets */}
                  <View style={styles.setsContainer}>
                    <View style={styles.setHeader}>
                      <Text style={styles.setHeaderText}>Set</Text>
                      <Text style={styles.setHeaderText}>Reps</Text>
                      <Text style={styles.setHeaderText}>Weight</Text>
                      <Text style={styles.setHeaderText}>✓</Text>
                    </View>
                    {exercise.sets.map((set, setIndex) => (
                      <View key={setIndex} style={styles.setRow}>
                        <Text style={styles.setNumber}>{setIndex + 1}</Text>
                        <TextInput
                          value={set.reps}
                          onChangeText={(value) =>
                            updateSet(exerciseIndex, setIndex, 'reps', value)
                          }
                          style={styles.setInput}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        <TextInput
                          value={set.weight}
                          onChangeText={(value) =>
                            updateSet(exerciseIndex, setIndex, 'weight', value)
                          }
                          style={styles.setInput}
                          keyboardType="numeric"
                          placeholder="0"
                        />
                        <TouchableOpacity
                          style={[
                            styles.checkButton,
                            set.completed && styles.checkButtonCompleted,
                          ]}
                          onPress={() => toggleSetComplete(exerciseIndex, setIndex)}
                        >
                          <Ionicons
                            name={set.completed ? 'checkmark' : 'ellipse-outline'}
                            size={20}
                            color={set.completed ? '#FFFFFF' : '#999999'}
                          />
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>

                  <View style={styles.setActions}>
                    <Button
                      mode="outlined"
                      onPress={() => addSet(exerciseIndex)}
                      compact
                      icon="plus"
                    >
                      Add Set
                    </Button>
                  </View>
                </Card.Content>
              </Card>
            ))}

            {/* Add Exercise Button */}
            <TouchableOpacity
              style={styles.addExerciseButton}
              onPress={() => setShowExerciseModal(true)}
            >
              <Ionicons name="add" size={24} color="#667EFF" />
              <Text style={styles.addExerciseText}>Add Exercise</Text>
            </TouchableOpacity>

            {/* Workout Actions */}
            <View style={styles.workoutActions}>
              <Button
                mode="outlined"
                onPress={cancelWorkout}
                style={styles.cancelButton}
                contentStyle={styles.actionButtonContent}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={finishWorkout}
                style={styles.finishButton}
                contentStyle={styles.actionButtonContent}
                disabled={selectedExercises.length === 0}
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
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <IconButton
              icon="close"
              onPress={() => setShowExerciseModal(false)}
            />
          </View>
          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
              <View key={category}>
                <Text style={styles.categoryTitle}>{category}</Text>
                {categoryExercises.map((exercise) => (
                  <List.Item
                    key={exercise.id}
                    title={exercise.name}
                    description={exercise.muscle_groups}
                    left={(props) => (
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: exercise.category_color + '20' },
                        ]}
                      >
                        <Ionicons
                          name="fitness"
                          size={24}
                          color={exercise.category_color}
                        />
                      </View>
                    )}
                    onPress={() => addExercise(exercise)}
                    style={styles.exerciseListItem}
                  />
                ))}
                <Divider style={styles.categoryDivider} />
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
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
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
  timerContainer: {
    backgroundColor: '#667EFF',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
  },
  timerText: {
    ...typography.body1,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  setupCard: {
    elevation: 2,
    borderRadius: 16,
  },
  sectionTitle: {
    ...typography.h4,
    color: '#333333',
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.md,
    backgroundColor: '#FFFFFF',
  },
  startButton: {
    marginTop: spacing.md,
    borderRadius: 24,
  },
  startButtonContent: {
    paddingVertical: spacing.sm,
  },
  workoutInfoCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  workoutTitle: {
    ...typography.h3,
    color: '#333333',
    marginBottom: spacing.sm,
  },
  workoutNotes: {
    ...typography.body2,
    color: '#666666',
    fontStyle: 'italic',
    marginBottom: spacing.md,
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
    color: '#667EFF',
    fontWeight: 'bold',
  },
  statLabel: {
    ...typography.caption,
    color: '#666666',
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
    color: '#333333',
  },
  exerciseMuscles: {
    ...typography.body2,
    color: '#666666',
    marginTop: 2,
  },
  setsContainer: {
    marginBottom: spacing.md,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  setHeaderText: {
    ...typography.body2,
    color: '#666666',
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  setNumber: {
    ...typography.body1,
    color: '#333333',
    fontWeight: '600',
    width: 30,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F5F5F5',
    textAlign: 'center',
  },
  checkButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButtonCompleted: {
    backgroundColor: '#4CAF50',
  },
  setActions: {
    alignItems: 'flex-start',
  },
  addExerciseButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderWidth: 2,
    borderColor: '#667EFF',
    borderStyle: 'dashed',
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  addExerciseText: {
    ...typography.body1,
    color: '#667EFF',
    fontWeight: '600',
  },
  workoutActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  cancelButton: {
    flex: 1,
    borderRadius: 24,
  },
  finishButton: {
    flex: 1,
    borderRadius: 24,
  },
  actionButtonContent: {
    paddingVertical: spacing.sm,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    margin: spacing.lg,
    borderRadius: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  modalTitle: {
    ...typography.h4,
    color: '#333333',
  },
  modalContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  categoryTitle: {
    ...typography.h4,
    color: '#333333',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  exerciseListItem: {
    paddingVertical: spacing.sm,
  },
  categoryDivider: {
    marginVertical: spacing.md,
  },
});
