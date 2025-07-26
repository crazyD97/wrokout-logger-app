import * as SQLite from 'expo-sqlite';

class DatabaseServiceImp {
  constructor() {
    this.db = null;
  }

  async init() {
    try {
      this.db = await SQLite.openDatabaseAsync('workoutLogger.db');
      await this.createTables();
      await this.seedExercises();
    } catch (error) {
      console.error('Database initialization error:', error);
    }
  }

  async createTables() {
    const queries = [
      // Users table
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Exercise categories
      `CREATE TABLE IF NOT EXISTS exercise_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        icon TEXT,
        color TEXT
      )`,
      
      // Exercises table
      `CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        category_id INTEGER,
        muscle_groups TEXT,
        equipment TEXT,
        instructions TEXT,
        image_url TEXT,
        FOREIGN KEY (category_id) REFERENCES exercise_categories (id)
      )`,
      
      // Workouts table
      `CREATE TABLE IF NOT EXISTS workouts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        date DATE NOT NULL,
        start_time TIME,
        end_time TIME,
        duration INTEGER,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      
      // Workout exercises (sets and reps)
      `CREATE TABLE IF NOT EXISTS workout_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        workout_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER,
        reps TEXT,
        weight TEXT,
        distance REAL,
        duration INTEGER,
        rest_time INTEGER,
        notes TEXT,
        FOREIGN KEY (workout_id) REFERENCES workouts (id) ON DELETE CASCADE,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      )`,
      
      // Personal records
      `CREATE TABLE IF NOT EXISTS personal_records (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        exercise_id INTEGER NOT NULL,
        record_type TEXT NOT NULL,
        value REAL NOT NULL,
        unit TEXT,
        date DATE NOT NULL,
        workout_id INTEGER,
        FOREIGN KEY (exercise_id) REFERENCES exercises (id),
        FOREIGN KEY (workout_id) REFERENCES workouts (id)
      )`
    ];

    for (const query of queries) {
      await this.db.execAsync(query);
    }
  }

  async seedExercises() {
    // Check if exercises already exist
    const result = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM exercises');
    if (result.count > 0) return;

    // Insert exercise categories
    const categories = [
      { name: 'Chest', icon: 'fitness', color: '#FF6B6B' },
      { name: 'Back', icon: 'body', color: '#4ECDC4' },
      { name: 'Legs', icon: 'walk', color: '#45B7D1' },
      { name: 'Shoulders', icon: 'fitness', color: '#96CEB4' },
      { name: 'Arms', icon: 'fitness', color: '#FECA57' },
      { name: 'Core', icon: 'fitness', color: '#FF9FF3' },
      { name: 'Cardio', icon: 'heart', color: '#54A0FF' },
    ];

    for (const category of categories) {
      await this.db.runAsync(
        'INSERT INTO exercise_categories (name, icon, color) VALUES (?, ?, ?)',
        [category.name, category.icon, category.color]
      );
    }

    // Insert sample exercises
    const exercises = [
      // Chest
      { name: 'Push-ups', category: 'Chest', muscles: 'Chest, Triceps, Shoulders', equipment: 'Bodyweight' },
      { name: 'Bench Press', category: 'Chest', muscles: 'Chest, Triceps, Shoulders', equipment: 'Barbell' },
      { name: 'Dumbbell Flyes', category: 'Chest', muscles: 'Chest', equipment: 'Dumbbells' },
      
      // Back
      { name: 'Pull-ups', category: 'Back', muscles: 'Lats, Biceps, Rhomboids', equipment: 'Pull-up Bar' },
      { name: 'Deadlifts', category: 'Back', muscles: 'Back, Glutes, Hamstrings', equipment: 'Barbell' },
      { name: 'Bent Over Rows', category: 'Back', muscles: 'Lats, Rhomboids', equipment: 'Barbell' },
      
      // Legs
      { name: 'Squats', category: 'Legs', muscles: 'Quadriceps, Glutes', equipment: 'Barbell' },
      { name: 'Lunges', category: 'Legs', muscles: 'Quadriceps, Glutes, Calves', equipment: 'Bodyweight' },
      { name: 'Leg Press', category: 'Legs', muscles: 'Quadriceps, Glutes', equipment: 'Machine' },
      
      // Shoulders
      { name: 'Shoulder Press', category: 'Shoulders', muscles: 'Shoulders, Triceps', equipment: 'Dumbbells' },
      { name: 'Lateral Raises', category: 'Shoulders', muscles: 'Shoulders', equipment: 'Dumbbells' },
      
      // Arms
      { name: 'Bicep Curls', category: 'Arms', muscles: 'Biceps', equipment: 'Dumbbells' },
      { name: 'Tricep Dips', category: 'Arms', muscles: 'Triceps', equipment: 'Bodyweight' },
      
      // Core
      { name: 'Plank', category: 'Core', muscles: 'Core, Shoulders', equipment: 'Bodyweight' },
      { name: 'Crunches', category: 'Core', muscles: 'Abs', equipment: 'Bodyweight' },
      
      // Cardio
      { name: 'Running', category: 'Cardio', muscles: 'Full Body', equipment: 'None' },
      { name: 'Cycling', category: 'Cardio', muscles: 'Legs, Core', equipment: 'Bike' },
    ];

    for (const exercise of exercises) {
      const categoryResult = await this.db.getFirstAsync(
        'SELECT id FROM exercise_categories WHERE name = ?',
        [exercise.category]
      );
      
      if (categoryResult) {
        await this.db.runAsync(
          'INSERT INTO exercises (name, category_id, muscle_groups, equipment) VALUES (?, ?, ?, ?)',
          [exercise.name, categoryResult.id, exercise.muscles, exercise.equipment]
        );
      }
    }
  }

  // Workout methods
  async createWorkout(workout) {
    const result = await this.db.runAsync(
      'INSERT INTO workouts (name, date, start_time, end_time, duration, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [workout.name, workout.date, workout.startTime, workout.endTime, workout.duration, workout.notes]
    );
    return result.lastInsertRowId;
  }

  async addExerciseToWorkout(workoutId, exercise) {
    return await this.db.runAsync(
      'INSERT INTO workout_exercises (workout_id, exercise_id, sets, reps, weight, distance, duration, rest_time, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [workoutId, exercise.exerciseId, exercise.sets, exercise.reps, exercise.weight, exercise.distance, exercise.duration, exercise.restTime, exercise.notes]
    );
  }

  async getWorkouts(limit = 10) {
    return await this.db.getAllAsync(
      'SELECT * FROM workouts ORDER BY date DESC, created_at DESC LIMIT ?',
      [limit]
    );
  }

  async getWorkoutById(id) {
    const workout = await this.db.getFirstAsync('SELECT * FROM workouts WHERE id = ?', [id]);
    if (workout) {
      const exercises = await this.db.getAllAsync(`
        SELECT we.*, e.name as exercise_name, e.muscle_groups, ec.name as category_name
        FROM workout_exercises we
        JOIN exercises e ON we.exercise_id = e.id
        JOIN exercise_categories ec ON e.category_id = ec.id
        WHERE we.workout_id = ?
      `, [id]);
      workout.exercises = exercises;
    }
    return workout;
  }

  async getExercises() {
    return await this.db.getAllAsync(`
      SELECT e.*, ec.name as category_name, ec.color as category_color
      FROM exercises e
      JOIN exercise_categories ec ON e.category_id = ec.id
      ORDER BY ec.name, e.name
    `);
  }

  async getExerciseCategories() {
    return await this.db.getAllAsync('SELECT * FROM exercise_categories ORDER BY name');
  }

  async getWorkoutStats() {
    const totalWorkouts = await this.db.getFirstAsync('SELECT COUNT(*) as count FROM workouts');
    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - 7);
    const weeklyWorkouts = await this.db.getFirstAsync(
      'SELECT COUNT(*) as count FROM workouts WHERE date >= ?',
      [thisWeek.toISOString().split('T')[0]]
    );
    
    return {
      totalWorkouts: totalWorkouts.count,
      weeklyWorkouts: weeklyWorkouts.count,
    };
  }

  async getWorkoutsByDateRange(startDate, endDate) {
    return await this.db.getAllAsync(
      'SELECT * FROM workouts WHERE date BETWEEN ? AND ? ORDER BY date',
      [startDate, endDate]
    );
  }
}

export const DatabaseService = new DatabaseServiceImp();
