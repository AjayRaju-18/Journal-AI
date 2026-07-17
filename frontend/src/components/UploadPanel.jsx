import { useState } from 'react';
import { uploadFiles } from '../api/client';

export default function UploadPanel({ onUploadSuccess }) {
  const [dataFile, setDataFile] = useState(null);
  const [templateFile, setTemplateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDataFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (validTypes.includes(fileExt)) {
        setDataFile(file);
        setError(null);
      } else {
        setError('Please select a CSV or Excel file for data');
        setDataFile(null);
      }
    }
  };

  const handleTemplateFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (fileExt === '.docx') {
        setTemplateFile(file);
        setError(null);
      } else {
        setError('Please select a DOCX file for template');
        setTemplateFile(null);
      }
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      
      if (['.csv', '.xlsx', '.xls'].includes(fileExt)) {
        setDataFile(file);
        setError(null);
      } else if (fileExt === '.docx' && !templateFile) {
        setTemplateFile(file);
        setError(null);
      } else {
        setError('Invalid file type. Please drop CSV/Excel for data or DOCX for template');
      }
    }
  };

  const handleUpload = async () => {
    if (!dataFile) {
      setError('Please select a data file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadFiles(dataFile, templateFile);
      console.log('Upload successful:', result);
      
      // Call success callback with job_id
      if (onUploadSuccess) {
        onUploadSuccess(result);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err.response?.data?.detail || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setDataFile(null);
    setTemplateFile(null);
    setError(null);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Upload Files</h2>
      
      {/* Drop Zone */}
      <div
        style={{
          ...styles.dropZone,
          ...(dragActive ? styles.dropZoneActive : {}),
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <p style={styles.dropText}>
          📁 Drag and drop files here
        </p>
        <p style={styles.dropSubtext}>or use the buttons below</p>
      </div>

      {/* Data File Input */}
      <div style={styles.fileSection}>
        <label style={styles.label}>
          Data File <span style={styles.required}>*</span>
        </label>
        <p style={styles.hint}>CSV or Excel file containing your data</p>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={handleDataFileChange}
          style={styles.hiddenInput}
          id="data-file-input"
          disabled={uploading}
        />
        <label htmlFor="data-file-input" style={styles.fileButton}>
          Choose Data File
        </label>
        {dataFile && (
          <div style={styles.fileInfo}>
            ✅ {dataFile.name} ({formatFileSize(dataFile.size)})
          </div>
        )}
      </div>

      {/* Template File Input */}
      <div style={styles.fileSection}>
        <label style={styles.label}>Template File (Optional)</label>
        <p style={styles.hint}>DOCX template with section headings</p>
        <input
          type="file"
          accept=".docx"
          onChange={handleTemplateFileChange}
          style={styles.hiddenInput}
          id="template-file-input"
          disabled={uploading}
        />
        <label htmlFor="template-file-input" style={styles.fileButton}>
          Choose Template File
        </label>
        {templateFile && (
          <div style={styles.fileInfo}>
            ✅ {templateFile.name} ({formatFileSize(templateFile.size)})
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {/* Action Buttons */}
      <div style={styles.buttonGroup}>
        <button
          onClick={handleUpload}
          disabled={!dataFile || uploading}
          style={{
            ...styles.button,
            ...styles.primaryButton,
            ...(!dataFile || uploading ? styles.buttonDisabled : {}),
          }}
        >
          {uploading ? '⏳ Uploading...' : '📤 Upload Files'}
        </button>
        
        <button
          onClick={handleReset}
          disabled={uploading}
          style={{
            ...styles.button,
            ...styles.secondaryButton,
            ...(uploading ? styles.buttonDisabled : {}),
          }}
        >
          🔄 Reset
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    maxWidth: '600px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  dropZone: {
    border: '2px dashed #ccc',
    borderRadius: '8px',
    padding: '40px',
    textAlign: 'center',
    marginBottom: '20px',
    backgroundColor: '#fafafa',
    transition: 'all 0.3s ease',
  },
  dropZoneActive: {
    borderColor: '#4CAF50',
    backgroundColor: '#f0f8f0',
  },
  dropText: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '8px',
  },
  dropSubtext: {
    fontSize: '14px',
    color: '#999',
  },
  fileSection: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#333',
  },
  required: {
    color: '#f44336',
  },
  hint: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
  },
  hiddenInput: {
    display: 'none',
  },
  fileButton: {
    display: 'inline-block',
    padding: '10px 20px',
    backgroundColor: '#2196F3',
    color: '#fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'background-color 0.3s ease',
    border: 'none',
  },
  fileInfo: {
    marginTop: '8px',
    padding: '8px 12px',
    backgroundColor: '#e8f5e9',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#2e7d32',
  },
  error: {
    padding: '12px',
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    borderRadius: '4px',
    color: '#c62828',
    marginBottom: '20px',
    fontSize: '14px',
  },
  buttonGroup: {
    display: 'flex',
    gap: '12px',
  },
  button: {
    flex: 1,
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    color: '#fff',
  },
  secondaryButton: {
    backgroundColor: '#fff',
    color: '#666',
    border: '2px solid #ddd',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
};
