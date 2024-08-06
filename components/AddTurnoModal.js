import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import Tesseract from 'tesseract.js';
import RegisterVehicle from './RegisterVehicle';

const AddTurnoModal = ({ firestore, onClose, onSave }) => {
  const [mechanics, setMechanics] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState('');
  const [selectedServices, setSelectedServices] = useState([]);
  const [licensePlate, setLicensePlate] = useState('');
  const [nombreCliente, setNombreCliente] = useState('');
  const [selectedHora, setSelectedHora] = useState('');
  const [newVehicle, setNewVehicle] = useState(false);
  const [vehicleVerified, setVehicleVerified] = useState(false);
  const [availableHours, setAvailableHours] = useState([]);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const mechanicsQuerySnapshot = await getDocs(query(collection(firestore, 'usuarios'), where('rol', '==', 'mecánico')));
        const fetchedMechanics = mechanicsQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMechanics(fetchedMechanics);
      } catch (error) {
        console.error("Error fetching mechanics: ", error);
      }
    };

    const fetchServices = async () => {
      try {
        const servicesQuerySnapshot = await getDocs(collection(firestore, 'servicios'));
        const fetchedServices = servicesQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setServices(fetchedServices);
      } catch (error) {
        console.error("Error fetching services: ", error);
      }
    };

    fetchMechanics();
    fetchServices();
    filterAvailableHours();
  }, [firestore]);

  const filterAvailableHours = () => {
    const now = new Date();
    const hours = [
      { label: "08:00 AM", value: "08:00" },
      { label: "09:00 AM", value: "09:00" },
      { label: "10:00 AM", value: "10:00" },
      { label: "11:00 AM", value: "11:00" },
      { label: "12:00 PM", value: "12:00" },
      { label: "01:00 PM", value: "13:00" },
      { label: "02:00 PM", value: "14:00" },
      { label: "03:00 PM", value: "15:00" },
      { label: "04:00 PM", value: "16:00" },
      { label: "05:00 PM", value: "17:00" },
      { label: "06:00 PM", value: "18:00" }
      // { label: "07:00 PM", value: "19:00" },
      // { label: "08:00 PM", value: "20:00" },
      // { label: "09:00 PM", value: "21:00" },
      // { label: "10:00 PM", value: "22:00" }
    ];

    const filteredHours = hours.filter(hour => {
      const [hourValue, minuteValue] = hour.value.split(":");
      const hourDate = new Date();
      hourDate.setHours(parseInt(hourValue), parseInt(minuteValue), 0, 0);
      return now < hourDate;
    });

    setAvailableHours(filteredHours);
  };

  const handleCheckLicensePlate = async () => {
    try {
      const vehicleQuerySnapshot = await getDocs(query(collection(firestore, 'vehiculos'), where('placa', '==', licensePlate)));
      if (vehicleQuerySnapshot.empty) {
        setNewVehicle(true);
        setVehicleVerified(false);
        Alert.alert('Placa no encontrada', 'El vehículo no está registrado. Por favor, ingresa los detalles del vehículo.');
      } else {
        setNewVehicle(false);
        setVehicleVerified(true);
        Alert.alert('Placa encontrada', 'El vehículo está registrado. Puedes proceder a registrar el turno.');
      }
    } catch (error) {
      console.error("Error checking license plate: ", error);
    }
  };

  const handleVehicleRegistered = () => {
    setVehicleVerified(true);
    setNewVehicle(false);
  };

  const handleServiceSelect = (serviceId) => {
    if (!selectedServices.includes(serviceId)) {
      setSelectedServices((prev) => [...prev, serviceId]);
    } else {
      Alert.alert('Servicio ya seleccionado', 'Este servicio ya ha sido seleccionado.');
    }
  };

  const handleRegisterTurno = async () => {
    if (!selectedMechanic || !selectedServices.length || !licensePlate || !nombreCliente || !selectedHora) {
      Alert.alert('Error', 'Por favor, completa todos los campos.');
      return;
    }

    const turnoData = {
      fecha: new Date().toISOString().split('T')[0], // Puedes ajustar esto según la fecha seleccionada
      hora: selectedHora,
      estado: 'pendiente',
      nombreCliente: nombreCliente,
      precio_total: '200', // Ajusta esto según los servicios seleccionados
      servicios: selectedServices,
      tiempo_total: '30', // Ajusta esto según los servicios seleccionados
      vehiculo_id: licensePlate,
      mecanico_id: selectedMechanic,
    };

    try {
      await addDoc(collection(firestore, 'turnos'), turnoData);
      Alert.alert('Turno registrado', 'El turno ha sido registrado correctamente.');
      onSave();
    } catch (error) {
      console.error("Error registering turno: ", error);
      Alert.alert('Error', 'No se pudo registrar el turno. Por favor, intenta de nuevo.');
    }
  };

  const handleScanLicensePlateWeb = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setOcrProcessing(true);
      try {
        const { data } = await Tesseract.recognize(
          file,
          'eng',
          {
            logger: (m) => console.log(m),
          }
        );
        console.log('OCR Result: ', data.text);
        setLicensePlate(data.text.trim());
      } catch (err) {
        console.error('OCR Error: ', err);
      }
      setOcrProcessing(false);
    }
  };

  const handleScanLicensePlateMobile = async () => {
    launchCamera({ mediaType: 'photo' }, async (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorMessage);
      } else {
        const source = { uri: response.assets[0].uri };
        console.log('Image source: ', source);

        setOcrProcessing(true);
        try {
          const { data } = await Tesseract.recognize(
            source.uri,
            'eng',
            {
              logger: (m) => console.log(m),
            }
          );
          console.log('OCR Result: ', data.text);
          setLicensePlate(data.text.trim());
        } catch (err) {
          console.error('OCR Error: ', err);
        }
        setOcrProcessing(false);
      }
    });
  };

  const handleScanLicensePlate = () => {
    if (Platform.OS === 'web') {
      document.getElementById('fileInput').click();
    } else {
      handleScanLicensePlateMobile();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Turno</Text>
      <TextInput
        style={styles.input}
        placeholder="Nombre del Cliente"
        value={nombreCliente}
        onChangeText={setNombreCliente}
      />
      <TextInput
        style={styles.input}
        placeholder="Placa del Vehículo"
        value={licensePlate}
        onChangeText={setLicensePlate}
      />
      <TouchableOpacity style={styles.checkButton} onPress={handleCheckLicensePlate}>
        <Text style={styles.checkButtonText}>Verificar Placa</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.scanButton} onPress={handleScanLicensePlate}>
        <Text style={styles.scanButtonText}>Escanear Placa</Text>
      </TouchableOpacity>
      {ocrProcessing && <Text style={styles.processingText}>Procesando OCR...</Text>}
      {newVehicle && (
        <RegisterVehicle firestore={firestore} licensePlate={licensePlate} onVehicleRegistered={handleVehicleRegistered} />
      )}
      <Text style={styles.label}>Seleccionar Hora</Text>
      <Picker
        selectedValue={selectedHora}
        style={styles.picker}
        onValueChange={(itemValue) => setSelectedHora(itemValue)}
      >
        <Picker.Item label="Selecciona una hora" value="" />
        {availableHours.map((hour) => (
          <Picker.Item key={hour.value} label={hour.label} value={hour.value} />
        ))}
      </Picker>
      <Text style={styles.label}>Seleccionar Mecánico</Text>
      <ScrollView style={styles.dropdown}>
        {mechanics.map((mechanic) => (
          <TouchableOpacity
            key={mechanic.id}
            style={[
              styles.dropdownItem,
              selectedMechanic === mechanic.id && styles.selectedItem,
            ]}
            onPress={() => setSelectedMechanic(mechanic.id)}
          >
            <Text>{mechanic.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <Text style={styles.label}>Seleccionar Servicios</Text>
      <ScrollView style={styles.dropdown}>
        {services.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={[
              styles.dropdownItem,
              selectedServices.includes(service.id) && styles.selectedItem,
            ]}
            onPress={() => handleServiceSelect(service.id)}
          >
            <Text>{service.nombre}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.saveButton, !vehicleVerified && styles.disabledButton]}
          onPress={handleRegisterTurno}
          disabled={!vehicleVerified}
        >
          <Text style={styles.saveButtonText}>Guardar Turno</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
      {Platform.OS === 'web' && (
        <input
          type="file"
          id="fileInput"
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleScanLicensePlateWeb}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 20,
    padding: 10,
  },
  checkButton: {
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
    marginBottom: 20,
  },
  checkButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scanButton: {
    padding: 10,
    backgroundColor: 'orange',
    borderRadius: 5,
    marginBottom: 20,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  processingText: {
    textAlign: 'center',
    marginVertical: 10,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dropdown: {
    maxHeight: 150,
    marginBottom: 20,
  },
  dropdownItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  selectedItem: {
    backgroundColor: '#ddd',
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
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    padding: 10,
    backgroundColor: 'red',
    borderRadius: 5,
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 20,
  },
});

export default AddTurnoModal;
