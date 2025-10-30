import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { assetAPI } from '../services/api';

export default function ScanScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);

  const handleBarCodeScanned = async ({ type, data }: any) => {
    setScanned(true);
    setScanning(false);

    try {
      // Extract asset ID from URL
      const urlMatch = data.match(/\/asset\/(\d+)/);
      if (!urlMatch) {
        Alert.alert('Error', 'Invalid QR code format');
        return;
      }

      const assetId = parseInt(urlMatch[1]);

      // Navigate to asset detail
      navigation.navigate('AssetDetail', { assetId });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Asset not found');
    }
  };

  const startScanning = () => {
    setScanned(false);
    setScanning(true);
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.errorText}>Camera permission not granted</Text>
            <Text style={styles.infoText}>
              Please enable camera access in your device settings to scan QR codes.
            </Text>
            <Button mode="contained" onPress={requestPermission} style={styles.button}>
              Request Permission
            </Button>
          </Card.Content>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Scan QR Code</Text>
        <Text style={styles.headerSubtitle}>Point camera at asset QR code</Text>
      </View>

      {scanning ? (
        <View style={styles.scannerContainer}>
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ['qr'],
            }}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
          {scanned && (
            <View style={styles.scannedOverlay}>
              <Text style={styles.scannedText}>Processing...</Text>
            </View>
          )}
        </View>
      ) : (
        <View style={styles.instructionsContainer}>
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.instructionTitle}>How to scan:</Text>
              <Text style={styles.instructionText}>
                1. Tap the "Start Scanning" button below{'\n'}
                2. Point your camera at the QR code{'\n'}
                3. Keep the code within the frame{'\n'}
                4. Asset details will appear automatically
              </Text>
            </Card.Content>
          </Card>
        </View>
      )}

      {!scanning && (
        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={startScanning}
            icon="qrcode-scan"
            style={styles.scanButton}
          >
            Start Scanning
          </Button>
        </View>
      )}
    </View>
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
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  scanFrame: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  scannedOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  scannedText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  instructionsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 24,
    color: '#4B5563',
  },
  buttonContainer: {
    padding: 20,
  },
  scanButton: {
    paddingVertical: 8,
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#EF4444',
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
});
