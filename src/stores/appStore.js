import { create } from 'zustand';
import toast from 'react-hot-toast';

export const useAppStore = create((set) => ({
  modal: {
    type: null, 
    data: null,
  },
  
  isSending: false,
  isUploading: false,
  isSaving: false,
  
  openModal: (type, data = null) => set({ modal: { type, data } }),
  closeModal: () => set({ modal: { type: null, data: null } }),
  
  setSending: (status) => set({ isSending: status }),
  setUploading: (status) => set({ isUploading: status }),
  setSaving: (status) => set({ isSaving: status }),

  notifySuccess: (message) => toast.success(message),
  notifyError: (message) => toast.error(message),
  notifyLoading: (message) => toast.loading(message),
  dismissToast: (id) => toast.dismiss(id),
}));
