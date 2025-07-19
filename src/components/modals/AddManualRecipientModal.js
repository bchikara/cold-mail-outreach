import React, { useRef } from 'react';
import { useAppStore } from '../../stores/appStore';
import {Modal} from '../shared/Modal';
import {CustomButton} from '../shared/CustomButton';

export default function AddManualRecipientModal() {
  const { modal, closeModal, notifyError } = useAppStore();
  
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const companyRef = useRef(null);

  const isOpen = modal.type === 'addManual';
  if (!isOpen) return null;

  const { onAdd } = modal.data;

  const handleAdd = () => {
    const name = nameRef.current.value;
    const email = emailRef.current.value;
    const company = companyRef.current.value;

    if (!name || !email || !company) {
      notifyError("Please fill in all fields.");
      return;
    }
    
    if (onAdd) {
      onAdd([{ name, email, company }]);
    }

    nameRef.current.value = '';
    emailRef.current.value = '';
    companyRef.current.value = '';
    nameRef.current.focus();
  };

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Add Recipient Manually">
      <div className="space-y-4">
        <input ref={nameRef} type="text" placeholder="Name" className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/>
        <input ref={emailRef} type="email" placeholder="Email" className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/>
        <input ref={companyRef} type="text" placeholder="Company" className="w-full bg-gray-700 text-white p-2 border border-gray-600 rounded-md"/>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <CustomButton onClick={closeModal} className="bg-gray-600 hover:bg-gray-500">Done</CustomButton>
        <CustomButton onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">Add Another</CustomButton>
      </div>
    </Modal>
  );
}
