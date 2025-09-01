import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const UploadSummary = ({ 
  files = [], 
  onStartUpload, 
  onClearAll,
  isUploading = false,
  className,
  ...props 
}) => {
const totalFiles = files.length;
  const completedFiles = files.filter(f => f.status_c === "completed").length;
  const uploadingFiles = files.filter(f => f.status_c === "uploading").length;
  const errorFiles = files.filter(f => f.status_c === "error").length;
  const pendingFiles = files.filter(f => f.status_c === "pending").length;

const totalSize = files.reduce((sum, file) => sum + (file.size_c || 0), 0);
  const completedSize = files
    .filter(f => f.status_c === "completed")
    .reduce((sum, file) => sum + (file.size_c || 0), 0);
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getOverallProgress = () => {
if (totalFiles === 0) return 0;
    const totalProgress = files.reduce((sum, file) => {
      if (file.status_c === "completed") return sum + 100;
      if (file.status_c === "uploading") return sum + (file.progress_c || 0);
      return sum;
    }, 0);
    return totalProgress / totalFiles;
  };

  const overallProgress = getOverallProgress();
  const hasFiles = totalFiles > 0;
  const canStartUpload = pendingFiles > 0 && !isUploading;
  const allCompleted = totalFiles > 0 && completedFiles === totalFiles;

  if (!hasFiles) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bg-surface border border-gray-700 rounded-xl p-6 space-y-4",
        allCompleted && "border-success/50 bg-success/5",
        className
      )}
      {...props}
    >
      {/* Progress Overview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Upload Summary</h3>
          {allCompleted && (
            <div className="flex items-center space-x-2 text-success">
              <ApperIcon name="CheckCircle" className="w-5 h-5" />
              <span className="font-medium">All uploads complete!</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Overall Progress</span>
            <span className="text-white font-medium">{Math.round(overallProgress)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className={cn(
                "h-3 rounded-full transition-all duration-300",
                allCompleted 
                  ? "bg-gradient-to-r from-success to-green-600" 
                  : "bg-gradient-to-r from-primary to-secondary"
              )}
            />
          </div>
        </div>
      </div>

      {/* Status Counts */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center p-3 bg-gray-800 rounded-lg">
          <div className="text-2xl font-bold text-white">{totalFiles}</div>
          <div className="text-xs text-gray-400">Total Files</div>
        </div>
        
        {completedFiles > 0 && (
          <div className="text-center p-3 bg-success/20 border border-success/30 rounded-lg">
            <div className="text-2xl font-bold text-success">{completedFiles}</div>
            <div className="text-xs text-success/80">Completed</div>
          </div>
        )}
        
        {uploadingFiles > 0 && (
          <div className="text-center p-3 bg-primary/20 border border-primary/30 rounded-lg">
            <div className="text-2xl font-bold text-primary">{uploadingFiles}</div>
            <div className="text-xs text-primary/80">Uploading</div>
          </div>
        )}
        
        {errorFiles > 0 && (
          <div className="text-center p-3 bg-error/20 border border-error/30 rounded-lg">
            <div className="text-2xl font-bold text-error">{errorFiles}</div>
            <div className="text-xs text-error/80">Failed</div>
          </div>
        )}
      </div>

      {/* Size Information */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-400">
          Size: {formatFileSize(completedSize)} / {formatFileSize(totalSize)}
        </span>
        <div className="flex items-center space-x-2">
          {pendingFiles > 0 && (
            <Badge variant="warning" size="sm">
              {pendingFiles} pending
            </Badge>
          )}
          {uploadingFiles > 0 && (
            <Badge variant="primary" size="sm">
              {uploadingFiles} uploading
            </Badge>
          )}
          {errorFiles > 0 && (
            <Badge variant="error" size="sm">
              {errorFiles} failed
            </Badge>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-700">
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          disabled={isUploading}
        >
          <ApperIcon name="Trash2" className="w-4 h-4 mr-2" />
          Clear All
        </Button>

        {canStartUpload && (
          <Button
            variant="primary"
            size="md"
            onClick={onStartUpload}
            disabled={isUploading}
          >
            <ApperIcon name="Upload" className="w-4 h-4 mr-2" />
            Upload {pendingFiles} File{pendingFiles !== 1 ? "s" : ""}
          </Button>
        )}

        {allCompleted && (
          <Button
            variant="success"
            size="md"
            onClick={onClearAll}
          >
            <ApperIcon name="Check" className="w-4 h-4 mr-2" />
            Done
          </Button>
        )}
      </div>
    </motion.div>
  );
};

export default UploadSummary;