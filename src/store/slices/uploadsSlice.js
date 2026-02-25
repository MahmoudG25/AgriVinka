import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  uploads: {} // { [id]: { progress: 0, status: 'idle' | 'uploading' | 'completed' | 'error', url: '', error: null } }
};

const uploadsSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    uploadStart: (state, action) => {
      const { id } = action.payload;
      state.uploads[id] = { progress: 0, status: 'uploading', url: '', error: null };
    },
    uploadProgress: (state, action) => {
      const { id, progress } = action.payload;
      if (state.uploads[id]) {
        state.uploads[id].progress = progress;
      }
    },
    uploadSuccess: (state, action) => {
      const { id, url, public_id } = action.payload;
      if (state.uploads[id]) {
        state.uploads[id].status = 'completed';
        state.uploads[id].progress = 100;
        state.uploads[id].url = url;
        state.uploads[id].public_id = public_id;
      }
    },
    uploadError: (state, action) => {
      const { id, error } = action.payload;
      if (state.uploads[id]) {
        state.uploads[id].status = 'error';
        state.uploads[id].error = error;
      }
    },
    resetUpload: (state, action) => {
      const { id } = action.payload;
      delete state.uploads[id];
    }
  }
});

export const { uploadStart, uploadProgress, uploadSuccess, uploadError, resetUpload } = uploadsSlice.actions;
export default uploadsSlice.reducer;
