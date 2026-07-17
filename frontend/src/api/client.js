import axios from 'axios';

// Base API URL - uses proxy in development, direct path in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Upload data file and optional template file
 * @param {File} dataFile - Data file (CSV, XLSX)
 * @param {File|null} templateFile - Optional template file (DOCX)
 * @returns {Promise<{job_id: string, status: string, files: object}>}
 */
export const uploadFiles = async (dataFile, templateFile = null, imageFiles = []) => {
  const formData = new FormData();
  formData.append('data_file', dataFile);

  if (templateFile) {
    formData.append('template_file', templateFile);
  }

  // Append image files individually so FastAPI receives them as a list
  (imageFiles || []).forEach((img, idx) => {
    formData.append('image_files', img);
  });

  const response = await apiClient.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

/**
 * Get upload status for a job
 * @param {string} jobId - Job identifier
 * @returns {Promise<{job_id: string, status: string, files: object}>}
 */
export const getUploadStatus = async (jobId) => {
  const response = await apiClient.get(`/upload/${jobId}`);
  return response.data;
};

/**
 * Start paper generation for a job
 * @param {string} jobId - Job identifier
 * @param {object} config - Generation configuration
 * @returns {Promise<{job_id: string, status: string, message: string}>}
 */
export const generatePaper = async (jobId, config = {}) => {
  const response = await apiClient.post('/generate', {
    job_id: jobId,
    config: {
      style: 'academic',
      citation_style: 'APA',
      ...config,
    },
  });
  
  return response.data;
};

/**
 * Get job status
 * @param {string} jobId - Job identifier
 * @returns {Promise<{job_id: string, status: string, progress: number, current_step: string, error: string|null, final_doc: string|null}>}
 */
export const getJobStatus = async (jobId) => {
  const response = await apiClient.get(`/status/${jobId}`);
  return response.data;
};

/**
 * Poll job status until completion or failure
 * @param {string} jobId - Job identifier
 * @param {function} onProgress - Callback for progress updates
 * @param {number} intervalMs - Polling interval in milliseconds
 * @returns {Promise<object>}
 */
export const pollJobStatus = async (jobId, onProgress = null, intervalMs = 2000) => {
  return new Promise((resolve, reject) => {
    const interval = setInterval(async () => {
      try {
        const status = await getJobStatus(jobId);
        
        // Call progress callback if provided
        if (onProgress) {
          onProgress(status);
        }
        
        // Check if job is complete
        if (status.status === 'completed') {
          clearInterval(interval);
          resolve(status);
        } else if (status.status === 'failed') {
          clearInterval(interval);
          reject(new Error(status.error || 'Job failed'));
        }
      } catch (error) {
        clearInterval(interval);
        reject(error);
      }
    }, intervalMs);
  });
};

/**
 * List all jobs
 * @returns {Promise<{jobs: Array, total: number}>}
 */
export const listJobs = async () => {
  const response = await apiClient.get('/jobs');
  return response.data;
};

/**
 * Download result file
 * @param {string} jobId - Job identifier
 * @returns {Promise<Blob>}
 */
export const downloadResult = async (jobId) => {
  const response = await apiClient.get(`/result/${jobId}`, {
    responseType: 'blob',
  });
  
  return response.data;
};

/**
 * Download and save result file
 * @param {string} jobId - Job identifier
 * @param {string} filename - Optional custom filename
 */
export const downloadAndSaveResult = async (jobId, filename = null) => {
  const blob = await downloadResult(jobId);
  
  // Create download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `paper_${jobId}.docx`;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/**
 * Get result file information
 * @param {string} jobId - Job identifier
 * @returns {Promise<{job_id: string, exists: boolean, filename: string, size_bytes: number, size_mb: number}>}
 */
export const getResultInfo = async (jobId) => {
  const response = await apiClient.get(`/result/${jobId}/info`);
  return response.data;
};

/**
 * Delete result and job data
 * @param {string} jobId - Job identifier
 * @returns {Promise<{job_id: string, deleted: Array, message: string}>}
 */
export const deleteResult = async (jobId) => {
  const response = await apiClient.delete(`/result/${jobId}`);
  return response.data;
};

/**
 * Check API health
 * @returns {Promise<{status: string}>}
 */
export const checkHealth = async () => {
  const response = await apiClient.get('/health', {
    baseURL: '/', // Use root path for health check
  });
  return response.data;
};

/**
 * Get API configuration
 * @returns {Promise<object>}
 */
export const getConfig = async () => {
  const response = await apiClient.get('/config');
  return response.data;
};

// Export axios instance for custom requests
export default apiClient;
