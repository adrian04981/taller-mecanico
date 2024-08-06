import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import { Entypo, FontAwesome } from '@expo/vector-icons';
import DashboardAdmin from '../screens/DashboardAdmin';
import ModifyUserScreen from '../screens/ModifyUserScreen';
import ManageServicesScreen from '../screens/ManageServicesScreen';
import HomeMecanico from '../screens/HomeMecanico';
import { firebaseConfig } from '../firebase-config';

const Tab = createBottomTabNavigator();

const AppNavigator = ({ route }) => {
  const { email } = route.params || {};
  const [userRole, setUserRole] = useState(null);

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const docRef = doc(firestore, 'usuarios', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserRole(userData.rol);
          } else {
            console.log('No such document!');
            setUserRole(null);
          }
        } catch (error) {
          console.log('Error al obtener el documento:', error);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
    });

    return () => unsubscribe();
  }, [auth, firestore]);

  if (userRole === null) {
    return null;
  }

  return (
    <Tab.Navigator
      screenOptions={({ }) => ({
        tabBarShowLabel: false,
        tabBarIcon: ({ focused, color, size }) => {
          if (focused) {
            return <FontAwesome name="circle" size={size} color={color} />;
          } else {
            return <Entypo name="circle" size={size} color={color} />;
          }
        },
        tabBarActiveTintColor: 'black',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {userRole === 'administrador' ? (
        <>
          <Tab.Screen
            name="Calendario"
            options={{ headerShown: false }}
          >
            {props => <DashboardAdmin {...props} email={email} />}
          </Tab.Screen>
          <Tab.Screen
            name="Gestionar Servicios"
            options={{ headerShown: false }}
          >
            {props => <ManageServicesScreen {...props} email={email} />}
          </Tab.Screen>
          <Tab.Screen
            name="Modificar Usuario"
            options={{ headerShown: false }}
          >
            {props => <ModifyUserScreen {...props} email={email} />}
          </Tab.Screen>
        </>
      ) : (
        <>
          <Tab.Screen
            name="HomeMecanico"
            options={{ headerShown: false }}
          >
            {props => <HomeMecanico {...props} email={email} />}
          </Tab.Screen>
          <Tab.Screen
            name="Modificar Usuario"
            options={{ headerShown: false }}
          >
            {props => <ModifyUserScreen {...props} email={email} />}
          </Tab.Screen>
        </>
      )}
    </Tab.Navigator>
  );
};

export default AppNavigator;


