import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import "./ImageUpload.css";

interface Props {
  value: string;
  onChange: (url: string) => void;
}

const ImageUpload: React.FC<Props> = ({ value, onChange }) => {
  const [preview, setPreview] = useState(value);
  const [progress, setProgress] = useState(0);

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        onChange(reader.result as string);
        setProgress(100);
      };
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress((e.loaded / e.total) * 100);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { "image/*": [] } });

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
      {progress > 0 && progress < 100 && (
        <div className="w-full bg-gray-200 rounded h-2 mt-2 overflow-hidden">
          <div className="bg-blue-500 h-2 rounded animate-progress" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
};

export default ImageUpload; 