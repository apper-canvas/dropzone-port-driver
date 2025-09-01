import React from "react";
import { motion } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import { cn } from "@/utils/cn";

const FilePreview = ({ file, className, ...props }) => {
const getFileIcon = (type) => {
    if (type && type.startsWith("image/")) return "Image";
    if (type === "application/pdf") return "FileText";
    if (type && type.includes("word") || type && type.includes("document")) return "FileText";
    if (type && type.includes("spreadsheet") || type && type.includes("excel")) return "Sheet";
    if (type && type.includes("presentation") || type && type.includes("powerpoint")) return "Presentation";
    if (type && type.startsWith("text/")) return "FileText";
    if (type && type.includes("json")) return "Code";
    if (type && type.includes("csv")) return "Database";
    return "File";
  };

const getFileTypeLabel = (type) => {
    if (type && type.startsWith("image/")) return type.split("/")[1].toUpperCase();
    if (type === "application/pdf") return "PDF";
    if (type && type.includes("word")) return "DOCX";
    if (type && type.includes("excel")) return "XLSX";
    if (type && type.includes("powerpoint")) return "PPTX";
    if (type === "text/plain") return "TXT";
    if (type === "application/json") return "JSON";
    if (type === "text/csv") return "CSV";
    return "FILE";
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

const getStatusColor = (status) => {
    switch (status) {
      case "completed": return "success";
      case "uploading": return "primary";
      case "error": return "error";
      case "pending": return "warning";
      default: return "default";
    }
  };

const iconColor = file.type_c && file.type_c.startsWith("image/") ? "text-purple-400" : 
                   file.type_c === "application/pdf" ? "text-red-400" :
                   file.type_c && file.type_c.includes("word") ? "text-blue-400" :
                   "text-gray-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex items-center space-x-4 p-4 bg-surface border border-gray-700 rounded-xl hover:border-gray-600 transition-all duration-200",
        className
      )}
      {...props}
    >
<div className={cn("w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center", iconColor)}>
        <ApperIcon name={getFileIcon(file.type_c)} className="w-6 h-6" />
      </div>
      
      <div className="flex-1 min-w-0">
<h4 className="text-white font-medium text-sm truncate mb-1">{file.Name}</h4>
        <div className="flex items-center space-x-2 text-xs text-gray-400">
<span>{formatFileSize(file.size_c)}</span>
          <span>•</span>
          <Badge variant="default" size="sm">
            {getFileTypeLabel(file.type_c)}
          </Badge>
        </div>
      </div>
      
      <div className="flex flex-col items-end space-y-1">
<Badge variant={getStatusColor(file.status_c)} size="sm">
          {file.status_c === "uploading" && <ApperIcon name="Upload" className="w-3 h-3 mr-1" />}
          {file.status_c === "completed" && <ApperIcon name="Check" className="w-3 h-3 mr-1" />}
          {file.status_c === "error" && <ApperIcon name="X" className="w-3 h-3 mr-1" />}
          {file.status_c && file.status_c.charAt(0).toUpperCase() + file.status_c.slice(1)}
        </Badge>
{file.uploaded_at_c && (
          <span className="text-xs text-gray-500">
            {new Date(file.uploaded_at_c).toLocaleDateString()}
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default FilePreview;