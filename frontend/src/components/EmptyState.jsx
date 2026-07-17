export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="mb-8 relative">
        {/* Decorative circles */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 bg-gradient-to-br from-indigo-200 to-purple-200 dark:from-indigo-900 dark:to-purple-900 rounded-full opacity-20 animate-pulse"></div>
        </div>
        <div className="relative w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <svg 
            className="w-12 h-12 text-white" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-3 text-claude-text-primary-light dark:text-claude-text-primary-dark">
        Ready to generate your research paper
      </h2>
      
      <p className="text-claude-text-secondary-light dark:text-claude-text-secondary-dark max-w-md mb-8 text-sm leading-relaxed">
        Upload your research data and template to begin. I'll guide you through structuring, drafting, and formatting your academic paper.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 text-sm">
        <div className="flex items-center gap-2 px-4 py-3 bg-claude-surface-light dark:bg-claude-surface-dark rounded-xl">
          <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="text-claude-text-secondary-light dark:text-claude-text-secondary-dark">Upload CSV/Excel data</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-3 bg-claude-surface-light dark:bg-claude-surface-dark rounded-xl">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-claude-text-secondary-light dark:text-claude-text-secondary-dark">Optional DOCX template</span>
        </div>
      </div>
    </div>
  );
}
