import { configureStore } from '@reduxjs/toolkit';
import dbReducer from './slices/dbSlice';
import uiReducer from './slices/uiSlice';
import uploadsReducer from './slices/uploadsSlice';
import authReducer from './slices/authSlice';

// simple listener for persistence
import { saveState } from '../../services/dbStorage';
// We will implement debounce in the listener or in the service

const store = configureStore({
  reducer: {
    db: dbReducer,
    ui: uiReducer,
    uploads: uploadsReducer,
    auth: authReducer,
  },
});

// Subscribe to store changes to persist DB
let lastState = store.getState().db;

store.subscribe(() => {
  const currentState = store.getState().db;
  if (currentState.lastUpdated !== lastState.lastUpdated) {
    saveState(currentState);
    lastState = currentState;
  }
});

export default store;
