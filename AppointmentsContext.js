// AppointmentsContext.js
import React, { createContext, useState } from 'react';

export const AppointmentsContext = createContext();

export const AppointmentsProvider = ({ children }) => {
  const [appointments, setAppointments] = useState({
    '2024-05-25': [
      { time: '10:00 AM', clientName: 'Juan Pérez', responsible: 'Mecánico', plate: 'ABC-123', dni: '12345678', description: 'Revisión de frenos', status: 'Registrado' },
      { time: '2:00 PM', clientName: 'María López', responsible: 'Mecánico', plate: 'DEF-456', dni: '87654321', description: 'Cambio de aceite', status: 'En proceso' },
    ],
    '2024-05-28': [
      { time: '9:00 AM', clientName: 'Carlos García', responsible: 'Mecánico', plate: 'GHI-789', dni: '98765432', description: 'Reparación de motor', status: 'Registrado' },
    ],
    '2024-05-29': [
      { time: '1:00 PM', clientName: 'Ana Martínez', responsible: 'Mecánico', plate: 'JKL-012', dni: '23456789', description: 'Ajuste de carburador', status: 'Registrado' },
    ],
    '2024-06-01': [
      { time: '1:00 PM', clientName: 'Ana Martínez', responsible: 'Mecánico', plate: 'JKL-012', dni: '23456789', description: 'Ajuste de carburador', status: 'Registrado' },
      { time: '9:00 AM', clientName: 'Carlos García', responsible: 'Mecánico', plate: 'GHI-789', dni: '98765432', description: 'Reparación de motor', status: 'Registrado' },
    ]
  });

  return (
    <AppointmentsContext.Provider value={{ appointments, setAppointments }}>
      {children}
    </AppointmentsContext.Provider>
  );
};
