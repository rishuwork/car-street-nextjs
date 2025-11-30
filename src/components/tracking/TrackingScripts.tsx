import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '@/utils/tracking';

const TrackingScripts = () => {
  const location = useLocation();

  useEffect(() => {
    // Track page views on route change
    trackPageView(location.pathname, document.title);
  }, [location]);

  return null;
};

export default TrackingScripts;
