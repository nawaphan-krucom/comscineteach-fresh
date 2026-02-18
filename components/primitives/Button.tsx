import React from 'react';
import PropTypes from 'prop-types';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'ghost' };

export const Button = React.forwardRef<HTMLButtonElement, Props>(({ variant = 'primary', className = '', children, ...rest }, ref) => {
  const base = 'inline-flex items-center justify-center gap-2 font-bold text-sm';
  const klass = variant === 'primary' ? `proto-btn ${base}` : `inline-flex items-center justify-center gap-2 text-sm ${base}`;
  return (
    <button ref={ref} className={`${klass} ${className}`} {...rest}>
      {children}
    </button>
  );
});

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'ghost']),
  className: PropTypes.string,
  children: PropTypes.any,
};

Button.displayName = 'Button';
export default Button;
