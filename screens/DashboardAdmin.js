import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getAuth, signOut } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config';
import CalendarComponent from '../components/CalendarComponent';
import AddTurnoModal from '../components/AddTurnoModal';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import AntDesign from '@expo/vector-icons/AntDesign';
const DashboardAdmin = () => {
  const [appointments, setAppointments] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  // Inicializa Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  const fetchAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(firestore, 'turnos'));
      const fetchedAppointments = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.fecha;
        const time = data.hora;
        if (date) {
          if (fetchedAppointments[date]) {
            fetchedAppointments[date].push({ id: doc.id, ...data });
          } else {
            fetchedAppointments[date] = [{ id: doc.id, ...data }];
          }
        } else {
          console.error('Fecha no válida en el documento:', doc.id);
        }
      });
      setAppointments(fetchedAppointments);
    } catch (error) {
      console.error("Error fetching appointments: ", error);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigation.navigate('LoginScreen');
      })
      .catch((error) => {
        Alert.alert('Error al cerrar sesión', error.message);
      });
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleAppointmentPress = (appointment) => {
    console.log('Appointment pressed:', appointment);
  };

  const handleAddTurnoPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleSaveTurno = () => {
    fetchAppointments();
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Buenos días, Administrador</Text>
        <TouchableOpacity onPress={handleLogout}>
          <AntDesign name="closesquareo" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={handleAddTurnoPress} style={styles.addButton}>
        <Text style={styles.addButtonText}>Agregar Turno</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <AddTurnoModal
              firestore={firestore}
              onClose={handleCloseModal}
              onSave={handleSaveTurno}
            />
          </View>
        </View>
      </Modal>
      <CalendarComponent
        onDayPress={handleDayPress}
        selectedDate={selectedDate}
        onAppointmentPress={handleAppointmentPress}
        appointments={appointments}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    alignSelf: 'center',
    marginTop: 10,
    padding: 10,
    backgroundColor: 'blue',
    borderRadius: 5,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
});

export default DashboardAdmin;

