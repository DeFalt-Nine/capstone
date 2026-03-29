
import type { TouristSpot, BlogPost, LocalEvent, Report, AdminLog } from '../types';

// Use relative path by default to leverage Vite proxy in development
export const API_BASE = ((import.meta as any).env && (import.meta as any).env.VITE_API_URL) || '';

const getHeaders = () => {
    const token = localStorage.getItem('adminToken') || '';
    return {
        'Content-Type': 'application/json',
        'x-admin-access-token': token
    };
};

// Helper to handle response status and errors consistently
const handleResponse = async (response: Response) => {
    if (response.ok) {
        return response.json();
    }
    
    let errorMessage = `HTTP Error: ${response.status}`;
    try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
    } catch (e) {
        if (response.status === 404) errorMessage = "Backend Endpoint Not Found (404).";
        else if (response.status === 403) errorMessage = "Invalid Access Code (403).";
        else if (response.status === 401) errorMessage = "Unauthorized (401).";
        else if (response.status === 500) errorMessage = "Server Error (500). Check terminal logs.";
        else if (response.status === 502 || response.status === 503) errorMessage = "Database or Server is currently unavailable.";
    }
    throw new Error(errorMessage);
};

// Wrapper for fetch to handle network errors specifically
const safeFetch = async (url: string, options?: RequestInit) => {
    try {
        const response = await fetch(url, options);
        return handleResponse(response);
    } catch (error: any) {
        if (error.message.includes('Failed to fetch')) {
            throw new Error("Cannot connect to backend. Please ensure the backend server is running on port 5000.");
        }
        throw error;
    }
};

// Verify the access code
export const verifyAdminToken = async (token: string) => {
    return safeFetch(`${API_BASE}/api/auth/verify`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-admin-access-token': token
        }
    });
};

export const logoutAdmin = async () => {
    return safeFetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: getHeaders()
    });
};

// Fetch all tourist spots
export const fetchTouristSpots = async (): Promise<TouristSpot[]> => {
  return safeFetch(`${API_BASE}/api/tourist-spots`);
};

// Fetch all dining spots
export const fetchDiningSpots = async (): Promise<TouristSpot[]> => {
  return safeFetch(`${API_BASE}/api/dining-spots`);
};

export const fetchBlogPosts = async (mode?: string): Promise<BlogPost[]> => {
    const url = mode === 'admin' ? `${API_BASE}/api/blog-posts?mode=admin` : `${API_BASE}/api/blog-posts`;
    const headers: HeadersInit = mode === 'admin' ? { 'x-admin-access-token': localStorage.getItem('adminToken') || '' } : {};
    
    return safeFetch(url, { headers });
};

export const fetchLocalEvents = async (): Promise<LocalEvent[]> => {
    return safeFetch(`${API_BASE}/api/events`);
};

