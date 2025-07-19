import React, { useState, useMemo } from 'react';
import { useAppStore } from '../stores/appStore';
import { useDataStore } from '../stores/dataStore';
import { useEmailSender } from '../hooks/useEmailSender';
import { Send, UserPlus, Upload, Users, Trash2 } from 'lucide-react';
import {CustomButton} from '../components/shared/CustomButton';
import {Pagination} from '../components/shared/Pagination';

export default function SendMailPage() {
    const { openModal } = useAppStore();
    const { contacts: allContacts } = useDataStore();
    const { initiateSendFlow, isSaving } = useEmailSender();
    
    const [recipients, setRecipients] = useState([]);
    const [selectedRecipients, setSelectedRecipients] = useState(new Set());
    const [currentPage, setCurrentPage] = useState(1);
    const RECIPIENTS_PER_PAGE = 10;

    const paginatedRecipients = useMemo(() => {
        const start = (currentPage - 1) * RECIPIENTS_PER_PAGE;
        const end = start + RECIPIENTS_PER_PAGE;
        return recipients.slice(start, end);
    }, [recipients, currentPage]);

    const handleSetRecipients = (newRecipients) => {
        const uniqueEmails = new Set(recipients.map(r => r.email));
        const filteredNew = newRecipients.filter(nr => !uniqueEmails.has(nr.email));
        setRecipients(prev => [...prev, ...filteredNew]);
    };

    const handleRemoveSelected = () => {
        setRecipients(prev => prev.filter(r => !selectedRecipients.has(r.email)));
        setSelectedRecipients(new Set());
    };

    const handleSelectRecipient = (email) => {
        const newSelection = new Set(selectedRecipients);
        if (newSelection.has(email)) newSelection.delete(email);
        else newSelection.add(email);
        setSelectedRecipients(newSelection);
    };

    const handleSelectAllOnPage = (e) => {
        const pageEmails = new Set(paginatedRecipients.map(r => r.email));
        if (e.target.checked) {
            setSelectedRecipients(prev => new Set([...prev, ...pageEmails]));
        } else {
            setSelectedRecipients(prev => new Set([...prev].filter(email => !pageEmails.has(email))));
        }
    };
    
    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold text-white">New Mail Campaign</h1>
                <CustomButton onClick={() => initiateSendFlow(recipients)} disabled={recipients.length === 0 || isSaving} className="bg-blue-600">
                    <Send size={18}/> 
                    {isSaving ? 'Saving Contacts...' : `Continue to Send (${recipients.length})`}
                </CustomButton>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">1. Add Recipients</h2>
                <div className="flex flex-wrap gap-4">
                    <CustomButton onClick={() => openModal('addManual', { onAdd: handleSetRecipients })} className="bg-gray-600">
                        <UserPlus size={18} /> Add Manually
                    </CustomButton>
                    <CustomButton onClick={() => openModal('uploadCsvForCampaign', { onUpload: handleSetRecipients })} className="bg-green-600">
                        <Upload size={18} /> Upload CSV
                    </CustomButton>
                    <CustomButton onClick={() => openModal('importContacts', { contacts: allContacts, onImport: handleSetRecipients })} className="bg-purple-600">
                        <Users size={18} /> Import from Contacts
                    </CustomButton>
                </div>
            </div>
            
            <div className="bg-gray-800 rounded-lg overflow-hidden">
                <div className="p-4 flex justify-between items-center bg-gray-700/50">
                    <h2 className="text-xl font-semibold text-white">2. Review Recipients ({recipients.length})</h2>
                    {selectedRecipients.size > 0 && (
                        <CustomButton onClick={handleRemoveSelected} className="bg-red-600">
                            <Trash2 size={18}/> Remove ({selectedRecipients.size})
                        </CustomButton>
                    )}
                </div>
                <table className="w-full text-left">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="p-4"><input type="checkbox" onChange={handleSelectAllOnPage} className="form-checkbox"/></th>
                            <th className="p-4 font-semibold text-white">Name</th>
                            <th className="p-4 font-semibold text-white">Email</th>
                            <th className="p-4 font-semibold text-white">Company</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedRecipients.map((contact, index) => (
                            <tr key={`${contact.email}-${index}`} className="border-b border-gray-700">
                                <td className="p-4"><input type="checkbox" checked={selectedRecipients.has(contact.email)} onChange={() => handleSelectRecipient(contact.email)} className="form-checkbox"/></td>
                                <td className="p-4">{contact.name}</td>
                                <td className="p-4">{contact.email}</td>
                                <td className="p-4">{contact.company}</td>
                            </tr>
                        ))}
                         {recipients.length === 0 && (
                            <tr><td colSpan="4" className="text-center p-8 text-gray-500">Add recipients to get started.</td></tr>
                        )}
                    </tbody>
                </table>
                <Pagination 
                    onNext={() => setCurrentPage(p => p + 1)}
                    onPrev={() => setCurrentPage(p => p - 1)}
                    hasNext={currentPage * RECIPIENTS_PER_PAGE < recipients.length}
                    hasPrev={currentPage > 1}
                />
            </div>
        </div>
    );
}
