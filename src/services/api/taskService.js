const initApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const taskService = {
  async getAll() {
    try {
      const apperClient = initApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "upload_c"}},
          {"field": {"Name": "upload_session_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedBy"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('task_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching tasks:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const apperClient = initApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "upload_c"}},
          {"field": {"Name": "upload_session_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}},
          {"field": {"Name": "CreatedBy"}},
          {"field": {"Name": "ModifiedBy"}}
        ]
      };
      
      const response = await apperClient.getRecordById('task_c', parseInt(id), params);
      
      if (!response?.data) {
        throw new Error(`Task with ID ${id} not found`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(taskData) {
    try {
      const apperClient = initApperClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: taskData.Name,
          Tags: taskData.Tags || "",
          description_c: taskData.description_c || "",
          status_c: taskData.status_c || "New",
          priority_c: taskData.priority_c || "Medium",
          due_date_c: taskData.due_date_c,
          assigned_to_c: taskData.assigned_to_c ? parseInt(taskData.assigned_to_c) : undefined,
          upload_c: taskData.upload_c ? parseInt(taskData.upload_c) : undefined,
          upload_session_c: taskData.upload_session_c ? parseInt(taskData.upload_session_c) : undefined
        }]
      };
      
      const response = await apperClient.createRecord('task_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to create ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                throw new Error(`${error.fieldLabel}: ${error}`);
              });
            }
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updateData) {
    try {
      const apperClient = initApperClient();
      
      // Only include Updateable fields that are being updated
      const params = {
        records: [{
          Id: parseInt(id),
          ...(updateData.Name !== undefined && { Name: updateData.Name }),
          ...(updateData.Tags !== undefined && { Tags: updateData.Tags }),
          ...(updateData.description_c !== undefined && { description_c: updateData.description_c }),
          ...(updateData.status_c !== undefined && { status_c: updateData.status_c }),
          ...(updateData.priority_c !== undefined && { priority_c: updateData.priority_c }),
          ...(updateData.due_date_c !== undefined && { due_date_c: updateData.due_date_c }),
          ...(updateData.assigned_to_c !== undefined && { assigned_to_c: updateData.assigned_to_c ? parseInt(updateData.assigned_to_c) : null }),
          ...(updateData.upload_c !== undefined && { upload_c: updateData.upload_c ? parseInt(updateData.upload_c) : null }),
          ...(updateData.upload_session_c !== undefined && { upload_session_c: updateData.upload_session_c ? parseInt(updateData.upload_session_c) : null })
        }]
      };
      
      const response = await apperClient.updateRecord('task_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to update ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.errors) {
              record.errors.forEach(error => {
                throw new Error(`${error.fieldLabel}: ${error}`);
              });
            }
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error updating task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = initApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('task_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        const failed = response.results.filter(r => !r.success);
        
        if (failed.length > 0) {
          console.error(`Failed to delete ${failed.length} records:`, failed);
          failed.forEach(record => {
            if (record.message) {
              throw new Error(record.message);
            }
          });
        }
        
        return successful.length > 0;
      }
    } catch (error) {
      console.error("Error deleting task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async updateStatus(id, status) {
    try {
      return await this.update(id, { status_c: status });
    } catch (error) {
      console.error("Error updating task status:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async updatePriority(id, priority) {
    try {
      return await this.update(id, { priority_c: priority });
    } catch (error) {
      console.error("Error updating task priority:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async assignTask(id, assignedToId) {
    try {
      return await this.update(id, { assigned_to_c: assignedToId });
    } catch (error) {
      console.error("Error assigning task:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async getTasksByStatus(status) {
    try {
      const apperClient = initApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{"FieldName": "status_c", "Operator": "ExactMatch", "Values": [status]}],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('task_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks with status ${status}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async getTasksByPriority(priority) {
    try {
      const apperClient = initApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "description_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "priority_c"}},
          {"field": {"Name": "due_date_c"}},
          {"field": {"Name": "assigned_to_c"}},
          {"field": {"Name": "CreatedOn"}}
        ],
        where: [{"FieldName": "priority_c", "Operator": "ExactMatch", "Values": [priority]}],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('task_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching tasks with priority ${priority}:`, error?.response?.data?.message || error);
      throw error;
    }
  }
};