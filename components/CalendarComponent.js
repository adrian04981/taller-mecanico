import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarComponent = ({ onAppointmentPress, appointments }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  useEffect(() => {
    if (selectedDate && appointments[selectedDate]) {
      setFilteredAppointments(appointments[selectedDate]);
    } else {
      setFilteredAppointments([]);
    }
  }, [selectedDate, appointments]);

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={{
          [selectedDate]: { selected: true, marked: true },
        }}
      />
      <ScrollView style={styles.agendaContainer}>
        {filteredAppointments.map((appointment, index) => {
          let appointmentDate;
          try {
            appointmentDate = new Date(appointment.fecha);
            if (isNaN(appointmentDate.getTime())) {
              throw new Error('Invalid date');
            }
          } catch (error) {
            console.error('Fecha no válida en el documento:', appointment.id);
            return null;
          }

          return (
            <TouchableOpacity key={index} style={styles.item} onPress={() => onAppointmentPress(appointment)}>
              <View style={[styles.statusIndicator, { backgroundColor: appointment.estado === 'completed' ? 'green' : 'red' }]} />
              <View style={styles.textContainer}>
                <Text style={styles.itemText}>
                  {appointmentDate.toISOString().split('T')[1].slice(0, 5)} - {appointment.nombreCliente}
                </Text>
                <Text style={styles.itemStatus}>Estado: {appointment.estado}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  agendaContainer: {
    flex: 1,
    marginTop: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 5,
    padding: 10,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  itemText: {
    fontSize: 16,
  },
  itemStatus: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
  },
  statusIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default CalendarComponent;
