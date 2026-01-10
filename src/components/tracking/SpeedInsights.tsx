import { useEffect } from 'react';
import { injectSpeedInsights } from '@vercel/speed-insights';

const SpeedInsights = () => {
  useEffect(() => {
    // Inject Vercel Speed Insights tracking script
    // This should only be called once in the app, and must run in the client
    injectSpeedInsights();
  }, []);

  return null;
};

export default SpeedInsights;
