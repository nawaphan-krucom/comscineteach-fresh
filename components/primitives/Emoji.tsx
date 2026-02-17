import React from 'react';

interface EmojiProps {
  symbol: string;
  label?: string;
  className?: string;
}

const Emoji: React.FC<EmojiProps> = ({ symbol, label, className }) => (
  <span role="img" aria-label={label || symbol} title={label || undefined} className={className}>
    {symbol}
  </span>
);

export default Emoji;
