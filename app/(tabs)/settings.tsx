import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';

const SettingsScreen = () => {
  const { theme, setTheme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const colors = Colors[theme];

  const [darkMode, setDarkMode] = React.useState(theme === 'dark');

  // Sync darkMode state with theme changes
  React.useEffect(() => {
    setDarkMode(theme === 'dark');
  }, [theme]);

  const settingsSections = [
    {
      title: 'Account',
      items: [
        {
          icon: 'person',
          title: 'Profile',
          subtitle: user?.email || 'Not signed in',
          type: 'navigate',
        },
      ],
    },
    {
      title: 'App Settings',
      items: [
        {
          icon: 'moon',
          title: 'Dark Mode',
          subtitle: 'Use dark theme',
          type: 'switch',
          value: darkMode,
          onValueChange: (value: boolean) => {
            setDarkMode(value);
            setTheme(value ? 'dark' : 'light');
          },
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle',
          title: 'App Info',
          subtitle: 'BCI Library v1.0.0',
          type: 'navigate',
        },
      ],
    },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderSettingItem = (item: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.settingItem}
      activeOpacity={0.7}
      onPress={() => {
        if (item.type === 'navigate') {
          // Handle navigation here
          console.log(`Navigate to ${item.title}`);
        }
      }}
    >
      <ThemedView style={styles.settingItemLeft}>
        <ThemedView style={[styles.iconContainer, { backgroundColor: colors.tint + '20' }]}>
          <Ionicons name={item.icon as any} size={20} color={colors.tint} />
        </ThemedView>
        <ThemedView style={styles.settingText}>
          <ThemedText type="defaultSemiBold" style={styles.settingTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.settingSubtitle}>{item.subtitle}</ThemedText>
        </ThemedView>
      </ThemedView>
      
      {item.type === 'switch' ? (
        <Switch
          value={item.value}
          onValueChange={item.onValueChange}
          trackColor={{ false: colors.icon + '30', true: colors.tint + '50' }}
          thumbColor={item.value ? colors.tint : colors.icon}
        />
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.icon} />
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.headerTitle}>
          Settings
        </ThemedText>
        <ThemedText style={styles.headerSubtitle}>
          Customize your BCI Library experience
        </ThemedText>
      </ThemedView>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {settingsSections.map((section, sectionIndex) => (
          <ThemedView key={sectionIndex} style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
            <ThemedView style={styles.sectionContent}>
              {section.items.map((item, itemIndex) => renderSettingItem(item, itemIndex))}
            </ThemedView>
          </ThemedView>
        ))}
      </ScrollView>

        <ThemedView style={styles.logoutSection}>
          <TouchableOpacity
            style={[styles.logoutButton, { backgroundColor: '#FF3B30' }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={20} color="white" style={styles.logoutIcon} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </ThemedView>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginHorizontal: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    opacity: 0.6,
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: 12,
    marginTop: 20,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsScreen;
