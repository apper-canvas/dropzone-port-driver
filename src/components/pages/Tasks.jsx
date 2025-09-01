import React, { useContext, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { taskService } from "@/services/api/taskService";
import { uploadService } from "@/services/api/uploadService";
import { AuthContext } from "../../App";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const { logout } = useContext(AuthContext);
  const { user } = useSelector((state) => state.user);

  // Form state
  const [formData, setFormData] = useState({
    Name: "",
    Tags: "",
    description_c: "",
    status_c: "New",
    priority_c: "Medium",
    due_date_c: "",
    assigned_to_c: "",
    upload_c: ""
  });

  const statusOptions = ["New", "In Progress", "Completed", "On Hold", "Cancelled"];
  const priorityOptions = ["High", "Medium", "Low"];

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const tasksData = await taskService.getAll();
      setTasks(tasksData || []);
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUploads = async () => {
    try {
      const uploadsData = await uploadService.getAll();
      setUploads(uploadsData || []);
    } catch (err) {
      console.error("Error loading uploads:", err);
    }
  };

  useEffect(() => {
    loadTasks();
    loadUploads();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      Name: "",
      Tags: "",
      description_c: "",
      status_c: "New",
      priority_c: "Medium",
      due_date_c: "",
      assigned_to_c: "",
      upload_c: ""
    });
    setEditingTask(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.Name.trim()) {
      toast.error("Task name is required");
      return;
    }

    try {
      if (editingTask) {
        await taskService.update(editingTask.Id, formData);
        setTasks(prev => prev.map(task => 
          task.Id === editingTask.Id ? { ...task, ...formData } : task
        ));
        toast.success("Task updated successfully!");
      } else {
        const newTask = await taskService.create(formData);
        setTasks(prev => [newTask, ...prev]);
        toast.success("Task created successfully!");
      }
      
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      toast.error(`Failed to ${editingTask ? 'update' : 'create'} task: ${err.message}`);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      Name: task.Name || "",
      Tags: task.Tags || "",
      description_c: task.description_c || "",
      status_c: task.status_c || "New",
      priority_c: task.priority_c || "Medium",
      due_date_c: task.due_date_c ? task.due_date_c.split('T')[0] : "",
      assigned_to_c: task.assigned_to_c?.Id || "",
      upload_c: task.upload_c?.Id || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;

    try {
      await taskService.delete(taskId);
      setTasks(prev => prev.filter(task => task.Id !== taskId));
      toast.success("Task deleted successfully!");
    } catch (err) {
      toast.error(`Failed to delete task: ${err.message}`);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await taskService.updateStatus(taskId, newStatus);
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...task, status_c: newStatus } : task
      ));
      toast.success("Task status updated!");
    } catch (err) {
      toast.error(`Failed to update status: ${err.message}`);
    }
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "New": return "info";
      case "In Progress": return "warning";
      case "Completed": return "success";
      case "On Hold": return "secondary";
      case "Cancelled": return "error";
      default: return "default";
    }
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case "High": return "error";
      case "Medium": return "warning";
      case "Low": return "success";
      default: return "default";
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = filterStatus === "All" || task.status_c === filterStatus;
    const matchesPriority = filterPriority === "All" || task.priority_c === filterPriority;
    const matchesSearch = searchTerm === "" || 
      task.Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description_c?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.Tags?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesPriority && matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Task Management
            </h1>
            <p className="text-xl text-gray-400">
              Organize and track your tasks efficiently
            </p>
          </div>
          <div className="flex items-center space-x-4">
            {user && (
              <span className="text-gray-400 text-sm">
                Welcome, {user.firstName || user.emailAddress}
              </span>
            )}
            <Link to="/">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <ApperIcon name="Upload" className="w-4 h-4" />
                <span>Files</span>
              </Button>
            </Link>
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

        {/* Filters and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between p-6 bg-surface rounded-lg"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
            
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-primary"
              >
                <option value="All">All Status</option>
                {statusOptions.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                className="px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-primary"
              >
                <option value="All">All Priority</option>
                {priorityOptions.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>
          </div>
          
          <Button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="flex items-center space-x-2"
          >
            <ApperIcon name="Plus" className="w-4 h-4" />
            <span>New Task</span>
          </Button>
        </motion.div>

        {/* Tasks List */}
        {error ? (
          <Error
            title="Failed to load tasks"
            message={error}
            onRetry={loadTasks}
            variant="inline"
          />
        ) : filteredTasks.length === 0 ? (
          <Empty
            title="No tasks found"
            message="Create your first task to get started."
            icon="CheckSquare"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.Id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-surface p-6 rounded-lg border border-gray-700 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-white">{task.Name}</h3>
                        <Badge variant={getPriorityBadgeVariant(task.priority_c)} size="sm">
                          {task.priority_c}
                        </Badge>
                        <Badge variant={getStatusBadgeVariant(task.status_c)} size="sm">
                          {task.status_c}
                        </Badge>
                      </div>
                      
                      {task.description_c && (
                        <p className="text-gray-400 text-sm">{task.description_c}</p>
                      )}
                      
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <ApperIcon name="Calendar" className="w-4 h-4" />
                          Due: {formatDate(task.due_date_c)}
                        </span>
                        
                        {task.assigned_to_c?.Name && (
                          <span className="flex items-center gap-1">
                            <ApperIcon name="User" className="w-4 h-4" />
                            {task.assigned_to_c.Name}
                          </span>
                        )}
                        
                        {task.upload_c?.Name && (
                          <span className="flex items-center gap-1">
                            <ApperIcon name="FileText" className="w-4 h-4" />
                            {task.upload_c.Name}
                          </span>
                        )}
                        
                        {task.Tags && (
                          <span className="flex items-center gap-1">
                            <ApperIcon name="Tag" className="w-4 h-4" />
                            {task.Tags}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-4">
                      <select
                        value={task.status_c}
                        onChange={(e) => handleStatusChange(task.Id, e.target.value)}
                        className="px-2 py-1 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:border-primary"
                      >
                        {statusOptions.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(task)}
                        className="p-2"
                      >
                        <ApperIcon name="Edit2" className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(task.Id)}
                        className="p-2 text-error hover:text-error hover:bg-error/10"
                      >
                        <ApperIcon name="Trash2" className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Task Modal */}
        <AnimatePresence>
          {isModalOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
              >
                <div className="bg-surface rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      {editingTask ? "Edit Task" : "Create New Task"}
                    </h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsModalOpen(false);
                        resetForm();
                      }}
                      className="p-2"
                    >
                      <ApperIcon name="X" className="w-4 h-4" />
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Task Name *
                      </label>
                      <Input
                        name="Name"
                        value={formData.Name}
                        onChange={handleInputChange}
                        placeholder="Enter task name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Description
                      </label>
                      <textarea
                        name="description_c"
                        value={formData.description_c}
                        onChange={handleInputChange}
                        placeholder="Task description"
                        rows="3"
                        className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-primary focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Status
                        </label>
                        <select
                          name="status_c"
                          value={formData.status_c}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-primary"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Priority
                        </label>
                        <select
                          name="priority_c"
                          value={formData.priority_c}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-primary"
                        >
                          {priorityOptions.map(priority => (
                            <option key={priority} value={priority}>{priority}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Due Date
                      </label>
                      <Input
                        type="date"
                        name="due_date_c"
                        value={formData.due_date_c}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Tags
                      </label>
                      <Input
                        name="Tags"
                        value={formData.Tags}
                        onChange={handleInputChange}
                        placeholder="Comma-separated tags"
                      />
                    </div>

                    {uploads.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Related Upload
                        </label>
                        <select
                          name="upload_c"
                          value={formData.upload_c}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-primary"
                        >
                          <option value="">Select an upload</option>
                          {uploads.map(upload => (
                            <option key={upload.Id} value={upload.Id}>
                              {upload.Name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setIsModalOpen(false);
                          resetForm();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button type="submit">
                        {editingTask ? "Update Task" : "Create Task"}
                      </Button>
                    </div>
                  </form>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Tasks;