import { logger } from '../utils/logger';

const DB_KEY = 'shams_admin_db_v1';

// We use LocalStorage for simplicity as it is synchronous and easier to debug.
// If data grows > 5MB, we can swap this implementation with IndexedDB without changing the API.

export const loadState = async () => {
  try {
    const serializedState = localStorage.getItem(DB_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    logger.error('Could not load state:', err);
    return undefined;
  }
};

export const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(DB_KEY, serializedState);
  } catch (err) {
    logger.error('Could not save state:', err);
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(DB_KEY);
  } catch (err) {
    logger.error('Could not clear state:', err);
  }
}