export const submitReview = async (
  spotId: string,
  review: { name: string; email: string; rating: number; comment?: string; images?: string[] },
  type: 'tourist' | 'dining' = 'tourist'
): Promise<TouristSpot> => {
  const endpoint = type === 'tourist' ? 'tourist-spots' : 'dining-spots';
  return safeFetch(`${API_BASE}/api/${endpoint}/${spotId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(review),
  });
};

export const deleteReview = async (
    type: 'tourist' | 'dining',
    spotId: string,
    reviewId: string
) => {
    const endpoint = type === 'tourist' ? 'tourist-spots' : 'dining-spots';
    return safeFetch(`${API_BASE}/api/${endpoint}/${spotId}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};

export const submitReport = async (data: Partial<Report>) => {
    return safeFetch(`${API_BASE}/api/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

export const fetchReports = async (): Promise<Report[]> => {
    return safeFetch(`${API_BASE}/api/reports`, {
        headers: getHeaders()
    });
};

export const deleteReport = async (id: string) => {
    return safeFetch(`${API_BASE}/api/reports/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
};

export const submitPublicBlogPost = async (data: Partial<BlogPost>) => {
    return safeFetch(`${API_BASE}/api/blog-posts/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
};

export const deleteItem = async (endpoint: string, id: string) => {
    const url = endpoint === 'upload' 
        ? `${API_BASE}/api/${endpoint}?publicId=${encodeURIComponent(id)}`
        : `${API_BASE}/api/${endpoint}/${id}`;
        
    return safeFetch(url, {
        method: 'DELETE',
        headers: getHeaders()
    });
};

export const createItem = async (endpoint: string, data: any) => {
    return safeFetch(`${API_BASE}/api/${endpoint}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const updateItem = async (endpoint: string, id: string, data: any) => {
    return safeFetch(`${API_BASE}/api/${endpoint}/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem('adminToken') || '';

    try {
        const response = await fetch(`${API_BASE}/api/upload`, {
            method: 'POST',
            headers: { 'x-admin-access-token': token },
            body: formData
        });

        if (response.ok) return response.json();

        const responseText = await response.text();
        let errorMessage = `Upload Error: ${response.status}`;
        try {
            const data = JSON.parse(responseText);
            errorMessage = data.message || errorMessage;
        } catch (e) {}
        throw new Error(errorMessage);
    } catch (error: any) {
        throw new Error(error.message || 'Network error during upload');
    }
};

export const logChatInteraction = async (userMessage: string, botResponse: string, isIntent: boolean = false) => {
    try {
        await fetch(`${API_BASE}/api/v1/stats/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userMessage, botResponse, isIntent }),
        });
    } catch (error) {}
};

export const subscribeToNewsletter = async (email: string) => {
    return safeFetch(`${API_BASE}/api/subscribers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
    });
};

export const fetchAnalyticsSummary = async () => {
    return safeFetch(`${API_BASE}/api/v1/stats/summary`, {
        headers: getHeaders()
    });
};

export const fetchAnalyticsDebug = async () => {
    return safeFetch(`${API_BASE}/api/v1/stats/debug`, {
        headers: getHeaders()
    });
};

export const fetchAdminLogs = async (): Promise<AdminLog[]> => {
    return safeFetch(`${API_BASE}/api/admin-logs`, {
        headers: getHeaders()
    });
};

export const fetchSiteSettings = async () => {
    return safeFetch(`${API_BASE}/api/site-settings`);
};

export const updateSiteSettings = async (data: any) => {
    return safeFetch(`${API_BASE}/api/site-settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data)
    });
};

export const markReviewAsSeen = async (type: 'tourist' | 'dining', spotId: string, reviewId: string) => {
    const endpoint = type === 'tourist' ? 'tourist-spots' : 'dining-spots';
    return safeFetch(`${API_BASE}/api/${endpoint}/${spotId}/reviews/${reviewId}/seen`, {
        method: 'PUT',
        headers: getHeaders()
    });
};

export const markReviewAsResolved = async (type: 'tourist' | 'dining', spotId: string, reviewId: string) => {
    const endpoint = type === 'tourist' ? 'tourist-spots' : 'dining-spots';
    return safeFetch(`${API_BASE}/api/${endpoint}/${spotId}/reviews/${reviewId}/resolved`, {
        method: 'PUT',
        headers: getHeaders()
    });
};

export const markReportAsSeen = async (id: string) => {
    return safeFetch(`${API_BASE}/api/reports/${id}/seen`, {
        method: 'PUT',
        headers: getHeaders()
    });
};

export const markBlogPostAsSeen = async (id: string) => {
    return safeFetch(`${API_BASE}/api/blog-posts/${id}/seen`, {
        method: 'PUT',
        headers: getHeaders()
    });
};

export const trackEvent = async (
    eventType: 'click' | 'view' | 'filter' | 'submit',
    targetId: string,
    page: string,
    metadata?: Record<string, any>
) => {
    try {
        const payload = JSON.stringify({ eventType, targetId, page, metadata });
        if (navigator.sendBeacon) {
            const blob = new Blob([payload], { type: 'application/json' });
            navigator.sendBeacon(`${API_BASE}/api/v1/stats/log`, blob);
        } else {
            await fetch(`${API_BASE}/api/v1/stats/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload
            });
        }
    } catch (error) {}
};
