import React from 'react'
import PropTypes from 'prop-types'

const Model = ({ children, isOpen, onClose, title }) => {
    if (!isOpen) return;
  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50'>
      <div className='bg-white rounded-lg p-4'>
        <h2 className='text-lg font-semibold'>{title}</h2>
          <button onClick={onClose}>Close</button>
        {children}
      </div>
    </div>
  )
}

Model.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired
}

export default Model