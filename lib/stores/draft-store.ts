import { FormularioGastosFormData } from "../schemas";

interface DraftStore {
  draft: Partial<FormularioGastosFormData> | null;
  lastSaved: number | null;
  saveDraft: (data: Partial<FormularioGastosFormData>) => void;
  clearDraft: () => void;
  loadDraft: () => Partial<FormularioGastosFormData> | null;
}

// Simple storage-based draft store compatible with Vite/React
let storedDraft: Partial<FormularioGastosFormData> | null = null;
let lastSaved: number | null = null;

// Load from localStorage if available
if (typeof window !== 'undefined') {
  try {
    const saved = localStorage.getItem('formulario-gastos-draft');
    if (saved) {
      storedDraft = JSON.parse(saved);
      lastSaved = localStorage.getItem('formulario-gastos-draft-time') ? parseInt(localStorage.getItem('formulario-gastos-draft-time')!) : null;
    }
  } catch (e) {
    console.warn('Error loading draft from localStorage:', e);
  }
}

export const useDraftStore = {
  draft: storedDraft,
  lastSaved: lastSaved,

  saveDraft: (data: Partial<FormularioGastosFormData>) => {
    storedDraft = data;
    lastSaved = Date.now();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('formulario-gastos-draft', JSON.stringify(data));
        localStorage.setItem('formulario-gastos-draft-time', lastSaved.toString());
      } catch (e) {
        console.warn('Error saving draft to localStorage:', e);
      }
    }
  },

  clearDraft: () => {
    storedDraft = null;
    lastSaved = null;
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('formulario-gastos-draft');
        localStorage.removeItem('formulario-gastos-draft-time');
      } catch (e) {
        console.warn('Error clearing draft from localStorage:', e);
      }
    }
  },

  loadDraft: () => {
    return storedDraft;
  },
} as DraftStore;
