export function FileIcon({ fileType }) {
  const iconColor = {
    pdf: 'text-red-500',
    doc: 'text-blue-500',
    docx: 'text-blue-500',
    zip: 'text-yellow-500',
    others: 'text-gray-500',
  }[fileType] || 'text-gray-500';

  return (
    <svg 
      className={`w-8 h-8 ${iconColor}`}
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={2} 
        d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
      />
    </svg>
  );
}

export function FileTypeIcon({ type }) {
  const icons = {
    pdf: "📄",
    doc: "📝",
    docx: "📝",
    ppt: "📊",
    pptx: "📊",
    image: "🖼️",
    others: "📁"
  };
  return icons[type] || icons.others;
} 
