import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, Upload as UploadIcon, X, FileText } from "lucide-react";
import { Progress } from "../components/ui/progress";
import { formatFileSize } from "../lib/utils";
import Button from "../components/Button";
import { uploadAndAnalyzeDocument } from "../lib/api";

const ACCEPTED_FILE_TYPES = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
    ".docx",
  ],
  "text/plain": [".txt"],
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const Upload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const navigate = useNavigate();

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
      
      // Store the summary in session storage to pass to the Summary page
      sessionStorage.setItem('documentSummary', JSON.stringify(summary));
      
      clearInterval(interval);
      setUploadProgress(100);

      // Short delay before navigation
      await new Promise((resolve) => setTimeout(resolve, 500));
      navigate("/summary");
    } catch (error) {
      console.error('Error uploading document:', error);
      setError("Failed to upload file. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center text-gray-600 hover:text-indigo-600 transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Upload Financial Document
          </h1>

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

          <div className="mt-6 flex justify-end">
            <Button
              label="Upload and Analyze"
              primary
              onClick={handleUpload}
              className={`${
                !file || uploading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
