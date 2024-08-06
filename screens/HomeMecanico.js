import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, Modal, Alert } from 'react-native';
import { getFirestore, collection, getDocs, updateDoc, doc, query, where } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';

const HomeMecanico = ({ route }) => {
  const { email } = route.params || {};
  const [turnos, setTurnos] = useState([]);
  const [selectedTurno, setSelectedTurno] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const navigation = useNavigation();

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    fetchTurnos();
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const fetchTurnos = async () => {
    if (user) {
      try {
        const q = query(collection(firestore, 'turnos'), where('mecanico_id', '==', user.uid));
        const turnosQuerySnapshot = await getDocs(q);
        const fetchedTurnos = turnosQuerySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTurnos(fetchedTurnos);
      } catch (error) {
        console.error("Error fetching turnos: ", error);
      }
    }
  };

  const handleTurnoPress = (turno) => {
    setSelectedTurno(turno);
    setModalVisible(true);
    if (turno.estado === 'En proceso') {
      setIsRunning(true);
    } else {
      setIsRunning(false);
    }
  };

  const handleUpdateEstado = async (newEstado) => {
    if (!selectedTurno) return;

    let updatedTurno = { ...selectedTurno, estado: newEstado };

    if (newEstado === 'En proceso') {
      setIsRunning(true);
    } else if (newEstado === 'Pausado') {
      setIsRunning(false);
    } else if (newEstado === 'Finalizado') {
      setIsRunning(false);
      const tiempoEmpleado = formatTime(timer);
      updatedTurno = { ...updatedTurno, TiempoEmpleado: tiempoEmpleado };
      setTimer(0);
    }

    try {
      const turnoRef = doc(firestore, 'turnos', selectedTurno.id);
      await updateDoc(turnoRef, updatedTurno);
      fetchTurnos();
      setSelectedTurno(updatedTurno);
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating turno: ", error);
      Alert.alert('Error', 'No se pudo actualizar el turno. Por favor, intenta de nuevo.');
    }
  };

  const handleFinalizarTurno = async () => {
    setConfirmModalVisible(false);
    await handleUpdateEstado('Finalizado');
  };

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('LoginScreen');
      })
      .catch((error) => {
        Alert.alert('Error al cerrar sesión', error.message);
      });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const renderTurno = ({ item }) => (
    <TouchableOpacity style={[styles.turnoRow, getEstadoColor(item.estado)]} onPress={() => handleTurnoPress(item)}>
      <Text style={styles.turnoText}>{item.nombreCliente}</Text>
      <Text style={styles.turnoText}>{item.vehiculo_id}</Text>
      <Text style={styles.turnoText}>{item.estado}</Text>
      {item.estado === 'En proceso' && (
        <Text style={styles.turnoText}>{formatTime(timer)}</Text>
      )}
    </TouchableOpacity>
  );

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return { backgroundColor: '#FFD700' };
      case 'En proceso':
        return { backgroundColor: '#90EE90' };
      case 'Pausado':
        return { backgroundColor: '#FFA07A' };
      case 'Finalizado':
        return { backgroundColor: '#ADD8E6' };
      default:
        return { backgroundColor: '#FFFFFF' };
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <AntDesign name="closesquareo" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Turnos</Text>
      <FlatList
        data={turnos}
        renderItem={renderTurno}
        keyExtractor={(item) => item.id}
        style={styles.turnosList}
      />
      {selectedTurno && (
        <Modal visible={modalVisible} animationType="slide">
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Detalles del Turno</Text>
            <Text style={styles.modalText}>Cliente: {selectedTurno.nombreCliente}</Text>
            <Text style={styles.modalText}>Vehículo: {selectedTurno.vehiculo_id}</Text>
            <Text style={styles.modalText}>Estado: {selectedTurno.estado}</Text>
            <Text style={styles.modalText}>Tiempo Empleado: {formatTime(timer)}</Text>
            {selectedTurno.estado === 'pendiente' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpdateEstado('En proceso')}
              >
                <Text style={styles.buttonText}>Iniciar Turno</Text>
              </TouchableOpacity>
            )}
            {selectedTurno.estado === 'En proceso' && (
              <View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleUpdateEstado('Pausado')}
                >
                  <Text style={styles.buttonText}>Pausar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setConfirmModalVisible(true)}
                >
                  <Text style={styles.buttonText}>Finalizar</Text>
                </TouchableOpacity>
              </View>
            )}
            {selectedTurno.estado === 'Pausado' && (
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleUpdateEstado('En proceso')}
              >
                <Text style={styles.buttonText}>Reanudar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      )}
      <Modal visible={confirmModalVisible} animationType="slide" transparent>
        <View style={styles.confirmModalContainer}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmText}>¿Estás seguro de que deseas finalizar este turno?</Text>
            <View style={styles.confirmButtonContainer}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleFinalizarTurno}
              >
                <Text style={styles.buttonText}>Sí</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setConfirmModalVisible(false)}
              >
                <Text style={styles.buttonText}>No</Text>
              </TouchableOpacity>
            </View>
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
  turnosList: {
    flexGrow: 0,
  },
  turnoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  turnoText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  confirmModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  confirmModal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  confirmText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  confirmButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  confirmButton: {
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
});

export default HomeMecanico;

