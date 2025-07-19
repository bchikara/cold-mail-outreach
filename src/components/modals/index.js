import React from 'react';
import { useAppStore } from '../../stores/appStore';
import AddContactModal from './AddContactModal';
import SelectTemplateModal from './SelectTemplateModal';
import ImportContactsModal from './ImportContactsModal';
import AddManualRecipientModal from './AddManualRecipientModal';
import UploadCsvModal from './UploadCsvModal';
import ImageCropModal from './ImageCropModal';

export default function Modals() {
  const { modal } = useAppStore();

  if (!modal.type) {
    return null;
  }

  switch (modal.type) {
    case 'addContact':
      return <AddContactModal />;
    
    case 'selectTemplate':
      return <SelectTemplateModal />;
      
    case 'importContacts':
      return <ImportContactsModal />;

    case 'addManual':
      return <AddManualRecipientModal />;

    case 'uploadCsvForCampaign':
      return <UploadCsvModal />;
      
    case 'cropImage':
      return <ImageCropModal />;

    default:
      return null;
  }
}
