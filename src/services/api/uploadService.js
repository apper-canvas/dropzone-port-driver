const initApperClient = () => {
  const { ApperClient } = window.ApperSDK;
  return new ApperClient({
    apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
    apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
  });
};

export const uploadService = {
  async getAll() {
    try {
      const apperClient = initApperClient();
      const params = {
        fields: [
          {"field": {"Name": "Name"}},
          {"field": {"Name": "Tags"}},
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "progress_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ],
        orderBy: [{"fieldName": "CreatedOn", "sorttype": "DESC"}],
        pagingInfo: {"limit": 100, "offset": 0}
      };
      
      const response = await apperClient.fetchRecords('upload_c', params);
      
      if (!response?.data?.length) {
        return [];
      }
      
      return response.data;
    } catch (error) {
      console.error("Error fetching uploads:", error?.response?.data?.message || error);
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
          {"field": {"Name": "size_c"}},
          {"field": {"Name": "type_c"}},
          {"field": {"Name": "status_c"}},
          {"field": {"Name": "progress_c"}},
          {"field": {"Name": "uploaded_at_c"}},
          {"field": {"Name": "url_c"}},
          {"field": {"Name": "CreatedOn"}},
          {"field": {"Name": "ModifiedOn"}}
        ]
      };
      
      const response = await apperClient.getRecordById('upload_c', parseInt(id), params);
      
      if (!response?.data) {
        throw new Error(`Upload with ID ${id} not found`);
      }
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching upload ${id}:`, error?.response?.data?.message || error);
      throw error;
    }
  },

  async create(uploadData) {
    try {
      const apperClient = initApperClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Name: uploadData.Name || uploadData.name,
          Tags: uploadData.Tags || "",
          size_c: uploadData.size_c || uploadData.size,
          type_c: uploadData.type_c || uploadData.type,
          status_c: uploadData.status_c || uploadData.status || "pending",
          progress_c: uploadData.progress_c || uploadData.progress || 0,
          uploaded_at_c: uploadData.uploaded_at_c || uploadData.uploadedAt,
          url_c: uploadData.url_c || uploadData.url
        }]
      };
      
      const response = await apperClient.createRecord('upload_c', params);
      
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
      console.error("Error creating upload:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async update(id, updateData) {
    try {
      const apperClient = initApperClient();
      
      // Only include Updateable fields
      const params = {
        records: [{
          Id: parseInt(id),
          ...(updateData.Name !== undefined && { Name: updateData.Name }),
          ...(updateData.Tags !== undefined && { Tags: updateData.Tags }),
          ...(updateData.size_c !== undefined && { size_c: updateData.size_c }),
          ...(updateData.type_c !== undefined && { type_c: updateData.type_c }),
          ...(updateData.status_c !== undefined && { status_c: updateData.status_c }),
          ...(updateData.progress_c !== undefined && { progress_c: updateData.progress_c }),
          ...(updateData.uploaded_at_c !== undefined && { uploaded_at_c: updateData.uploaded_at_c }),
          ...(updateData.url_c !== undefined && { url_c: updateData.url_c })
        }]
      };
      
      const response = await apperClient.updateRecord('upload_c', params);
      
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
      console.error("Error updating upload:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async delete(id) {
    try {
      const apperClient = initApperClient();
      const params = { 
        RecordIds: [parseInt(id)]
      };
      
      const response = await apperClient.deleteRecord('upload_c', params);
      
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
      console.error("Error deleting upload:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async simulateUpload(id, onProgress) {
    try {
      // Simulate upload progress with real database updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 150));
        
        // Update progress in database
        await this.update(id, { 
          progress_c: progress,
          status_c: progress === 100 ? "completed" : "uploading"
        });
        
        if (onProgress) {
          onProgress(progress);
        }
      }

      // Final completion update
      const completedUpload = await this.update(id, {
        status_c: "completed",
        url_c: `/uploads/file-${id}`,
        uploaded_at_c: new Date().toISOString()
      });

      return completedUpload;
    } catch (error) {
      console.error("Error simulating upload:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      "image/jpeg",
      "image/png", 
      "image/gif",
      "image/webp",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
      "text/csv",
      "application/json"
    ];

    if (file.size > maxSize) {
      throw new Error(`File size exceeds 10MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type "${file.type}" is not allowed. Supported types: images, PDF, Word documents, text files.`);
    }

    return true;
  },

  // Upload session methods
  async createSession(files) {
    try {
      const apperClient = initApperClient();
      const totalSize = files.reduce((sum, file) => sum + (file.size_c || file.size), 0);
      
      const params = {
        records: [{
          Name: `Upload Session ${new Date().toISOString()}`,
          files_c: JSON.stringify(files.map(f => f.Id)),
          total_size_c: totalSize,
          started_at_c: new Date().toISOString(),
          completed_at_c: null
        }]
      };
      
      const response = await apperClient.createRecord('upload_session_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error creating upload session:", error?.response?.data?.message || error);
      throw error;
    }
  },

  async completeSession(id) {
    try {
      const apperClient = initApperClient();
      
      const params = {
        records: [{
          Id: parseInt(id),
          completed_at_c: new Date().toISOString()
        }]
      };
      
      const response = await apperClient.updateRecord('upload_session_c', params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }
      
      if (response.results) {
        const successful = response.results.filter(r => r.success);
        return successful.length > 0 ? successful[0].data : null;
      }
    } catch (error) {
      console.error("Error completing upload session:", error?.response?.data?.message || error);
      throw error;
    }
  }
};