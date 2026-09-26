import React from 'react';

export const Skeleton = ({ className = '', ...props }) => (
  <div
    className={`bg-slate-200/80 animate-pulse rounded-md ${className}`}
    {...props}
  />
);

export const SchemeCardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-20 rounded-full" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-6 w-3/4" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
    <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-28 rounded-lg" />
    </div>
  </div>
);

export const DashboardCardSkeleton = () => (
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
    <Skeleton className="h-10 w-10 rounded-lg" />
    <Skeleton className="h-5 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-9 w-full rounded-lg mt-4" />
  </div>
);

export default Skeleton;
