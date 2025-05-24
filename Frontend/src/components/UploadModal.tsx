import React, { useCallback, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useDropzone } from "react-dropzone";
import { X, Upload as UploadIcon, FileText } from "lucide-react";
import { Progress } from "./ui/progress";
import { formatFileSize } from "../lib/utils";
import Button from "./Button";
import { uploadAndAnalyzeDocument, DocumentSummary } from "../lib/api";

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (summary: DocumentSummary) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setError(null);
    const selectedFile = acceptedFiles[0];

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setFile(selectedFile);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    maxFiles: 1,
    multiple: false,
  });

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      // Start upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + 5;
        });
      }, 100);

      // Call API to upload and analyze document
      const summary = await uploadAndAnalyzeDocument(file);

      clearInterval(interval);
      setUploadProgress(100);

      // Short delay before closing
      await new Promise((resolve) => setTimeout(resolve, 500));
      onUploadComplete(summary);
      onClose();
    } catch (error) {
      console.error("Error uploading document:", error);
      setError("Failed to upload file. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900">
              Upload Financial Document
            </Dialog.Title>
            <Dialog.Close className="text-gray-400 hover:text-gray-500">
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>

          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors duration-200 ${
              isDragActive
                ? "border-indigo-500 bg-indigo-50"
                : "border-gray-300 hover:border-indigo-400"
            }`}
          >
            <input {...getInputProps()} />
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-lg text-gray-600 mb-2">
              {isDragActive
                ? "Drop the file here"
                : "Drag & drop your file here, or click to select"}
            </p>
            <p className="text-sm text-gray-500">
              Supported formats: PDF, DOCX, TXT (Max 5MB)
            </p>
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {file && !error && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-indigo-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {uploading && (
                <div className="mt-4">
                  <Progress value={uploadProgress} className="mb-2" />
                  <p className="text-sm text-gray-500">
                    {uploadProgress < 100
                      ? "Uploading..."
                      : "Processing document..."}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 flex justify-end space-x-4">
            <Button label="Cancel" secondary onClick={onClose} />
            <Button
              label="Upload and Analyze"
              primary
              onClick={handleUpload}
              className={`${
                !file || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UploadModal;
