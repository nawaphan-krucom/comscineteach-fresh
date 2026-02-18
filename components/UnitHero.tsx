import React from 'react';

type Props = {
  unitNumber: number | string;
  badge?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  outerClassName?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  divider?: boolean;
  children?: React.ReactNode;
};

const UnitHero: React.FC<Props> = ({
  unitNumber,
  badge,
  title,
  subtitle,
  outerClassName,
  titleClassName,
  subtitleClassName,
  divider = false,
  children,
}) => {
  const outer = outerClassName ?? 'text-center space-y-4 mb-8';
  const titleCls = titleClassName ?? 'text-3xl md:text-4xl font-bold text-slate-800 font-cute';
  const subtitleCls = subtitleClassName ?? 'text-slate-600';

  return (
    <section className={outer}>
      {children}

      {badge && <div className="mx-auto mb-2">{badge}</div>}

      <h2 className={titleCls}>
        หน่วยการเรียนรู้ที่ {unitNumber} <br />
        {title}
      </h2>

      {subtitle && <p className={subtitleCls}>{subtitle}</p>}

      {divider && <div className="w-32 h-1.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mx-auto mt-6 shadow-lg"></div>}
    </section>
  );
};

export default UnitHero;
