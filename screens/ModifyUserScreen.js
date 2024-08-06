import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { getFirestore, doc, getDoc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { firebaseConfig } from '../firebase-config';

const ModifyUserScreen = ({ route }) => {
  const { email } = route.params || {};
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correo, setCorreo] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');

  const app = initializeApp(firebaseConfig);
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const user = auth.currentUser;

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    if (user) {
      try {
        const userDocRef = doc(firestore, 'usuarios', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);

        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
          setNombre(userData.nombre);
          setApellidos(userData.apellidos);
          setCorreo(userData.correo);
          setDni(userData.dni);
          setTelefono(userData.telefono);
        } else {
          console.log('No se encontró el documento de usuario.');
        }
      } catch (error) {
        console.error('Error al obtener datos del usuario: ', error);
      }
    }
  };

  const handleUpdateUser = async () => {
    if (!user) return;

    try {
      const userDocRef = doc(firestore, 'usuarios', user.uid);
      await updateDoc(userDocRef, {
        nombre: nombre,
        apellidos: apellidos,
        correo: correo,
        dni: dni,
        telefono: telefono,
      });
      Alert.alert('Éxito', 'Los datos del usuario se actualizaron correctamente.');
    } catch (error) {
      console.error('Error al actualizar datos del usuario: ', error);
      Alert.alert('Error', 'No se pudieron actualizar los datos del usuario. Por favor, intenta de nuevo.');
    }
  };

  const handleReset = () => {
    fetchUserData();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Modificar Datos de Usuario</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Nombre:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            value={nombre}
            onChangeText={setNombre}
          />
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Apellidos:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Apellidos"
            value={apellidos}
            onChangeText={setApellidos}
          />
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Correo:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Correo"
            value={correo}
            onChangeText={setCorreo}
          />
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>DNI:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="DNI"
            value={dni}
            onChangeText={setDni}
          />
        </View>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>Teléfono:</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
          />
        </View>
      </View>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.saveButton} onPress={handleUpdateUser}>
          <MaterialIcons name="update" size={24} color="#0000f0" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Ionicons name="refresh" size={24} color="#e61a1a" />
        </TouchableOpacity>
      </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    flex: 1,
    fontSize: 16,
  },
  inputContainer: {
    flex: 2,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 10,
  },
  input: {
    fontSize: 16,
    paddingVertical: 5,
    borderWidth: 0,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
  resetButton: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
  },
});

export default ModifyUserScreen;




