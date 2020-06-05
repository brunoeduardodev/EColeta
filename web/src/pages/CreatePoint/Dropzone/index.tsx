import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import "./styles.css";

interface OwnProps {
  onFileUploaded: (file: File) => void;
}

const Dropzone = ({ onFileUploaded }: OwnProps) => {
  const [selectedFileUrl, setSelectedFileUrl] = useState("");

  const onDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      const fileUrl = URL.createObjectURL(file);
      console.log(fileUrl);
      setSelectedFileUrl(fileUrl);
      onFileUploaded(file);
    },
    [onFileUploaded]
  );
  const { getRootProps, getInputProps } = useDropzone({ onDrop, accept: "image/*" });

  return (
    <div className="dropzone" {...getRootProps()}>
      <input {...getInputProps()} />

      {selectedFileUrl ? (
        <img src={selectedFileUrl} alt="Logo" />
      ) : (
        <p>
          <FiUpload />
          Imagem do estabelecimento
        </p>
      )}
    </div>
  );
};

export default Dropzone;
