import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Modal, Alert } from 'react-native';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config'; 
import { AntDesign } from '@expo/vector-icons';


const ManageServicesScreen = () => {
  const [services, setServices] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [serviceName, setServiceName] = useState('');
  const [servicePrice, setServicePrice] = useState('');

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const servicesQuerySnapshot = await getDocs(collection(firestore, 'servicios'));
      const fetchedServices = servicesQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setServices(fetchedServices);
    } catch (error) {
      console.error("Error fetching services: ", error);
    }
  };

  const handleAddService = async () => {
    if (serviceName === '' || servicePrice === '') {
      Alert.alert('Por favor, complete todos los campos');
      return;
    }

    try {
      await addDoc(collection(firestore, 'servicios'), {
        nombre: serviceName,
        precio: servicePrice,
      });
      Alert.alert('Servicio agregado con éxito');
      fetchServices();
      setModalVisible(false);
      setServiceName('');
      setServicePrice('');
    } catch (error) {
      console.error("Error adding service: ", error);
      Alert.alert('Error al agregar el servicio:', error.message);
    }
  };

  const handleEditService = async () => {
    if (serviceName === '' || servicePrice === '') {
      Alert.alert('Por favor, complete todos los campos');
      return;
    }

    try {
      const serviceRef = doc(firestore, 'servicios', editingService.id);
      await updateDoc(serviceRef, {
        nombre: serviceName,
        precio: servicePrice,
      });
      Alert.alert('Servicio actualizado con éxito');
      fetchServices();
      setModalVisible(false);
      setEditingService(null);
      setServiceName('');
      setServicePrice('');
    } catch (error) {
      console.error("Error editing service: ", error);
      Alert.alert('Error al editar el servicio:', error.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    try {
      await deleteDoc(doc(firestore, 'servicios', serviceId));
      Alert.alert('Servicio eliminado con éxito');
      fetchServices();
    } catch (error) {
      console.error("Error deleting service: ", error);
      Alert.alert('Error al eliminar el servicio:', error.message);
    }
  };

  const openModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setServiceName(service.nombre);
      setServicePrice(service.precio);
    } else {
      setEditingService(null);
      setServiceName('');
      setServicePrice('');
    }
    setModalVisible(true);
  };

  const renderService = ({ item }) => (
    <View style={styles.serviceRow}>
      <Text style={styles.serviceText}>{item.nombre}</Text>
      <Text style={styles.serviceText}>{item.precio}</Text>
      <TouchableOpacity style={styles.iconButton} onPress={() => openModal(item)}>
        <AntDesign name="edit" size={24} color="black" />
      </TouchableOpacity>
      <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteService(item.id)}>
        <AntDesign name="delete" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestionar Servicios</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
        <Text style={styles.buttonText}>Agregar Servicio</Text>
      </TouchableOpacity>
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        style={styles.servicesList}
      />
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{editingService ? 'Editar Servicio' : 'Agregar Servicio'}</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre del Servicio"
            value={serviceName}
            onChangeText={setServiceName}
          />
          <TextInput
            style={styles.input}
            placeholder="Precio del Servicio"
            value={servicePrice}
            onChangeText={setServicePrice}
            keyboardType="numeric"
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.saveButton}
              onPress={editingService ? handleEditService : handleAddService}
            >
              <Text style={styles.buttonText}>{editingService ? 'Guardar Cambios' : 'Agregar Servicio'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginBottom: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  servicesList: {
    flexGrow: 0,
  },
  serviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  serviceText: {
    fontSize: 16,
  },
  iconButton: {
    padding: 5,
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    padding: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  saveButton: {
    padding: 10,
    backgroundColor: 'green',
    borderRadius: 5,
  },
  cancelButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
});

export default ManageServicesScreen;

