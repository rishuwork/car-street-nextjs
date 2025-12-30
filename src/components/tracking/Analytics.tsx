import { useEffect } from 'react';

/**
 * Analytics Component for Vercel Web Analytics
 * 
 * This component integrates Vercel Web Analytics into the application.
 * It uses the inject() function from @vercel/analytics which adds the tracking
 * script to your app. This should only be called once in your app, and must run in the client.
 * 
 * Features:
 * - Automatic page view tracking
 * - Visitor tracking
 * - Route detection (when integrated with React Router)
 * - Privacy-compliant tracking
 * - Custom event support
 * 
 * Note: Make sure Vercel Web Analytics is enabled in your Vercel dashboard:
 * 1. Go to your project dashboard
 * 2. Click the Analytics tab
 * 3. Click Enable
 * 
 * After deployment, you'll see:
 * - Fetch/XHR requests to /_vercel/insights/view in your Network tab
 * - Analytics data available in your Vercel dashboard
 */
const Analytics = () => {
  useEffect(() => {
    // The analytics tracking is already initialized in entry-client.tsx via inject()
    // This component serves as a placeholder and documentation for the analytics setup
    // No additional initialization needed here
    
    // If you need to track custom events, use the following pattern:
    // import { track } from '@vercel/analytics';
    // track('event_name', { custom_property: 'value' });
  }, []);

  return null;
};

export default Analytics;
