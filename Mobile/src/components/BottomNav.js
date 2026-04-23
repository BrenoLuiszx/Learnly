import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

const tabs = [
  { name: 'Home',         label: 'Início',     icon: 'home' },
  { name: 'Courses',      label: 'Cursos',     icon: 'book' },
  { name: 'Saved',        label: 'Salvos',     icon: 'heart' },
  { name: 'Planning',     label: 'Planos',     icon: 'grid' },
  { name: 'Profile',      label: 'Perfil',     icon: 'person' },
];

const BottomNav = ({ currentRoute, navigation }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
      {tabs.map((tab) => {
        const active = currentRoute === tab.name;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.name)}
          >
            <View style={styles.iconWrap}>
              <Ionicons
                name={active ? tab.icon : `${tab.icon}-outline`}
                size={22}
                color={active ? theme.primary : theme.textSecondary}
              />
            </View>
            <Text style={[styles.label, { color: active ? theme.primary : theme.textSecondary }]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderTopWidth: 1,
    height: 64,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  iconWrap: {
    position: 'relative',
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default BottomNav;
