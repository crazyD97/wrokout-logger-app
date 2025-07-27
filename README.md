# Workout Logger

A comprehensive fitness tracking app built with React Native and Expo.

## Features

- **Workout Tracking**: Log and track your workouts with detailed exercise information
- **Progress Analytics**: View your fitness progress over time with charts and statistics
- **Calendar View**: See your workout history in a calendar format
- **Dark/Light Theme**: Switch between light and dark themes for better user experience
- **Settings Management**: Customize app preferences and user profile
- **Database Support**: Local SQLite database for data persistence

## Recent Improvements

### Theme System
- ✅ **Fixed SettingsScreen**: Now properly uses SettingsContext instead of local state
- ✅ **Enhanced Theme Integration**: All screens now use React Native Paper's `useTheme` hook
- ✅ **Improved Theme Constants**: Better color definitions and theme properties
- ✅ **Consistent Theming**: All components now respond to theme changes
- ✅ **Better Loading States**: Added proper loading indicators with theme colors

### Dark Mode Fixes
- ✅ **LogWorkoutScreen**: Fixed white backgrounds and text color issues in dark mode
- ✅ **ProgressScreen**: Fixed chart backgrounds and text colors for dark theme
- ✅ **CalendarScreen**: Improved calendar theme integration
- ✅ **Navigation**: Theme-aware tab bar and navigation elements

### Layout & UI Improvements
- ✅ **Calendar Layout**: Fixed calendar positioning to give more space to workouts section
- ✅ **Gradient Reduction**: Made gradients more subtle and less overwhelming
- ✅ **Flexible Calendar**: Added maxHeight constraint for better space distribution
- ✅ **Better Spacing**: Improved spacing and layout across all screens

### Settings & Context
- ✅ **Robust SettingsContext**: Better error handling and initialization
- ✅ **AsyncStorage Integration**: Proper fallback for web and mobile platforms
- ✅ **Reset Settings**: Added ability to reset all settings to defaults
- ✅ **Profile Management**: Edit user profile with proper validation

### Code Quality
- ✅ **Removed Hardcoded Colors**: All colors now use theme system
- ✅ **Better Error Handling**: Improved error handling throughout the app
- ✅ **Consistent Styling**: Unified styling approach across all screens
- ✅ **Performance Optimizations**: Better state management and rendering

## Technical Stack

- **React Native** with Expo
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **Expo SQLite** for database
- **React Native Calendars** for calendar functionality
- **Expo Linear Gradient** for gradient effects

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run on your preferred platform:
   ```bash
   npm run android
   npm run ios
   npm run web
   ```

## Theme System

The app uses a comprehensive theme system with:

- **Light Theme**: Clean, bright interface for daytime use
- **Dark Theme**: Easy on the eyes for low-light environments
- **Dynamic Switching**: Real-time theme changes without app restart
- **Consistent Colors**: All UI elements follow the theme color palette

## Settings

The app includes comprehensive settings:

- **Theme Toggle**: Switch between light and dark themes
- **Notifications**: Control workout reminders
- **Rest Timer Sound**: Enable/disable timer sounds
- **User Profile**: Manage personal information
- **Data Management**: Export, backup, and clear data
- **Reset Settings**: Return all settings to defaults

## Database

The app uses SQLite for data persistence with:

- **Workouts Table**: Store workout sessions
- **Exercises Table**: Exercise database
- **Categories Table**: Exercise categories
- **Personal Records**: Track personal bests
- **Web Fallback**: localStorage for web platform

## Recent Bug Fixes

### Dark Mode Issues (Fixed ✅)
- **LogWorkoutScreen**: Fixed white backgrounds and unreadable text in dark mode
- **ProgressScreen**: Fixed chart backgrounds and text colors for dark theme
- **CalendarScreen**: Improved calendar theme integration
- **Navigation**: Theme-aware tab bar styling

### Layout Issues (Fixed ✅)
- **Calendar Layout**: Calendar now has flexible height with maxHeight constraint
- **Workouts Section**: More space available for displaying selected date workouts
- **Gradient Intensity**: Reduced gradient intensity for better visual appeal
- **Spacing**: Improved spacing and layout consistency

### UI Improvements (Fixed ✅)
- **Subtle Gradients**: Made gradients more subtle and less overwhelming
- **Better Contrast**: Improved text contrast in both light and dark modes
- **Consistent Theming**: All components now properly follow theme colors
- **Responsive Layout**: Better space distribution across all screens

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 