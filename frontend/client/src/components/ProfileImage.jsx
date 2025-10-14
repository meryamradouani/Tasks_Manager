import React from 'react';
import { DEFAULT_PROFILE_IMAGE } from '../utils/config';

const ProfileImage = ({ 
  src, 
  alt, 
  size = 'md', 
  className = '', 
  showBorder = true,
  showName = false,
  name = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12'
  };

  const borderClass = showBorder ? 'border-2 border-white' : '';

  return (
    <div className={`flex items-center gap-1`}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 ${borderClass} ${className}`}>
        <img
          src={src || DEFAULT_PROFILE_IMAGE}
          alt={alt || 'Profile'}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = DEFAULT_PROFILE_IMAGE;
          }}
        />
      </div>
      {showName && name && (
        <span className="text-xs text-gray-600 font-medium">{name}</span>
      )}
    </div>
  );
};

export default ProfileImage; 