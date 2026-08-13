import { useEffect } from 'react';

/**
 * Custom hook to prevent body scrolling when a modal is open
 * @param {boolean} isOpen - Whether the modal is open
 */
const useDisableBodyScroll = (isOpen) => {
  useEffect(() => {
    if (isOpen) {
      // Save the current scroll position
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      
      // Lock html element
      const htmlElement = document.documentElement;
      const originalHtmlOverflow = htmlElement.style.overflow;
      const originalHtmlHeight = htmlElement.style.height;
      
      htmlElement.style.overflow = 'hidden';
      htmlElement.style.height = '100%';
      
      // Lock root and main elements directly
      const rootElement = document.getElementById('root');
      const mainElement = document.querySelector('main');
      
      if (rootElement) {
        const originalRootOverflow = rootElement.style.overflow;
        const originalRootHeight = rootElement.style.height;
        rootElement.style.overflow = 'hidden';
        rootElement.style.height = '100%';
        
        // Store original values for cleanup
        rootElement.setAttribute('data-original-overflow', originalRootOverflow);
        rootElement.setAttribute('data-original-height', originalRootHeight);
      }
      
      if (mainElement) {
        const originalMainOverflow = mainElement.style.overflow;
        const originalMainOverflowY = mainElement.style.overflowY;
        const originalMainOverflowX = mainElement.style.overflowX;
        
        mainElement.style.overflow = 'hidden';
        mainElement.style.overflowY = 'hidden';
        mainElement.style.overflowX = 'hidden';
        
        // Store original values for cleanup
        mainElement.setAttribute('data-original-overflow', originalMainOverflow);
        mainElement.setAttribute('data-original-overflow-y', originalMainOverflowY);
        mainElement.setAttribute('data-original-overflow-x', originalMainOverflowX);
      }
      
      // Lock body
      const originalBodyOverflow = document.body.style.overflow;
      const originalBodyPosition = document.body.style.position;
      const originalBodyTop = document.body.style.top;
      const originalBodyWidth = document.body.style.width;
      
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      
      // Store scroll position for restoration
      document.body.setAttribute('data-scroll-y', scrollY.toString());
      
      // Cleanup: restore styles when modal closes
      return () => {
        // Restore html
        htmlElement.style.overflow = originalHtmlOverflow;
        htmlElement.style.height = originalHtmlHeight;
        
        // Restore root element
        if (rootElement) {
          const originalOverflow = rootElement.getAttribute('data-original-overflow') || '';
          const originalHeight = rootElement.getAttribute('data-original-height') || '';
          rootElement.style.overflow = originalOverflow;
          rootElement.style.height = originalHeight;
          rootElement.removeAttribute('data-original-overflow');
          rootElement.removeAttribute('data-original-height');
        }
        
        // Restore main element
        if (mainElement) {
          const originalOverflow = mainElement.getAttribute('data-original-overflow') || '';
          const originalOverflowY = mainElement.getAttribute('data-original-overflow-y') || '';
          const originalOverflowX = mainElement.getAttribute('data-original-overflow-x') || '';
          mainElement.style.overflow = originalOverflow;
          mainElement.style.overflowY = originalOverflowY;
          mainElement.style.overflowX = originalOverflowX;
          mainElement.removeAttribute('data-original-overflow');
          mainElement.removeAttribute('data-original-overflow-y');
          mainElement.removeAttribute('data-original-overflow-x');
        }
        
        // Restore body
        document.body.style.overflow = originalBodyOverflow;
        document.body.style.position = originalBodyPosition;
        document.body.style.top = originalBodyTop;
        document.body.style.width = originalBodyWidth;
        
        // Restore scroll position
        const savedScrollY = parseInt(document.body.getAttribute('data-scroll-y') || scrollY.toString(), 10);
        document.body.removeAttribute('data-scroll-y');
        window.scrollTo(0, savedScrollY);
      };
    }
  }, [isOpen]);
};

export default useDisableBodyScroll;

