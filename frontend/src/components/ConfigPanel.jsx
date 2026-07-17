import { useState } from 'react';
import { generatePaper } from '../api/client';

export default function ConfigPanel({ jobId, onGenerateStart }) {
  const [config, setConfig] = useState({
    style: 'academic',
    citation_style: 'APA',
  });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const styleOptions = [
    { value: 'academic', label: 'Academic' },
    { value: 'technical', label: 'Technical' },
    { value: 'scientific', label: 'Scientific' },
    { value: 'business', label: 'Business' },
  ];

  const citationOptions = [
    { value: 'APA', label: 'APA (7th Edition)' },
    { value: 'MLA', label: 'MLA (9th Edition)' },
    { value: 'Chicago', label: 'Chicago' },
    { value: 'IEEE', label: 'IEEE' },
    { value: 'Harvard', label: 'Harvard' },
  ];

  const handleStyleChange = (e) => {
    setConfig({
      ...config,
      style: e.target.value,
    });
  };

  const handleCitationChange = (e) => {
    setConfig({
      ...config,
      citation_style: e.target.value,
    });
  };

  const handleGenerate = async () => {
    if (!jobId) {
      setError('Please upload files first');
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const result = await generatePaper(jobId, config);
      console.log('Generation started:', result);
      
      // Call callback to notify parent
      if (onGenerateStart) {
        onGenerateStart(result);
      }
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to start generation');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Configuration</h2>
      
      {/* Job ID Display */}
      {jobId && (
        <div style={styles.jobIdSection}>
          <span style={styles.jobIdLabel}>Job ID:</span>
          <code style={styles.jobId}>{jobId}</code>
        </div>
      )}

      {/* Writing Style */}
      <div style={styles.formGroup}>
        <label htmlFor="style" style={styles.label}>
          Writing Style
        </label>
        <p style={styles.hint}>
          Choose the writing style for your paper
        </p>
        <select
          id="style"
          value={config.style}
          onChange={handleStyleChange}
          disabled={!jobId || generating}
          style={{
            ...styles.select,
            ...(!jobId || generating ? styles.disabled : {}),
          }}
        >
          {styleOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Citation Style */}
      <div style={styles.formGroup}>
        <label htmlFor="citation" style={styles.label}>
          Citation Style
        </label>
        <p style={styles.hint}>
          Select citation format for references
        </p>
        <select
          id="citation"
          value={config.citation_style}
          onChange={handleCitationChange}
          disabled={!jobId || generating}
          style={{
            ...styles.select,
            ...(!jobId || generating ? styles.disabled : {}),
          }}
        >
          {citationOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Configuration Summary */}
      <div style={styles.summary}>
        <h3 style={styles.summaryTitle}>Selected Configuration:</h3>
        <ul style={styles.summaryList}>
          <li style={styles.summaryItem}>
            <strong>Style:</strong> {config.style}
          </li>
          <li style={styles.summaryItem}>
            <strong>Citations:</strong> {config.citation_style}
          </li>
        </ul>
      </div>

      {/* Error Display */}
      {error && (
        <div style={styles.error}>
          ⚠️ {error}
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={!jobId || generating}
        style={{
          ...styles.button,
          ...(!jobId || generating ? styles.buttonDisabled : {}),
        }}
      >
        {generating ? (
          <>
            <span style={styles.spinner}>⏳</span> Generating Paper...
          </>
        ) : (
          <>
            🚀 Generate Paper
          </>
        )}
      </button>

      {/* Info Box */}
      {!jobId && (
        <div style={styles.info}>
          ℹ️ Please upload files first to enable paper generation
        </div>
      )}
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
  jobIdSection: {
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  jobIdLabel: {
    fontWeight: '600',
    color: '#666',
    marginRight: '8px',
  },
  jobId: {
    padding: '2px 6px',
    backgroundColor: '#e3f2fd',
    borderRadius: '3px',
    color: '#1976d2',
    fontSize: '13px',
    fontFamily: 'monospace',
  },
  formGroup: {
    marginBottom: '24px',
  },
  label: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '4px',
    color: '#333',
  },
  hint: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
  },
  select: {
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    border: '2px solid #ddd',
    borderRadius: '6px',
    backgroundColor: '#fff',
    color: '#333',
    cursor: 'pointer',
    transition: 'border-color 0.3s ease',
    outline: 'none',
  },
  disabled: {
    backgroundColor: '#f5f5f5',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
  summary: {
    padding: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    marginBottom: '20px',
    border: '1px solid #e0e0e0',
  },
  summaryTitle: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '12px',
    color: '#555',
  },
  summaryList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  summaryItem: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '6px',
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
  info: {
    padding: '12px',
    backgroundColor: '#e3f2fd',
    border: '1px solid #2196F3',
    borderRadius: '4px',
    color: '#1565c0',
    marginTop: '20px',
    fontSize: '14px',
    textAlign: 'center',
  },
  button: {
    width: '100%',
    padding: '14px 24px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    animation: 'spin 1s linear infinite',
  },
};
