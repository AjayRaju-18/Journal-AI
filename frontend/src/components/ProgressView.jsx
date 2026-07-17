import { useState, useEffect } from 'react';
import { getJobStatus } from '../api/client';

export default function ProgressView({ jobId, onComplete }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    // Start polling when jobId is provided
    setPolling(true);
    setError(null);

    const pollInterval = setInterval(async () => {
      try {
        const result = await getJobStatus(jobId);
        setStatus(result);

        // Stop polling if completed or failed
        if (result.status === 'completed') {
          clearInterval(pollInterval);
          setPolling(false);
          if (onComplete) {
            onComplete(result);
          }
        } else if (result.status === 'failed') {
          clearInterval(pollInterval);
          setPolling(false);
          setError(result.error || 'Job failed');
        }
      } catch (err) {
        console.error('Status polling error:', err);
        setError(err.response?.data?.detail || err.message || 'Failed to fetch status');
        clearInterval(pollInterval);
        setPolling(false);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup on unmount
    return () => {
      clearInterval(pollInterval);
    };
  }, [jobId, onComplete]);

  if (!jobId) {
    return (
      <div style={styles.container}>
        <div style={styles.placeholder}>
          📊 Progress tracking will appear here once generation starts
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

  if (!status) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}>⏳</div>
          <p>Loading status...</p>
        </div>
      </div>
    );
  }

  const progressPercentage = Math.round(status.progress * 100);
  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';
  const isProcessing = status.status === 'processing' || status.status === 'pending';

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Generation Progress</h2>

      {/* Job Info */}
      <div style={styles.jobInfo}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Job ID:</span>
          <code style={styles.jobId}>{status.job_id}</code>
        </div>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>Status:</span>
          <span style={{
            ...styles.statusBadge,
            ...(isCompleted ? styles.statusCompleted : {}),
            ...(isFailed ? styles.statusFailed : {}),
            ...(isProcessing ? styles.statusProcessing : {}),
          }}>
            {status.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={styles.progressSection}>
        <div style={styles.progressHeader}>
          <span style={styles.progressLabel}>Overall Progress</span>
          <span style={styles.progressPercentage}>{progressPercentage}%</span>
        </div>
        <div style={styles.progressBarContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${progressPercentage}%`,
              backgroundColor: isCompleted ? '#4CAF50' : isFailed ? '#f44336' : '#2196F3',
            }}
          />
        </div>
      </div>

      {/* Current Step */}
      {status.current_step && (
        <div style={styles.currentStep}>
          <h3 style={styles.stepTitle}>Current Step:</h3>
          <div style={styles.stepBadge}>
            {getStepIcon(status.current_step)} {formatStepName(status.current_step)}
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div style={styles.workflow}>
        <h3 style={styles.workflowTitle}>Workflow Steps</h3>
        <div style={styles.steps}>
          {getWorkflowSteps().map((step, index) => {
            const isActive = status.current_step === step.id;
            const isComplete = getStepProgress(step.id) < status.progress;
            
            return (
              <div
                key={step.id}
                style={{
                  ...styles.step,
                  ...(isActive ? styles.stepActive : {}),
                  ...(isComplete ? styles.stepComplete : {}),
                }}
              >
                <div style={styles.stepNumber}>
                  {isComplete ? '✓' : index + 1}
                </div>
                <div style={styles.stepContent}>
                  <div style={styles.stepName}>{step.name}</div>
                  <div style={styles.stepDescription}>{step.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Completion Message */}
      {isCompleted && (
        <div style={styles.success}>
          <h3 style={styles.successTitle}>✅ Generation Complete!</h3>
          <p style={styles.successMessage}>
            Your paper has been generated successfully.
          </p>
        </div>
      )}

      {/* Error Message */}
      {isFailed && status.error && (
        <div style={styles.errorBox}>
          <h3 style={styles.errorTitle}>❌ Generation Failed</h3>
          <p style={styles.errorMessage}>{status.error}</p>
        </div>
      )}

      {/* Polling Indicator */}
      {polling && !isCompleted && !isFailed && (
        <div style={styles.pollingIndicator}>
          <span style={styles.pulseIndicator}>●</span> Live updates active
        </div>
      )}
    </div>
  );
}

// Helper functions
function getWorkflowSteps() {
  return [
    { id: 'initializing', name: 'Initializing', description: 'Setting up job', progress: 0.1 },
    { id: 'structuring', name: 'Structuring', description: 'Analyzing data and creating outline', progress: 0.25 },
    { id: 'drafting', name: 'Drafting', description: 'Writing section content', progress: 0.5 },
    { id: 'citation', name: 'Citations', description: 'Formatting citations', progress: 0.7 },
    { id: 'formatting', name: 'Formatting', description: 'Creating final document', progress: 0.9 },
    { id: 'completed', name: 'Completed', description: 'Document ready', progress: 1.0 },
  ];
}

function getStepProgress(stepId) {
  const step = getWorkflowSteps().find(s => s.id === stepId);
  return step ? step.progress : 0;
}

function formatStepName(stepId) {
  const step = getWorkflowSteps().find(s => s.id === stepId);
  return step ? step.name : stepId;
}

function getStepIcon(stepId) {
  const icons = {
    initializing: '🔄',
    structuring: '📋',
    drafting: '✍️',
    citation: '📚',
    formatting: '📄',
    completed: '✅',
    failed: '❌',
  };
  return icons[stepId] || '⚙️';
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
  },
  placeholder: {
    padding: '40px',
    textAlign: 'center',
    color: '#999',
    fontSize: '16px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
  },
  loading: {
    padding: '40px',
    textAlign: 'center',
    color: '#666',
  },
  spinner: {
    fontSize: '32px',
    marginBottom: '12px',
    animation: 'spin 2s linear infinite',
  },
  jobInfo: {
    padding: '16px',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px',
    marginBottom: '24px',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },
  infoLabel: {
    fontWeight: '600',
    color: '#666',
    fontSize: '14px',
  },
  jobId: {
    padding: '4px 8px',
    backgroundColor: '#e3f2fd',
    borderRadius: '3px',
    color: '#1976d2',
    fontSize: '12px',
    fontFamily: 'monospace',
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  statusFailed: {
    backgroundColor: '#ffebee',
    color: '#c62828',
  },
  statusProcessing: {
    backgroundColor: '#e3f2fd',
    color: '#1565c0',
  },
  progressSection: {
    marginBottom: '24px',
  },
  progressHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  progressLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
  },
  progressPercentage: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2196F3',
  },
  progressBarContainer: {
    width: '100%',
    height: '24px',
    backgroundColor: '#e0e0e0',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    transition: 'width 0.5s ease',
    borderRadius: '12px',
  },
  currentStep: {
    marginBottom: '24px',
  },
  stepTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '8px',
    color: '#333',
  },
  stepBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#e3f2fd',
    border: '2px solid #2196F3',
    borderRadius: '6px',
    color: '#1565c0',
    fontWeight: '600',
    fontSize: '14px',
  },
  workflow: {
    marginBottom: '24px',
  },
  workflowTitle: {
    fontSize: '16px',
    fontWeight: '600',
    marginBottom: '16px',
    color: '#333',
  },
  steps: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  step: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9f9f9',
    borderRadius: '6px',
    border: '2px solid transparent',
    transition: 'all 0.3s ease',
  },
  stepActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196F3',
  },
  stepComplete: {
    backgroundColor: '#e8f5e9',
    borderColor: '#4CAF50',
  },
  stepNumber: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#ddd',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '600',
    fontSize: '14px',
    marginRight: '12px',
    flexShrink: 0,
  },
  stepContent: {
    flex: 1,
  },
  stepName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '2px',
  },
  stepDescription: {
    fontSize: '12px',
    color: '#666',
  },
  success: {
    padding: '16px',
    backgroundColor: '#e8f5e9',
    border: '2px solid #4CAF50',
    borderRadius: '6px',
    marginBottom: '16px',
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2e7d32',
    marginBottom: '8px',
  },
  successMessage: {
    fontSize: '14px',
    color: '#2e7d32',
    margin: 0,
  },
  error: {
    padding: '16px',
    backgroundColor: '#ffebee',
    border: '2px solid #f44336',
    borderRadius: '6px',
  },
  errorBox: {
    padding: '16px',
    backgroundColor: '#ffebee',
    border: '2px solid #f44336',
    borderRadius: '6px',
    marginBottom: '16px',
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
  pollingIndicator: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666',
    marginTop: '16px',
  },
  pulseIndicator: {
    color: '#4CAF50',
    animation: 'pulse 2s ease-in-out infinite',
  },
};
