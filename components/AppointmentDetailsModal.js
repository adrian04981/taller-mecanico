import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Modal, Button } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config'; // Asegúrate de tener este archivo configurado correctamente

const AppointmentDetailsModal = ({ visible, appointment, onClose }) => {
  const [mechanicName, setMechanicName] = useState('');

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);

  useEffect(() => {
    const fetchMechanicName = async () => {
      if (appointment) {
        const mechanicDocRef = doc(firestore, 'usuarios', appointment.idMecanico);
        const mechanicDocSnap = await getDoc(mechanicDocRef);

        if (mechanicDocSnap.exists()) {
          setMechanicName(mechanicDocSnap.data().nombre);
        } else {
          setMechanicName('Desconocido');
        }
      }
    };

    fetchMechanicName();
  }, [appointment]);

  if (!appointment) {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Detalles de la Cita</Text>
          <Text style={styles.modalText}>Nombre del Cliente: {appointment.nombreCliente}</Text>
          <Text style={styles.modalText}>Fecha: {appointment.fecha.toDate().toISOString()}</Text>
          <Text style={styles.modalText}>Estado: {appointment.estado}</Text>
          <Text style={styles.modalText}>Mecánico: {mechanicName}</Text>
          <Text style={styles.modalText}>Descripción: {appointment.descripcion}</Text>
          <Button title="Cerrar" onPress={onClose} />
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
  modalText: {
    marginBottom: 10,
  },
});

export default AppointmentDetailsModal;
