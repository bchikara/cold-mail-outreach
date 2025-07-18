import React, { useState, useMemo } from 'react';
import { useAppStore } from '../../stores/appStore';
import {Modal} from '../shared/Modal';
import {CustomButton} from '../shared/CustomButton';

export default function ImportContactsModal() {
  const { modal, closeModal } = useAppStore();
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [filterType, setFilterType] = useState('name');
  const [searchTerm, setSearchTerm] = useState('');



  const { contacts, onImport } = modal.data;

  const uniqueCompanies = useMemo(() => {
    const companySet = new Set(contacts.map(c => c.company));
    return Array.from(companySet).sort();
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    if (!searchTerm) return contacts;
    return contacts.filter(contact => {
      const term = searchTerm.toLowerCase();
      if (filterType === 'name') return (contact.name || '').toLowerCase().includes(term);
      if (filterType === 'email') return (contact.email || '').toLowerCase().includes(term);
      if (filterType === 'company') return (contact.company || '').toLowerCase() === term;
      return false;
    });
  }, [contacts, filterType, searchTerm]);

  const handleSelect = (contactId) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(contactId)) {
      newSelection.delete(contactId);
    } else {
      newSelection.add(contactId);
    }
    setSelectedIds(newSelection);
  };
  
  const handleSelectAllFiltered = (e) => {
    if (e.target.checked) {
        setSelectedIds(new Set(filteredContacts.map(c => c.id)));
    } else {
        setSelectedIds(new Set());
    }
  };

  const handleImport = () => {
    const selected = contacts.filter(c => selectedIds.has(c.id));
    if (onImport) {
      onImport(selected);
    }
    closeModal();
  };

  const isOpen = modal.type === 'importContacts';
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Import from Contacts">
      <div className="flex gap-2 mb-4">
        <select value={filterType} onChange={e => { setFilterType(e.target.value); setSearchTerm(''); }} className="bg-gray-700 text-white p-2 border border-gray-600 rounded-md">
          <option value="name">Name</option>
          <option value="company">Company</option>
          <option value="email">Email</option>
        </select>
        {filterType === 'company' ? (
          <select value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md">
            <option value="">Select a company</option>
            {uniqueCompanies.map(company => <option key={company} value={company.toLowerCase()}>{company}</option>)}
          </select>
        ) : (
          <input type="text" placeholder={`Search by ${filterType}...`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto bg-gray-900/50 p-2 rounded-md border border-gray-700 mb-4">
        <div className="flex items-center gap-3 p-2 rounded sticky top-0 bg-gray-900/80 backdrop-blur-sm">
            <input type="checkbox" id="select-all-import" onChange={handleSelectAllFiltered} className="form-checkbox"/>
            <label htmlFor="select-all-import" className="flex-grow cursor-pointer text-white font-semibold">Select All Filtered</label>
        </div>
        {filteredContacts.map(contact => (
          <div key={contact.id} className="flex items-center gap-3 p-2 rounded hover:bg-gray-700">
            <input type="checkbox" id={`import-${contact.id}`} checked={selectedIds.has(contact.id)} onChange={() => handleSelect(contact.id)} className="form-checkbox"/>
            <label htmlFor={`import-${contact.id}`} className="flex-grow cursor-pointer">
              <p className="text-white">{contact.name}</p>
              <p className="text-xs text-gray-400">{contact.email} ({contact.company})</p>
            </label>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4">
        <CustomButton onClick={closeModal} className="bg-gray-600 hover:bg-gray-500">Cancel</CustomButton>
        <CustomButton onClick={handleImport} disabled={selectedIds.size === 0}>Import {selectedIds.size} Contacts</CustomButton>
      </div>
    </Modal>
  );
}
