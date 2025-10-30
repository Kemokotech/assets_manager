import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, Platform } from 'react-native';
import { Card, Title, Paragraph, Chip, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { assetAPI, getFullImageUrl } from '../services/api';

export default function AssetDetailScreen({ route, navigation }: any) {
  const { assetId } = route.params;
  const [asset, setAsset] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadAsset();
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

  const loadAsset = async () => {
    try {
      const response = await assetAPI.getById(assetId);
      setAsset(response.data.data.asset);
    } catch (error) {
      Alert.alert('Error', 'Failed to load asset');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Asset', 'Are you sure you want to delete this asset?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            // Ensure assetId is a number
            const id = typeof assetId === 'string' ? parseInt(assetId) : assetId;
            await assetAPI.delete(id);
            // Navigate back immediately, then show success
            navigation.navigate('Assets');
            setTimeout(() => {
              Alert.alert('Success', 'Asset deleted successfully');
            }, 500);
          } catch (error: any) {
            console.error('Delete error:', error);
            console.error('Error response:', error.response?.data);
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.errors?.[0]?.msg ||
                               'Failed to delete asset';
            Alert.alert('Error', errorMessage);
          }
        },
      },
    ]);
  };

  const handleDownloadQRCode = async () => {
    try {
      if (!asset.qr_code_url) {
        Alert.alert('Error', 'QR code not available');
        return;
      }

      const qrCodeUrl = getFullImageUrl(asset.qr_code_url);
      if (!qrCodeUrl) {
        Alert.alert('Error', 'Invalid QR code URL');
        return;
      }

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      // Download file to cache
      const fileUri = FileSystem.cacheDirectory + `qr-${asset.serial_number}.png`;
      const downloadResult = await FileSystem.downloadAsync(qrCodeUrl, fileUri);

      // Share/Save the file
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: 'image/png',
        dialogTitle: 'Save QR Code',
        UTI: 'public.png'
      });

      // Success message is shown by the share dialog
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download QR code');
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
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

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!asset) return null;

  return (
    <ScrollView style={styles.container}>
      {/* Image */}
      {asset.image_url && (
        <Image source={{ uri: getFullImageUrl(asset.image_url) || '' }} style={styles.image} />
      )}

      {/* Main Info */}
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>{asset.name}</Title>
          <Paragraph style={styles.serial}>{asset.serial_number}</Paragraph>
          <Chip
            style={[styles.chip, { backgroundColor: getStatusColor(asset.status) }]}
            textStyle={{ color: 'white' }}
          >
            {getStatusLabel(asset.status)}
          </Chip>
        </Card.Content>
      </Card>

      {/* Details */}
      <Card style={styles.card}>
        <Card.Title title="Details" />
        <Card.Content>
          <View style={styles.row}>
            <Ionicons name="business" size={20} color="#6B7280" />
            <View style={styles.rowContent}>
              <Paragraph style={styles.label}>Department</Paragraph>
              <Paragraph style={styles.value}>{asset.department_name || 'N/A'}</Paragraph>
            </View>
          </View>

          <View style={styles.row}>
            <Ionicons name="location" size={20} color="#6B7280" />
            <View style={styles.rowContent}>
              <Paragraph style={styles.label}>Location</Paragraph>
              <Paragraph style={styles.value}>{asset.location || 'N/A'}</Paragraph>
            </View>
          </View>

          {asset.purchase_date && (
            <View style={styles.row}>
              <Ionicons name="calendar" size={20} color="#6B7280" />
              <View style={styles.rowContent}>
                <Paragraph style={styles.label}>Purchase Date</Paragraph>
                <Paragraph style={styles.value}>
                  {new Date(asset.purchase_date).toLocaleDateString()}
                </Paragraph>
              </View>
            </View>
          )}

          {asset.purchase_price && (
            <View style={styles.row}>
              <Ionicons name="cash" size={20} color="#6B7280" />
              <View style={styles.rowContent}>
                <Paragraph style={styles.label}>Purchase Price</Paragraph>
                <Paragraph style={styles.value}>${asset.purchase_price}</Paragraph>
              </View>
            </View>
          )}

          {asset.description && (
            <View style={styles.row}>
              <Ionicons name="document-text" size={20} color="#6B7280" />
              <View style={styles.rowContent}>
                <Paragraph style={styles.label}>Description</Paragraph>
                <Paragraph style={styles.value}>{asset.description}</Paragraph>
              </View>
            </View>
          )}
        </Card.Content>
      </Card>

      {/* QR Code */}
      {asset.qr_code_url && (
        <Card style={styles.card}>
          <Card.Title title="QR Code" />
          <Card.Content style={styles.qrContainer}>
            <Image source={{ uri: getFullImageUrl(asset.qr_code_url) || '' }} style={styles.qrCode} />
            <Paragraph style={styles.qrText}>Scan to view asset details</Paragraph>
            <Button
              mode="contained"
              icon="share-variant"
              onPress={handleDownloadQRCode}
              style={styles.downloadButton}
            >
              Save QR Code
            </Button>
          </Card.Content>
        </Card>
      )}

      {/* Actions */}
      {isAdmin && (
        <View style={styles.actions}>
          <Button
            mode="contained"
            icon="pencil"
            onPress={() => navigation.navigate('EditAsset', { assetId: asset.id })}
            style={styles.actionButton}
          >
            Edit
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            onPress={handleDelete}
            style={styles.actionButton}
            textColor="#EF4444"
          >
            Delete
          </Button>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  image: { width: '100%', height: 250 },
  card: { margin: 12 },
  title: { fontSize: 24, fontWeight: 'bold' },
  serial: { color: '#6B7280', marginTop: 4, fontSize: 14 },
  chip: { alignSelf: 'flex-start', marginTop: 12 },
  row: { flexDirection: 'row', paddingVertical: 12, alignItems: 'flex-start' },
  rowContent: { marginLeft: 12, flex: 1 },
  label: { fontSize: 12, color: '#6B7280', marginBottom: 2 },
  value: { fontSize: 16, color: '#111827' },
  qrContainer: { alignItems: 'center', paddingVertical: 16 },
  qrCode: { width: 200, height: 200, marginBottom: 12 },
  qrText: { color: '#6B7280', fontSize: 12, marginBottom: 16 },
  downloadButton: { marginTop: 8 },
  actions: { flexDirection: 'row', gap: 12, padding: 12, paddingBottom: 24 },
  actionButton: { flex: 1 },
});
