import React, { useState } from 'react';

/**
 * A reusable tooltip component for displaying help information
 * 
 * @param {Object} props
 * @param {string} props.text - The tooltip text to display
 * @param {string} [props.position="top"] - Position of tooltip (top, bottom, left, right)
 * @param {React.ReactNode} [props.children] - Icon or element that triggers the tooltip
 */
export default function InfoTooltip({ text, position = "top", children }) {
  const [isVisible, setIsVisible] = useState(false);
  
  const positionClasses = {
    top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
    left: "right-full top-1/2 transform -translate-y-1/2 mr-2",
    right: "left-full top-1/2 transform -translate-y-1/2 ml-2"
  };
  
  return (
    <div className="relative inline-block">
      <div 
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex cursor-help"
      >
        {children || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      
      {isVisible && (
        <div className={`absolute z-10 ${positionClasses[position]}`}>
          <div className="bg-gray-900 text-white text-xs p-2 rounded shadow-lg max-w-xs">
            {text}
          </div>
        </div>
      )}
    </div>
  );
}
