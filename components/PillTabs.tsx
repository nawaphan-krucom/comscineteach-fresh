import React from 'react';

type TabItem = {
  id: string | number;
  label: React.ReactNode;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
};

type Props = {
  items: TabItem[];
  active: string | number;
  onChange: (id: string | number) => void;
  outerClassName?: string;
  itemClassName?: string;
  activeClassName?: string;
  inactiveClassName?: string;
  ariaLabel?: string;
};

const PillTabs: React.FC<Props> = ({
  items,
  active,
  onChange,
  outerClassName,
  itemClassName = 'px-4 py-2 rounded-lg font-bold text-sm',
  activeClassName = 'bg-white text-blue-600 shadow-md',
  inactiveClassName = 'text-slate-500 hover:text-slate-700',
  ariaLabel = 'section-tabs',
}) => {
  return (
    <div role="tablist" aria-label={ariaLabel} className={outerClassName ?? 'flex justify-center bg-slate-100 p-1.5 rounded-xl w-full md:w-fit mx-auto mb-10 overflow-x-auto'}>
      {items.map((it) => {
        const isActive = it.id === active;
        const cls = `${isActive ? activeClassName : inactiveClassName} ${itemClassName} flex-1 md:flex-none flex items-center justify-center gap-2 transition-all duration-300`;
        return (
          <button
            key={String(it.id)}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(it.id)}
            className={cls}
          >
            {it.icon && <span className="flex-shrink-0">{it.icon}</span>}
            <span>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default PillTabs;
