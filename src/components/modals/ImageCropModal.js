import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useAppStore } from '../../stores/appStore';
import { Modal } from '../shared/Modal';
import { CustomButton } from '../shared/CustomButton';

const EXPORT_AS_PNG = true;
const CIRCULAR_OUTPUT = true;
const OUTPUT_QUALITY = 0.95;
const ASPECT = 1;
const INITIAL_WIDTH_PERCENT = 90;

function percentCropToPixels(crop, image) {
  const naturalW = image.naturalWidth;
  const naturalH = image.naturalHeight;
  const isPercent = crop?.unit === '%';
  if (!crop || crop.width == null || crop.height == null) return null;
  return {
    x: isPercent ? (crop.x / 100) * naturalW : crop.x,
    y: isPercent ? (crop.y / 100) * naturalH : crop.y,
    width: isPercent ? (crop.width / 100) * naturalW : crop.width,
    height: isPercent ? (crop.height / 100) * naturalH : crop.height
  };
}

async function getCroppedImageBlob(image, percentCrop) {
  const pixelCrop = percentCropToPixels(percentCrop, image);
  if (!pixelCrop) return null;
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(pixelCrop.width * ratio);
  canvas.height = Math.round(pixelCrop.height * ratio);
  ctx.scale(ratio, ratio);
  if (CIRCULAR_OUTPUT) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(pixelCrop.width / 2, pixelCrop.height / 2, pixelCrop.width / 2, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  if (CIRCULAR_OUTPUT) ctx.restore();
  const mime = EXPORT_AS_PNG ? 'image/png' : 'image/jpeg';
  const blob = await new Promise(resolve =>
    canvas.toBlob(b => resolve(b), mime, EXPORT_AS_PNG ? undefined : OUTPUT_QUALITY)
  );
  if (!blob) return null;
  const dataUrl = await new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
  return { blob, dataUrl };
}

export default function ImageCropModal() {
  const { modal, closeModal } = useAppStore();
  const imgRef = useRef(null);
  const [crop, setCrop] = useState(null);
  const [loadingExport, setLoadingExport] = useState(false);
  const isOpen = modal.type === 'cropImage';
  const imageSrc = modal.data?.imageSrc;
  const onCropComplete = modal.data?.onCropComplete;

  const onImageLoad = useCallback(e => {
    const img = e.currentTarget;
    const initial = centerCrop(
      makeAspectCrop({ unit: '%', width: INITIAL_WIDTH_PERCENT }, ASPECT, img.width, img.height),
      img.width,
      img.height
    );
    setCrop(initial);
  }, []);

  const handleSaveCrop = useCallback(async () => {
    if (!imgRef.current || !crop?.width || !crop?.height) return;
    setLoadingExport(true);
    try {
      const result = await getCroppedImageBlob(imgRef.current, crop);
      if (result && onCropComplete) onCropComplete(result.blob, result.dataUrl);
      closeModal();
    } finally {
      setLoadingExport(false);
    }
  }, [crop, onCropComplete, closeModal]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={loadingExport ? () => {} : closeModal}
      title="Crop Your Profile Picture"
    >
      <div className="flex justify-center bg-gray-900 p-4 rounded-md max-h-[75vh] overflow-auto">
        <ReactCrop
          crop={crop}
          onChange={(_px, percent) => setCrop(percent)}
          aspect={ASPECT}
          circularCrop
        >
          <img
            ref={imgRef}
            src={imageSrc}
            onLoad={onImageLoad}
            alt="Crop preview"
            style={{ maxHeight: '70vh', display: 'block' }}
          />
        </ReactCrop>
      </div>
      <div className="flex justify-end gap-4 mt-6">
        <CustomButton
          onClick={closeModal}
          className="bg-gray-600 hover:bg-gray-500"
          disabled={loadingExport}
        >
          Cancel
        </CustomButton>
        <CustomButton
          onClick={handleSaveCrop}
          className="bg-blue-600 hover:bg-blue-700"
          disabled={!crop || loadingExport}
        >
          {loadingExport ? 'Exporting…' : 'Save Image'}
        </CustomButton>
      </div>
    </Modal>
  );
}
