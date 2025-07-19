import { collection, writeBatch, doc } from 'firebase/firestore';
import { db, appId } from '../lib/firebaseConfig';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { getPersonalizedEmail } from '../lib/utils';
import { FOOTER_REGEX } from '../lib/geminiUtils';

export function useEmailSender() {
  const {
    openModal,
    closeModal,
    setSaving,
    isSaving,
    isSending,
    setSending,
    notifySuccess,
    notifyError,
  } = useAppStore();

  const { userId } = useAuthStore();
  const { contacts: allContacts, profile, resumeFile } = useDataStore();

  const initiateSendFlow = async (recipients, options = {}) => {
    if (!Array.isArray(recipients) || recipients.length === 0 || isSaving) return;

    if (!profile?.name) {
      notifyError('Please add your name in Settings before sending emails.');
      return;
    }
    if (!resumeFile) {
      notifyError('Please upload your resume in Settings before sending emails.');
      return;
    }

    setSaving(true);
    try {
      const existingEmails = new Set(allContacts.map((c) => c.email));
      const newContactsToSave = recipients.filter((r) => !existingEmails.has(r.email));
      if (newContactsToSave.length > 0) {
        const batch = writeBatch(db);
        newContactsToSave.forEach((contact) => {
          const newDocRef = doc(collection(db, `artifacts/${appId}/users/${userId}/contacts`));
          batch.set(newDocRef, { ...contact, createdAt: new Date() });
        });
        await batch.commit();
        notifySuccess(`${newContactsToSave.length} new contact(s) saved.`);
      }
    } catch (err) {
      console.error('Error saving new contacts:', err);
      notifyError('Could not save new contacts.');
    } finally {
      setSaving(false);
    }

    openModal('selectTemplate', {
      recipients,
      defaultTemplate: options.defaultTemplate,
      generatedBody: options.generatedBody,
      onSelect: (template, subjectBase, bodyBase) => {
        sendEmails(recipients, template, subjectBase, bodyBase, options.isFollowUp);
      },
      onSendTest: (template, subjectBase, bodyBase) => {
        sendTestEmail(template, subjectBase, bodyBase);
      },
    });
  };

  const sendEmails = async (
    contactsToSend,
    template,
    subjectBase,
    bodyBase,
    isFollowUp = false,
    isTest = false
  ) => {
    if (!Array.isArray(contactsToSend) || contactsToSend.length === 0) return;
    setSending(true);

    let resumeBlob = null;
    if (resumeFile?.url) {
      try {
        const resp = await fetch(resumeFile.url);
        resumeBlob = await resp.blob();
      } catch (err) {
        console.error('Resume fetch failed:', err);
        notifyError('Could not fetch resume file.');
        setSending(false);
        return;
      }
    }

    const sanitizedBodyBase = (bodyBase || '').replace(FOOTER_REGEX, '');
    const resumeFilename = `${(profile.name || 'User')} Resume.pdf`;

    const emailPromises = contactsToSend.map(async (contact) => {
      const { subject, body } = getPersonalizedEmail(
        { subject: subjectBase ?? template.subject, body: sanitizedBodyBase || template.body },
        contact,
        profile
      );

      const formData = new FormData();
      formData.append('to', contact.email);
      formData.append('subject', subject);
      formData.append('html', body);
      formData.append('fromName', profile.name || 'A Professional Contact');

      if (resumeBlob) {
        formData.append('resume', resumeBlob, resumeFilename);
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `Server responded with ${response.status}`);
      }
      return contact;
    });

    const results = await Promise.allSettled(emailPromises);
    const successful = [];

    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        successful.push(r.value);
      } else {
        const name = contactsToSend[i].name || contactsToSend[i].email;
        console.error(`Failed to send to ${name}:`, r.reason);
        notifyError(`Failed to send email to ${name}: ${r.reason.message}`);
      }
    });

    if (successful.length > 0 && !isTest) {
      const batch = writeBatch(db);
      successful.forEach((contact) => {
        if (isFollowUp && contact.id) {
          const ref = doc(db, `artifacts/${appId}/users/${userId}/history`, contact.id);
          batch.update(ref, { status: 'Follow-up Sent', sentAt: new Date() });
        } else {
          const ref = doc(collection(db, `artifacts/${appId}/users/${userId}/history`));
          const { id, ...contactData } = contact;
          batch.set(ref, {
            ...contactData,
            template: template.name,
            sentAt: new Date(),
            createdAt: new Date(),
            status: 'Initial Outreach',
          });
        }
      });
      await batch.commit();
    }

    setSending(false);
    if (isTest) {
      notifySuccess(`Test email sent to ${profile.email}`);
    } else {
      notifySuccess('Email campaign has been processed!');
      closeModal();
    }
  };

  const sendTestEmail = async (template, subjectBase, bodyBase) => {
    if (!profile.email) {
      notifyError('Your primary email is not available in your profile to send a test.');
      return;
    }
    const testRecipient = {
      name: 'Test User (You)',
      email: profile.email,
      company: 'Test Company Inc.',
    };
    await sendEmails([testRecipient], template, subjectBase, bodyBase, false, true);
  };

  return { initiateSendFlow, isSending, isSaving };
}
