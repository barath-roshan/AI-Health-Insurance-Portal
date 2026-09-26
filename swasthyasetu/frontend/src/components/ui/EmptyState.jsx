import React from 'react';
import { SearchX, FileQuestion, RefreshCw } from 'lucide-react';
import Button from './Button';

export const EmptyState = ({
  title = 'No records found',
  description = 'Try adjusting your search criteria or filters.',
  icon: Icon = SearchX,
  actionLabel = null,
  onAction = null,
  className = '',
}) => {
  return (
    <div className={`bg-white border border-slate-200/80 rounded-xl p-12 text-center max-w-md mx-auto shadow-2xs ${className}`}>
      <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-bold text-slate-900">{title}</h3>
      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="outline" size="sm" onClick={onAction} icon={RefreshCw}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
