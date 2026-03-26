import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import analyticsService from '../services/analyticsService';

export const useAnalytics = (targetId?: string, pageOverride?: string) => {
    const location = useLocation();
    const startTimeRef = useRef<number>(Date.now());
    const heartbeatIntervalRef = useRef<any>(null);

    useEffect(() => {
        // Log initial view
        const page = pageOverride || location.pathname;
        console.log(`[Analytics] Logging view for ${targetId} on ${page}`);
        analyticsService.logEvent({
            eventType: 'view',
            targetId,
            page
        }).then(() => console.log(`[Analytics] Successfully sent view event for ${targetId}`))
          .catch(err => console.error(`[Analytics] Failed to send view event:`, err));

        // Start heartbeat for dwell time
        startTimeRef.current = Date.now();
        heartbeatIntervalRef.current = setInterval(() => {
            const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            analyticsService.logEvent({
                eventType: 'dwell',
                targetId,
                page,
                duration
            });
        }, 30000); // Every 30 seconds

        return () => {
            // Log final dwell time on unmount
            if (heartbeatIntervalRef.current) {
                clearInterval(heartbeatIntervalRef.current);
            }
            const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
            if (finalDuration > 5) { // Only log if they stayed for more than 5 seconds
                analyticsService.logEvent({
                    eventType: 'dwell',
                    targetId,
                    page,
                    duration: finalDuration,
                    metadata: { final: true }
                });
            }
        };
    }, [location.pathname, targetId, pageOverride]);
};
