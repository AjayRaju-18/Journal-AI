import { useState, useEffect } from 'react';
import { getJobStatus } from '../api/client';

const WORKFLOW_STAGES = [
  { key: 'structuring', label: 'Structuring', icon: 'structure' },
  { key: 'drafting', label: 'Drafting', icon: 'draft' },
  { key: 'citation', label: 'Citations', icon: 'citation' },
  { key: 'formatting', label: 'Formatting', icon: 'format' },
];

export default function StatusCard({ jobId }) {
  const [status, setStatus] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jobId) return;

    let intervalId;
    let isMounted = true;

    const pollStatus = async () => {
      try {
        const response = await getJobStatus(jobId);
        if (isMounted) {
          setStatus(response);
          
          // Stop polling if completed or failed
          if (response.status === 'completed' || response.status === 'failed') {
            clearInterval(intervalId);
          }
        }
      } catch (err) {
        console.error('Error polling status:', err);
        if (isMounted) {
          setError(err.message);
          clearInterval(intervalId);
        }
      }
    };

    // Initial fetch
    pollStatus();

    // Poll every 2 seconds
    intervalId = setInterval(pollStatus, 2000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [jobId]);

  if (error) {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Error: {error}</span>
        </div>
      </div>
    );
  }

  if (!status) {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-claude-surface-light dark:bg-claude-surface-dark border border-claude-border-light dark:border-claude-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
            Initializing...
          </span>
        </div>
      </div>
    );
  }

  const currentStageIndex = WORKFLOW_STAGES.findIndex(
    stage => stage.key === status.current_node
  );

  const isCompleted = status.status === 'completed';
  const isFailed = status.status === 'failed';

  return (
    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isFailed ? (
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="font-semibold text-indigo-900 dark:text-indigo-100">
            {isCompleted ? 'Paper Complete!' : isFailed ? 'Generation Failed' : 'Generating Paper'}
          </span>
        </div>
        {status.progress !== undefined && (
          <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">
            {status.progress}%
          </span>
        )}
      </div>

      {/* Progress bar */}
      {!isCompleted && !isFailed && (
        <div className="mb-4 h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${status.progress || 0}%` }}
          />
        </div>
      )}

      {/* Workflow stages */}
      <div className="space-y-2">
        {WORKFLOW_STAGES.map((stage, index) => {
          const isActive = index === currentStageIndex;
          const isPast = index < currentStageIndex || isCompleted;
          const isCurrent = status.current_node === stage.key;
          
          return (
            <WorkflowStage
              key={stage.key}
              stage={stage}
              isActive={isActive}
              isPast={isPast}
              isCurrent={isCurrent}
              isCompleted={isCompleted}
              currentSection={status.current_section}
            />
          );
        })}
      </div>

      {/* Completion message */}
      {isCompleted && (
        <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Your paper is ready for download!</span>
          </div>
        </div>
      )}

      {/* Error message */}
      {isFailed && status.error && (
        <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
          <div className="text-sm text-red-700 dark:text-red-300">
            <span className="font-medium">Error: </span>
            {status.error}
          </div>
        </div>
      )}
    </div>
  );
}

function WorkflowStage({ stage, isActive, isPast, isCurrent, isCompleted, currentSection }) {
  const getIcon = () => {
    switch (stage.icon) {
      case 'structure':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        );
      case 'draft':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        );
      case 'citation':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
        );
      case 'format':
        return (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl transition-all ${
      isActive || isCurrent
        ? 'bg-indigo-100 dark:bg-indigo-900/40 border-2 border-indigo-400 dark:border-indigo-600'
        : isPast
        ? 'bg-white/50 dark:bg-gray-800/30'
        : 'bg-white/30 dark:bg-gray-800/20'
    }`}>
      {/* Icon */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
        isPast || isCompleted
          ? 'bg-green-500'
          : isActive || isCurrent
          ? 'bg-indigo-500'
          : 'bg-gray-300 dark:bg-gray-700'
      }`}>
        {isPast || isCompleted ? (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {getIcon()}
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className={`font-medium text-sm ${
          isActive || isCurrent
            ? 'text-indigo-900 dark:text-indigo-100'
            : isPast
            ? 'text-gray-700 dark:text-gray-300'
            : 'text-gray-500 dark:text-gray-500'
        }`}>
          {stage.label}
        </div>
        
        {/* Current section for drafting */}
        {stage.key === 'drafting' && isCurrent && currentSection && (
          <div className="mt-1 text-xs text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
            <span>Writing: {currentSection}</span>
          </div>
        )}

        {/* Status indicator */}
        {isActive && !isCompleted && (
          <div className="mt-1 flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400">
            <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse" />
            <span>In progress...</span>
          </div>
        )}
      </div>
    </div>
  );
}
