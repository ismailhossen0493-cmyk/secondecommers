// frontend/src/hooks/useColorDropper.js
import { useState, useCallback } from 'react';

/**
 * Custom hook wrapping the EyeDropper API
 * Returns: { pickColor, supported, picking, error }
 */
export function useColorDropper() {
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState(null);

  const supported = typeof window !== 'undefined' && 'EyeDropper' in window;

  const pickColor = useCallback(async () => {
    if (!supported) {
      setError('EyeDropper API not supported in this browser (use Chrome 95+)');
      return null;
    }
    try {
      setPicking(true);
      setError(null);
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      return result.sRGBHex; // e.g. "#1a2b3c"
    } catch (e) {
      if (e.name !== 'AbortError') {
        setError('Color picking failed: ' + e.message);
      }
      return null;
    } finally {
      setPicking(false);
    }
  }, [supported]);

  return { pickColor, supported, picking, error };
}
