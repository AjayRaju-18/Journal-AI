import { useState } from 'react';
import UploadPanel from './components/UploadPanel';
import ConfigPanel from './components/ConfigPanel';
import ProgressView from './components/ProgressView';
import PaperPreview from './components/PaperPreview';

export default function App() {
  // Application state
  const [jobId, setJobId] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [generationStarted, setGenerationStarted] = useState(false);
  const [jobStatus, setJobStatus] = useState(null);
  const [currentStep, setCurrentStep] = useState('upload'); // upload, configure, generate, complete

  // Handle successful file upload
  const handleUploadSuccess = (result) => {
    console.log('Upload successful:', result);
    setUploadResult(result);
    setJobId(result.job_id);
    setCurrentStep('configure');
  };

  // Handle generation start
  const handleGenerateStart = (result) => {
    console.log('Generation started:', result);
    setGenerationStarted(true);
    setCurrentStep('generate');
  };

  // Handle generation complete
  const handleGenerationComplete = (status) => {
    console.log('Generation completed:', status);
    setJobStatus(status);
    setCurrentStep('complete');
  };

  // Reset workflow
  const handleReset = () => {
    setJobId(null);
    setUploadResult(null);
    setGenerationStarted(false);
    setJobStatus(null);
    setCurrentStep('upload');
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.appTitle}>📄 Paper Pipeline</h1>
          <p style={styles.appSubtitle}>
            Automated Academic Paper Generation from Data
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main style={styles.main}>
        <div style={styles.container}>
          
          {/* Step Indicator */}
          <div style={styles.stepIndicator}>
            <div style={{
              ...styles.stepItem,
              ...(currentStep === 'upload' ? styles.stepActive : {}),
              ...(currentStep !== 'upload' ? styles.stepComplete : {}),
            }}>
              <div style={styles.stepNumber}>1</div>
              <span style={styles.stepLabel}>Upload</span>
            </div>
            <div style={styles.stepConnector} />
            <div style={{
              ...styles.stepItem,
              ...(currentStep === 'configure' ? styles.stepActive : {}),
              ...(currentStep === 'generate' || currentStep === 'complete' ? styles.stepComplete : {}),
            }}>
              <div style={styles.stepNumber}>2</div>
              <span style={styles.stepLabel}>Configure</span>
            </div>
            <div style={styles.stepConnector} />
            <div style={{
              ...styles.stepItem,
              ...(currentStep === 'generate' ? styles.stepActive : {}),
              ...(currentStep === 'complete' ? styles.stepComplete : {}),
            }}>
              <div style={styles.stepNumber}>3</div>
              <span style={styles.stepLabel}>Generate</span>
            </div>
            <div style={styles.stepConnector} />
            <div style={{
              ...styles.stepItem,
              ...(currentStep === 'complete' ? styles.stepActive : {}),
            }}>
              <div style={styles.stepNumber}>4</div>
              <span style={styles.stepLabel}>Download</span>
            </div>
          </div>

          {/* Step 1: Upload */}
          {currentStep === 'upload' && (
            <div style={styles.section}>
              <UploadPanel onUploadSuccess={handleUploadSuccess} />
            </div>
          )}

          {/* Step 2: Configure */}
          {currentStep === 'configure' && (
            <div style={styles.section}>
              <ConfigPanel 
                jobId={jobId} 
                onGenerateStart={handleGenerateStart} 
              />
              
              <div style={styles.backButton}>
                <button onClick={handleReset} style={styles.buttonSecondary}>
                  ← Back to Upload
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Generate (with Progress) */}
          {currentStep === 'generate' && (
            <div style={styles.section}>
              <ProgressView 
                jobId={jobId} 
                onComplete={handleGenerationComplete} 
              />
            </div>
          )}

          {/* Step 4: Complete (with Preview & Download) */}
          {currentStep === 'complete' && (
            <div style={styles.section}>
              <PaperPreview 
                jobId={jobId} 
                status={jobStatus?.status} 
              />
              
              <div style={styles.actionButtons}>
                <button onClick={handleReset} style={styles.buttonPrimary}>
                  🔄 Generate Another Paper
                </button>
              </div>
            </div>
          )}

          {/* Debug Info (dev only) */}
          {import.meta.env.DEV && (
            <div style={styles.debug}>
              <details>
                <summary style={styles.debugSummary}>Debug Info</summary>
                <pre style={styles.debugContent}>
                  {JSON.stringify({
                    currentStep,
                    jobId,
                    generationStarted,
                    uploadResult: uploadResult ? { job_id: uploadResult.job_id, status: uploadResult.status } : null,
                    jobStatus: jobStatus ? { status: jobStatus.status, progress: jobStatus.progress } : null,
                  }, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Powered by FastAPI + LangGraph + React
        </p>
      </footer>
    </div>
  );
}

const styles = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2196F3',
    color: '#fff',
    padding: '24px 16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center',
  },
  appTitle: {
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '0 0 8px 0',
  },
  appSubtitle: {
    fontSize: '16px',
    margin: 0,
    opacity: 0.9,
  },
  main: {
    flex: 1,
    padding: '32px 16px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  stepIndicator: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '40px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  stepItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.5,
    transition: 'opacity 0.3s ease',
  },
  stepActive: {
    opacity: 1,
  },
  stepComplete: {
    opacity: 0.8,
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#e0e0e0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    fontSize: '16px',
    color: '#666',
  },
  stepLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#666',
  },
  stepConnector: {
    width: '80px',
    height: '2px',
    backgroundColor: '#e0e0e0',
    margin: '0 8px',
  },
  section: {
    marginBottom: '24px',
  },
  backButton: {
    marginTop: '16px',
    textAlign: 'center',
  },
  actionButtons: {
    marginTop: '24px',
    textAlign: 'center',
  },
  buttonPrimary: {
    padding: '12px 32px',
    fontSize: '16px',
    fontWeight: '600',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#4CAF50',
    color: '#fff',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonSecondary: {
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    borderRadius: '6px',
    border: '2px solid #ddd',
    backgroundColor: '#fff',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  footer: {
    backgroundColor: '#fff',
    padding: '16px',
    textAlign: 'center',
    borderTop: '1px solid #e0e0e0',
  },
  footerText: {
    margin: 0,
    fontSize: '14px',
    color: '#666',
  },
  debug: {
    marginTop: '40px',
    padding: '16px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  debugSummary: {
    cursor: 'pointer',
    fontWeight: '600',
    color: '#666',
    fontSize: '14px',
  },
  debugContent: {
    marginTop: '12px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '4px',
    fontSize: '12px',
    overflow: 'auto',
    maxHeight: '300px',
  },
};
