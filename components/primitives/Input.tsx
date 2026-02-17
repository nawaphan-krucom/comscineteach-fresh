import React from 'react';
import PropTypes from 'prop-types';

type Props = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, Props>((props, ref) => {
  return <input ref={ref} className={`proto-input ${props.className || ''}`} {...props} />;
});

Input.propTypes = {
  className: PropTypes.string,
} as any;

Input.displayName = 'Input';
export default Input;
