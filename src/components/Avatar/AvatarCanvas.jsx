import React from 'react';

const AvatarCanvas = ({ avatar, size = 'md' }) => {
  const sizes = {
    sm: 'w-16 h-16 text-2xl',
    md: 'w-32 h-32 text-4xl',
    lg: 'w-48 h-48 text-6xl'
  };

  return (
    <div className={`${sizes[size]} bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg`}>
      {avatar || '👤'}
    </div>
  );
};

export default AvatarCanvas;