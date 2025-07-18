import React, { useState, useMemo } from 'react';
import { useDataStore } from '../stores/dataStore';
import { useTemplateStore } from '../stores/templateStore';
import { useEmailSender } from '../hooks/useEmailSender';
import { Send } from 'lucide-react';
import {Pagination} from '../components/shared/Pagination';

export default function HistoryPage() {
  const { history } = useDataStore();
  const { emailTemplates } = useTemplateStore();
  const { initiateSendFlow, isSaving } = useEmailSender();
  
  const [currentPage, setCurrentPage] = useState(1);
  const DOCS_PER_PAGE = 10;

  const paginatedHistory = useMemo(() => {
    const start = (currentPage - 1) * DOCS_PER_PAGE;
    const end = start + DOCS_PER_PAGE;
    return history.slice(start, end);
  }, [history, currentPage]);
  
  const handleFollowUp = (historyItem) => {
    const followUpTemplate = emailTemplates.find(t => t.id === 'follow-up');
    
    initiateSendFlow([historyItem], { 
      defaultTemplate: followUpTemplate,
      isFollowUp: true 
    });
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Email History</h1>
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="p-4 flex justify-between items-center bg-gray-700/50">
            <h2 className="text-xl font-semibold text-white">Sent Emails ({history.length})</h2>
        </div>
        <table className="w-full text-left">
          <thead className="bg-gray-700">
            <tr>
              <th className="p-4 font-semibold text-white">Name</th>
              <th className="p-4 font-semibold text-white">Company</th>
              <th className="p-4 font-semibold text-white">Status</th>
              <th className="p-4 font-semibold text-white">Date Sent</th>
              <th className="p-4 font-semibold text-white text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedHistory.map(h => (
              <tr key={h.id} className="border-b border-gray-700 hover:bg-gray-700/50">
                <td className="p-4 text-gray-300">{h.name}</td>
                <td className="p-4 text-gray-300">{h.company}</td>
                <td className="p-4 text-gray-300">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${h.status === 'Follow-up Sent' ? 'bg-yellow-900 text-yellow-300' : 'bg-green-900 text-green-300'}`}>
                    {h.status || 'Initial Outreach'}
                  </span>
                </td>
                <td className="p-4 text-gray-300">{h.sentAt?.toDate().toLocaleString() ?? 'N/A'}</td>
                <td className="p-4 text-right">
                  <button onClick={() => handleFollowUp(h)} disabled={isSaving} className="text-gray-400 hover:text-blue-400 flex items-center gap-1 ml-auto disabled:cursor-not-allowed">
                    <Send size={16}/> Follow-up
                  </button>
                </td>
              </tr>
            ))}
             {history.length === 0 && (
                <tr><td colSpan="5" className="text-center p-8 text-gray-500">No emails sent yet.</td></tr>
            )}
          </tbody>
        </table>
        <Pagination 
          onNext={() => setCurrentPage(p => p + 1)}
          onPrev={() => setCurrentPage(p => p - 1)}
          hasNext={currentPage * DOCS_PER_PAGE < history.length}
          hasPrev={currentPage > 1}
        />
      </div>
    </div>
  );
}
