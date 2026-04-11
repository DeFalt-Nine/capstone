
import React, { useState, useRef } from 'react';
import { uploadImage } from '../services/apiService';
import ImageCropper from './ImageCropper';

interface UniversalImageSelectorProps {
  onImageSelected: (url: string) => void;
  aspectRatio?: number;
  label?: string;
  currentImage?: string;
  className?: string;
}

const UniversalImageSelector: React.FC<UniversalImageSelectorProps> = ({
  onImageSelected,
  aspectRatio = 16 / 9,
  label = "Select Image",
  currentImage,
  className = ""
}) => {
  const [isCropping, setIsCropping] = useState(false);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempImage(reader.result as string);
        setIsCropping(true);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!urlInput) return;
    setTempImage(urlInput);
    setIsCropping(true);
    setShowUrlInput(false);
  };

  const handleCropComplete = async (croppedBlob: Blob) => {
    setIsCropping(false);
    setIsUploading(true);
    setError(null);

    try {
      const file = new File([croppedBlob], 'cropped-image.png', { type: 'image/png' });
      const result = await uploadImage(file);
      onImageSelected(result.url);
      setTempImage(null);
      setUrlInput('');
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setIsCropping(false);
    setTempImage(null);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</label>}
      
      <div className="relative group">
        {currentImage ? (
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-200 shadow-sm group">
            <img src={currentImage} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-sm">
              <button 
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-10 h-10 bg-white text-slate-700 rounded-full flex items-center justify-center hover:bg-lt-blue hover:text-white transition-all shadow-lg"
                title="Change Image"
              >
                <i className="fas fa-camera"></i>
              </button>
              <button 
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="w-10 h-10 bg-white text-slate-700 rounded-full flex items-center justify-center hover:bg-lt-orange hover:text-white transition-all shadow-lg"
                title="Link URL"
              >
                <i className="fas fa-link"></i>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-lt-blue hover:bg-lt-blue/5 transition-all group"
            >
              <i className="fas fa-cloud-upload-alt text-2xl text-slate-300 group-hover:text-lt-blue mb-2"></i>
              <span className="text-xs font-bold text-slate-500 group-hover:text-lt-blue">Upload File</span>
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(true)}
              className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl hover:border-lt-orange hover:bg-lt-orange/5 transition-all group"
            >
              <i className="fas fa-link text-2xl text-slate-300 group-hover:text-lt-orange mb-2"></i>
              <span className="text-xs font-bold text-slate-500 group-hover:text-lt-orange">Link Image</span>
            </button>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl z-10">
            <i className="fas fa-circle-notch fa-spin text-lt-blue text-2xl mb-2"></i>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Uploading...</span>
          </div>
        )}
      </div>

      {showUrlInput && (
        <div className="flex gap-2 animate-in slide-in-from-top duration-200">
          <input 
            type="url" 
            placeholder="Paste image URL here..."
            className="flex-grow bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-lt-orange/20 focus:border-lt-orange outline-none transition-all"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleUrlSubmit(e as any);
              }
            }}
            autoFocus
          />
          <button 
            type="button"
            onClick={handleUrlSubmit as any}
            className="bg-lt-orange text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-lt-orange/10"
          >
            Next
          </button>
          <button 
            type="button"
            onClick={() => setShowUrlInput(false)}
            className="text-slate-400 hover:text-slate-600 px-2"
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      {error && <p className="text-[10px] text-red-500 font-bold bg-red-50 p-2 rounded-lg border border-red-100"><i className="fas fa-exclamation-circle mr-1"></i> {error}</p>}

      <input 
        type="file" 
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {isCropping && tempImage && (
        <ImageCropper 
          image={tempImage}
          aspectRatio={aspectRatio}
          onCropComplete={handleCropComplete}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};

export default UniversalImageSelector;
