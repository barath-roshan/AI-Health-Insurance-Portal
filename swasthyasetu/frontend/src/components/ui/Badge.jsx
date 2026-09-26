import React from 'react';

const VARIANT_MAP = {
  eligible: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  near_match: 'bg-amber-50 text-amber-800 border-amber-200/80',
  needs_info: 'bg-sky-50 text-sky-800 border-sky-200/80',
  not_eligible: 'bg-slate-100 text-slate-700 border-slate-200',
  verified: 'bg-emerald-50 text-emerald-800 border-emerald-200/80',
  central: 'bg-indigo-50 text-indigo-800 border-indigo-200/80',
  state: 'bg-teal-50 text-teal-800 border-teal-200/80',
  brand: 'bg-[#0F4C5C]/10 text-[#0F4C5C] border-[#0F4C5C]/20',
  neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200/80',
  danger: 'bg-rose-50 text-rose-800 border-rose-200/80',
};

const DOT_MAP = {
  eligible: 'bg-emerald-500',
  near_match: 'bg-amber-500',
  needs_info: 'bg-sky-500',
  not_eligible: 'bg-slate-400',
  verified: 'bg-emerald-500',
  danger: 'bg-rose-500',
};

export const Badge = ({
  children,
  variant = 'neutral',
  size = 'md',
  showDot = false,
  className = '',
  ...props
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
  const variantClasses = VARIANT_MAP[variant.toLowerCase()] || VARIANT_MAP.neutral;
  const dotColor = DOT_MAP[variant.toLowerCase()] || 'bg-slate-400';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-2xs transition-colors ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />}
      {children}
    </span>
  );
};

export default Badge;
