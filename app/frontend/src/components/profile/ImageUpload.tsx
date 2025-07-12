import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { profileApi } from "./api";
import "./ImageUpload.css";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

const ImageUpload: React.FC<Props> = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      setLoading(true);
      setError(null);
      setProgress(0);
      
      try {
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('File size must be less than 5MB');
        }
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
          throw new Error('Please select a valid image file');
        }
        
        setProgress(25);
        
        // Upload to backend
        const res = await profileApi.uploadProfileImage(file);
        onChange(res.url);
        setProgress(100);
        
        // Clear error on success
        setError(null);
        
      } catch (err: any) {
        console.error('Upload error:', err);
        setError(err.message || "Upload failed - please try again");
        setProgress(0);
        
        // Reset preview on error
        setPreview(value);
      } finally {
        setLoading(false);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { "image/*": [] },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false
  });

  return (
    <div {...getRootProps()} className={`image-upload-zone border-2 border-dashed p-4 rounded mb-2 text-center cursor-pointer transition-all duration-300 ${isDragActive ? "border-blue-500 bg-blue-50 animate-glow" : "border-gray-300"}`}>
      <input {...getInputProps()} />
      {preview ? (
        <img src={preview} alt="Preview" className="w-24 h-24 rounded-full mx-auto mb-2 animate-fade-in" />
      ) : (
        <div className="flex flex-col items-center justify-center h-24">
          <span className="text-3xl text-blue-400 animate-bounce">⬆️</span>
          <p className="mt-2">{isDragActive ? "Drop the image here..." : "Drag & drop or click to select an image"}</p>
        </div>
      )}
      {loading && <div className="text-blue-500 mt-2">Uploading...</div>}
      {error && <div className="text-red-500 mt-2 text-sm">{error}</div>}
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-2 overflow-hidden">
          <div className="bg-blue-500 h-2 rounded animate-progress" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 