import React from 'react';

/**
 * Renders an initials avatar for a barber or customer.
 * Uses a charcoal circle with a gold border and subtle styling.
 */
export default function Avatar({ name, status, size = 'md' }) {
  const getInitials = (str) => {
    if (!str) return '?';
    const parts = str.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return str.substring(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-base font-bold',
    xl: 'w-20 h-20 text-xl font-extrabold',
  }[size] || 'w-10 h-10 text-sm';

  const dotSize = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3.5 h-3.5',
    xl: 'w-4 h-4',
  }[size] || 'w-2.5 h-2.5';

  const statusColors = {
    available: 'bg-emerald-500 ring-2 ring-charcoal',
    break: 'bg-amber-500 ring-2 ring-charcoal',
    offduty: 'bg-gray-500 ring-2 ring-charcoal',
  };

  return (
    <div className="relative inline-block select-none">
      <div
        className={`${sizeClasses} rounded-full bg-charcoal border-2 border-gold text-gold flex items-center justify-center font-semibold shadow-inner`}
      >
        {getInitials(name)}
      </div>
      {status && statusColors[status] && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} rounded-full ${statusColors[status]}`}
          title={status}
        />
      )}
    </div>
  );
}
