import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => {
  return <div className={`animate-pulse bg-slate-200/70 ${className}`}></div>;
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="animate-fade-in space-y-8">
      <div className="mb-6">
        <Skeleton className="h-10 w-64 rounded-xl mb-2" />
        <Skeleton className="h-5 w-48 rounded-lg" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
        <Skeleton className="h-32 rounded-3xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40 rounded-3xl" />
          <Skeleton className="h-48 rounded-3xl" />
        </div>
        <div className="space-y-6">
            <Skeleton className="h-56 rounded-3xl" />
            <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    </div>
  );
};

export const TableSkeleton: React.FC = () => {
    return (
        <div className="glass-card rounded-[30px] p-8 overflow-hidden animate-fade-in">
            <Skeleton className="h-8 w-64 rounded-lg mb-8" />
            <div className="space-y-6">
                <div className="flex gap-4 border-b border-slate-200 pb-4">
                    {[1,2,3,4].map(i => <Skeleton key={i} className="h-4 flex-1 rounded-md" />)}
                </div>
                {[1,2,3,4,5].map(i => (
                    <div key={i} className="flex gap-4 items-center">
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                        <Skeleton className="h-10 flex-1 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    )
}

export const PageSkeleton: React.FC = () => (
  <div className="space-y-8 animate-fade-in">
    <div className="space-y-4">
      <Skeleton className="h-12 w-3/4 mx-auto rounded-xl" />
      <Skeleton className="h-8 w-1/2 mx-auto rounded-lg" />
    </div>
    <Skeleton className="h-48 w-full rounded-3xl" />
    <Skeleton className="h-64 w-full rounded-3xl" />
  </div>
);

export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 3 }) => (
  <div className="space-y-4">
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center gap-4 p-4 bg-white/50 rounded-2xl">
        <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded-md" />
        </div>
      </div>
    ))}
  </div>
);