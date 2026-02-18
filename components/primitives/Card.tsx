import React from 'react';

type Props = { children: React.ReactNode; className?: string };

export const Card: React.FC<Props> = ({ children, className = '' }) => {
  return <div className={`proto-card ${className}`}>{children}</div>;
};

export default Card;
