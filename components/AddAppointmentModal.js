import React, { useState, useContext, useEffect } from 'react';
import { View, StyleSheet, TextInput, Modal, Button, Text, Picker } from 'react-native';
import { AppointmentsContext } from '../AppointmentsContext.js';
import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config'; // Asegúrate de tener este archivo configurado correctamente

const AddAppointmentModal = ({ visible, onClose }) => {
  const { appointments, setAppointments } = useContext(AppointmentsContext);
  const [newAppointmentTime, setNewAppointmentTime] = useState('');
  const [newClientName, setNewClientName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mechanics, setMechanics] = useState([]);
  const [selectedMechanic, setSelectedMechanic] = useState('');

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  useEffect(() => {
    const fetchMechanics = async () => {
      try {
        const querySnapshot = await getDocs(collection(firestore, 'usuarios'));
        const mechanicsList = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.rol === 'mecánico') {
            mechanicsList.push({ id: doc.id, nombre: data.nombre });
          }
        });
        setMechanics(mechanicsList);
      } catch (error) {
        console.error('Error al obtener mecánicos:', error);
      }
    };
    fetchMechanics();
  }, [firestore]);

  const addNewAppointment = async () => {
    if (!newAppointmentTime || !newClientName || !newDescription || !selectedMechanic) {
      alert('Por favor, complete todos los campos para agregar una nueva cita.');
      return;
    }

    const newAppointment = {
      nombreCliente: newClientName,
      fecha: new Date(`${selectedDate}T${newAppointmentTime}:00Z`),
      estado: 'Registrado',
      idMecanico: selectedMechanic,
      descripcion: newDescription,
    };

    try {
      // Agregar la nueva cita a Firestore
      await addDoc(collection(firestore, 'turnos'), newAppointment);

      // Actualizar el estado local
      const appointmentsCopy = { ...appointments };
      if (appointmentsCopy[selectedDate]) {
        appointmentsCopy[selectedDate].push(newAppointment);
      } else {
        appointmentsCopy[selectedDate] = [newAppointment];
      }
      setAppointments(appointmentsCopy);

      setNewAppointmentTime('');
      setNewClientName('');
      setNewDescription('');
      setSelectedMechanic('');
      onClose();
    } catch (error) {
      console.error('Error al agregar la cita:', error);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Agregar Nueva Cita</Text>
          <TextInput
            style={styles.input}
            placeholder="Hora (ej. 10:00)"
            value={newAppointmentTime}
            onChangeText={setNewAppointmentTime}
          />
          <TextInput
            style={styles.input}
            placeholder="Nombre del Cliente"
            value={newClientName}
            onChangeText={setNewClientName}
          />
          <TextInput
            style={styles.input}
            placeholder="Descripción"
            value={newDescription}
            onChangeText={setNewDescription}
          />
          <Picker
            selectedValue={selectedMechanic}
            style={styles.picker}
            onValueChange={(itemValue) => setSelectedMechanic(itemValue)}
          >
            <Picker.Item label="Seleccione un Mecánico" value="" />
            {mechanics.map((mechanic) => (
              <Picker.Item key={mechanic.id} label={mechanic.nombre} value={mechanic.id} />
            ))}
          </Picker>
          <View style={styles.modalButtons}>
            <Button title="Cancelar" onPress={onClose} />
            <Button title="Registrar" onPress={addNewAppointment} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
  },
  picker: {
    width: '100%',
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
});

export default AddAppointmentModal;
