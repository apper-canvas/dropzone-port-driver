import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import ProgressBar from "@/components/atoms/ProgressBar";
import Button from "@/components/atoms/Button";
import { cn } from "@/utils/cn";

const UploadProgress = ({ 
  file, 
  onCancel, 
  onRemove, 
  className,
  ...props 
}) => {
const getFileIcon = (type) => {
    if (type && type.startsWith("image/")) return "Image";
    if (type === "application/pdf") return "FileText";
    if (type && type.includes("word") || type && type.includes("document")) return "FileText";
    return "File";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getProgressVariant = () => {
if (file.status_c === "error") return "error";
    if (file.status_c === "completed") return "success";
    return "primary";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={cn(
"bg-surface border border-gray-700 rounded-xl p-4 space-y-3",
        file.status_c === "error" && "border-red-500/50",
        file.status_c === "completed" && "border-green-500/50",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center">
            <ApperIcon 
name={getFileIcon(file.type_c)} 
              className={cn(
                "w-5 h-5",
                file.type_c && file.type_c.startsWith("image/") ? "text-purple-400" :
                file.type_c === "application/pdf" ? "text-red-400" :
                "text-gray-400"
              )}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm truncate">{file.Name}</h4>
            <p className="text-gray-400 text-xs">{formatFileSize(file.size_c)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
{file.status_c === "uploading" && onCancel && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCancel(file.Id)}
              className="p-1 h-8 w-8"
            >
              <ApperIcon name="X" className="w-4 h-4" />
            </Button>
          )}
          
{(file.status_c === "completed" || file.status_c === "error") && onRemove && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(file.Id)}
              className="p-1 h-8 w-8"
            >
              <ApperIcon name="Trash2" className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

{file.status_c === "uploading" && (
        <div className="space-y-2">
          <ProgressBar
            value={file.progress_c}
            variant={getProgressVariant()}
            size="md"
            showLabel={true}
          />
          <p className="text-xs text-gray-400">
            Uploading... {file.progress_c}% complete
          </p>
        </div>
      )}

{file.status_c === "completed" && (
        <div className="flex items-center space-x-2 text-success text-sm">
          <ApperIcon name="CheckCircle" className="w-4 h-4" />
          <span>Upload completed successfully</span>
        </div>
      )}

{file.status_c === "error" && (
        <div className="flex items-center space-x-2 text-error text-sm">
          <ApperIcon name="AlertCircle" className="w-4 h-4" />
          <span>Upload failed - please try again</span>
        </div>
      )}
    </motion.div>
  );
};

export default UploadProgress;