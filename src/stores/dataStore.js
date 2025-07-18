import { create } from 'zustand';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { ref, getMetadata, getDownloadURL } from 'firebase/storage';
import { db, appId, storage } from '../lib/firebaseConfig';

export const useDataStore = create((set, get) => ({
  contacts: [],
  history: [],
  profile: null,
  resumeFile: null,
  unsubscribeContacts: null,
  unsubscribeHistory: null,
  unsubscribeProfile: null,

  fetchData: (userId) => {
    get().unsubscribeAll();

    if (!userId) {
      set({ contacts: [], history: [], profile: null, resumeFile: null });
      return;
    }

    const contactsQuery = query(collection(db, `artifacts/${appId}/users/${userId}/contacts`), orderBy("createdAt", "desc"));
    const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
      const contactsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ contacts: contactsData });
    });

    const historyQuery = query(collection(db, `artifacts/${appId}/users/${userId}/history`), orderBy("createdAt", "desc"));
    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
      const historyData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      set({ history: historyData });
    });

    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/main`);
    const unsubProfile = onSnapshot(profileRef, (doc) => {
      if (doc.exists()) {
        set({ profile: doc.data() });
      } else {
        set({ profile: { name: '', profession: '', skills: '', website: '' } }); 
      }
    });

    const resumeRef = ref(storage, `resumes/${userId}/resume.pdf`);
    getMetadata(resumeRef)
      .then(metadata => getDownloadURL(resumeRef).then(url => set({ resumeFile: { name: metadata.name, url } })))
      .catch(err => { 
          if (err.code === 'storage/object-not-found') {
              set({ resumeFile: null });
          } else {
              console.error("Error fetching resume metadata:", err);
          }
      });

    set({ 
        unsubscribeContacts: unsubContacts, 
        unsubscribeHistory: unsubHistory, 
        unsubscribeProfile: unsubProfile 
    });
  },

  unsubscribeAll: () => {
    const { unsubscribeContacts, unsubscribeHistory, unsubscribeProfile } = get();
    if (unsubscribeContacts) unsubscribeContacts();
    if (unsubscribeHistory) unsubscribeHistory();
    if (unsubscribeProfile) unsubscribeProfile();
    set({ unsubscribeContacts: null, unsubscribeHistory: null, unsubscribeProfile: null });
  },
}));
