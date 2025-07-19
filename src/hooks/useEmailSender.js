import { collection, addDoc, writeBatch, doc, updateDoc } from 'firebase/firestore';
import { useAppStore } from '../stores/appStore';
import { useAuthStore } from '../stores/authStore';
import { useDataStore } from '../stores/dataStore';
import { db, appId } from '../lib/firebaseConfig';
import { getPersonalizedEmail } from '../lib/utils';

export function useEmailSender() {
  const { 
    openModal, 
    closeModal,
    setSaving, 
    isSaving, 
    isSending,
    setSending, 
    notifySuccess, 
    notifyError 
  } = useAppStore();
  const { userId } = useAuthStore();
  const { contacts: allContacts, profile, resumeFile } = useDataStore();

  const initiateSendFlow = async (recipients, options = {}) => {
    if (recipients.length === 0 || isSaving) return;
    if (!profile || !profile.name) {
      notifyError("Please add your name in Settings before sending emails.");
      return;
    }
    if (!resumeFile) {
      notifyError("Please upload your resume in Settings before sending emails.");
      return;
    }

    setSaving(true);
    try {
      const existingEmails = new Set(allContacts.map(c => c.email));
      const newContactsToSave = recipients.filter(r => !existingEmails.has(r.email));
      if (newContactsToSave.length > 0) {
        const batch = writeBatch(db);
        newContactsToSave.forEach(contact => {
          const newDocRef = doc(collection(db, `artifacts/${appId}/users/${userId}/contacts`));
          batch.set(newDocRef, { ...contact, createdAt: new Date() });
        });
        await batch.commit();
        notifySuccess(`${newContactsToSave.length} new contact(s) saved.`);
      }
    } catch (error) {
      console.error("Error saving new contacts:", error);
      notifyError("Could not save new contacts.");
    } finally {
      setSaving(false);
    }

    openModal('selectTemplate', {
      recipients,
      defaultTemplate: options.defaultTemplate,
      onSelect: (template, finalSubject, finalBody) => {
        sendEmails(recipients, template, finalSubject, finalBody, options.isFollowUp);
      }
    });
  };

  const sendEmails = async (contactsToSend, template, finalSubject, finalBody, isFollowUp = false, isTest = false) => {
    if (contactsToSend.length === 0) return;
    setSending(true);

    let resumeBlob = null;
    if (resumeFile && resumeFile.url) {
        try {
            const response = await fetch(resumeFile.url);
            resumeBlob = await response.blob();
        } catch (error) {
            console.error("Failed to fetch resume for attachment:", error);
            notifyError("Could not fetch resume file.");
            setSending(false);
            return;
        }
    }

    const emailPromises = contactsToSend.map(async (contact) => {
      const editedTemplate = { subject: finalSubject, body: finalBody };
      const { subject, body } = getPersonalizedEmail(editedTemplate, contact, profile);

      const formData = new FormData();
      formData.append('to', contact.email);
      formData.append('subject', subject);
      formData.append('html', body);
      formData.append('fromName', profile.name || "A Professional Contact");
      
      if (resumeBlob) {
          const resumeFilename = `${(profile.name || 'User').replace(/ /g, '_')}_Resume.pdf`;
          formData.append('resume', resumeBlob, resumeFilename);
      }

      const response = await fetch('/api/send-email', {
          method: 'POST',
          body: formData,
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.details || `Server responded with ${response.status}`);
      }
      return contact;
    });

    const results = await Promise.allSettled(emailPromises);
    
    const successfulSends = [];
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulSends.push(result.value);
      } else {
        const contactName = contactsToSend[index].name;
        console.error(`Failed to send email to ${contactName}:`, result.reason);
        notifyError(`Failed to send email to ${contactName}: ${result.reason.message}`);
      }
    });

    if (successfulSends.length > 0 && !isTest) {
      const batch = writeBatch(db);
      successfulSends.forEach(contact => {
        if (isFollowUp && contact.id) {
            const historyRef = doc(db, `artifacts/${appId}/users/${userId}/history`, contact.id);
            batch.update(historyRef, { status: 'Follow-up Sent', sentAt: new Date() });
        } else {
            const historyRef = doc(collection(db, `artifacts/${appId}/users/${userId}/history`));
            const { id, ...contactData } = contact;
            const historyData = {
                ...contactData,
                template: template.name,
                sentAt: new Date(),
                createdAt: new Date(),
                status: 'Initial Outreach'
            };
            batch.set(historyRef, historyData);
        }
      });
      await batch.commit();
    }
    
    setSending(false);
    if (!isTest) {
      closeModal();
      notifySuccess(`Email campaign has been processed!`);
    } else {
      notifySuccess(`Test email sent to ${profile.email}`);
    }
  };
  
  const sendTestEmail = async (template, subject, body) => {
    if (!profile.email) {
      notifyError("Your primary email is not available in your profile to send a test.");
      return;
    }
    const testRecipient = { name: "Test User (You)", email: profile.email, company: "Test Company Inc." };
    await sendEmails([testRecipient], template, subject, body, false, true);
  };

  return { initiateSendFlow, isSending, isSaving };
}
