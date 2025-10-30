import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { analyticsAPI } from '../services/api';
import { Ionicons } from '@expo/vector-icons';

export default function DashboardScreen() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await analyticsAPI.getDashboard();
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Dashboard</Title>
        <Paragraph>Overview of asset management</Paragraph>
      </View>

      <View style={styles.statsGrid}>
        <Card style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
          <Card.Content>
            <View style={styles.statContent}>
              <View>
                <Paragraph style={styles.statLabel}>Total Assets</Paragraph>
                <Title style={styles.statValue}>{stats?.totalAssets || 0}</Title>
              </View>
              <Ionicons name="cube" size={40} color="#3B82F6" />
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
          <Card.Content>
            <View style={styles.statContent}>
              <View>
                <Paragraph style={styles.statLabel}>Active</Paragraph>
                <Title style={styles.statValue}>{stats?.statusStats?.active || 0}</Title>
              </View>
              <Ionicons name="checkmark-circle" size={40} color="#10B981" />
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
          <Card.Content>
            <View style={styles.statContent}>
              <View>
                <Paragraph style={styles.statLabel}>Under Repair</Paragraph>
                <Title style={styles.statValue}>{stats?.statusStats?.under_repair || 0}</Title>
              </View>
              <Ionicons name="construct" size={40} color="#F59E0B" />
            </View>
          </Card.Content>
        </Card>

        <Card style={[styles.statCard, { backgroundColor: '#FEE2E2' }]}>
          <Card.Content>
            <View style={styles.statContent}>
              <View>
                <Paragraph style={styles.statLabel}>Missing</Paragraph>
                <Title style={styles.statValue}>{stats?.statusStats?.missing || 0}</Title>
              </View>
              <Ionicons name="alert-circle" size={40} color="#EF4444" />
            </View>
          </Card.Content>
        </Card>
      </View>

      <Card style={styles.card}>
        <Card.Title title="Recently Added Assets" />
        <Card.Content>
          {stats?.recentAssets?.slice(0, 5).map((asset: any) => (
            <View key={asset.id} style={styles.assetItem}>
              <View style={styles.assetInfo}>
                <Text style={styles.assetName}>{asset.name}</Text>
                <Text style={styles.assetSerial}>{asset.serial_number}</Text>
              </View>
              <Text style={styles.assetDept}>{asset.department_name || 'N/A'}</Text>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: 'white',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
  },
  statCard: {
    width: '48%',
    margin: '1%',
    marginBottom: 12,
  },
  statContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  card: {
    margin: 12,
  },
  assetItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  assetInfo: {
    flex: 1,
  },
  assetName: {
    fontSize: 16,
    fontWeight: '600',
  },
  assetSerial: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  assetDept: {
    fontSize: 12,
    color: '#6B7280',
  },
});
