import React from 'react'

const Model = ({ children, isOpen, onClose, title }) => {
    if (!isOpen) return;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg p-4'>
        <h2 className='text-lg font-semibold'>{title}</h2>
        <button onClick={onClose} className='absolute top-2 right-2'>
          Close
        </button>
        {children}
      </div>
    </div>
  )
}

export default Model