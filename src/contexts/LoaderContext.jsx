import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import BrandedLoader from '../components/shared/BrandedLoader';

const LoaderContext = createContext();

export const useLoader = () => {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
};

export const LoaderProvider = ({ children }) => {
  const [loaderState, setLoaderState] = useState({
    visible: false,
    primaryText: 'KolekTrash',
    secondaryText: 'Please wait…',
    variant: 'elevated'
  });
  const timeoutRef = useRef();

  const resolveDuration = useCallback((requestedDuration) => {
    if (typeof requestedDuration === 'number' && Number.isFinite(requestedDuration)) {
      return Math.max(300, requestedDuration);
    }

    if (typeof navigator !== 'undefined') {
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

      if (connection) {
        const { effectiveType, downlink } = connection;

        if (effectiveType === 'slow-2g') return 3500;
        if (effectiveType === '2g') return 3000;
        if (effectiveType === '3g') return 2200;
        if (effectiveType === '4g') {
          if (typeof downlink === 'number' && downlink < 1) return 2000;
          return 1400;
        }

        if (typeof downlink === 'number') {
          if (downlink < 0.5) return 3200;
          if (downlink < 1) return 2400;
          if (downlink < 5) return 1600;
          return 1200;
        }
      }
    }

    return 1500;
  }, []);

  const hideLoader = useCallback(() => {
    setLoaderState((prev) => ({ ...prev, visible: false }));
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showLoader = useCallback(({ primaryText = 'KolekTrash', secondaryText = 'Please wait…', duration, variant = 'elevated' } = {}) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise((resolve) => {
      const resolvedDuration = resolveDuration(duration);

      setLoaderState({
        visible: true,
        primaryText,
        secondaryText,
        variant
      });

      timeoutRef.current = setTimeout(() => {
        hideLoader();
        resolve();
      }, resolvedDuration);
    });
  }, [hideLoader, resolveDuration]);

  const contextValue = {
    showLoader,
    hideLoader,
    loaderState
  };

  return (
    <LoaderContext.Provider value={contextValue}>
      {children}
      <BrandedLoader
        visible={loaderState.visible}
        primaryText={loaderState.primaryText}
        secondaryText={loaderState.secondaryText}
        variant={loaderState.variant}
      />
    </LoaderContext.Provider>
  );
};
