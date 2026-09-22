import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert('Déconnexion', 'Se déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Oui', style: 'destructive', onPress: logout },
    ]);
  };

  const initials = user?.nom?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?';

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.nom}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role === 'technicien' ? '🔧 Technicien' : '👤 Client'}</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="account-edit" color="#e94560" title="Modifier le profil" subtitle="Nom, email" />
        <MenuItem icon="bell" color="#17a2b8" title="Notifications" subtitle="Gérer les alertes" />
        <MenuItem icon="shield-lock" color="#28a745" title="Sécurité" subtitle="Mot de passe" />
        <MenuItem icon="help-circle" color="#ffc107" title="Aide" subtitle="FAQ, support" />
        <MenuItem icon="information" color="#6c757d" title="À propos" subtitle="Version 1.0" />
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Icon name="logout" size={22} color="#dc3545" />
        <Text style={styles.logoutText}>Se déconnecter</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Assist'IT v1.0</Text>
    </ScrollView>
  );
};

const MenuItem = ({ icon, color, title, subtitle }: any) => (
  <View style={menuStyles.item}>
    <View style={[menuStyles.icon, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={22} color={color} />
    </View>
    <View style={menuStyles.content}>
      <Text style={menuStyles.title}>{title}</Text>
      <Text style={menuStyles.subtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-right" size={22} color="#666" />
  </View>
);

const menuStyles = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#16213e', borderRadius: 12, padding: 15, marginBottom: 10 },
  icon: { width: 42, height: 42, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  content: { flex: 1, marginLeft: 12 },
  title: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  subtitle: { color: '#888', fontSize: 12, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a2e' },
  header: { alignItems: 'center', padding: 30, backgroundColor: '#16213e', borderBottomLeftRadius: 25, borderBottomRightRadius: 25 },
  avatar: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#e94560', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#fff', marginTop: 12 },
  email: { fontSize: 13, color: '#888', marginTop: 4 },
  roleBadge: { marginTop: 10, backgroundColor: '#1a1a2e', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 12 },
  roleText: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  menu: { padding: 15 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, margin: 15, padding: 14, backgroundColor: '#16213e', borderRadius: 12, borderWidth: 1, borderColor: '#dc3545' },
  logoutText: { color: '#dc3545', fontSize: 15, fontWeight: 'bold' },
  footer: { color: '#666', fontSize: 12, textAlign: 'center', paddingBottom: 30 },
});

export default ProfileScreen;
