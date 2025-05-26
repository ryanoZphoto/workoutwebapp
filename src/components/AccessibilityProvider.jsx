import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const AccessibilityProvider = ({ children, title, description }) => {
  // Handle ESC key for modal closing
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        // Dispatch a custom event that your modal components can listen for
        document.dispatchEvent(new CustomEvent('app-close-modal'));
      }
    };
    
    window.addEventListener('keydown', handleEscKey);
    return () => {
      window.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Add skip link functionality
  useEffect(() => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.setAttribute('tabindex', '-1');
    }
  }, []);

  return (
    <>
      <Helmet>
        <html lang="en" />
        <title>{title || 'Workout Web App'}</title>
        <meta name="description" content={description || 'Track and manage your workout progress'} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Helmet>
      
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:p-4 focus:bg-white focus:z-50 focus:top-0 focus:left-0">
        Skip to main content
      </a>
      
      {children}
    </>
  );
};

export default AccessibilityProvider;
