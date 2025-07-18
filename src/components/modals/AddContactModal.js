import React, { useRef } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';
import { db, appId } from '../../lib/firebaseConfig';
import {Modal} from '../shared/Modal';
import {CustomButton} from '../shared/CustomButton';

export default function AddContactModal() {
  const { modal, closeModal, notifySuccess, notifyError, isSaving, setSaving } = useAppStore();
  const { userId } = useAuthStore();
  
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const companyRef = useRef(null);

  const isOpen = modal.type === 'addContact';

  const handleAddContact = async () => {
    if (isSaving) return;
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const company = companyRef.current.value;

    if (!name || !email || !company) {
      notifyError("Please fill in all fields.");
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, `artifacts/${appId}/users/${userId}/contacts`), { 
        name, 
        email, 
        company, 
        createdAt: new Date() 
      });
      notifySuccess("Contact added successfully!");
      closeModal();
    } catch (error) {
      console.error("Error adding contact:", error);
      notifyError("Failed to add contact.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Add New Contact">
      <div className="space-y-4">
        <input ref={nameRef} type="text" placeholder="Name" className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/>
        <input ref={emailRef} type="email" placeholder="Email" className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/>
        <input ref={companyRef} type="text" placeholder="Company" className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <CustomButton onClick={closeModal} className="bg-gray-600 hover:bg-gray-500" disabled={isSaving}>
          Cancel
        </CustomButton>
        <CustomButton onClick={handleAddContact} className="bg-blue-600 hover:bg-blue-700" disabled={isSaving}>
          {isSaving ? "Adding..." : "Add Contact"}
        </CustomButton>
      </div>
    </Modal>
  );
}