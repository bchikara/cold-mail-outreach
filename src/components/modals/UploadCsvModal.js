import React, { useState, useRef } from 'react';
import { useAppStore } from '../../stores/appStore';
import {Modal} from '../shared/Modal';
import {CustomButton} from '../shared/CustomButton';
import { Upload, Loader2 } from 'lucide-react';

export default function UploadCsvModal() {
  const { modal, closeModal } = useAppStore();
  const [fileName, setFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const fileRef = useRef(null);

  const isOpen = modal.type === 'uploadCsvForCampaign';
  if (!isOpen) return null;

  const { onUpload } = modal.data;

  const handleUpload = () => {
    const file = fileRef.current.files[0];
    if (!file || isParsing) return;
    setIsParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const rows = text.split('\n').slice(1);
      const newContacts = [];
      for (const row of rows) {
        const [name, email, company] = row.split(',').map(s => s.trim());
        if (name && email && company) {
          newContacts.push({ name, email, company });
        }
      }
      if (onUpload) {
        onUpload(newContacts);
      }
      setIsParsing(false);
      closeModal();
    };
    reader.readAsText(file);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isParsing && closeModal()} title="Upload CSV for Campaign">
      <p className="text-sm text-gray-400 mb-4">Select a CSV file with columns: name, email, company.</p>
      <div className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-md border border-gray-600">
        <Upload size={20} className="text-gray-400" />
        <span className="text-white flex-grow truncate">{fileName || "No file selected"}</span>
        <CustomButton onClick={() => fileRef.current.click()} className="bg-gray-600 hover:bg-gray-500" disabled={isParsing}>
          Choose File
        </CustomButton>
      </div>
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => setFileName(e.target.files[0]?.name || '')} disabled={isParsing}/>
      <div className="flex justify-end gap-4 mt-6">
        <CustomButton onClick={closeModal} className="bg-gray-600 hover:bg-gray-500" disabled={isParsing}>Cancel</CustomButton>
        <CustomButton onClick={handleUpload} className="bg-green-600 hover:bg-green-700" disabled={!fileName || isParsing}>
          {isParsing ? <Loader2 className="animate-spin" /> : 'Upload and Add'}
        </CustomButton>
      </div>
    </Modal>
  );
}
