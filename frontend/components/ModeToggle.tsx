'use client';

interface ModeToggleProps {
  mode: 'chat' | 'form';
  onChange: (mode: 'chat' | 'form') => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
  return (
    <div className="inline-flex rounded-lg bg-gray-200 p-1">
      <button
        onClick={() => onChange('chat')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'chat'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        💬 Chat Mode
      </button>
      <button
        onClick={() => onChange('form')}
        className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
          mode === 'form'
            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md'
            : 'text-gray-700 hover:text-gray-900'
        }`}
      >
        📝 Form Mode
      </button>
    </div>
  );
}
