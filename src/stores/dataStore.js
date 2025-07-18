import { create } from 'zustand';
import { collection, query, orderBy, onSnapshot, doc } from 'firebase/firestore';
import { ref, getMetadata, getDownloadURL } from 'firebase/storage';
import { db, appId, storage } from '../lib/firebaseConfig';

export const useDataStore = create((set, get) => ({
  contacts: [],
  history: [],
  profile: null,
  resumeFile: null,
  scheduledEmails: [], 
  unsubscribeContacts: null,
  unsubscribeHistory: null,
  unsubscribeProfile: null,
  unsubscribeScheduled: null, 

  fetchData: (userId) => {
    get().unsubscribeAll();

    if (!userId) {
      set({ contacts: [], history: [], profile: null, resumeFile: null, scheduledEmails: [] });
      return;
    }

    const contactsQuery = query(collection(db, `artifacts/${appId}/users/${userId}/contacts`), orderBy("createdAt", "desc"));
    const unsubContacts = onSnapshot(contactsQuery, (snapshot) => {
      set({ contacts: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
    });

    const historyQuery = query(collection(db, `artifacts/${appId}/users/${userId}/history`), orderBy("createdAt", "desc"));
    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
      set({ history: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
    });

    const profileRef = doc(db, `artifacts/${appId}/users/${userId}/profile/main`);
    const unsubProfile = onSnapshot(profileRef, (doc) => {
      set({ profile: doc.exists() ? doc.data() : { name: '', profession: '', skills: '', website: '' } });
    });
    
    const scheduledQuery = query(collection(db, `artifacts/${appId}/users/${userId}/scheduledEmails`), orderBy("sendAt", "asc"));
    const unsubScheduled = onSnapshot(scheduledQuery, (snapshot) => {
        set({ scheduledEmails: snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) });
    });

    const resumeRef = ref(storage, `resumes/${userId}/resume.pdf`);
    getMetadata(resumeRef)
      .then(metadata => getDownloadURL(resumeRef).then(url => set({ resumeFile: { name: metadata.name, url } })))
      .catch(err => { 
          if (err.code === 'storage/object-not-found') set({ resumeFile: null });
          else console.error("Error fetching resume metadata:", err);
      });

    set({ 
        unsubscribeContacts: unsubContacts, 
        unsubscribeHistory: unsubHistory, 
        unsubscribeProfile: unsubProfile,
        unsubscribeScheduled: unsubScheduled
    });
  },

  unsubscribeAll: () => {
    const { unsubscribeContacts, unsubscribeHistory, unsubscribeProfile, unsubscribeScheduled } = get();
    if (unsubscribeContacts) unsubscribeContacts();
    if (unsubscribeHistory) unsubscribeHistory();
    if (unsubscribeProfile) unsubscribeProfile();
    if (unsubscribeScheduled) unsubscribeScheduled();
    set({ unsubscribeContacts: null, unsubscribeHistory: null, unsubscribeProfile: null, unsubscribeScheduled: null });
  },
}));
