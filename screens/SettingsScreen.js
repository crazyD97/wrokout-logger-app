import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {
  Card,
  List,
  Divider,
  Button,
  Dialog,
  Portal,
  TextInput,
  useTheme,
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { spacing, typography } from '../constants/theme';
import { useSettings } from '../contexts/SettingsContext';
import { DatabaseService } from '../database/DatabaseService';

export default function SettingsScreen({ navigation }) {
  const theme = useTheme();
  const {
    isDarkMode,
    notifications,
    restTimerSound,
    userProfile,
    toggleDarkMode,
    toggleNotifications,
    toggleRestTimerSound,
    updateUserProfile,
    resetSettings,
  } = useSettings();
  
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [editedProfile, setEditedProfile] = useState(userProfile);

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your workout data will be exported as a JSON file.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => {
            // Implementation would export data
            Alert.alert('Success', 'Data exported successfully!');
          },
        },
      ]
    );
  };

  const handleClearData = async () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your workouts and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.clearAllData();
              Alert.alert('Success', 'All data has been cleared.');
              // Optionally trigger a refresh event for other screens
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data.');
            }
          },
        },
      ]
    );
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate Workout Logger',
      'If you enjoy using Workout Logger, please consider rating us on the App Store!',
      [
        { text: 'Maybe Later', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => {
            // Implementation would open app store
          },
        },
      ]
    );
  };

  const settingSections = [
    {
      title: 'Profile',
      items: [
        {
          title: 'Personal Information',
          description: 'Name, email, and body metrics',
          icon: 'person',
          onPress: () => {
            // Navigate to profile edit screen
          },
        },
        {
          title: 'Workout Preferences',
          description: 'Default rest times, units, and more',
          icon: 'settings',
          onPress: () => {
            // Navigate to workout preferences
          },
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          title: 'Dark Mode',
          description: 'Switch between light and dark themes',
          icon: 'moon',
          type: 'switch',
          value: isDarkMode,
          onValueChange: toggleDarkMode,
        },
        {
          title: 'Notifications',
          description: 'Workout reminders and achievements',
          icon: 'notifications',
          type: 'switch',
          value: notifications,
          onValueChange: toggleNotifications,
        },
        {
          title: 'Rest Timer Sound',
          description: 'Play sound when rest timer expires',
          icon: 'volume-high',
          type: 'switch',
          value: restTimerSound,
          onValueChange: toggleRestTimerSound,
        },
      ],
    },
    {
      title: 'Data & Privacy',
      items: [
        {
          title: 'Export Data',
          description: 'Download your workout data',
          icon: 'download',
          onPress: handleExportData,
        },
        {
          title: 'Backup & Sync',
          description: 'Cloud backup and device sync',
          icon: 'cloud',
          onPress: () => setShowBackupDialog(true),
        },
        {
          title: 'Clear All Data',
          description: 'Permanently delete all workouts',
          icon: 'trash',
          danger: true,
          onPress: handleClearData,
        },
        {
          title: 'Reset Settings',
          description: 'Reset all app settings to default',
          icon: 'refresh',
          danger: true,
          onPress: () => {
            Alert.alert(
              'Reset Settings',
              'This will reset all app settings to their default values. Are you sure?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Reset',
                  style: 'destructive',
                  onPress: () => {
                    resetSettings();
                    Alert.alert('Success', 'Settings have been reset to default values.');
                  },
                },
              ]
            );
          },
        },
      ],
    },
    {
      title: 'Support',
      items: [
        {
          title: 'Help & FAQ',
          description: 'Get help and find answers',
          icon: 'help-circle',
          onPress: () => {
            // Navigate to help screen
          },
        },
        {
          title: 'Contact Support',
          description: 'Get in touch with our team',
          icon: 'mail',
          onPress: () => {
            // Open email or contact form
          },
        },
        {
          title: 'Rate App',
          description: 'Share your feedback',
          icon: 'star',
          onPress: handleRateApp,
        },
        {
          title: 'About',
          description: 'App version and information',
          icon: 'information-circle',
          onPress: () => setShowAboutDialog(true),
        },
      ],
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.onSurface} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Summary */}
        <Card style={[styles.profileCard, { backgroundColor: theme.colors.surface }]}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={64} color={theme.colors.primary} />
              </View>
              <View style={styles.profileInfo}>
                <Text style={[styles.profileName, { color: theme.colors.onSurface }]}>{userProfile.name}</Text>
                <Text style={[styles.profileEmail, { color: theme.colors.onSurfaceVariant }]}>{userProfile.email}</Text>
                <Text style={[styles.profileStats, { color: theme.colors.onSurfaceVariant }]}>
                  {userProfile.height} • {userProfile.weight} lbs
                </Text>
              </View>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => {
                  setEditedProfile(userProfile);
                  setShowProfileDialog(true);
                }}
              >
                <Ionicons name="pencil" size={20} color={theme.colors.primary} />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}>
            <Card.Content>
              <Text style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <List.Item
                    title={item.title}
                    description={item.description}
                    left={(props) => (
                      <View style={[styles.listIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                        <Ionicons
                          name={item.icon}
                          size={24}
                          color={item.danger ? theme.colors.error : theme.colors.primary}
                        />
                      </View>
                    )}
                    right={(props) => {
                      if (item.type === 'switch') {
                        return (
                          <Switch
                            value={item.value}
                            onValueChange={item.onValueChange}
                            thumbColor={item.value ? theme.colors.primary : theme.colors.outline}
                            trackColor={{ 
                              false: theme.colors.outline, 
                              true: theme.colors.primaryContainer 
                            }}
                          />
                        );
                      }
                      return (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={theme.colors.onSurfaceVariant}
                        />
                      );
                    }}
                    onPress={item.onPress}
                    style={[
                      styles.listItem,
                      item.danger && styles.dangerItem,
                    ]}
                    titleStyle={[
                      styles.listItemTitle,
                      { color: theme.colors.onSurface },
                      item.danger && { color: theme.colors.error },
                    ]}
                    descriptionStyle={[styles.listItemDescription, { color: theme.colors.onSurfaceVariant }]}
                  />
                  {itemIndex < section.items.length - 1 && (
                    <Divider style={styles.divider} />
                  )}
                </View>
              ))}
            </Card.Content>
          </Card>
        ))}

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={[styles.appInfoText, { color: theme.colors.onSurfaceVariant }]}>Workout Logger v1.0.0</Text>
          <Text style={[styles.appInfoText, { color: theme.colors.onSurfaceVariant }]}>Made with ❤️ for fitness enthusiasts</Text>
        </View>
      </ScrollView>

      {/* About Dialog */}
      <Portal>
        <Dialog
          visible={showAboutDialog}
          onDismiss={() => setShowAboutDialog(false)}
        >
          <Dialog.Title>About Workout Logger</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.dialogText, { color: theme.colors.onSurface }]}>
              Workout Logger is a comprehensive fitness tracking app designed to help you
              achieve your fitness goals.
            </Text>
            <Text style={[styles.dialogText, { marginTop: spacing.md, color: theme.colors.onSurface }]}>
              Version: 1.0.0{'\n'}
              Build: 1001{'\n'}
              Release Date: 2024
            </Text>
            <Text style={[styles.dialogText, { marginTop: spacing.md, color: theme.colors.onSurface }]}>
              Features:{'\n'}
              • Workout tracking{'\n'}
              • Progress analytics{'\n'}
              • Exercise database{'\n'}
              • Calendar view{'\n'}
              • Personal records
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowAboutDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Backup Dialog */}
      <Portal>
        <Dialog
          visible={showBackupDialog}
          onDismiss={() => setShowBackupDialog(false)}
        >
          <Dialog.Title>Backup & Sync</Dialog.Title>
          <Dialog.Content>
            <Text style={[styles.dialogText, { color: theme.colors.onSurface }]}>
              Keep your workout data safe and synchronized across all your devices.
            </Text>
            <Text style={[styles.dialogText, { marginTop: spacing.md, color: theme.colors.onSurface }]}>
              Current status: Local storage only
            </Text>
            <View style={styles.backupOptions}>
              <Button
                mode="outlined"
                style={styles.backupButton}
                onPress={() => {
                  setShowBackupDialog(false);
                  Alert.alert('Coming Soon', 'Cloud backup will be available in a future update.');
                }}
              >
                Enable Cloud Backup
              </Button>
              <Button
                mode="outlined"
                style={styles.backupButton}
                onPress={() => {
                  setShowBackupDialog(false);
                  handleExportData();
                }}
              >
                Manual Backup
              </Button>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowBackupDialog(false)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* Profile Edit Dialog */}
      <Portal>
        <Dialog
          visible={showProfileDialog}
          onDismiss={() => setShowProfileDialog(false)}
        >
          <Dialog.Title>Edit Profile</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Name"
              value={editedProfile.name}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, name: text })}
              style={{ marginBottom: spacing.md }}
            />
            <TextInput
              label="Email"
              value={editedProfile.email}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, email: text })}
              style={{ marginBottom: spacing.md }}
            />
            <TextInput
              label="Height"
              value={editedProfile.height}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, height: text })}
              style={{ marginBottom: spacing.md }}
            />
            <TextInput
              label="Weight (lbs)"
              value={editedProfile.weight}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, weight: text })}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setShowProfileDialog(false)}>Cancel</Button>
            <Button 
              onPress={() => {
                updateUserProfile(editedProfile);
                setShowProfileDialog(false);
                Alert.alert('Success', 'Profile updated successfully!');
              }}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
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
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  profileCard: {
    elevation: 2,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: spacing.md,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...typography.h4,
  },
  profileEmail: {
    ...typography.body2,
    marginTop: 2,
  },
  profileStats: {
    ...typography.caption,
    marginTop: 4,
  },
  editButton: {
    padding: spacing.sm,
  },
  sectionCard: {
    elevation: 1,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h4,
    marginBottom: spacing.sm,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  listItem: {
    paddingHorizontal: 0,
    paddingVertical: spacing.sm,
  },
  listItemTitle: {
    ...typography.body1,
    fontWeight: '600',
  },
  listItemDescription: {
    ...typography.body2,
  },
  dangerItem: {
    // Additional styling for dangerous actions
  },
  divider: {
    marginVertical: spacing.xs,
    marginLeft: 56, // Align with text after icon
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    marginBottom: spacing.xl,
  },
  appInfoText: {
    ...typography.caption,
    textAlign: 'center',
    marginBottom: 4,
  },
  dialogText: {
    ...typography.body2,
    lineHeight: 20,
  },
  backupOptions: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  backupButton: {
    borderRadius: 24,
  },
});
