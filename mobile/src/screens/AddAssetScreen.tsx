import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { TextInput, Button, Text, Title, Menu, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { assetAPI, departmentAPI } from '../services/api';

export default function AddAssetScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [location, setLocation] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');
  const [image, setImage] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [departmentMenuVisible, setDepartmentMenuVisible] = useState(false);
  const [statusMenuVisible, setStatusMenuVisible] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const response = await departmentAPI.getAll();
      setDepartments(response.data.data.departments);
    } catch (error) {
      Alert.alert('Error', 'Failed to load departments');
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant media library permission');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Please grant camera permission');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const handleSubmit = async () => {
    if (!name || !serialNumber || !departmentId) {
      Alert.alert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('serial_number', serialNumber);
      formData.append('department_id', departmentId);
      formData.append('status', status);
      if (location) formData.append('location', location);
      if (purchaseDate) formData.append('purchase_date', purchaseDate);
      if (purchasePrice) formData.append('purchase_price', purchasePrice);
      if (description) formData.append('description', description);

      if (image) {
        const uri = image.uri;
        const filename = uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';

        formData.append('image', {
          uri,
          name: filename,
          type,
        } as any);
      }

      await assetAPI.create(formData);
      Alert.alert('Success', 'Asset created successfully', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create asset');
    } finally {
      setLoading(false);
    }
  };

  const selectedDepartment = departments.find((d) => d.id.toString() === departmentId);
  const statusOptions = [
    { label: 'Active', value: 'active' },
    { label: 'Under Repair', value: 'under_repair' },
    { label: 'Retired', value: 'retired' },
    { label: 'Disposed', value: 'disposed' },
  ];
  const selectedStatus = statusOptions.find((s) => s.value === status);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.title}>Add New Asset</Title>
      </View>

      <View style={styles.form}>
        {/* Image Section */}
        <View style={styles.imageSection}>
          {image ? (
            <Image source={{ uri: image.uri }} style={styles.image} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No image selected</Text>
            </View>
          )}
          <View style={styles.imageButtons}>
            <Button mode="outlined" onPress={takePhoto} style={styles.imageButton}>
              Take Photo
            </Button>
            <Button mode="outlined" onPress={pickImage} style={styles.imageButton}>
              Choose Image
            </Button>
          </View>
        </View>

        {/* Form Fields */}
        <TextInput
          label="Asset Name *"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Serial Number *"
          value={serialNumber}
          onChangeText={setSerialNumber}
          mode="outlined"
          style={styles.input}
        />

        {/* Department Dropdown */}
        <Menu
          visible={departmentMenuVisible}
          onDismiss={() => setDepartmentMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setDepartmentMenuVisible(true)}
              style={styles.input}
              contentStyle={styles.dropdownButton}
            >
              {selectedDepartment ? selectedDepartment.name : 'Select Department *'}
            </Button>
          }
        >
          {departments.map((dept) => (
            <Menu.Item
              key={dept.id}
              onPress={() => {
                setDepartmentId(dept.id.toString());
                setDepartmentMenuVisible(false);
              }}
              title={dept.name}
            />
          ))}
        </Menu>

        {/* Status Dropdown */}
        <Menu
          visible={statusMenuVisible}
          onDismiss={() => setStatusMenuVisible(false)}
          anchor={
            <Button
              mode="outlined"
              onPress={() => setStatusMenuVisible(true)}
              style={styles.input}
              contentStyle={styles.dropdownButton}
            >
              {selectedStatus ? selectedStatus.label : 'Select Status'}
            </Button>
          }
        >
          {statusOptions.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => {
                setStatus(option.value);
                setStatusMenuVisible(false);
              }}
              title={option.label}
            />
          ))}
        </Menu>

        <TextInput
          label="Location"
          value={location}
          onChangeText={setLocation}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Purchase Date (YYYY-MM-DD)"
          value={purchaseDate}
          onChangeText={setPurchaseDate}
          mode="outlined"
          placeholder="2024-01-01"
          style={styles.input}
        />

        <TextInput
          label="Purchase Price"
          value={purchasePrice}
          onChangeText={setPurchasePrice}
          mode="outlined"
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          disabled={loading}
          style={styles.submitButton}
        >
          Create Asset
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { padding: 20, paddingTop: 60, backgroundColor: 'white' },
  title: { fontSize: 28, fontWeight: 'bold' },
  form: { padding: 20 },
  imageSection: { marginBottom: 20, alignItems: 'center' },
  image: { width: '100%', height: 200, borderRadius: 8, marginBottom: 12 },
  imagePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  imagePlaceholderText: { color: '#6B7280' },
  imageButtons: { flexDirection: 'row', gap: 10 },
  imageButton: { flex: 1 },
  input: { marginBottom: 16 },
  dropdownButton: { justifyContent: 'flex-start' },
  submitButton: { marginTop: 20, paddingVertical: 8 },
});
