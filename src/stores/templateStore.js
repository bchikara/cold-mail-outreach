import { create } from 'zustand';
import { emailTemplates as templates } from '../data/emailTemplates'; 

export const useTemplateStore = create((set) => ({
  emailTemplates: templates,
  selectedTemplate: templates[0], 

  setSelectedTemplate: (template) => set({ selectedTemplate: template }),
}));