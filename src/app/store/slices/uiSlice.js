import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  toasts: [], // { id, type, message }
  loading: false,
  modal: {
    isOpen: false,
    type: null, // 'CONFIRM', 'INFO'
    props: {}
  }
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    addToast: (state, action) => {
      const { type = 'info', message, duration = 3000 } = action.payload;
      state.toasts.push({ id: Date.now(), type, message, duration });
    },
    removeToast: (state, action) => {
      state.toasts = state.toasts.filter(t => t.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    openModal: (state, action) => {
      state.modal = {
        isOpen: true,
        type: action.payload.type,
        props: action.payload.props || {}
      };
    },
    closeModal: (state) => {
      state.modal.isOpen = false;
      state.modal.type = null;
      state.modal.props = {};
    }
  }
});

export const { addToast, removeToast, setLoading, openModal, closeModal } = uiSlice.actions;
export default uiSlice.reducer;
