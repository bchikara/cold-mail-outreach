import React, { useState } from 'react';
import { useAppStore } from '../../stores/appStore';
import { emailTemplates } from '../../data/emailTemplates';
import {Modal} from '../shared/Modal';
import {CustomButton} from '../shared/CustomButton';
import {TemplateCard} from '../shared/TemplateCard';
import { Loader2, Calendar, Clock } from 'lucide-react';

export default function SelectTemplateModal() {
  const { modal, closeModal, isSending } = useAppStore();
  const [selectedTemplate, setSelectedTemplate] = useState(emailTemplates[0]);
  const [scheduleTime, setScheduleTime] = useState('');

  const isOpen = modal.type === 'selectTemplate';
  if (!isOpen) return null;

  const { recipients, onSelect, onSchedule } = modal.data;

  const handleSendNow = () => {
    if (selectedTemplate && onSelect) {
      onSelect(selectedTemplate);
    }
  };

  const handleSchedule = () => {
    if (selectedTemplate && scheduleTime && onSchedule) {
      onSchedule(selectedTemplate, new Date(scheduleTime));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSending && closeModal()} title="Choose Template & Send">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[50vh] overflow-y-auto p-1">
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
      
      <div className="mt-6 pt-4 border-t border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-3">Scheduling Options</h3>
        <div className="flex items-center gap-2 p-2 bg-gray-700/50 rounded-md">
            <Calendar size={20} className="text-gray-400" />
            <input 
                type="datetime-local"
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="w-full bg-transparent text-white outline-none"
            />
        </div>
        <p className="text-xs text-gray-500 mt-1">Leave blank to send immediately.</p>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <CustomButton onClick={closeModal} className="bg-gray-600 hover:bg-gray-500" disabled={isSending}>
          Cancel
        </CustomButton>
        <CustomButton 
          onClick={scheduleTime ? handleSchedule : handleSendNow} 
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!selectedTemplate || isSending}
        >
          {isSending ? <Loader2 className="animate-spin" /> : (scheduleTime ? 'Schedule Email' : 'Send Now')}
        </CustomButton>
      </div>
    </Modal>
  );
}
