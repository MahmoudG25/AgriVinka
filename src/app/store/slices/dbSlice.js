import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
  courses: { byId: {}, allIds: [] },
  roadmaps: { byId: {}, allIds: [] },
  instructors: { byId: {}, allIds: [] },
  media: { byId: {}, allIds: [] },
  lastUpdated: null,
};

const dbSlice = createSlice({
  name: 'db',
  initialState,
  reducers: {
    // --- INIT ---
    loadDatabase: (state, action) => {
      // action.payload should be the full normalized DB object
      return { ...state, ...action.payload, lastUpdated: Date.now() };
    },

    // --- COURSES ---
    addCourse: (state, action) => {
      const newCourse = { id: uuidv4(), ...action.payload, createdAt: new Date().toISOString() };
      state.courses.byId[newCourse.id] = newCourse;
      state.courses.allIds.push(newCourse.id);
      state.lastUpdated = Date.now();
    },
    updateCourse: (state, action) => {
      const { id, updates } = action.payload;
      if (state.courses.byId[id]) {
        state.courses.byId[id] = { ...state.courses.byId[id], ...updates, updatedAt: new Date().toISOString() };
        state.lastUpdated = Date.now();
      }
    },
    deleteCourse: (state, action) => {
      const id = action.payload;
      delete state.courses.byId[id];
      state.courses.allIds = state.courses.allIds.filter(courseId => courseId !== id);
      state.lastUpdated = Date.now();
    },

    // --- ROADMAPS ---
    addRoadmap: (state, action) => {
      const newRoadmap = { id: uuidv4(), ...action.payload, createdAt: new Date().toISOString() };
      state.roadmaps.byId[newRoadmap.id] = newRoadmap;
      state.roadmaps.allIds.push(newRoadmap.id);
      state.lastUpdated = Date.now();
    },
    updateRoadmap: (state, action) => {
      const { id, updates } = action.payload;
      if (state.roadmaps.byId[id]) {
        state.roadmaps.byId[id] = { ...state.roadmaps.byId[id], ...updates, updatedAt: new Date().toISOString() };
        state.lastUpdated = Date.now();
      }
    },
    deleteRoadmap: (state, action) => {
      const id = action.payload;
      delete state.roadmaps.byId[id];
      state.roadmaps.allIds = state.roadmaps.allIds.filter(rmId => rmId !== id);
      state.lastUpdated = Date.now();
    },

    // --- INSTRUCTORS ---
    addInstructor: (state, action) => {
      const newInstructor = { id: uuidv4(), ...action.payload };
      state.instructors.byId[newInstructor.id] = newInstructor;
      state.instructors.allIds.push(newInstructor.id);
      state.lastUpdated = Date.now();
    },
    updateInstructor: (state, action) => {
      const { id, updates } = action.payload;
      if (state.instructors.byId[id]) {
        state.instructors.byId[id] = { ...state.instructors.byId[id], ...updates };
        state.lastUpdated = Date.now();
      }
    },

    // --- MEDIA ---
    addMedia: (state, action) => {
      const mediaItem = action.payload; // Should be result from Cloudinary
      if (!mediaItem.id) mediaItem.id = mediaItem.public_id || uuidv4();

      state.media.byId[mediaItem.id] = mediaItem;
      if (!state.media.allIds.includes(mediaItem.id)) {
        state.media.allIds.push(mediaItem.id);
      }
      state.lastUpdated = Date.now();
    },

    // --- RESET ---
    resetDatabase: (state) => {
      // This will be handled by re-loading seed data in the thunk/middleware
      return initialState;
    }
  },
});

export const {
  loadDatabase,
  addCourse, updateCourse, deleteCourse,
  addRoadmap, updateRoadmap, deleteRoadmap,
  addInstructor, updateInstructor,
  addMedia,
  resetDatabase
} = dbSlice.actions;

export default dbSlice.reducer;
