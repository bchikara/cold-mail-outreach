import React, { useState, useEffect, useMemo } from 'react';
import SunEditor from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';

import { useAppStore } from '../../stores/appStore';
import { useDataStore } from '../../stores/dataStore';
import { useTemplateStore } from '../../stores/templateStore';

import { getPersonalizedEmail } from '../../lib/utils';
import {
  rephraseEmailBody,
  rephraseEmailSubject,
  generateEmailBody,
  FOOTER_REGEX,
} from '../../lib/geminiUtils';

import { Modal } from '../shared/Modal';
import { CustomButton } from '../shared/CustomButton';
import { Loader2, Edit, Eye, TestTube2, Sparkles } from 'lucide-react';

function stripFooter(html = '') {
  return html.replace(FOOTER_REGEX, '');
}

export default function SelectTemplateModal() {
  const { modal, closeModal, isSending, notifyLoading, dismissToast, notifyError } = useAppStore();
  const { profile } = useDataStore();
  const { emailTemplates } = useTemplateStore();

  const isOpen = modal.type === 'selectTemplate';
  const {
    recipients = [],
    defaultTemplate,
    generatedBody,
    autoGenerate = false, 
    jobTitle, 
    onSelect,
    onSendTest,
  } = modal.data || {};

  const [subjectBase, setSubjectBase] = useState('');
  const [bodyBase, setBodyBase] = useState('');

  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const [activeTab, setActiveTab] = useState('preview'); 
  const [previewRecipientIndex, setPreviewRecipientIndex] = useState(0);
  const [isRephrasingBody, setIsRephrasingBody] = useState(false);
  const [isRephrasingSubject, setIsRephrasingSubject] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const initialTemplate = defaultTemplate || emailTemplates[0];
    setSelectedTemplate(initialTemplate || null);

    const baseSubject = initialTemplate?.subject || '';
    const rawBody = generatedBody ?? initialTemplate?.body ?? '';

    setSubjectBase(baseSubject);
    setBodyBase(stripFooter(rawBody));

    setPreviewRecipientIndex(0);
    setActiveTab('preview');

    (async () => {
      if (!autoGenerate) return;
      try {
        const toastId = notifyLoading('Generating AI email...');
        const aiBody = await generateEmailBody(profile, jobTitle || '[Job Title]');
        dismissToast(toastId);
        if (aiBody) {
          setBodyBase(stripFooter(aiBody));
        }
      } catch (err) {
        console.error('Auto-generate error:', err);
        notifyError('AI generation failed.');
      }
    })();
  }, [isOpen, defaultTemplate, generatedBody, autoGenerate, jobTitle, emailTemplates, profile]);

  const previewContact =
    recipients?.[previewRecipientIndex] || { name: 'Example', company: 'ExampleCo', email: '' };

  const preview = useMemo(() => {
    return getPersonalizedEmail(
      { subject: subjectBase, body: bodyBase },
      previewContact,
      profile || {}
    );
  }, [subjectBase, bodyBase, previewContact, profile]);

  const handleTemplateChange = (e) => {
    const newTemplate = emailTemplates.find((t) => t.id === e.target.value);
    if (!newTemplate) return;
    setSelectedTemplate(newTemplate);
    setSubjectBase(newTemplate.subject || '');
    setBodyBase(stripFooter(newTemplate.body || ''));
  };

  const handleRephraseBody = async () => {
    if (isRephrasingBody) return;
    setIsRephrasingBody(true);
    const toastId = notifyLoading('Improving email with AI...');
    try {
      const updated = await rephraseEmailBody(bodyBase);
      if (updated) setBodyBase(stripFooter(updated));
      else notifyError('AI did not return content.');
    } catch (err) {
      console.error('Body rephrase error:', err);
      notifyError('Failed to rephrase email body.');
    } finally {
      dismissToast(toastId);
      setIsRephrasingBody(false);
    }
  };

  const handleRephraseSubject = async () => {
    if (isRephrasingSubject) return;
    setIsRephrasingSubject(true);
    const toastId = notifyLoading('Improving subject with AI...');
    try {
      const updated = await rephraseEmailSubject(subjectBase);
      if (updated) setSubjectBase(updated);
      else notifyError('AI did not return a subject.');
    } catch (err) {
      console.error('Subject rephrase error:', err);
      notifyError('Failed to rephrase subject.');
    } finally {
      dismissToast(toastId);
      setIsRephrasingSubject(false);
    }
  };

  const handleSend = () => {
    if (!selectedTemplate || !onSelect) return;
    onSelect(selectedTemplate, subjectBase, bodyBase);
  };

  const handleSendTest = () => {
    if (!selectedTemplate || !onSendTest) return;
    onSendTest(selectedTemplate, subjectBase, bodyBase);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isSending && closeModal()}
      title="Review and Send Email"
    >
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-1">Template:</p>
        <select
          value={selectedTemplate?.id || ''}
          onChange={handleTemplateChange}
          className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"
        >
          {emailTemplates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.name}
            </option>
          ))}
        </select>
      </div>

      <div className="border border-gray-700 rounded-lg overflow-hidden mb-4">
        <div className="bg-gray-700/50 p-3 flex items-center gap-2">
          <label className="text-sm text-gray-400 font-semibold">Subject:</label>
          <input
            type="text"
            value={subjectBase}
            onChange={(e) => setSubjectBase(e.target.value)}
            className="w-full bg-transparent text-white outline-none flex-1"
          />
          <CustomButton
            onClick={handleRephraseSubject}
            disabled={isRephrasingSubject}
            className="bg-purple-600 text-xs"
            title="Improve subject with AI"
          >
            {isRephrasingSubject ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
          </CustomButton>
        </div>
      </div>

      {recipients?.length > 1 && (
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-1">Preview as:</p>
          <select
            value={previewRecipientIndex}
            onChange={(e) => setPreviewRecipientIndex(Number(e.target.value))}
            className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"
          >
            {recipients.map((r, i) => (
              <option key={`${r.email}-${i}`} value={i}>
                {r.name || r.email} – {r.company || 'n/a'}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="border border-gray-700 rounded-lg overflow-hidden">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'preview' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            <Eye size={16} /> Preview
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2 ${
              activeTab === 'editor' ? 'bg-gray-800 text-white' : 'bg-gray-700 text-gray-400'
            }`}
          >
            <Edit size={16} /> Editor
          </button>
        </div>

        {activeTab === 'editor' && (
          <div className="p-2 bg-gray-700 flex justify-end">
            <CustomButton
              onClick={handleRephraseBody}
              disabled={isRephrasingBody}
              className="bg-purple-600 text-xs"
            >
              {isRephrasingBody ? <Loader2 className="animate-spin" /> : <Sparkles size={16} />}
              Rephrase with AI
            </CustomButton>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="p-4 bg-white h-64 overflow-y-auto text-black">
            <div dangerouslySetInnerHTML={{ __html: preview.body }} />
          </div>
        )}

        {activeTab === 'editor' && (
          <div
            className="text-black sun-editor-container overflow-y-auto bg-white"
            style={{ height: '300px' }}
          >
            <SunEditor
              setContents={bodyBase}
              onChange={(html) => setBodyBase(stripFooter(html))}
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
        <CustomButton
          onClick={handleSendTest}
          className="bg-gray-600 hover:bg-gray-500"
          disabled={isSending}
        >
          <TestTube2 size={18} /> Send Test to Myself
        </CustomButton>
        <div className="flex gap-4">
          <CustomButton
            onClick={closeModal}
            className="bg-gray-600 hover:bg-gray-500"
            disabled={isSending}
          >
            Cancel
          </CustomButton>
          <CustomButton
            onClick={handleSend}
            className="bg-blue-600"
            disabled={!selectedTemplate || isSending}
          >
            {isSending ? (
              <Loader2 className="animate-spin" />
            ) : (
              `Send to ${recipients?.length || 0} Recipient${
                recipients?.length === 1 ? '' : 's'
              }`
            )}
          </CustomButton>
        </div>
      </div>
    </Modal>
  );
}
