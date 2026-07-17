import { useState, useEffect, useRef } from 'react';
import { getJobStatus, downloadAndSaveResult } from '../api/client';

// Maps backend node keys -> display labels + icons
const WORKFLOW_STAGES = [
  {
    key: 'structuring',
    label: 'Structuring',
    description: 'Analysing data & creating outline',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    ),
  },
  {
    key: 'drafting',
    label: 'Drafting',
    description: 'Writing each section from data',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    ),
  },
  {
    key: 'citation',
    label: 'Citations',
    description: 'Formatting references',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
    ),
  },
  {
    key: 'formatting',
    label: 'Formatting',
    description: 'Generating final DOCX',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    ),
  },
];

export default function StatusCard({ jobId }) {
  const [status, setStatus] = useState(null);
  const [pollError, setPollError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const intervalRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!jobId) return;

    mountedRef.current = true;
    setPollError(null);
    setStatus(null);

    const poll = async () => {
      try {
        const data = await getJobStatus(jobId);
        if (!mountedRef.current) return;
        setStatus(data);
        // Stop once terminal state reached
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        if (!mountedRef.current) return;
        setPollError(err?.response?.data?.detail || err.message || 'Failed to reach server');
        clearInterval(intervalRef.current);
      }
    };

    poll(); // immediate first call
    intervalRef.current = setInterval(poll, 2000);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalRef.current);
    };
  }, [jobId]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndSaveResult(jobId);
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloading(false);
    }
  };

  // ── Error state ──────────────────────────────────────────────────────────
  if (pollError) {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-medium">Polling error: {pollError}</span>
        </div>
      </div>
    );
  }

  // ── Initialising ─────────────────────────────────────────────────────────
  if (!status) {
    return (
      <div className="mt-3 p-4 rounded-2xl bg-claude-surface-light dark:bg-claude-surface-dark border border-claude-border-light dark:border-claude-border-dark">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-claude-text-secondary-light dark:text-claude-text-secondary-dark">
            Connecting to server…
          </span>
        </div>
      </div>
    );
  }

  const isCompleted = status.status === 'completed';
  const isFailed    = status.status === 'failed';

  // Determine the current stage index from the backend's current_step field
  // Backend uses: "structuring" | "drafting" | "citation" | "formatting" | "completed"
  const currentStep = status.current_step || status.current_node || '';
  const activeIndex = WORKFLOW_STAGES.findIndex(s => s.key === currentStep);

  // Progress percentage — backend sends 0.0–1.0 or 0–100; normalise to 0–100
  const rawProgress  = status.progress ?? 0;
  const progressPct  = rawProgress <= 1 ? Math.round(rawProgress * 100) : Math.round(rawProgress);

  return (
    <div className="mt-3 p-4 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-800">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : isFailed ? (
            <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center">
              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          ) : (
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          )}
          <span className="font-semibold text-sm text-indigo-900 dark:text-indigo-100">
            {isCompleted ? 'Paper Complete!' : isFailed ? 'Generation Failed' : 'Generating Paper…'}
          </span>
        </div>

        <span className="text-xs font-medium tabular-nums text-indigo-600 dark:text-indigo-300">
          {progressPct}%
        </span>
      </div>

      {/* ── Progress bar ─────────────────────────────────────────────── */}
      <div className="mb-4 h-1.5 bg-indigo-100 dark:bg-indigo-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isCompleted ? 'bg-green-500' : isFailed ? 'bg-red-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
          }`}
          style={{ width: `${isCompleted ? 100 : progressPct}%` }}
        />
      </div>

      {/* ── Stage list ───────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        {WORKFLOW_STAGES.map((stage, index) => {
          const isDone    = isCompleted || index < activeIndex;
          const isActive  = !isCompleted && index === activeIndex;
          const isPending = !isCompleted && index > activeIndex;

          return (
            <div
              key={stage.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-indigo-100 dark:bg-indigo-900/50 ring-1 ring-indigo-300 dark:ring-indigo-700'
                  : isDone
                  ? 'bg-white/60 dark:bg-white/5'
                  : 'opacity-50'
              }`}
            >
              {/* Stage icon / spinner / checkmark */}
              <div className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300 ${
                isDone   ? 'bg-green-500' :
                isActive ? 'bg-indigo-500' :
                           'bg-gray-200 dark:bg-gray-700'
              }`}>
                {isDone ? (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : isActive ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {stage.icon}
                  </svg>
                )}
              </div>

              {/* Label & sub-text */}
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium leading-none ${
                  isActive ? 'text-indigo-900 dark:text-indigo-100' :
                  isDone   ? 'text-gray-700 dark:text-gray-300' :
                             'text-gray-400 dark:text-gray-500'
                }`}>
                  {stage.label}
                </div>

                {/* Active: show "In progress…" or current section */}
                {isActive && (
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-indigo-500 dark:text-indigo-400">
                    <span className="inline-block w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
                    {stage.key === 'drafting' && status.current_section
                      ? `Writing: ${status.current_section}`
                      : 'In progress…'}
                  </div>
                )}
              </div>

              {/* Done: small tick badge */}
              {isDone && !isActive && (
                <span className="flex-shrink-0 text-xs text-green-600 dark:text-green-400 font-medium">✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Completion footer ────────────────────────────────────────── */}
      {isCompleted && (
        <div className="mt-4 pt-4 border-t border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Your paper is ready for download!
          </div>

          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:opacity-60 rounded-xl shadow-sm hover:shadow-md transition-all"
          >
            {downloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Downloading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Paper (.docx)
              </>
            )}
          </button>
        </div>
      )}

      {/* ── Error footer ─────────────────────────────────────────────── */}
      {isFailed && status.error && (
        <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
          <span className="font-medium">Error: </span>{status.error}
        </div>
      )}
    </div>
  );
}
