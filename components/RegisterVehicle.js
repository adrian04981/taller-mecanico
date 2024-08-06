import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';

const RegisterVehicle = ({ firestore, licensePlate, onVehicleRegistered }) => {
  const [vehicleDetails, setVehicleDetails] = useState({
    marca: '',
    modelo: '',
    año: '',
    nombres: '',
    apellidos: '',
    dni: ''
  });

  const handleRegisterVehicle = async () => {
    if (Object.values(vehicleDetails).some(detail => detail === '')) {
      Alert.alert('Error', 'Por favor, completa todos los campos del vehículo.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'vehiculos'), { placa: licensePlate, ...vehicleDetails });
      Alert.alert('Vehículo registrado', 'El vehículo ha sido registrado correctamente.');
      onVehicleRegistered();
    } catch (error) {
      console.error("Error registering vehicle: ", error);
      Alert.alert('Error', 'No se pudo registrar el vehículo. Por favor, intenta de nuevo.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Vehículo</Text>
      <TextInput
        style={styles.input}
        placeholder="Marca"
        onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, marca: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Modelo"
        onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, modelo: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Año"
        onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, año: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Nombres del Propietario"
        onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, nombres: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="Apellidos del Propietario"
        onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, apellidos: text }))}
      />
      <TextInput
        style={styles.input}
        placeholder="DNI del Propietario"
        onChangeText={(text) => setVehicleDetails((prev) => ({ ...prev, dni: text }))}
      />
      <TouchableOpacity style={styles.saveButton} onPress={handleRegisterVehicle}>
        <Text style={styles.saveButtonText}>Registrar Vehículo</Text>
      </TouchableOpacity>
    </View>
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
});
export default RegisterVehicle;