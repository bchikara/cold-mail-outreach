import React, { useState, useEffect } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import { useAppStore } from '../../stores/appStore';
import { useDataStore } from '../../stores/dataStore';
import { useTemplateStore } from '../../stores/templateStore';
import { getPersonalizedEmail } from '../../lib/utils';
import { rephraseEmailBody } from '../../lib/geminiUtils';
import {Modal} from '../shared/Modal';
import {CustomButton} from '../shared/CustomButton';
import { Loader2, Edit, Eye, TestTube2, Sparkles } from 'lucide-react';

export default function SelectTemplateModal() {
  const { modal, closeModal, isSending, notifyLoading, dismissToast, notifyError } = useAppStore();
  const { profile } = useDataStore();
  const { emailTemplates } = useTemplateStore();
  
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editedBody, setEditedBody] = useState('');
  const [personalizedSubject, setPersonalizedSubject] = useState('');
  const [isRephrasing, setIsRephrasing] = useState(false);

  const isOpen = modal.type === 'selectTemplate';

  useEffect(() => {
    if (isOpen) {
      const initialTemplate = modal.data?.defaultTemplate || emailTemplates[0];
      setSelectedTemplate(initialTemplate);
      
      const firstRecipient = modal.data?.recipients[0];
      if (firstRecipient && initialTemplate) {
        const bodyContent = modal.data?.generatedBody || initialTemplate.body;
        const { subject, body } = getPersonalizedEmail({ ...initialTemplate, body: bodyContent }, firstRecipient, profile);
        setPersonalizedSubject(subject);
        setEditedBody(body);
      }
    }
  }, [isOpen, modal.data, emailTemplates, profile]);

  if (!isOpen) return null;

  const { recipients, onSelect, onSendTest } = modal.data;

  const handleRephrase = async () => {
    if (isRephrasing) return;
    setIsRephrasing(true);
    const toastId = notifyLoading("Rephrasing with AI...");
    const rephrased = await rephraseEmailBody(editedBody);
    dismissToast(toastId);
    if (rephrased) {
        setEditedBody(rephrased);
    } else {
        notifyError("Failed to rephrase content.");
    }
    setIsRephrasing(false);
  };

  const handleSend = () => {
    if (selectedTemplate && onSelect) {
      onSelect(selectedTemplate, personalizedSubject, editedBody);
    }
  };
  
  const handleSendTest = () => {
    if (selectedTemplate && onSendTest) {
      onSendTest(selectedTemplate, personalizedSubject, editedBody);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={() => !isSending && closeModal()} title="Review and Send Email">
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-1">Template:</p>
        <select 
          value={selectedTemplate?.id || ''} 
          onChange={(e) => {
            const newTemplate = emailTemplates.find(t => t.id === e.target.value);
            if (newTemplate) {
              const { subject, body } = getPersonalizedEmail(newTemplate, recipients[0], profile);
              setSelectedTemplate(newTemplate);
              setPersonalizedSubject(subject);
              setEditedBody(body);
            }
          }}
          className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"
        >
          {emailTemplates.map(template => (
            <option key={template.id} value={template.id}>{template.name}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="bg-gray-700/50 p-3 flex items-center gap-2">
          <label className="text-sm text-gray-400 font-semibold">Subject:</label>
          <input 
            type="text"
            value={personalizedSubject}
            onChange={(e) => setPersonalizedSubject(e.target.value)}
            className="w-full bg-transparent text-white outline-none flex-1"
          />
        </div>
        <div className="flex border-b border-gray-700">
          <button onClick={() => setActiveTab('preview')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400'}`}><Eye size={16}/> Preview</button>
          <button onClick={() => setActiveTab('editor')} className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 ${activeTab === 'editor' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400'}`}><Edit size={16}/> Editor</button>
        </div>
        
        {activeTab === 'editor' && (
            <div className="p-2 bg-gray-700 flex justify-end">
                <CustomButton onClick={handleRephrase} disabled={isRephrasing} className="bg-purple-600 text-xs">
                    {isRephrasing ? <Loader2 className="animate-spin"/> : <Sparkles size={16}/>}
                    Rephrase with AI
                </CustomButton>
            </div>
        )}

        {activeTab === 'preview' && (
          <div className="p-4 bg-white h-64 overflow-y-auto">
            <div dangerouslySetInnerHTML={{ __html: editedBody }} />
          </div>
        )}

        {activeTab === 'editor' && (
          <div className="text-black sun-editor-container overflow-y-auto" style={{ height: '300px' }}>
            <SunEditor 
              setContents={editedBody}
              onChange={setEditedBody}
              setDefaultStyle="font-family: Arial; font-size: 14px;"
              setOptions={{
                height: '100%',
                buttonList: [
                  ['undo', 'redo'],
                  ['font', 'fontSize', 'formatBlock'],
                  ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                  ['fontColor', 'hiliteColor'],
                  ['removeFormat'],
                  ['outdent', 'indent'],
                  ['align', 'horizontalRule', 'list', 'lineHeight'],
                  ['link', 'image', 'video'],
                  ['fullScreen', 'showBlocks', 'codeView'],
                ],
              }}
            />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center gap-4 mt-6">
        <CustomButton onClick={handleSendTest} className="bg-gray-600 hover:bg-gray-500" disabled={isSending}>
          <TestTube2 size={18} /> Send Test to Myself
        </CustomButton>
        <div className="flex gap-4">
          <CustomButton onClick={closeModal} className="bg-gray-600 hover:bg-gray-500" disabled={isSending}>
            Cancel
          </CustomButton>
          <CustomButton onClick={handleSend} className="bg-blue-600" disabled={!selectedTemplate || isSending}>
            {isSending ? <Loader2 className="animate-spin" /> : `Send to ${recipients?.length} Recipients`}
          </CustomButton>
        </div>
      </div>
    </Modal>
  );
}
