import { useState, useEffect } from 'react';
import { getResultInfo, downloadAndSaveResult } from '../api/client';

export default function PaperPreview({ jobId, status }) {
  const [resultInfo, setResultInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId || status !== 'completed') {
      return;
    }

    // Fetch result info when job is completed
    const fetchInfo = async () => {
      setLoading(true);
      setError(null);

      try {
        const info = await getResultInfo(jobId);
        setResultInfo(info);
      } catch (err) {
        console.error('Failed to fetch result info:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to load result info');
      } finally {
        setLoading(false);
      }
    };

    fetchInfo();
  }, [jobId, status]);

  const handleDownload = async () => {
    if (!jobId) return;

    setDownloading(true);
    setError(null);

    try {
      await downloadAndSaveResult(jobId);
    } catch (err) {
      console.error('Download failed:', err);
      setError(err.response?.data?.detail || err.message || 'Download failed');
    } finally {
      setDownloading(false);
    }
  };

  // Don't show if job not completed
  if (status !== 'completed') {
    return (
      <div style={styles.container}>
        <div style={styles.placeholder}>
          <div style={styles.placeholderIcon}>📄</div>
          <h3 style={styles.placeholderTitle}>Paper Preview</h3>
          <p style={styles.placeholderText}>
            Your generated paper will appear here once the generation is complete.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}>⏳</div>
          <p>Loading paper info...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h3 style={styles.errorTitle}>❌ Error</h3>
          <p style={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (!resultInfo || !resultInfo.exists) {
    return (
      <div style={styles.container}>
        <div style={styles.notFound}>
          <h3 style={styles.notFoundTitle}>📄 Paper Not Found</h3>
          <p style={styles.notFoundText}>
            The paper file could not be found. Please try regenerating.
          </p>
        </div>
      </div>
    );
  }

  const formattedDate = resultInfo.created_at 
    ? new Date(resultInfo.created_at * 1000).toLocaleString()
    : 'Unknown';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>📄 Your Paper is Ready!</h2>

      {/* Success Banner */}
      <div style={styles.successBanner}>
        <div style={styles.successIcon}>✅</div>
        <div style={styles.successContent}>
          <h3 style={styles.successTitle}>Generation Successful</h3>
          <p style={styles.successText}>
            Your academic paper has been generated and is ready for download.
          </p>
        </div>
      </div>

      {/* Paper Info Card */}
      <div style={styles.infoCard}>
        <h3 style={styles.infoTitle}>Document Information</h3>
        
        <div style={styles.infoGrid}>
          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>📋 Filename:</span>
            <span style={styles.infoValue}>{resultInfo.filename}</span>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>📏 File Size:</span>
            <span style={styles.infoValue}>{resultInfo.size_mb} MB</span>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>🕐 Created:</span>
            <span style={styles.infoValue}>{formattedDate}</span>
          </div>

          <div style={styles.infoItem}>
            <span style={styles.infoLabel}>🆔 Job ID:</span>
            <code style={styles.jobId}>{jobId}</code>
          </div>
        </div>
      </div>

      {/* Download Section */}
      <div style={styles.downloadSection}>
        <button
          onClick={handleDownload}
          disabled={downloading}
          style={{
            ...styles.downloadButton,
            ...(downloading ? styles.downloadButtonDisabled : {}),
          }}
        >
          {downloading ? (
            <>
              <span style={styles.buttonSpinner}>⏳</span>
              Downloading...
            </>
          ) : (
            <>
              📥 Download Paper (DOCX)
            </>
          )}
        </button>

        <p style={styles.downloadHint}>
          The paper will be downloaded as a Microsoft Word (.docx) document.
        </p>
      </div>

      {/* Preview Note */}
      <div style={styles.previewNote}>
        <h3 style={styles.noteTitle}>📖 About Your Paper</h3>
        <ul style={styles.noteList}>
          <li style={styles.noteItem}>
            The paper includes all sections generated from your data
          </li>
          <li style={styles.noteItem}>
            Citations are formatted according to your selected style
          </li>
          <li style={styles.noteItem}>
            Template structure has been applied if you provided one
          </li>
          <li style={styles.noteItem}>
            You can edit the document in Microsoft Word or compatible software
          </li>
        </ul>
      </div>

      {/* Actions */}
      <div style={styles.actions}>
        <div style={styles.actionHint}>
          💡 Tip: Review and edit the paper as needed. All content is based on your uploaded data.
        </div>
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
    maxWidth: '700px',
    margin: '0 auto',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
    textAlign: 'center',
  },
  placeholder: {
    padding: '60px 20px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  placeholderIcon: {
    fontSize: '64px',
    marginBottom: '16px',
    opacity: 0.5,
  },
  placeholderTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#666',
    marginBottom: '8px',
  },
  placeholderText: {
    fontSize: '14px',
    color: '#999',
    maxWidth: '400px',
    margin: '0 auto',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
  spinner: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  error: {
    padding: '20px',
    backgroundColor: '#ffebee',
    border: '2px solid #f44336',
    borderRadius: '6px',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#c62828',
    marginBottom: '8px',
  },
  errorMessage: {
    fontSize: '14px',
    color: '#c62828',
    margin: 0,
  },
  notFound: {
    padding: '40px 20px',
    textAlign: 'center',
    backgroundColor: '#fff3e0',
    border: '2px solid #ff9800',
    borderRadius: '6px',
  },
  notFoundTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#e65100',
    marginBottom: '8px',
  },
  notFoundText: {
    fontSize: '14px',
    color: '#e65100',
    margin: 0,
  },
  successBanner: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#e8f5e9',
    border: '2px solid #4CAF50',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  successIcon: {
    fontSize: '48px',
    marginRight: '16px',
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: '4px',
  },
  successText: {
    fontSize: '14px',
    color: '#2e7d32',
    margin: 0,
  },
  infoCard: {
    padding: '20px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  infoTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '16px',
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  infoValue: {
    fontSize: '14px',
    color: '#333',
    fontWeight: '500',
  },
  jobId: {
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    borderRadius: '3px',
    color: '#1976d2',
    fontSize: '12px',
    fontFamily: 'monospace',
    display: 'inline-block',
  },
  downloadSection: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  downloadButton: {
    width: '100%',
    maxWidth: '400px',
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: '600',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
  },
  downloadButtonDisabled: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  buttonSpinner: {
    display: 'inline-block',
  },
  downloadHint: {
    marginTop: '12px',
    fontSize: '13px',
    color: '#666',
  },
  previewNote: {
    padding: '20px',
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    marginBottom: '16px',
  },
  noteTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: '12px',
  },
  noteList: {
    margin: 0,
    paddingLeft: '20px',
  },
  noteItem: {
    fontSize: '14px',
    color: '#1565c0',
    marginBottom: '8px',
    lineHeight: '1.5',
  },
  actions: {
    textAlign: 'center',
  },
  actionHint: {
    padding: '12px',
    backgroundColor: '#fff3e0',
    border: '1px solid #ff9800',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#e65100',
  },
};
