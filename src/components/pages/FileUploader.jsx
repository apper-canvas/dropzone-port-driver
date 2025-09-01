import React, { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { uploadService } from "@/services/api/uploadService";
import { AuthContext } from "../../App";
import ApperIcon from "@/components/ApperIcon";
import DropZone from "@/components/organisms/DropZone";
import FileList from "@/components/organisms/FileList";
import UploadSummary from "@/components/organisms/UploadSummary";
import Button from "@/components/atoms/Button";

const FileUploader = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  const loadFiles = async () => {
try {
      setLoading(true);
      setError(null);
      const uploads = await uploadService.getAll();
      setFiles(uploads || []);
    } catch (err) {
      console.error("Error loading files:", err);
      setError(err.message);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  // Load initial data (uploaded files history)
  useEffect(() => {
    loadFiles();
  }, []);

const handleFilesSelected = async (selectedFiles) => {
    const newFiles = [];
    
    for (const file of selectedFiles) {
      try {
        const uploadData = await uploadService.create({
          Name: file.name,
          size_c: file.size,
          type_c: file.type,
          status_c: "pending",
          progress_c: 0
        });
        
        newFiles.push({
          ...uploadData,
          file: file // Keep reference to original file for upload
        });
      } catch (err) {
        toast.error(`Failed to prepare ${file.name}: ${err.message}`);
      }
    }

    if (newFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...newFiles]);
    }
  };

const handleStartUpload = async () => {
    const pendingFiles = files.filter(f => f.status_c === "pending");
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    try {
      // Upload files sequentially for better UX
      for (const file of pendingFiles) {
        try {
          // Update status to uploading
          setFiles(prev => prev.map(f => 
            f.Id === file.Id ? { ...f, status_c: "uploading", progress_c: 0 } : f
          ));

          // Simulate upload with progress updates
          await uploadService.simulateUpload(file.Id, (progress) => {
            setFiles(prev => prev.map(f => 
              f.Id === file.Id ? { ...f, progress_c: progress } : f
            ));
          });

          // Update local state with completed status
          setFiles(prev => prev.map(f => 
            f.Id === file.Id 
              ? { ...f, status_c: "completed", progress_c: 100, uploaded_at_c: new Date().toISOString() }
              : f
          ));

          toast.success(`${file.Name} uploaded successfully!`);
        } catch (err) {
          // Update status to error
          setFiles(prev => prev.map(f => 
            f.Id === file.Id ? { ...f, status_c: "error", progress_c: 0 } : f
          ));
          
          toast.error(`Failed to upload ${file.Name}: ${err.message}`);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

const handleCancelUpload = async (fileId) => {
    try {
      // In a real app, you'd cancel the actual upload request
      setFiles(prev => prev.map(f => 
        f.Id === fileId ? { ...f, status_c: "pending", progress_c: 0 } : f
      ));
      
      toast.info("Upload cancelled");
    } catch (err) {
      toast.error(`Failed to cancel upload: ${err.message}`);
    }
  };

const handleRemoveFile = async (fileId) => {
    try {
      await uploadService.delete(fileId);
      setFiles(prev => prev.filter(f => f.Id !== fileId));
      toast.success("File removed");
    } catch (err) {
      toast.error(`Failed to remove file: ${err.message}`);
    }
  };

const handleClearAll = () => {
    setFiles([]);
    toast.info("All files cleared");
  };

  const handleRetry = () => {
    loadFiles();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
        {/* Header with Logout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="text-center flex-1 space-y-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              DropZone
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Upload and manage your files with ease. Drag, drop, and watch the magic happen.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-gray-400 text-sm">
                Welcome, {user.firstName || user.emailAddress}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <ApperIcon name="LogOut" className="w-4 h-4" />
              <span>Logout</span>
            </Button>
          </div>
        </motion.div>

        {/* Drop Zone */}
        <DropZone onFilesSelected={handleFilesSelected} />

        {/* File List */}
        <FileList
          files={files}
          loading={loading}
          error={error}
          onCancel={handleCancelUpload}
          onRemove={handleRemoveFile}
          onRetry={handleRetry}
        />

        {/* Upload Summary */}
        <UploadSummary
          files={files}
          onStartUpload={handleStartUpload}
          onClearAll={handleClearAll}
          isUploading={isUploading}
        />
      </div>
    </div>
  );
};

export default FileUploader;