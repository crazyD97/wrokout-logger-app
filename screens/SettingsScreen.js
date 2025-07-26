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
} from 'react-native-paper';
import Ionicons from '@expo/vector-icons/Ionicons';
import { spacing, typography, lightTheme, darkTheme } from '../constants/theme';

export default function SettingsScreen({ navigation }) {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [restTimerSound, setRestTimerSound] = useState(true);
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showBackupDialog, setShowBackupDialog] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    weight: '175',
    height: '5\'10"',
  });

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

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your workouts and cannot be undone. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: () => {
            // Implementation would clear database
            Alert.alert('Success', 'All data has been cleared.');
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
          value: darkMode,
          onValueChange: setDarkMode,
        },
        {
          title: 'Notifications',
          description: 'Workout reminders and achievements',
          icon: 'notifications',
          type: 'switch',
          value: notifications,
          onValueChange: setNotifications,
        },
        {
          title: 'Rest Timer Sound',
          description: 'Play sound when rest timer expires',
          icon: 'volume-high',
          type: 'switch',
          value: restTimerSound,
          onValueChange: setRestTimerSound,
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
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#333333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Summary */}
        <Card style={styles.profileCard}>
          <Card.Content>
            <View style={styles.profileHeader}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-circle" size={64} color="#667EFF" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{userProfile.name}</Text>
                <Text style={styles.profileEmail}>{userProfile.email}</Text>
                <Text style={styles.profileStats}>
                  {userProfile.height} • {userProfile.weight} lbs
                </Text>
              </View>
              <TouchableOpacity style={styles.editButton}>
                <Ionicons name="pencil" size={20} color="#667EFF" />
              </TouchableOpacity>
            </View>
          </Card.Content>
        </Card>

        {/* Settings Sections */}
        {settingSections.map((section, sectionIndex) => (
          <Card key={sectionIndex} style={styles.sectionCard}>
            <Card.Content>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex}>
                  <List.Item
                    title={item.title}
                    description={item.description}
                    left={(props) => (
                      <View style={styles.listIcon}>
                        <Ionicons
                          name={item.icon}
                          size={24}
                          color={item.danger ? '#F44336' : '#667EFF'}
                        />
                      </View>
                    )}
                    right={(props) => {
                      if (item.type === 'switch') {
                        return (
                          <Switch
                            value={item.value}
                            onValueChange={item.onValueChange}
                            thumbColor={item.value ? '#667EFF' : '#f4f3f4'}
                            trackColor={{ false: '#767577', true: '#667EFF80' }}
                          />
                        );
                      }
                      return (
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color="#CCCCCC"
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
                      item.danger && styles.dangerText,
                    ]}
                    descriptionStyle={styles.listItemDescription}
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
          <Text style={styles.appInfoText}>Workout Logger v1.0.0</Text>
          <Text style={styles.appInfoText}>Made with ❤️ for fitness enthusiasts</Text>
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
            <Text style={styles.dialogText}>
              Workout Logger is a comprehensive fitness tracking app designed to help you
              achieve your fitness goals.
            </Text>
            <Text style={[styles.dialogText, { marginTop: spacing.md }]}>
              Version: 1.0.0{'\n'}
              Build: 1001{'\n'}
              Release Date: 2024
            </Text>
            <Text style={[styles.dialogText, { marginTop: spacing.md }]}>
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
            <Text style={styles.dialogText}>
              Keep your workout data safe and synchronized across all your devices.
            </Text>
            <Text style={[styles.dialogText, { marginTop: spacing.md }]}>
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
    color: '#333333',
  },
  profileEmail: {
    ...typography.body2,
    color: '#666666',
    marginTop: 2,
  },
  profileStats: {
    ...typography.caption,
    color: '#999999',
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
    color: '#333333',
    marginBottom: spacing.sm,
  },
  listIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F2FF',
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
    color: '#333333',
    fontWeight: '600',
  },
  listItemDescription: {
    ...typography.body2,
    color: '#666666',
  },
  dangerItem: {
    // Additional styling for dangerous actions
  },
  dangerText: {
    color: '#F44336',
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
    color: '#999999',
    textAlign: 'center',
    marginBottom: 4,
  },
  dialogText: {
    ...typography.body2,
    color: '#333333',
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
