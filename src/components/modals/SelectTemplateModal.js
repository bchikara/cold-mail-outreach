import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { emailTemplates } from '../../data/emailTemplates';
import {Modal} from '../shared/Modal';
import {CustomButton} from '../shared/CustomButton';
import {TemplateCard} from '../shared/TemplateCard';
import { Loader2 } from 'lucide-react';

export default function SelectTemplateModal() {
  const { modal, closeModal, isSending } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);

  const isOpen = modal.type === 'selectTemplate';
  if (!isOpen) return null;

  const { recipients, onSelect } = modal.data;

  const handleSend = () => {
    if (selectedTemplate && onSelect) {
      onSelect(selectedTemplate); 
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSending && closeModal()} title="Choose an Email Template">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto p-1">
        {emailTemplates.map(template => (
          <div key={template.id} onClick={() => setSelectedTemplate(template)} className="cursor-pointer">
            <TemplateCard 
              template={template}
              isSelected={selectedTemplate?.id === template.id}
              onSelect={() => {}}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-700">
        <CustomButton onClick={closeModal} className="bg-gray-600 hover:bg-gray-500" disabled={isSending}>
          Cancel
        </CustomButton>
        <CustomButton 
          onClick={handleSend} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedTemplate || isSending}
        >
          {isSending ? <Loader2 className="animate-spin" /> : `Send to ${recipients?.length} Recipients`}
        </CustomButton>
      </div>
    </Modal>
  );
}
