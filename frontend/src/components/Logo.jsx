export default function Logo({ size = 'md', showText = true, textClass = '' }) {
  const dims = size === 'sm' ? 28 : size === 'lg' ? 44 : 36

  return (
    <div className="flex items-center gap-2.5">
      <div
        style={{
          width: dims,
          height: dims,
          borderRadius: dims * 0.28,
          background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #06B6D4 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(79,70,229,0.4)',
          flexShrink: 0,
        }}
      >
        <svg
          width={dims * 0.62}
          height={dims * 0.62}
          viewBox="0 0 24 24"
          fill="none"
        >
          <rect x="2" y="16" width="20" height="3.5" rx="1.75" fill="white" opacity="0.45" />
          <rect x="4" y="10.5" width="16" height="3.5" rx="1.75" fill="white" opacity="0.72" />
          <rect x="6" y="5" width="12" height="3.5" rx="1.75" fill="white" />
        </svg>
      </div>
      {showText && (
        <span
          className={textClass}
          style={{ fontWeight: 700, letterSpacing: '-0.02em' }}
        >
          TaskFlow
        </span>
      )}
    </div>
  )
}
