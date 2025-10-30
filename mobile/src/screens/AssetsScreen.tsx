import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Card, Text, Searchbar, Chip, FAB, Menu, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { assetAPI, departmentAPI, getFullImageUrl } from '../services/api';

export default function AssetsScreen({ navigation }: any) {
  const [assets, setAssets] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);
  const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadInitialData();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setIsAdmin(user.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  useEffect(() => {
    navigation.addListener('focus', () => {
      fetchAssets();
    });
  }, [navigation]);

  useEffect(() => {
    fetchAssets();
  }, [searchQuery, statusFilter, departmentFilter]);

  const loadInitialData = async () => {
    await Promise.all([fetchAssets(), fetchDepartments()]);
  };

  const fetchAssets = async () => {
    try {
      const params: any = {};
      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (departmentFilter) params.department = departmentFilter;

      const response = await assetAPI.getAll(params);
      setAssets(response.data.data.assets);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data.departments);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAssets();
  };

  const clearFilters = () => {
    setStatusFilter('');
    setDepartmentFilter('');
    setSearchQuery('');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: '#10B981',
      under_repair: '#F59E0B',
      retired: '#6B7280',
      disposed: '#EF4444',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: any = {
      active: 'Active',
      under_repair: 'Under Repair',
      retired: 'Retired',
      disposed: 'Disposed',
    };
    return labels[status] || status;
  };

  const renderAsset = ({ item }: any) => (
    <TouchableOpacity onPress={() => navigation.navigate('AssetDetail', { assetId: item.id })}>
      <Card style={styles.card}>
        {item.image_url && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: getFullImageUrl(item.image_url) || '' }} style={styles.cardImage} />
          </View>
        )}
        <Card.Content>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.serial}>{item.serial_number}</Text>
            </View>
            <Chip
              style={{ backgroundColor: getStatusColor(item.status) }}
              textStyle={{ color: 'white', fontSize: 11 }}
            >
              {getStatusLabel(item.status)}
            </Chip>
          </View>
          <View style={styles.footer}>
            <View style={styles.footerItem}>
              <Ionicons name="business" size={14} color="#6B7280" />
              <Text style={styles.footerText}>{item.department_name || 'N/A'}</Text>
            </View>
            {item.location && (
              <View style={styles.footerItem}>
                <Ionicons name="location" size={14} color="#6B7280" />
                <Text style={styles.footerText}>{item.location}</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Under Repair', value: 'under_repair' },
    { label: 'Retired', value: 'retired' },
    { label: 'Disposed', value: 'disposed' },
  ];

  const hasFilters = statusFilter || departmentFilter;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search assets..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <Menu
            visible={statusMenuVisible}
            onDismiss={() => setStatusMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setStatusMenuVisible(true)}
                style={styles.filterButton}
                icon="filter"
              >
                {statusFilter ? getStatusLabel(statusFilter) : 'Status'}
              </Button>
            }
          >
            {statusOptions.map((option) => (
              <Menu.Item
                key={option.value}
                onPress={() => {
                  setStatusFilter(option.value);
                  setStatusMenuVisible(false);
                }}
                title={option.label}
              />
            ))}
          </Menu>

          <Menu
            visible={departmentMenuVisible}
            onDismiss={() => setDepartmentMenuVisible(false)}
            anchor={
              <Button
                mode="outlined"
                onPress={() => setDepartmentMenuVisible(true)}
                style={styles.filterButton}
                icon="office-building"
              >
                {departmentFilter
                  ? departments.find((d) => d.id.toString() === departmentFilter)?.name || 'Department'
                  : 'Department'}
              </Button>
            }
          >
            <Menu.Item
              onPress={() => {
                setDepartmentFilter('');
                setDepartmentMenuVisible(false);
              }}
              title="All Departments"
            />
            {departments.map((dept) => (
              <Menu.Item
                key={dept.id}
                onPress={() => {
                  setDepartmentFilter(dept.id.toString());
                  setDepartmentMenuVisible(false);
                }}
                title={dept.name}
              />
            ))}
          </Menu>

          {hasFilters && (
            <Button mode="text" onPress={clearFilters} style={styles.clearButton}>
              Clear
            </Button>
          )}
        </ScrollView>
      </View>

      <FlatList
        data={assets}
        renderItem={renderAsset}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyText}>No assets found</Text>
          </View>
        }
      />

      {isAdmin && (
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddAsset')}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  searchContainer: { paddingTop: 60, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: 'white' },
  searchbar: { marginBottom: 12 },
  filtersContainer: { flexDirection: 'row', marginBottom: 8 },
  filterButton: { marginRight: 8 },
  clearButton: { marginRight: 8 },
  list: { padding: 12, paddingBottom: 80 },
  card: { marginBottom: 12 },
  imageContainer: { overflow: 'hidden', borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  cardImage: { width: '100%', height: 150 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  name: { fontSize: 16, fontWeight: 'bold' },
  serial: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  footer: { flexDirection: 'row', gap: 16, marginTop: 8 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: '#6B7280' },
  fab: { position: 'absolute', right: 16, bottom: 16, backgroundColor: '#3B82F6' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#9CA3AF' },
});
