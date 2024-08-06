import { registerRootComponent } from 'expo';
import React from 'react';
import { AppointmentsProvider } from './AppointmentsContext';
import App from './App';

const AppWithProviders = () => {
  return (
    <AppointmentsProvider>
      <App />
    </AppointmentsProvider>
  );
};

registerRootComponent(AppWithProviders);
