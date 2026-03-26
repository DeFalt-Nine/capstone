const API_BASE = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || '';

export interface AnalyticsEventData {
    eventType: 'view' | 'click' | 'dwell' | 'filter';
    targetId?: string;
    page: string;
    duration?: number;
    metadata?: any;
}

const analyticsService = {
    logEvent: async (event: AnalyticsEventData) => {
        try {
            await fetch(`${API_BASE}/api/v1/stats/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
        } catch (error) {
            console.error('Failed to log analytics event:', error);
        }
    }
};

export default analyticsService;
