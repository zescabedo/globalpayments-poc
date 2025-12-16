import { BREAKPOINTS } from '@/constants/appConstants';
import { debounce } from 'lodash';
import { useCallback, useEffect, useState } from 'react';

const useIsMobile = (breakpoint = BREAKPOINTS.md) => {
  const [isMobile, setIsMobile] = useState(false);
  const checkMobile = useCallback(() => {
    if (typeof window !== 'undefined') {
      setIsMobile(window.innerWidth < breakpoint);
    }
  }, [breakpoint]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const debouncedCheck = debounce(checkMobile, 150);
    checkMobile();
    window.addEventListener('resize', debouncedCheck);
    return () => {
      window.removeEventListener('resize', debouncedCheck);
      debouncedCheck.cancel();
    };
  }, [checkMobile]);

  return isMobile;
};

export default useIsMobile;
