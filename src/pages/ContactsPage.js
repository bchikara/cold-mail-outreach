import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '../stores/authStore';
import { useAppStore } from '../stores/appStore';
import { useDataStore } from '../stores/dataStore';
import { writeBatch, doc } from 'firebase/firestore';
import { db, appId } from '../lib/firebaseConfig';
import { Plus, Trash2 } from 'lucide-react';
import {CustomButton} from '../components/shared/CustomButton';
import {Pagination} from '../components/shared/Pagination';

export default function ContactsPage() {
  const { userId } = useAuthStore();
  const { openModal, notifySuccess, notifyError } = useAppStore();
  const { contacts } = useDataStore();
  
  const [selectedContacts, setSelectedContacts] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const DOCS_PER_PAGE = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [contacts]);

  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * DOCS_PER_PAGE;
    const end = start + DOCS_PER_PAGE;
    return contacts.slice(start, end);
  }, [contacts, currentPage]);

  const handleDeleteSelected = async () => {
    if (selectedContacts.size === 0) return;
    const batch = writeBatch(db);
    selectedContacts.forEach(contactId => {
      const docRef = doc(db, `artifacts/${appId}/users/${userId}/contacts`, contactId);
      batch.delete(docRef);
    });
    try {
      await batch.commit();
      notifySuccess(`${selectedContacts.size} contacts deleted successfully.`);
      setSelectedContacts(new Set());
    } catch (error) {
      notifyError("Failed to delete contacts.");
      console.error("Error deleting contacts:", error);
    }
  };

  const handleSelect = (contactId) => {
    const newSelection = new Set(selectedContacts);
    if (newSelection.has(contactId)) newSelection.delete(contactId);
    else newSelection.add(contactId);
    setSelectedContacts(newSelection);
  };

  const handleSelectAllOnPage = (e) => {
    const pageIds = new Set(paginatedContacts.map(c => c.id));
    if (e.target.checked) {
      setSelectedContacts(new Set([...selectedContacts, ...pageIds]));
    } else {
      setSelectedContacts(new Set([...selectedContacts].filter(id => !pageIds.has(id))));
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white">Contact List</h1>
        <CustomButton onClick={() => openModal('addContact')} className="bg-blue-600">
          <Plus size={18} /> Add Contact
        </CustomButton>
      </div>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center bg-gray-700/50">
          <h2 className="text-xl font-semibold text-white">All Contacts ({contacts.length})</h2>
          {selectedContacts.size > 0 && (
            <CustomButton onClick={handleDeleteSelected} className="bg-red-600 hover:bg-red-700">
              <Trash2 size={18} /> Delete ({selectedContacts.size})
            </CustomButton>
          )}
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4">Select</th>
              <th className="p-4 font-semibold text-white">Name</th>
              <th className="p-4 font-semibold text-white">Email</th>
              <th className="p-4 font-semibold text-white">Company</th>
            </tr>
          </thead>
          <tbody>
            {paginatedContacts.map(contact => (
              <tr key={contact.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-4"><input type="checkbox" checked={selectedContacts.has(contact.id)} onChange={() => handleSelect(contact.id)} className="form-checkbox"/></td>
                <td className="p-4 text-gray-300">{contact.name}</td>
                <td className="p-4 text-gray-300">{contact.email}</td>
                <td className="p-4 text-gray-300">{contact.company}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr><td colSpan="4" className="text-center p-8 text-gray-500">No contacts found.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination 
          onNext={() => setCurrentPage(p => p + 1)}
          onPrev={() => setCurrentPage(p => p - 1)}
          hasNext={currentPage * DOCS_PER_PAGE < contacts.length}
          hasPrev={currentPage > 1}
        />
      </div>
    </div>
  );
}
