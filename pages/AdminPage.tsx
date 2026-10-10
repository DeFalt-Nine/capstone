import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    fetchTouristSpots, fetchDiningSpots, fetchBlogPosts, fetchLocalEvents, fetchReports,
    deleteItem, createItem, updateItem, deleteReview, deleteReport, verifyAdminToken,
    fetchAnalyticsSummary,
    fetchAnalyticsDebug,
    fetchAdminLogs,
    logoutAdmin,
    fetchSiteSettings,
    updateSiteSettings,
    markReviewAsSeen,
    markReviewAsResolved,
    markReportAsSeen,
    markBlogPostAsSeen,
    fetchJeepneyRoutes
} from '../services/apiService';
import AlertModal from '../components/AlertModal';
import ConfirmationModal from '../components/ConfirmationModal';
import { NAV_LINKS } from '../constants';
import AnimatedElement from '../components/AnimatedElement';
import UniversalImageSelector from '../components/UniversalImageSelector';

const TABS = [
    { id: 'tourist-spots', label: 'Tourist Spots', icon: 'fa-map-marked-alt' },
    { id: 'dining-spots', label: 'Dining', icon: 'fa-utensils' },
    { id: 'blog-posts', label: 'Blog Moderation', icon: 'fa-newspaper' },
    { id: 'events', label: 'Events', icon: 'fa-calendar-alt' },
    { id: 'reports', label: 'Reports', icon: 'fa-flag', badge: 'reports' },
    { id: 'site-settings', label: 'Home/About', icon: 'fa-cog' },
    { id: 'jeepney-routes', label: 'Jeepney Routes', icon: 'fa-bus' },
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
    { id: 'activity-log', label: 'Activity Log', icon: 'fa-history' }
];

const SPOT_CATEGORY_PRESETS = [
    'Agri-tourism',
    'Nature & Parks',
    'Cultural & Heritage',
    'Local Produce',
    'Ecotourism',
    'Adventure & Hiking',
    'Sightseeing'
];

const DINING_CATEGORY_PRESETS = [
    'Cordilleran & Filipino',
    'Cafe & Bakery',
    'Farm-to-Table',
    'Strawberry Treats',
    'Casual Dining',
    'Buffet'
];

const HOURS_PRESETS = [
    '6:00 AM - 5:00 PM Daily',
    '7:00 AM - 6:00 PM Daily',
    '8:00 AM - 5:00 PM Daily',
    '8:00 AM - 5:00 PM (Mon-Sat)',
    'Sunrise to Sunset',
    'Open 24 Hours'
];

const SPOT_TAG_PRESETS = [
    '🍓 Strawberry Picking',
    '🌸 Flower Gardens',
    '⛰️ Mountain View',
    '📸 Photography Spot',
    '👨‍👩‍👧 Family Friendly',
    '🚶 Guided Eco-Tour',
    '🛍️ Fresh Market',
    '☕ Mountain Cafe'
];

const EMERGENCY_FACILITY_PRESETS: { type: 'Hospital' | 'Police'; name: string; distance: string }[] = [
    { type: 'Hospital', name: 'Benguet General Hospital', distance: 'Km. 5, Poblacion (Approx. 5-10 min drive)' },
    { type: 'Hospital', name: 'Valley Emergency Clinic', distance: 'Poblacion, La Trinidad (Approx. 5 min drive)' },
    { type: 'Police', name: 'La Trinidad Municipal Police Station', distance: 'Km. 5, Poblacion (Approx. 5 min drive)' },
    { type: 'Police', name: 'Puguis Police Sub-Station', distance: 'Brgy. Puguis (Approx. 8 min drive)' },
    { type: 'Police', name: 'Pico Police Sub-Station', distance: 'Brgy. Pico (Approx. 5 min drive)' }
];

const AdminPage: React.FC = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [loginLoading, setLoginLoading] = useState(false);
    const [loginError, setLoginError] = useState<string | null>(null);
    const [accessCode, setAccessCode] = useState('');
    
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'tourist-spots';
    const detailId = searchParams.get('id');
    const isDetailView = !!detailId;
    
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [viewMode, setViewMode] = useState<'management' | 'preview'>('management');
    
    const [notifications, setNotifications] = useState({
        touristReviews: 0,
        diningReviews: 0,
        reports: 0,
        blogPosts: 0
    });
    const [previewUrl, setPreviewUrl] = useState('/');
    
    const [data, setData] = useState<any[]>([]);
    const [analyticsSummary, setAnalyticsSummary] = useState<any>(null);
    const [adminLogs, setAdminLogs] = useState<any[]>([]);
    const [siteSettingsForm, setSiteSettingsForm] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    // isModalOpen is no longer used — all editing is done via the full-screen detail view
    const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
    const [alertModal, setAlertModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        variant?: 'info' | 'success' | 'error' | 'warning';
        onClose?: () => void;
    }>({ isOpen: false, title: '', message: '' });

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        onCancel?: () => void;
        confirmLabel?: string;
        variant?: 'danger' | 'warning' | 'info';
    }>({ isOpen: false, title: '', message: '', onConfirm: () => {} });
    const [editItem, setEditItem] = useState<any | null>(null);
    const [formData, setFormData] = useState<any>({});
    
    const [detailSubView, setDetailSubView] = useState<'info' | 'reviews' | 'edit'>('info');
    const [detailItem, setDetailItem] = useState<any | null>(null);
    const [spotEditorTab, setSpotEditorTab] = useState<'basic' | 'media' | 'location' | 'safety'>('basic');
    const [formError, setFormError] = useState<string | null>(null);

    const setActiveTab = (tab: string) => {
        setSearchParams({ tab });
        setViewMode('management');
    };

    const setIsDetailView = (show: boolean) => {
        if (!show) {
            setSearchParams({ tab: activeTab });
        }
    };

    useEffect(() => {
        if (detailId && detailId !== 'new' && data.length > 0) {
            const item = data.find((i: any) => i._id === detailId);
            if (item) {
                setDetailItem(item);
                setEditItem(item);
                setFormData({ ...item });
            }
        } else if (detailId === 'new') {
            setDetailItem(null);
            setEditItem(null);
            setFormData({});
            setDetailSubView('edit');
        } else {
            setDetailItem(null);
            setEditItem(null);
        }
    }, [detailId, data]);

    useEffect(() => {
        const checkExistingAuth = async () => {
            const token = sessionStorage.getItem('adminToken');
            if (token) {
                try {
                    await verifyAdminToken(token);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Auth verification failed', err);
                    sessionStorage.removeItem('adminToken');
                    setIsAuthenticated(false);
                }
            }
            setIsVerifying(false);
        };
        checkExistingAuth();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadData(activeTab);
            fetchNotifications();
        }
    }, [activeTab, isAuthenticated]);

    const fetchNotifications = async () => {
        try {
            const [spots, dining, reports, blogPosts] = await Promise.all([
                fetchTouristSpots(),
                fetchDiningSpots(),
                fetchReports(),
                fetchBlogPosts('admin')
            ]);

            const touristReviews = spots.reduce((acc: any, spot: any) => {
                return acc + (spot.reviews?.filter((r: any) => !r.isSeen).length || 0);
            }, 0);

            const diningReviews = dining.reduce((acc: any, spot: any) => {
                return acc + (spot.reviews?.filter((r: any) => !r.isSeen).length || 0);
            }, 0);

            const newReports = reports.filter((r: any) => !r.isSeen).length;
            const newBlogPosts = blogPosts.filter((p: any) => !p.isSeen).length;

            setNotifications({
                touristReviews,
                diningReviews,
                reports: newReports,
                blogPosts: newBlogPosts
            });
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    // Inactivity Auto-Logout (10 minutes)
    useEffect(() => {
        if (!isAuthenticated) return;

        let timeout: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                handleLogout();
                setAlertModal({
                    isOpen: true,
                    title: "Session Expired",
                    message: "You have been logged out due to 10 minutes of inactivity.",
                    variant: 'warning'
                });
            }, 10 * 60 * 1000);
        };

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        const handleActivity = () => resetTimer();

        events.forEach(event => document.addEventListener(event, handleActivity));
        resetTimer();

        return () => {
            if (timeout) clearTimeout(timeout);
            events.forEach(event => document.removeEventListener(event, handleActivity));
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (activeTab === 'analytics' && isAuthenticated) {
            const fetchDebug = async () => {
                try {
                    const debugData = await fetchAnalyticsDebug();
                    console.log('[Debug Analytics] Latest Events:', debugData);
                } catch (err) {
                    console.error('Debug fetch failed', err);
                }
            };
            fetchDebug();
        }
    }, [activeTab, isAuthenticated]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);
        setLoginLoading(true);

        try {
            await verifyAdminToken(accessCode);
            sessionStorage.setItem('adminToken', accessCode);
            setIsAuthenticated(true);
            setAccessCode('');
        } catch (error: any) {
            setLoginError(error.message || 'Invalid access code. Please try again.');
        } finally {
            setLoginLoading(false);
        }
    };

    const handleLogout = React.useCallback(async () => {
        try {
            await logoutAdmin();
        } catch (err) {
            console.error('Logout error', err);
        }
        sessionStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setAccessCode('');
        setData([]);
        setIsLogoutConfirmOpen(false);
    }, []);

    const loadData = async (tab: string) => {
        setIsLoading(true);
        try {
            let result;
            if (tab === 'tourist-spots') result = await fetchTouristSpots();
            else if (tab === 'dining-spots') result = await fetchDiningSpots();
            else if (tab === 'blog-posts') result = await fetchBlogPosts('admin');
            else if (tab === 'events') result = await fetchLocalEvents();
            else if (tab === 'reports') result = await fetchReports();
            else if (tab === 'jeepney-routes') result = await fetchJeepneyRoutes();
            else if (tab === 'analytics') {
                result = await fetchAnalyticsSummary();
                setAnalyticsSummary(result);
                setData([]);
                setIsLoading(false);
                return;
            } else if (tab === 'activity-log') {
                result = await fetchAdminLogs();
                setAdminLogs(result);
                setData([]);
                setIsLoading(false);
                return;
            } else if (tab === 'site-settings') {
                setLoading(true);
                setError(null);
                try {
                    console.log('[Admin] Fetching site settings...');
                    result = await fetchSiteSettings();
                    console.log('[Admin] Site Settings Result:', result);
                    if (!result) {
                        throw new Error("Site settings returned empty from server.");
                    }
                    setSiteSettingsForm(result);
                    setData([]);
                } catch (err: any) {
                    console.error('[Admin] Failed to fetch site settings:', err);
                    setError(err.message || 'Failed to load site settings.');
                } finally {
                    setLoading(false);
                    setIsLoading(false);
                }
                return;
            }
            setData(result || []);
        } catch (error: any) {
            console.error('[Admin] loadData Error:', error);
            if (error.message.includes('403')) {
                handleLogout();
                setAlertModal({
                    isOpen: true,
                    title: "Session Expired",
                    message: "Your session has expired. Please login again.",
                    variant: 'warning'
                });
            } else {
                setAlertModal({
                    isOpen: true,
                    title: "Error Loading Data",
                    message: `Error loading data: ${error.message}`,
                    variant: 'error'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };


    
const formatDateRange = (start: string, end: string): string => {
    if (!start) return '';
    
    const startDate = new Date(start + 'T12:00:00'); // ← use noon not midnight
    const endDate = new Date(end + 'T12:00:00');     
    
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                        'July', 'August', 'September', 'October', 'November', 'December'];

    const startMonth = monthNames[startDate.getMonth()];
    const startDay = startDate.getDate();
    const startYear = startDate.getFullYear();

    const endMonth = monthNames[endDate.getMonth()];
    const endDay = endDate.getDate();
    const endYear = endDate.getFullYear();

    // Single day
    if (start === end || !end) {
        return `${startMonth} ${startDay}, ${startYear}`;
    }

    // Same month same year: "February 16 to 20, 2026"
    if (startMonth === endMonth && startYear === endYear) {
        return `${startMonth} ${startDay} to ${endDay}, ${endYear}`;
    }

    // Different months same year: "March 4 to April 1, 2026"
    if (startYear === endYear) {
        return `${startMonth} ${startDay} to ${endMonth} ${endDay}, ${endYear}`;
    }

    // Different years: "December 30, 2025 to January 2, 2026"
    return `${startMonth} ${startDay}, ${startYear} to ${endMonth} ${endDay}, ${endYear}`;
};

    const handleDelete = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Confirm Delete",
            message: "Are you sure you want to delete this item? This cannot be undone.",
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    if (activeTab === 'reports') {
                        await deleteReport(id);
                    } else {
                        await deleteItem(activeTab, id);
                    }
                    setData((prev: any[]) => prev.filter((item: any) => item._id !== id));
                    // Return to list view after deletion
                    setIsDetailView(false);
                } catch (error: any) {
                    setAlertModal({
                        isOpen: true,
                        title: "Operation Failed",
                        message: error.message || 'Operation failed.',
                        variant: 'error'
                    });
                }
            }
        });
    };

    const handleApprove = async (id: string) => {
        setConfirmModal({
            isOpen: true,
            title: "Approve Post",
            message: "Approve this post for public view?",
            variant: 'info',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    const updated = await updateItem(activeTab, id, { status: 'approved' });
                    setData((prev: any[]) => prev.map((item: any) => item._id === id ? updated : item));
                } catch (error: any) {
                    setAlertModal({
                        isOpen: true,
                        title: "Approval Failed",
                        message: error.message || 'Failed to approve.',
                        variant: 'error'
                    });
                }
            }
        });
    };

    // ─── Unified entry point: everything opens the full-screen detail panel ───
   const openDetailPanel = (item: any | null, subView: 'info' | 'reviews' | 'edit') => {
    setEditItem(item || null);
    const initialData = item ? { ...item } : {};
    
    // Ensure nested structures exist for jeepney-routes
    if (activeTab === 'jeepney-routes') {
        if (!initialData.signboard) initialData.signboard = { text: '', color: '', backgroundColor: '' };
        if (!initialData.terminal) initialData.terminal = { name: '', location: '' };
        if (!initialData.fare) initialData.fare = { minimum: 14, studentSenior: 11, fullRoute: 20 };
        if (!initialData.path) initialData.path = [];
    }

    setFormData(initialData);
    setFormError(null);
    setDetailItem(item);
    setDetailSubView(subView);
    setSpotEditorTab('basic');
    
    if (item?._id) {
        setSearchParams({ tab: activeTab, id: item._id });
    } else {
        setSearchParams({ tab: activeTab, id: 'new' });
    }

    // ── Parse existing date back into start/end for date pickers ──
    if (item?.date) {
        const rangeMatch = item.date.match(/^([A-Za-z]+)\s+(\d+)\s+to\s+(\d+),?\s*(\d{4})/i);
        const crossMatch = item.date.match(/^([A-Za-z]+\s+\d+),?\s*(\d{4})?\s+to\s+([A-Za-z]+\s+\d+),?\s*(\d{4})/i);

        if (rangeMatch) {
            const [, month, startDay, endDay, year] = rangeMatch;
            const pad = (n: string) => n.padStart(2, '0');
            const monthNum = new Date(`${month} 1, 2000`).getMonth() + 1;
            setFormData((prev: any) => ({
                ...prev,
                startDate: `${year}-${pad(String(monthNum))}-${pad(startDay)}`,
                endDate: `${year}-${pad(String(monthNum))}-${pad(endDay)}`
            }));
        } else if (crossMatch) {
            const startDate = new Date(`${crossMatch[1]}, ${crossMatch[4] || crossMatch[2]}`);
            const endDate = new Date(`${crossMatch[3]}, ${crossMatch[4]}`);
            if (!isNaN(startDate.getTime())) {
                setFormData((prev: any) => ({
                    ...prev,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: !isNaN(endDate.getTime()) ? endDate.toISOString().split('T')[0] : ''
                }));
            }
        } else {
            const single = new Date(item.date);
            if (!isNaN(single.getTime())) {
                setFormData((prev: any) => ({
                    ...prev,
                    startDate: single.toISOString().split('T')[0],
                    endDate: ''
                }));
            }
        }
    }

    // Auto-mark as seen if it's a report or blog post
    if (item && !item.isSeen) {
        if (activeTab === 'reports') {
            handleMarkReportSeen(item._id);
        } else if (activeTab === 'blog-posts') {
            handleMarkBlogPostSeen(item._id);
        }
    }
};

    const handleOpenModal      = (item?: any)  => openDetailPanel(item || null, item ? 'info' : 'edit');
    const handleEdit           = (item: any)   => openDetailPanel(item, 'edit');
    const handleOpenReviewModal = (item: any)  => openDetailPanel(item, 'reviews');
    const handleOpenDetailModal = (item: any)  => openDetailPanel(item, 'info');

    const handleDeleteReview = async (reviewId: string) => {
        if (!detailItem) return;
        setConfirmModal({
            isOpen: true,
            title: "Delete Review",
            message: "Delete this review? This is permanent.",
            variant: 'danger',
            onConfirm: async () => {
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
                try {
                    const type = activeTab === 'tourist-spots' ? 'tourist' : 'dining';
                    await deleteReview(type, detailItem._id, reviewId);
                    const updatedReviews = detailItem.reviews.filter((r: any) => r._id !== reviewId);
                    const updatedItem = { ...detailItem, reviews: updatedReviews };
                    setDetailItem(updatedItem);
                    setData((prev: any[]) => prev.map((item: any) => item._id === detailItem._id ? updatedItem : item));
                } catch (error: any) {
                    setAlertModal({
                        isOpen: true,
                        title: "Error",
                        message: error.message || "Failed to delete review.",
                        variant: 'error'
                    });
                }
            }
        });
    };

    const handleMarkReviewSeen = async (reviewId: string) => {
        if (!detailItem) return;
        try {
            const type = activeTab === 'tourist-spots' ? 'tourist' : 'dining';
            await markReviewAsSeen(type, detailItem._id, reviewId);
            const updatedReviews = detailItem.reviews.map((r: any) => r._id === reviewId ? { ...r, isSeen: true } : r);
            const updatedItem = { ...detailItem, reviews: updatedReviews };
            setDetailItem(updatedItem);
            setData((prev: any[]) => prev.map((item: any) => item._id === detailItem._id ? updatedItem : item));
            fetchNotifications();
        } catch (error) {
            console.error('Error marking review as seen:', error);
        }
    };

    const handleMarkReviewResolved = async (reviewId: string) => {
        if (!detailItem) return;
        try {
            const type = activeTab === 'tourist-spots' ? 'tourist' : 'dining';
            await markReviewAsResolved(type, detailItem._id, reviewId);
            const updatedReviews = detailItem.reviews.map((r: any) => r._id === reviewId ? { ...r, isSeen: true, isResolved: true } : r);
            const updatedItem = { ...detailItem, reviews: updatedReviews };
            setDetailItem(updatedItem);
            setData((prev: any[]) => prev.map((item: any) => item._id === detailItem._id ? updatedItem : item));
            fetchNotifications();
        } catch (error) {
            console.error('Error marking review as resolved:', error);
        }
    };

    const handleMarkReportSeen = async (reportId: string) => {
        try {
            await markReportAsSeen(reportId);
            setData((prev: any[]) => prev.map((d: any) => d._id === reportId ? { ...d, isSeen: true } : d));
            if (detailItem && detailItem._id === reportId) {
                setDetailItem({ ...detailItem, isSeen: true });
            }
            fetchNotifications();
        } catch (error) {
            console.error('Error marking report as seen:', error);
        }
    };

    const handleMarkBlogPostSeen = async (postId: string) => {
        try {
            await markBlogPostAsSeen(postId);
            setData((prev: any[]) => prev.map((d: any) => d._id === postId ? { ...d, isSeen: true } : d));
            if (detailItem && detailItem._id === postId) {
                setDetailItem({ ...detailItem, isSeen: true });
            }
            fetchNotifications();
        } catch (error) {
            console.error('Error marking blog post as seen:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            const payload = { ...formData };
            if (activeTab === 'tourist-spots' || activeTab === 'dining-spots' || activeTab === 'blog-posts') {
                if (typeof payload.tags === 'string') payload.tags = payload.tags.split(',').map((t: string) => t.trim());
                if (typeof payload.gallery === 'string') payload.gallery = payload.gallery.split(',').map((t: string) => t.trim());
            }

            if (editItem) {
                const updated = await updateItem(activeTab, editItem._id, payload);
                setData((prev: any[]) => prev.map((item: any) => item._id === editItem._id ? updated : item));
            } else {
                const created = await createItem(activeTab, payload);
                setData((prev: any[]) => [created, ...prev]);
            }
            setIsDetailView(false);
            setFormData({});
        } catch (error: any) {
            setFormError(error.message || 'Operation failed.');
        }
    };

    const renderSiteSettings = () => {
        console.log('[Admin] renderSiteSettings siteSettingsForm:', siteSettingsForm);
        
        if (loading && !siteSettingsForm) {
            return (
                <div className="p-32 text-center text-slate-400">
                    <i className="fas fa-circle-notch fa-spin text-4xl mb-4 text-lt-blue"></i>
                    <p className="text-sm font-medium">Loading site settings...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className="p-32 text-center text-slate-400">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-exclamation-triangle text-3xl text-red-400 opacity-60"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Failed to load settings</h3>
                    <p className="text-sm text-slate-500 mb-6">{error}</p>
                    <button 
                        onClick={() => loadData('site-settings')}
                        className="bg-lt-blue text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-lt-moss transition-all"
                    >
                        Retry Loading
                    </button>
                </div>
            );
        }

        if (!siteSettingsForm || !siteSettingsForm.home || !siteSettingsForm.about) {
            return (
                <div className="p-32 text-center text-slate-400">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <i className="fas fa-exclamation-triangle text-3xl opacity-20"></i>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">Settings not found</h3>
                    <p className="text-sm text-slate-500 mb-6">We couldn't retrieve the site settings. Please try refreshing.</p>
                    <button 
                        onClick={() => loadData('site-settings')}
                        className="bg-lt-blue text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-lt-moss transition-all"
                    >
                        Retry Loading
                    </button>
                </div>
            );
        }

        const handleSaveSettings = async () => {
            setIsLoading(true);
            try {
                const updated = await updateSiteSettings(siteSettingsForm);
                setSiteSettingsForm(updated);
                setAlertModal({
                    isOpen: true,
                    title: "Success",
                    message: 'Site settings updated successfully!',
                    variant: 'success'
                });
            } catch (error: any) {
                setAlertModal({
                    isOpen: true,
                    title: "Update Failed",
                    message: error.message || 'Failed to update settings.',
                    variant: 'error'
                });
            } finally {
                setIsLoading(false);
            }
        };

        const updateHomeField = (field: string, value: any) => {
            setSiteSettingsForm({
                ...siteSettingsForm,
                home: { ...siteSettingsForm.home, [field]: value }
            });
        };

        const updateAboutField = (field: string, value: any) => {
            setSiteSettingsForm({
                ...siteSettingsForm,
                about: { ...siteSettingsForm.about, [field]: value }
            });
        };

        const updateJourneyItem = (index: number, field: string, value: string) => {
            const newJourney = [...(siteSettingsForm.about.journeyThroughTime || [])];
            newJourney[index] = { ...newJourney[index], [field]: value };
            updateAboutField('journeyThroughTime', newJourney);
        };

        const addJourneyItem = () => {
            const newJourney = [...(siteSettingsForm.about.journeyThroughTime || []), { year: '', title: '', content: '', image: '' }];
            updateAboutField('journeyThroughTime', newJourney);
        };

        const removeJourneyItem = (index: number) => {
            const newJourney = siteSettingsForm.about.journeyThroughTime.filter((_: any, i: number) => i !== index);
            updateAboutField('journeyThroughTime', newJourney);
        };

        const updateOfficial = (index: number, field: string, value: string) => {
            const newOfficials = [...(siteSettingsForm.about.localGovernment?.officials || [])];
            newOfficials[index] = { ...newOfficials[index], [field]: value };
            setSiteSettingsForm({
                ...siteSettingsForm,
                about: {
                    ...siteSettingsForm.about,
                    localGovernment: {
                        ...siteSettingsForm.about.localGovernment,
                        officials: newOfficials
                    }
                }
            });
        };

        const addOfficial = () => {
            const newOfficials = [...(siteSettingsForm.about.localGovernment?.officials || []), { name: '', position: '', image: '' }];
            setSiteSettingsForm({
                ...siteSettingsForm,
                about: {
                    ...siteSettingsForm.about,
                    localGovernment: {
                        ...siteSettingsForm.about.localGovernment,
                        officials: newOfficials
                    }
                }
            });
        };

        const removeOfficial = (index: number) => {
            const newOfficials = siteSettingsForm.about.localGovernment.officials.filter((_: any, i: number) => i !== index);
            setSiteSettingsForm({
                ...siteSettingsForm,
                about: {
                    ...siteSettingsForm.about,
                    localGovernment: {
                        ...siteSettingsForm.about.localGovernment,
                        officials: newOfficials
                    }
                }
            });
        };

        const updateHomeHeroImage = (index: number, field: string, value: string) => {
            const newImages = [...siteSettingsForm.home.heroImages];
            newImages[index] = { ...newImages[index], [field]: value };
            updateHomeField('heroImages', newImages);
        };

        return (
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Home & About Content</h2>
                        <p className="text-slate-500 text-sm">Edit titles, text, and images for Home and About pages.</p>
                    </div>
                    <button 
                        onClick={handleSaveSettings}
                        disabled={isLoading}
                        className="bg-lt-blue hover:bg-lt-moss text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-lt-blue/20 transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>}
                        Save All Changes
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Home Page Settings */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-lt-yellow/10 text-lt-yellow flex items-center justify-center">
                                    <i className="fas fa-home"></i>
                                </div>
                                <h3 className="font-bold text-slate-800">Home Page Content</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Welcome Text</label>
                                    <input 
                                        type="text" 
                                        value={siteSettingsForm.home.heroWelcomeText}
                                        onChange={(e) => updateHomeField('heroWelcomeText', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-yellow/20 focus:border-lt-yellow outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Title</label>
                                    <input 
                                        type="text" 
                                        value={siteSettingsForm.home.heroTitle}
                                        onChange={(e) => updateHomeField('heroTitle', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-yellow/20 focus:border-lt-yellow outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Subtitle</label>
                                    <textarea 
                                        rows={3}
                                        value={siteSettingsForm.home.heroSubtitle}
                                        onChange={(e) => updateHomeField('heroSubtitle', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-yellow/20 focus:border-lt-yellow outline-none transition-all resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-lt-orange/10 text-lt-orange flex items-center justify-center">
                                    <i className="fas fa-images"></i>
                                </div>
                                <h3 className="font-bold text-slate-800">Home Hero Slideshow</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {Array.isArray(siteSettingsForm.home.heroImages) && siteSettingsForm.home.heroImages.map((img: any, idx: number) => (
                                    <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-slate-800 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-md z-10 border border-white">
                                            {idx + 1}
                                        </span>
                                        <div className="space-y-2">
                                            <UniversalImageSelector 
                                                currentImage={img.url}
                                                onImageSelected={(url) => updateHomeHeroImage(idx, 'url', url)}
                                                label={`Slide ${idx + 1}`}
                                                aspectRatio={16/9}
                                            />
                                            <div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Alt Text"
                                                    value={img.alt}
                                                    onChange={(e) => updateHomeHeroImage(idx, 'alt', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-1.5 text-[10px] focus:ring-2 focus:ring-lt-orange/20 focus:border-lt-orange outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* About Page Settings */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-lt-blue/10 text-lt-blue flex items-center justify-center">
                                    <i className="fas fa-info-circle"></i>
                                </div>
                                <h3 className="font-bold text-slate-800">About Page Content</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Title</label>
                                    <input 
                                        type="text" 
                                        value={siteSettingsForm.about.heroTitle}
                                        onChange={(e) => updateAboutField('heroTitle', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-blue/20 focus:border-lt-blue outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Subtitle</label>
                                    <textarea 
                                        rows={2}
                                        value={siteSettingsForm.about.heroSubtitle}
                                        onChange={(e) => updateAboutField('heroSubtitle', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-blue/20 focus:border-lt-blue outline-none transition-all resize-none"
                                    />
                                </div>
                                <div>
                                    <UniversalImageSelector 
                                        currentImage={siteSettingsForm.about.heroImage}
                                        onImageSelected={(url) => updateAboutField('heroImage', url)}
                                        label="Hero Background Image"
                                        aspectRatio={16/9}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                                <div className="w-10 h-10 rounded-full bg-lt-moss/10 text-lt-moss flex items-center justify-center">
                                    <i className="fas fa-book-open"></i>
                                </div>
                                <h3 className="font-bold text-slate-800">Our Story Section</h3>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Story Title</label>
                                    <input 
                                        type="text" 
                                        value={siteSettingsForm.about.storyTitle}
                                        onChange={(e) => updateAboutField('storyTitle', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-moss/20 focus:border-lt-moss outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Story Content</label>
                                    <textarea 
                                        rows={8}
                                        value={siteSettingsForm.about.storyContent}
                                        onChange={(e) => updateAboutField('storyContent', e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-moss/20 focus:border-lt-moss outline-none transition-all resize-none leading-relaxed"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-2 italic">Tip: Use double newlines to separate paragraphs.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Journey Through Time */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
                        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-lt-blue/10 text-lt-blue flex items-center justify-center">
                                    <i className="fas fa-history"></i>
                                </div>
                                <h3 className="font-bold text-slate-800">Journey Through Time (Timeline)</h3>
                            </div>
                            <button 
                                onClick={addJourneyItem}
                                className="text-xs font-bold text-lt-blue hover:text-lt-moss flex items-center gap-1"
                            >
                                <i className="fas fa-plus-circle"></i> Add Year
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(siteSettingsForm.about.journeyThroughTime || []).map((item: any, idx: number) => (
                                <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group flex flex-col">
                                    <button 
                                        onClick={() => removeJourneyItem(idx)}
                                        className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors z-20"
                                    >
                                        <i className="fas fa-times-circle text-lg"></i>
                                    </button>
                                    
                                    <div className="mb-3">
                                        <UniversalImageSelector 
                                            currentImage={item.image}
                                            onImageSelected={(url) => updateJourneyItem(idx, 'image', url)}
                                            label={`Event ${idx + 1}`}
                                            aspectRatio={16/9}
                                        />
                                    </div>

                                    <div className="space-y-2 flex-grow">
                                        <div className="flex gap-2">
                                            <div className="w-20 flex-shrink-0">
                                                <input 
                                                    type="text" 
                                                    value={item.year}
                                                    onChange={(e) => updateJourneyItem(idx, 'year', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-black outline-none focus:border-lt-blue text-center"
                                                    placeholder="Year"
                                                />
                                            </div>
                                            <input 
                                                type="text" 
                                                value={item.title}
                                                onChange={(e) => updateJourneyItem(idx, 'title', e.target.value)}
                                                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none focus:border-lt-blue"
                                                placeholder="Title"
                                            />
                                        </div>
                                        <textarea 
                                            rows={3}
                                            value={item.content}
                                            onChange={(e) => updateJourneyItem(idx, 'content', e.target.value)}
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] outline-none focus:border-lt-blue resize-none leading-snug h-20"
                                            placeholder="Content..."
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Local Government */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 mt-8">
                        <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-lt-yellow/10 text-lt-yellow flex items-center justify-center">
                                <i className="fas fa-landmark"></i>
                            </div>
                            <h3 className="font-bold text-slate-800">Local Government Section</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="md:col-span-3 space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Section Title</label>
                                    <input 
                                        type="text" 
                                        value={siteSettingsForm.about.localGovernment?.title || ''}
                                        onChange={(e) => setSiteSettingsForm({
                                            ...siteSettingsForm,
                                            about: {
                                                ...siteSettingsForm.about,
                                                localGovernment: { ...siteSettingsForm.about.localGovernment, title: e.target.value }
                                            }
                                        })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-lt-yellow font-bold text-slate-700"
                                        placeholder="e.g. Capital of Benguet"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Government Description / Story</label>
                                    <textarea 
                                        rows={4}
                                        value={siteSettingsForm.about.localGovernment?.content || ''}
                                        onChange={(e) => setSiteSettingsForm({
                                            ...siteSettingsForm,
                                            about: {
                                                ...siteSettingsForm.about,
                                                localGovernment: { ...siteSettingsForm.about.localGovernment, content: e.target.value }
                                            }
                                        })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-lt-yellow resize-none leading-relaxed"
                                        placeholder="Describe the LGU structure, vision, or history..."
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-1 pt-5">
                                <UniversalImageSelector 
                                    currentImage={siteSettingsForm.about.localGovernment?.image}
                                    onImageSelected={(url) => setSiteSettingsForm({
                                        ...siteSettingsForm,
                                        about: {
                                            ...siteSettingsForm.about,
                                            localGovernment: { ...siteSettingsForm.about.localGovernment, image: url }
                                        }
                                    })}
                                    label="LGU Logo / Seal"
                                    aspectRatio={1}
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100">
                             <div className="flex items-center justify-between mb-4">
                                 <div>
                                     <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Government Officials</label>
                                     <p className="text-[10px] text-slate-400 mt-0.5">Add key members of the municipal leadership.</p>
                                 </div>
                                 <button 
                                     onClick={addOfficial}
                                     className="px-3 py-1.5 bg-lt-yellow/10 text-lt-yellow rounded-lg text-[10px] font-bold hover:bg-lt-yellow hover:text-white transition-all flex items-center gap-1.5 border border-lt-yellow/20"
                                 >
                                     <i className="fas fa-plus-circle"></i> Add Official
                                 </button>
                             </div>
                             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                 {(siteSettingsForm.about.localGovernment?.officials || []).map((official: any, idx: number) => (
                                            <div key={idx} className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm relative group">
                                                <button 
                                                    onClick={() => removeOfficial(idx)}
                                                    className="absolute top-1.5 right-1.5 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all z-10"
                                                >
                                                    <i className="fas fa-times-circle text-[10px]"></i>
                                                </button>
                                                <div className="flex gap-3 items-center">
                                                    <UniversalImageSelector 
                                                        currentImage={official.image}
                                                        onImageSelected={(url) => updateOfficial(idx, 'image', url)}
                                                        label=""
                                                        aspectRatio={1}
                                                        className="w-16 flex-shrink-0"
                                                    />
                                                    <div className="flex-1 space-y-1.5">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Name"
                                                            value={official.name}
                                                            onChange={(e) => updateOfficial(idx, 'name', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-[11px] outline-none focus:border-lt-yellow"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Position"
                                                            value={official.position}
                                                            onChange={(e) => updateOfficial(idx, 'position', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded px-2 py-0.5 text-[10px] outline-none focus:border-lt-yellow italic"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
        );
    };

    const renderAnalyticsDashboard = () => {
        if (!analyticsSummary) return null;

        const { summary, topTouristSpots, topDiningSpots, topBlogPosts, avgDwellTime, recentActivity } = analyticsSummary;

        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-lt-blue/10 text-lt-blue rounded-xl flex items-center justify-center">
                                <i className="fas fa-map-marked-alt text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tourist Spot Views</p>
                                <h3 className="text-2xl font-bold text-slate-900">{summary.totalTouristSpotViews}</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-lt-blue" style={{ width: '70%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-lt-moss/10 text-lt-moss rounded-xl flex items-center justify-center">
                                <i className="fas fa-utensils text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dining Spot Views</p>
                                <h3 className="text-2xl font-bold text-slate-900">{summary.totalDiningSpotViews || 0}</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-lt-moss" style={{ width: '50%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-lt-orange/10 text-lt-orange rounded-xl flex items-center justify-center">
                                <i className="fas fa-newspaper text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blog Post Views</p>
                                <h3 className="text-2xl font-bold text-slate-900">{summary.totalBlogPostViews}</h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-lt-orange" style={{ width: '45%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
                                <i className="fas fa-clock text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Avg. Dwell Time</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {avgDwellTime.length > 0 
                                        ? `${Math.round(avgDwellTime.reduce((acc: number, curr: any) => acc + curr.avgDuration, 0) / avgDwellTime.length)}s`
                                        : '0s'}
                                </h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '60%' }}></div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                                <i className="fas fa-users text-xl"></i>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Interactions</p>
                                <h3 className="text-2xl font-bold text-slate-900">
                                    {(summary.totalTouristSpotViews || 0) + (summary.totalDiningSpotViews || 0) + (summary.totalBlogPostViews || 0)}
                                </h3>
                            </div>
                        </div>
                        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: '85%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <i className="fas fa-trophy text-lt-orange"></i>
                                Top Performing Content
                            </h3>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Tourist Spots</h4>
                                <div className="space-y-4">
                                    {topTouristSpots.map((spot: any, index: number) => (
                                        <div key={spot._id} className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-slate-300 w-4">{index + 1}</div>
                                            <img src={spot.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{spot.name}</p>
                                                <p className="text-[10px] text-slate-400">{spot.views} views</p>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-lt-blue" style={{ width: `${(spot.views / topTouristSpots[0].views) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Dining Spots</h4>
                                <div className="space-y-4">
                                    {topDiningSpots && topDiningSpots.length > 0 ? topDiningSpots.map((spot: any, index: number) => (
                                        <div key={spot._id} className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-slate-300 w-4">{index + 1}</div>
                                            <img src={spot.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{spot.name}</p>
                                                <p className="text-[10px] text-slate-400">{spot.views} views</p>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-lt-moss" style={{ width: `${topDiningSpots[0]?.views > 0 ? (spot.views / topDiningSpots[0].views) * 100 : 0}%` }}></div>
                                            </div>
                                        </div>
                                    )) : (
                                        <p className="text-xs text-slate-400 italic">No dining spot data yet</p>
                                    )}
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Blog Posts</h4>
                                <div className="space-y-4">
                                    {topBlogPosts.map((post: any, index: number) => (
                                        <div key={post._id} className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-slate-300 w-4">{index + 1}</div>
                                            <img src={post.image} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 truncate">{post.title}</p>
                                                <p className="text-[10px] text-slate-400">{post.views} views</p>
                                            </div>
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-lt-orange" style={{ width: `${(post.views / topBlogPosts[0].views) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="fas fa-hourglass-half text-lt-blue"></i>
                                    Average Dwell Time by Page
                                </h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {avgDwellTime.map((item: any) => (
                                        <div key={item._id} className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-xs font-bold text-slate-700 truncate">{item._id}</p>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                                    <div className="h-full bg-lt-blue" style={{ width: `${Math.min((item.avgDuration / 120) * 100, 100)}%` }}></div>
                                                </div>
                                            </div>
                                            <div className="ml-4 text-right">
                                                <p className="text-xs font-bold text-slate-900">{Math.round(item.avgDuration)}s</p>
                                                <p className="text-[9px] text-slate-400">{item.totalEvents} samples</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="p-6 border-b border-slate-100">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <i className="fas fa-history text-slate-400"></i>
                                    Recent Activity
                                </h3>
                            </div>
                            <div className="p-0">
                                {recentActivity.map((event: any) => (
                                    <div key={event._id} className="p-4 border-b border-slate-50 last:border-0 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                                            event.eventType === 'view' ? 'bg-blue-50 text-blue-600' :
                                            event.eventType === 'dwell' ? 'bg-green-50 text-green-600' :
                                            event.eventType === 'click' ? 'bg-orange-50 text-orange-600' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                            <i className={`fas ${
                                                event.eventType === 'view' ? 'fa-eye' :
                                                event.eventType === 'dwell' ? 'fa-clock' :
                                                event.eventType === 'click' ? 'fa-mouse-pointer' :
                                                'fa-fingerprint'
                                            }`}></i>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 truncate">
                                                {event.eventType === 'view' ? 'Page View' : 
                                                 event.eventType === 'dwell' ? 'Dwell Time' : 
                                                 event.eventType === 'click' ? 'Interaction' : 
                                                 'Event'} on {event.page}
                                            </p>
                                            <p className="text-[10px] text-slate-400">
                                                {new Date(event.timestamp).toLocaleTimeString()} • {event.duration ? `${event.duration}s` : (event.targetId ? `ID: ${event.targetId.substring(0, 10)}...` : 'Interaction')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderActivityLog = () => {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-500">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <i className="fas fa-history text-lt-blue"></i>
                        Administrative Activity Log
                    </h3>
                    <button 
                        onClick={() => loadData('activity-log')}
                        className="text-xs font-bold text-lt-blue hover:underline flex items-center gap-1"
                    >
                        <i className="fas fa-sync-alt"></i> Refresh
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
                            <tr>
                                <th className="p-5">Time</th>
                                <th className="p-5">Action</th>
                                <th className="p-5">Target Type</th>
                                <th className="p-5">Target Name</th>
                                <th className="p-5">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {adminLogs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-10 text-center text-slate-400 text-sm">
                                        No activity logs found.
                                    </td>
                                </tr>
                            ) : (
                                adminLogs.map((log: any) => (
                                    <tr key={log._id} className="hover:bg-slate-50/30 transition-colors">
                                        <td className="p-5 text-xs text-slate-500 whitespace-nowrap">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </td>
                                        <td className="p-5">
                                            <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${
                                                log.action === 'login' ? 'bg-green-50 text-green-600 border-green-200' :
                                                log.action === 'delete' || log.action === 'reject' ? 'bg-red-50 text-red-600 border-red-200' :
                                                log.action === 'create' || log.action === 'approve' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                'bg-slate-50 text-slate-600 border-slate-200'
                                            }`}>
                                                {(log.action || 'unknown').replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="p-5 text-xs font-bold text-slate-700 capitalize">
                                            {(log.targetType || 'system').replace('-', ' ')}
                                        </td>
                                        <td className="p-5 text-xs text-slate-800 font-medium">
                                            {log.targetName || '-'}
                                        </td>
                                        <td className="p-5 text-xs text-slate-500 max-w-xs truncate">
                                            {log.details}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    const renderJeepneyPathEditor = () => {
        const path = (formData.path as any[]) || [];

        const addStop = () => {
            const newPath = [...path, { stop: '', isLandmark: false, landmarkIcon: 'fas fa-map-marker-alt' }];
            setFormData({ ...formData, path: newPath });
        };

        const removeStop = (index: number) => {
            const newPath = path.filter((_, i) => i !== index);
            setFormData({ ...formData, path: newPath });
        };

        const updateStop = (index: number, field: string, value: any) => {
            const newPath = [...path];
            newPath[index] = { ...newPath[index], [field]: value };
            setFormData({ ...formData, path: newPath });
        };

        const moveStop = (index: number, direction: 'up' | 'down') => {
            if (direction === 'up' && index === 0) return;
            if (direction === 'down' && index === path.length - 1) return;
            
            const newPath = [...path];
            const targetIndex = direction === 'up' ? index - 1 : index + 1;
            const temp = newPath[index];
            newPath[index] = newPath[targetIndex];
            newPath[targetIndex] = temp;
            setFormData({ ...formData, path: newPath });
        };

        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center mb-2">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Route Path & Stops</p>
                        <p className="text-[10px] text-slate-500 mt-1">Define the sequence of stops and highlight major landmarks.</p>
                    </div>
                    <button 
                        type="button"
                        onClick={addStop}
                        className="bg-lt-blue text-white px-4 py-2 rounded-xl text-xs font-bold shadow-md hover:bg-lt-blue/90 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <i className="fas fa-plus-circle"></i>
                        Add Stop
                    </button>
                </div>

                <div className="space-y-3">
                    {path.length === 0 && (
                        <div className="py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                            <i className="fas fa-route text-slate-200 text-3xl mb-2"></i>
                            <p className="text-xs text-slate-400">No stops added yet. Click "Add Stop" to begin.</p>
                        </div>
                    )}
                    
                    {path.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 group animate-in slide-in-from-left-2 duration-300">
                            {/* Reorder Buttons */}
                            <div className="flex flex-col gap-1">
                                <button type="button" onClick={() => moveStop(idx, 'up')} className="text-slate-400 hover:text-lt-blue disabled:opacity-20" disabled={idx === 0}>
                                    <i className="fas fa-chevron-up text-[10px]"></i>
                                </button>
                                <button type="button" onClick={() => moveStop(idx, 'down')} className="text-slate-400 hover:text-lt-blue disabled:opacity-20" disabled={idx === path.length - 1}>
                                    <i className="fas fa-chevron-down text-[10px]"></i>
                                </button>
                            </div>

                            <div className="flex-grow grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
                                <div className="md:col-span-2">
                                    <input 
                                        type="text" 
                                        value={item.stop} 
                                        onChange={(e) => updateStop(idx, 'stop', e.target.value)}
                                        placeholder="Stop Name (e.g. Km. 4 Tiong San)"
                                        className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-lt-blue outline-none"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="checkbox" 
                                        id={`landmark-${idx}`}
                                        checked={item.isLandmark} 
                                        onChange={(e) => updateStop(idx, 'isLandmark', e.target.checked)}
                                        className="w-4 h-4 text-lt-blue border-slate-300 rounded focus:ring-lt-blue"
                                    />
                                    <label htmlFor={`landmark-${idx}`} className="text-xs font-bold text-slate-600 cursor-pointer">Landmark?</label>
                                </div>
                                {item.isLandmark && (
                                    <div className="relative">
                                        <select 
                                            value={item.landmarkIcon || 'fas fa-star'} 
                                            onChange={(e) => updateStop(idx, 'landmarkIcon', e.target.value)}
                                            className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-lt-blue outline-none"
                                        >
                                            <option value="fas fa-star">⭐ Major Landmark</option>
                                            <option value="fas fa-shopping-bag">🛍️ Market / Mall</option>
                                            <option value="fas fa-hospital">🏥 Hospital / Clinic</option>
                                            <option value="fas fa-graduation-cap">🎓 School / University</option>
                                            <option value="fas fa-church">⛪ Church / Chapel</option>
                                            <option value="fas fa-tree">🌲 Park / Viewpoint</option>
                                            <option value="fas fa-utensils">🍽️ Food Hub</option>
                                        </select>
                                    </div>
                                )}
                            </div>

                            <button 
                                type="button"
                                onClick={() => removeStop(idx)}
                                className="w-8 h-8 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                            >
                                <i className="fas fa-trash-alt text-[10px]"></i>
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const renderInput = (key: string, label: string, type: string = 'text', placeholder: string = ''): React.ReactElement => {
        // Support nested property access like 'signboard.text'
        const getValue = (obj: any, path: string) => {
            return path.split('.').reduce((acc, part) => acc && acc[part], obj);
        };

        const updateValue = (obj: any, path: string, value: any) => {
            const keys = path.split('.');
            const newObj = { ...obj };
            let current = newObj;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return newObj;
        };

        const value = getValue(formData, key) || '';
        
        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const val = e.target.value;
            if (key.includes('.')) {
                setFormData(updateValue(formData, key, val));
            } else {
                setFormData({ ...formData, [key]: val });
            }
        };

        return (
            <div className="mb-4">
                <label className="block text-sm font-bold text-slate-700 mb-1 tracking-tight">{label}</label>
                {type === 'textarea' ? (
                    <textarea 
                        value={value} 
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                        rows={4}
                        placeholder={placeholder}
                    />
                ) : (
                    <input 
                        type={type} 
                        value={value} 
                        onChange={handleChange}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                        placeholder={placeholder}
                    />
                )}
            </div>
        );
    };

    const renderGalleryInput = (label: string): React.ReactElement => {
        const gallery = formData.gallery || [];
        
        const addGalleryItem = (url: string) => {
            if (!url) return;
            if (gallery.length >= 5) return;
            setFormData({ ...formData, gallery: [...gallery, url] });
        };

        const removeGalleryItem = (index: number) => {
            const newGallery = [...gallery];
            newGallery.splice(index, 1);
            setFormData({ ...formData, gallery: newGallery });
        };

        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                <div className="flex justify-between items-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label} ({gallery.length} / 5)</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {gallery.map((img: string, i: number) => (
                        <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => removeGalleryItem(i)}
                                className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                            >
                                <i className="fas fa-times text-[10px]"></i>
                            </button>
                        </div>
                    ))}
                    
                    {gallery.length < 5 && (
                        <UniversalImageSelector 
                            onImageSelected={addGalleryItem}
                            aspectRatio={1}
                            label=""
                            className="aspect-square"
                        />
                    )}
                </div>
                <p className="text-[10px] text-slate-400 italic">Upload or link an image to add it to the gallery.</p>
            </div>
        );
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Full-screen detail / edit panel — replaces the entire main content area.
    // No modal, no overlay.  The sidebar collapses automatically via CSS when
    // isDetailView is true (see `aside` className below).
    // ─────────────────────────────────────────────────────────────────────────
    const renderDetailView = () => {
        if (!detailItem && detailSubView !== 'edit') return null;
        
        const isNew = !detailItem && detailSubView === 'edit';
        const item = detailItem || {};
        
        const fields = Object.entries(item).filter(([key]) => ![
            '_id', 'id', '__v', 'updatedAt', 'updated_at', 'createdAt', 'created_at',
            'reviews', 'image', 'gallery', 'targetId', 'is_seen', 'isSeen',
            'mapEmbedUrl', 'map_embed_url', 'views'
        ].includes(key));

        const renderValue = (key: string, value: any) => {
            if (value === undefined || value === null || value === '') {
                return <span className="text-slate-400 italic text-xs">Not specified</span>;
            }
            if (key === 'tags') {
                const tagList = Array.isArray(value) ? value : typeof value === 'string' ? value.split(',') : [];
                return (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                        {tagList.map((tag: any, idx: number) => (
                            <span key={idx} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                                {String(tag).trim()}
                            </span>
                        ))}
                    </div>
                );
            }
            if (key === 'location') {
                return (
                    <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <i className="fas fa-map-marker-alt text-lt-blue text-sm"></i>
                        <span>{String(value)}</span>
                    </div>
                );
            }
            if (key === 'nearbyEmergency' && Array.isArray(value)) {
                return (
                    <div className="grid grid-cols-1 gap-2 mt-1">
                        {value.map((em: any, idx: number) => (
                            <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${em.type === 'Hospital' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    <i className={`fas ${em.type === 'Hospital' ? 'fa-hospital' : 'fa-shield-alt'}`}></i>
                                </span>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-800 leading-tight">{em.name}</p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{em.distance || em.type}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
            if (key === 'terminal' && typeof value === 'object') {
                return (
                    <div className="flex items-center gap-2.5 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                        <i className="fas fa-map-marker-alt text-lt-blue text-sm"></i>
                        <div>
                            <p className="text-xs font-bold text-slate-800">{value.name || 'Terminal'}</p>
                            {value.location && <p className="text-[10px] text-slate-500">{value.location}</p>}
                        </div>
                    </div>
                );
            }
            if (key === 'signboard' && typeof value === 'object') {
                return (
                    <div 
                        className="inline-flex px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-black uppercase shadow-xs tracking-tight"
                        style={{ backgroundColor: value.backgroundColor || '#000', color: value.color || '#fff' }}
                    >
                        {value.text || 'Signboard'}
                    </div>
                );
            }
            if (key === 'fare' && typeof value === 'object') {
                return (
                    <div className="flex gap-2">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-bold">Min: ₱{value.minimum}</span>
                        <span className="px-2.5 py-1 bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold">Full: ₱{value.fullRoute}</span>
                    </div>
                );
            }
            if (Array.isArray(value)) {
                return (
                    <div className="flex flex-wrap gap-1.5">
                        {value.map((item, i) => (
                            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200">
                                {typeof item === 'object' ? (item.stop || item.name || 'Item') : String(item)}
                            </span>
                        ))}
                    </div>
                );
            }
            if (typeof value === 'object' && value !== null) {
                return (
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                        {Object.entries(value).map(([subK, subV]) => (
                            <div key={subK} className="flex justify-between gap-2 border-b border-slate-100 last:border-none pb-1 last:pb-0">
                                <span className="font-semibold text-slate-500 capitalize">{subK.replace(/([A-Z])/g, ' $1')}:</span>
                                <span className="text-slate-800 font-bold">{String(subV)}</span>
                            </div>
                        ))}
                    </div>
                );
            }
            if (key.toLowerCase().includes('date') || key === 'createdAt') {
                const parsed = new Date(value);
                return (
                    <span className="text-slate-700 font-medium">
                        {!isNaN(parsed.getTime()) && key !== 'date' 
                            ? parsed.toLocaleString() 
                            : value}
                    </span>
                );
            }
            if (key === 'status') {
                const colors: any = { approved: 'bg-emerald-100 text-emerald-700', pending: 'bg-amber-100 text-amber-700', rejected: 'bg-red-100 text-red-700' };
                return <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${colors[value] || 'bg-slate-100 text-slate-600'}`}>{value}</span>;
            }
            return <span className="text-slate-700 leading-relaxed text-sm font-medium">{String(value)}</span>;
        };

        return (
            <div className="h-full flex flex-col bg-slate-50">
                {/* ── Slide-over header ──────────────────────────────────── */}
                <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-4 min-w-0">
                        {/* Close button */}
                        <button 
                            onClick={() => setIsDetailView(false)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors shrink-0"
                            title="Close Panel"
                        >
                            <i className="fas fa-times text-sm"></i>
                        </button>

                        <div className="min-w-0">
                            <h3 className="font-bold text-slate-900 text-base leading-tight truncate">
                                {isNew 
                                    ? `New ${TABS.find(t => t.id === activeTab)?.label.replace(/s$/, '')}` 
                                    : (item.name || item.title || item.targetName || item.key || 'Record Details')}
                            </h3>
                            {!isNew && (
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
                                    ID: {item._id} &nbsp;·&nbsp; {item.updatedAt || item.createdAt ? new Date(item.updatedAt || item.createdAt).toLocaleDateString() : 'Active'}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                        {/* Sub-view tabs (only for non-reports) */}
                        {activeTab !== 'reports' && (
                            <nav className="flex bg-slate-100 p-1 rounded-xl gap-1">
                                {!isNew && (
                                    <>
                                        <button 
                                            onClick={() => setDetailSubView('info')}
                                            className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${detailSubView === 'info' ? 'bg-white text-lt-blue shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                        >
                                            Details
                                        </button>
                                        {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                            <button 
                                                onClick={() => setDetailSubView('reviews')}
                                                className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${detailSubView === 'reviews' ? 'bg-white text-lt-blue shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                            >
                                                Reviews ({item.reviews?.length || 0})
                                            </button>
                                        )}
                                    </>
                                )}
                                <button 
                                    onClick={() => setDetailSubView('edit')}
                                    className={`px-3 py-1.5 text-xs rounded-lg font-bold transition-all ${detailSubView === 'edit' ? 'bg-white text-lt-blue shadow-xs' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                >
                                    {isNew ? 'Create' : 'Edit'}
                                </button>
                            </nav>
                        )}
                        
                        {!isNew && (
                            <button 
                                onClick={() => handleDelete(item._id)}
                                className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                title="Delete Record"
                            >
                                <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Scrollable content ────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {activeTab === 'reports' ? (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reported Destination</span>
                                    <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-slate-100 text-slate-800 border border-slate-200">
                                        {item.targetType || item.category || 'TouristSpot'}
                                    </span>
                                </div>
                                <div>
                                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">
                                        {item.targetName || item.name || 'Tourist Destination'}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500 font-medium">
                                        <span className="flex items-center gap-1.5">
                                            <i className="fas fa-calendar-alt text-slate-400"></i>
                                            {item.createdAt || item.created_at ? new Date(item.createdAt || item.created_at).toLocaleString() : 'Recently Submitted'}
                                        </span>
                                        {(item.email || item.name) && (
                                            <>
                                                <span>·</span>
                                                <span className="flex items-center gap-1.5">
                                                    <i className="fas fa-user text-slate-400"></i>
                                                    {item.name || 'Visitor'} {item.email ? `(${item.email})` : ''}
                                                </span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-6 shadow-xs space-y-3">
                                <div className="flex items-center gap-2 text-amber-900 text-xs font-black uppercase tracking-wider">
                                    <i className="fas fa-flag text-amber-600"></i>
                                    <span>Issue Reason: <strong className="text-amber-950 font-black underline">{item.reason || item.subject || 'Inaccurate Information'}</strong></span>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1.5">Visitor Feedback & Explanation</label>
                                    <div className="bg-white p-5 rounded-xl border border-amber-200 text-slate-900 text-base leading-relaxed font-semibold shadow-xs">
                                        "{item.description || item.message || 'No additional details provided by the visitor.'}"
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Triage Actions</label>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    You can jump directly to edit this spot to correct inaccurate information, or mark this report as resolved.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const targetTab = (item.targetType || item.category || '').toLowerCase().includes('dining') ? 'dining-spots' : 'tourist-spots';
                                            setIsDetailView(false);
                                            setActiveTab(targetTab);
                                            setTimeout(() => {
                                                const spotMatch = data.find((s: any) => 
                                                    (s.name && item.targetName && s.name.toLowerCase() === item.targetName.toLowerCase()) || 
                                                    (s.name && item.name && s.name.toLowerCase() === item.name.toLowerCase()) || 
                                                    s._id === item.targetId
                                                );
                                                if (spotMatch) {
                                                    openDetailPanel(spotMatch, 'edit');
                                                }
                                            }, 400);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 bg-lt-blue hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-xs"
                                    >
                                        <i className="fas fa-pen text-xs"></i>
                                        Jump to Edit "{item.targetName || item.name || 'Destination'}"
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item._id)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-xs transition-all text-xs"
                                    >
                                        <i className="fas fa-check text-xs"></i>
                                        Resolve & Dismiss Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            {detailSubView === 'info' && (
                                <div className="space-y-6">
                                    {item.image && (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                                            <div className="aspect-video w-full">
                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        {fields.map(([key, value]: [string, any]) => (
                                            <div key={key} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                </label>
                                                <div className="text-slate-800 text-sm leading-relaxed">
                                                    {renderValue(key, value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {item.mapEmbedUrl && (
                                        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location Map</span>
                                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-lt-blue border border-blue-200">
                                                    <i className="fas fa-map-marker-alt mr-1"></i> Interactive Map
                                                </span>
                                            </div>
                                            <div className="rounded-xl overflow-hidden border border-slate-200 aspect-video w-full bg-slate-50">
                                                <iframe 
                                                    src={item.mapEmbedUrl}
                                                    className="w-full h-full border-none"
                                                    loading="lazy"
                                                    title="Location Map"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {item.gallery && item.gallery.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Gallery ({item.gallery.length})</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {item.gallery.map((img: string, i: number) => (
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action card */}
                                    <div className="pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setDetailSubView('edit')}
                                            className="w-full flex items-center justify-center gap-2 bg-lt-blue hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md transition-all text-xs"
                                        >
                                            <i className="fas fa-pen text-xs"></i>
                                            Edit this Record
                                        </button>
                                    </div>
                                </div>
                            )}

                            {detailSubView === 'reviews' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-slate-800 text-base">User Reviews</h4>
                                        <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{item.reviews?.length || 0} Total</span>
                                    </div>
                                    
                                    {(!item.reviews || item.reviews.length === 0) ? (
                                        <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                                            <i className="fas fa-comment-slash text-3xl text-slate-300 mb-3"></i>
                                            <p className="text-slate-500 text-sm">No reviews yet for this spot.</p>
                                        </div>
                                    ) : (
                                        item.reviews.map((review: any) => (
                                            <div key={review._id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                                            {review.user?.charAt(0) || 'U'}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800 text-sm">{review.user}</p>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <div className="flex text-amber-400 text-[10px]">
                                                                    {[...Array(5)].map((_, i) => (
                                                                        <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'opacity-20'}`}></i>
                                                                    ))}
                                                                </div>
                                                                <span className="text-[10px] text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                        title="Delete Review"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </button>
                                                </div>
                                                <p className="text-slate-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {detailSubView === 'edit' && (
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* ── 4-Tab Navigation for Tourist & Dining Spots (Idea A) ── */}
                                    {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                        <div className="flex border-b border-slate-200 bg-white sticky top-0 z-10 -mx-6 -mt-6 px-6 pt-3 mb-6 gap-1 shadow-2xs overflow-x-auto">
                                            <button
                                                type="button"
                                                onClick={() => setSpotEditorTab('basic')}
                                                className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                                    spotEditorTab === 'basic' ? 'border-lt-blue text-lt-blue' : 'border-transparent text-slate-400 hover:text-slate-700'
                                                }`}
                                            >
                                                <i className="fas fa-info-circle text-[11px]"></i>
                                                Basic Info
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSpotEditorTab('media')}
                                                className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                                    spotEditorTab === 'media' ? 'border-lt-blue text-lt-blue' : 'border-transparent text-slate-400 hover:text-slate-700'
                                                }`}
                                            >
                                                <i className="fas fa-images text-[11px]"></i>
                                                Media & Gallery
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSpotEditorTab('location')}
                                                className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                                    spotEditorTab === 'location' ? 'border-lt-blue text-lt-blue' : 'border-transparent text-slate-400 hover:text-slate-700'
                                                }`}
                                            >
                                                <i className="fas fa-map-marked-alt text-[11px]"></i>
                                                {activeTab === 'dining-spots' ? 'Location & Pricing' : 'Location & Transit'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSpotEditorTab('safety')}
                                                className={`pb-3 px-3.5 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                                                    spotEditorTab === 'safety' ? 'border-lt-blue text-lt-blue' : 'border-transparent text-slate-400 hover:text-slate-700'
                                                }`}
                                            >
                                                <i className="fas fa-shield-alt text-[11px]"></i>
                                                {activeTab === 'dining-spots' ? 'Hours & Specialties' : 'Hours & Safety'}
                                            </button>
                                        </div>
                                    )}

                                    {/* ── TOURIST SPOTS TABS ── */}
                                    {activeTab === 'tourist-spots' && (
                                        <>
                                            {spotEditorTab === 'basic' && (
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Basic Information</p>
                                                    {renderInput('name', 'Destination Name', 'text', 'e.g. La Trinidad Strawberry Farm')}
                                                    
                                                    {/* Category preset chips */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 tracking-tight">Category</label>
                                                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                            {SPOT_CATEGORY_PRESETS.map((cat) => (
                                                                <button
                                                                    key={cat}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, category: cat })}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                                                        formData.category === cat 
                                                                            ? 'bg-lt-blue text-white border-lt-blue shadow-2xs' 
                                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={formData.category || ''} 
                                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                            placeholder="Or type custom category label..."
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                                                        />
                                                    </div>

                                                    {renderInput('description', 'Short Summary', 'textarea', 'A brief, engaging overview of this destination for tourists...')}
                                                    {renderInput('history', 'Background Story & Heritage', 'textarea', 'The historical significance, cultural context, or origin story...')}

                                                    {/* Filter tags with chips */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 tracking-tight">Filter Tags</label>
                                                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                            {SPOT_TAG_PRESETS.map((tag) => {
                                                                const currentTags = Array.isArray(formData.tags) 
                                                                    ? formData.tags 
                                                                    : typeof formData.tags === 'string' 
                                                                        ? formData.tags.split(',').map((t: string) => t.trim()) 
                                                                        : [];
                                                                const isSelected = currentTags.includes(tag);
                                                                return (
                                                                    <button
                                                                        key={tag}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            let nextTags;
                                                                            if (isSelected) {
                                                                                nextTags = currentTags.filter((t: string) => t !== tag);
                                                                            } else {
                                                                                nextTags = [...currentTags, tag];
                                                                            }
                                                                            setFormData({ ...formData, tags: nextTags });
                                                                        }}
                                                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                                                            isSelected 
                                                                                ? 'bg-emerald-500 text-white border-emerald-500 shadow-2xs' 
                                                                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                        }`}
                                                                    >
                                                                        {tag} {isSelected ? '✓' : '+'}
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={Array.isArray(formData.tags) ? formData.tags.join(', ') : (formData.tags || '')} 
                                                            onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                                            placeholder="Comma-separated tags (e.g. Strawberry, Nature, Family)"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {spotEditorTab === 'media' && (
                                                <div className="space-y-6">
                                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Display & Cover Photo</p>
                                                        <UniversalImageSelector 
                                                            onImageSelected={(url) => setFormData({...formData, image: url})}
                                                            aspectRatio={4 / 3}
                                                            label="Featured Image"
                                                            currentImage={formData.image}
                                                        />
                                                        {renderInput('alt', 'Image Alt Text', 'text', 'e.g. Strawberry fields overlooking the valley')}
                                                    </div>
                                                    {renderGalleryInput('Spot Photo Gallery')}
                                                </div>
                                            )}

                                            {spotEditorTab === 'location' && (
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location & Transit Options</p>
                                                    {renderInput('location', 'Physical Address / Location', 'text', 'e.g. Km. 6, Brgy. Betag, La Trinidad')}
                                                    
                                                    {/* Google Maps embed with auto-parser and live map preview */}
                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="block text-sm font-bold text-slate-700 tracking-tight">Google Maps Location Link</label>
                                                                {formData.mapEmbedUrl && formData.mapEmbedUrl.includes('google.com/maps') && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                                        <i className="fas fa-check-circle text-xs"></i> Map Linked
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 mb-2">Paste the share or embed link from Google Maps for this spot.</p>
                                                            <input 
                                                                type="text"
                                                                value={formData.mapEmbedUrl || ''}
                                                                onChange={e => {
                                                                    let val = e.target.value.trim();
                                                                    const match = val.match(/src=["']([^"']+)["']/);
                                                                    if (match && match[1]) val = match[1];
                                                                    setFormData({ ...formData, mapEmbedUrl: val });
                                                                }}
                                                                placeholder="https://www.google.com/maps/embed?pb=..."
                                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                                                            />
                                                        </div>

                                                        {formData.mapEmbedUrl && formData.mapEmbedUrl.includes('google.com/maps') && (
                                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                                                        <i className="fas fa-map-marker-alt text-lt-blue"></i> Map Preview
                                                                    </span>
                                                                </div>
                                                                <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                                    <iframe 
                                                                        src={formData.mapEmbedUrl}
                                                                        className="w-full h-full border-none"
                                                                        loading="lazy"
                                                                        title="Google Map Preview"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                                                        {renderInput('terminalLocation', 'Jeepney Terminal', 'text', 'e.g. Magsaysay Ave, Baguio')}
                                                        {renderInput('jeepneyFare', 'Jeepney Fare', 'text', 'e.g. ₱15.00 - ₱20.00')}
                                                        {renderInput('taxiFare', 'Taxi Fare (Est.)', 'text', 'e.g. ₱120.00 - ₱150.00')}
                                                    </div>
                                                </div>
                                            )}

                                            {spotEditorTab === 'safety' && (
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hours & Safety Services</p>
                                                    
                                                    {/* Hours with quick chips */}
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 tracking-tight">Business / Operating Hours</label>
                                                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                            {HOURS_PRESETS.map((hrs) => (
                                                                <button
                                                                    key={hrs}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, openingHours: hrs })}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                                                        formData.openingHours === hrs 
                                                                            ? 'bg-lt-blue text-white border-lt-blue shadow-2xs' 
                                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    {hrs}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={formData.openingHours || ''} 
                                                            onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                                                            placeholder="e.g. 8:00 AM - 5:00 PM Daily"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                                                        />
                                                    </div>

                                                    {renderInput('bestTimeToVisit', 'Best Season to Visit', 'text', 'e.g. November to April (Strawberry Harvest Season)')}

                                                    {/* Nearby Emergency Facilities Selector */}
                                                    <div className="pt-2">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <label className="block text-sm font-bold text-slate-700 tracking-tight">Nearby Emergency Facilities</label>
                                                            <span className="text-[10px] text-slate-400 font-semibold">Select nearby emergency services</span>
                                                        </div>
                                                        <div className="grid grid-cols-1 gap-2.5">
                                                            {EMERGENCY_FACILITY_PRESETS.map((facility) => {
                                                                const currentFacilities = Array.isArray(formData.nearbyEmergency) ? formData.nearbyEmergency : [];
                                                                const isSelected = currentFacilities.some((f: any) => f.name === facility.name);
                                                                return (
                                                                    <div 
                                                                        key={facility.name}
                                                                        onClick={() => {
                                                                            let nextFacilities;
                                                                            if (isSelected) {
                                                                                nextFacilities = currentFacilities.filter((f: any) => f.name !== facility.name);
                                                                            } else {
                                                                                nextFacilities = [...currentFacilities, facility];
                                                                            }
                                                                            setFormData({ ...formData, nearbyEmergency: nextFacilities });
                                                                        }}
                                                                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                                                                            isSelected 
                                                                                ? 'bg-blue-50/70 border-lt-blue shadow-2xs' 
                                                                                : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                                                                        }`}
                                                                    >
                                                                        <div className="flex items-center gap-3">
                                                                            <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs ${
                                                                                facility.type === 'Hospital' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                                                            }`}>
                                                                                <i className={`fas ${facility.type === 'Hospital' ? 'fa-hospital' : 'fa-shield-alt'}`}></i>
                                                                            </span>
                                                                            <div>
                                                                                <p className="text-xs font-bold text-slate-900 leading-tight">{facility.name}</p>
                                                                                <p className="text-[10px] text-slate-500 mt-0.5">{facility.distance}</p>
                                                                            </div>
                                                                        </div>
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={isSelected} 
                                                                            readOnly 
                                                                            className="w-4 h-4 text-lt-blue rounded-md border-slate-300 focus:ring-lt-blue pointer-events-none"
                                                                        />
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* ── DINING SPOTS TABS ── */}
                                    {activeTab === 'dining-spots' && (
                                        <>
                                            {spotEditorTab === 'basic' && (
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Basic Information</p>
                                                    {renderInput('name', 'Establishment Name', 'text', 'e.g. Jack\'s Restaurant')}
                                                    
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 tracking-tight">Category</label>
                                                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                            {DINING_CATEGORY_PRESETS.map((cat) => (
                                                                <button
                                                                    key={cat}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, category: cat })}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                                                        formData.category === cat 
                                                                            ? 'bg-lt-blue text-white border-lt-blue shadow-2xs' 
                                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    {cat}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={formData.category || ''} 
                                                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                                                            placeholder="Or type custom category..."
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                                                        />
                                                    </div>

                                                    {renderInput('description', 'Description & Ambiance', 'textarea', 'Signature dishes, atmosphere, specialties...')}
                                                </div>
                                            )}

                                            {spotEditorTab === 'media' && (
                                                <div className="space-y-6">
                                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Display & Cover Photo</p>
                                                        <UniversalImageSelector 
                                                            onImageSelected={(url) => setFormData({...formData, image: url})}
                                                            aspectRatio={4 / 3}
                                                            label="Featured Image"
                                                            currentImage={formData.image}
                                                        />
                                                        {renderInput('alt', 'Image Alt Text', 'text', 'e.g. Dining interior and signature dishes')}
                                                    </div>
                                                    {renderGalleryInput('Dining Photo Gallery')}
                                                </div>
                                            )}

                                            {spotEditorTab === 'location' && (
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location & Pricing</p>
                                                    {renderInput('location', 'Location / Address', 'text', 'e.g. Km. 4, Balili, La Trinidad')}
                                                    {renderInput('priceRange', 'Price Range', 'text', 'e.g. ₱150 - ₱300 per person')}
                                                    {renderInput('contactInfo', 'Contact Number / Facebook', 'text', 'e.g. (074) 422-2020 / fb.com/restaurant')}
                                                    
                                                    {/* Google Maps embed with auto-parser and live map preview */}
                                                    <div className="space-y-3">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <label className="block text-sm font-bold text-slate-700 tracking-tight">Google Maps Location Link</label>
                                                                {formData.mapEmbedUrl && formData.mapEmbedUrl.includes('google.com/maps') && (
                                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                                                        <i className="fas fa-check-circle text-xs"></i> Map Linked
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-[11px] text-slate-500 mb-2">Paste the share or embed link from Google Maps for this restaurant/cafe.</p>
                                                            <input 
                                                                type="text"
                                                                value={formData.mapEmbedUrl || ''}
                                                                onChange={e => {
                                                                    let val = e.target.value.trim();
                                                                    const match = val.match(/src=["']([^"']+)["']/);
                                                                    if (match && match[1]) val = match[1];
                                                                    setFormData({ ...formData, mapEmbedUrl: val });
                                                                }}
                                                                placeholder="https://www.google.com/maps/embed?pb=..."
                                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                                                            />
                                                        </div>

                                                        {formData.mapEmbedUrl && formData.mapEmbedUrl.includes('google.com/maps') && (
                                                            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                                                <div className="flex items-center justify-between mb-2">
                                                                    <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
                                                                        <i className="fas fa-map-marker-alt text-lt-blue"></i> Map Preview
                                                                    </span>
                                                                </div>
                                                                <div className="aspect-video w-full rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                                    <iframe 
                                                                        src={formData.mapEmbedUrl}
                                                                        className="w-full h-full border-none"
                                                                        loading="lazy"
                                                                        title="Dining Spot Map Preview"
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {spotEditorTab === 'safety' && (
                                                <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Hours & Specialties</p>
                                                    <div>
                                                        <label className="block text-sm font-bold text-slate-700 mb-1.5 tracking-tight">Business Hours</label>
                                                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                                                            {HOURS_PRESETS.map((hrs) => (
                                                                <button
                                                                    key={hrs}
                                                                    type="button"
                                                                    onClick={() => setFormData({ ...formData, openingHours: hrs })}
                                                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all border ${
                                                                        formData.openingHours === hrs 
                                                                            ? 'bg-lt-blue text-white border-lt-blue shadow-2xs' 
                                                                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                                                                    }`}
                                                                >
                                                                    {hrs}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <input 
                                                            type="text" 
                                                            value={formData.openingHours || ''} 
                                                            onChange={e => setFormData({ ...formData, openingHours: e.target.value })}
                                                            placeholder="e.g. 7:00 AM - 9:00 PM Daily"
                                                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-lt-blue focus:bg-white outline-none transition-all text-sm"
                                                        />
                                                    </div>
                                                    {renderInput('specialties', 'House Specialties & Recommendations', 'text', 'e.g. Strawberry Shortcake, Fresh Salad, Benguet Brew')}
                                                </div>
                                            )}
                                        </>
                                    )}

                                    {/* ── JEEPNEY ROUTES ── */}
                                    {activeTab === 'jeepney-routes' && (
                                    <div className="space-y-6">
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Route Signboard</p>
                                            
                                            {renderInput('signboard.text', 'Signboard Route Text', 'text', 'e.g. KM. 4 - KM. 5 LA TRINIDAD')}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Signboard Background</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            { label: 'White', color: '#ffffff', border: 'border-slate-300' },
                                                            { label: 'Yellow', color: '#facc15', border: 'border-yellow-400' },
                                                            { label: 'Green', color: '#16a34a', border: 'border-green-600' },
                                                            { label: 'Blue', color: '#2563eb', border: 'border-blue-600' },
                                                            { label: 'Red', color: '#dc2626', border: 'border-red-600' },
                                                            { label: 'Black', color: '#0f172a', border: 'border-slate-800' }
                                                        ].map(bg => (
                                                            <button
                                                                key={bg.color}
                                                                type="button"
                                                                onClick={() => setFormData({
                                                                    ...formData,
                                                                    signboard: { ...(formData.signboard || {}), backgroundColor: bg.color }
                                                                })}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border flex items-center gap-1.5 ${
                                                                    (formData.signboard as any)?.backgroundColor === bg.color
                                                                        ? 'ring-2 ring-lt-blue ring-offset-1 font-black shadow-xs'
                                                                        : 'hover:scale-105'
                                                                } ${bg.border}`}
                                                                style={{ backgroundColor: bg.color, color: bg.color === '#ffffff' || bg.color === '#facc15' ? '#0f172a' : '#ffffff' }}
                                                            >
                                                                {bg.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Signboard Text Color</label>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            { label: 'Black', color: '#000000' },
                                                            { label: 'Red', color: '#dc2626' },
                                                            { label: 'Blue', color: '#1d4ed8' },
                                                            { label: 'White', color: '#ffffff' },
                                                            { label: 'Green', color: '#15803d' }
                                                        ].map(tc => (
                                                            <button
                                                                key={tc.color}
                                                                type="button"
                                                                onClick={() => setFormData({
                                                                    ...formData,
                                                                    signboard: { ...(formData.signboard || {}), color: tc.color }
                                                                })}
                                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-slate-300 flex items-center gap-1.5 ${
                                                                    (formData.signboard as any)?.color === tc.color
                                                                        ? 'ring-2 ring-lt-blue ring-offset-1 font-black shadow-xs'
                                                                        : 'hover:scale-105'
                                                                }`}
                                                                style={{ backgroundColor: tc.color, color: tc.color === '#ffffff' ? '#0f172a' : '#ffffff' }}
                                                            >
                                                                {tc.label}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-2">
                                                <div className="p-5 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 shadow-inner">
                                                    <div 
                                                        className="px-8 py-3.5 rounded-xl border-4 border-slate-900 shadow-2xl min-w-[220px] max-w-full flex items-center justify-center transition-all"
                                                        style={{ 
                                                            backgroundColor: (formData.signboard as any)?.backgroundColor || '#ffffff'
                                                        }}
                                                    >
                                                        <span 
                                                            className="text-lg md:text-xl font-black tracking-tight text-center uppercase"
                                                            style={{
                                                                color: (formData.signboard as any)?.color || '#000000'
                                                            }}
                                                        >
                                                            {(formData.signboard as any)?.text || 'ROUTE SIGNBOARD'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Terminal & Route Info</p>
                                                <span className="text-[9px] font-bold text-lt-blue px-2 py-0.5 bg-lt-blue/10 rounded-full italic">Required for navigator displays</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {renderInput('terminal.name', 'Terminal Name', 'text', 'e.g. Magsaysay Terminal')}
                                                {renderInput('terminal.location', 'Terminal Location (Text)', 'text', 'e.g. Near Baguio Center Mall')}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {renderInput('terminal.mapUrl', 'Terminal Map Embed URL', 'text', 'https://maps.google.com/...')}
                                                {renderInput('routeMapUrl', 'Full Route Embed/Link URL', 'text', 'https://maps.google.com/...')}
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {renderInput('operatingHours', 'Operating Hours', 'text', 'e.g. 5:00 AM - 9:00 PM')}
                                                {renderInput('frequency', 'Frequency', 'text', 'e.g. Every 10-15 mins')}
                                            </div>
                                        </div>

                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Fare Configuration</p>
                                            <div className="grid grid-cols-3 gap-4">
                                                {renderInput('fare.minimum', 'Minimum Fare (Normal)', 'number', '14')}
                                                {renderInput('fare.studentSenior', 'Student/Senior Fare', 'number', '11')}
                                                {renderInput('fare.fullRoute', 'Full Route Fare', 'number', '25')}
                                            </div>
                                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3">
                                                <i className="fas fa-info-circle text-blue-500"></i>
                                                <p className="text-[10px] text-blue-800 font-medium">Fares are strictly follow LTFRB regulations. Enter numeric values only.</p>
                                            </div>
                                        </div>

                                        {renderJeepneyPathEditor()}
                                    </div>
                                )}

                                {activeTab === 'events' && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Event Details</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="mb-4">
    <label className="block text-sm font-bold text-slate-700 mb-2">Schedule</label>
    <div className="grid grid-cols-2 gap-3">
        <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Start Date</label>
            <input
                type="date"
                value={formData.startDate || ''}
                onChange={e => {
                    const start = e.target.value;
                    const end = formData.endDate || start;
                    setFormData({
                        ...formData,
                        startDate: start,
                        date: formatDateRange(start, end)
                    });
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lt-blue outline-none text-sm"
            />
        </div>
        <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">End Date <span className="text-slate-300 font-normal">(optional)</span></label>
            <input
                type="date"
                value={formData.endDate || ''}
                onChange={e => {
                    const end = e.target.value;
                    const start = formData.startDate || end;
                    setFormData({
                        ...formData,
                        endDate: end,
                        date: formatDateRange(start, end)
                    });
                }}
                className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lt-blue outline-none text-sm"
            />
        </div>
    </div>
    {formData.date && (
        <div className="mt-2 flex items-center gap-2 bg-blue-50/70 px-3 py-1.5 rounded-lg border border-blue-100 text-xs font-semibold text-lt-blue">
            <i className="fas fa-calendar-alt"></i>
            <span>{formData.date}</span>
        </div>
    )}
</div>
                                            {renderInput('badge', 'Event Type', 'text', 'e.g., Festival')}
                                        </div>
                                        <div className="mt-6">
                                            {renderGalleryInput('Event Gallery')}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'blog-posts' && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Article Details</p>
                                        <div className="grid grid-cols-2 gap-6">
                                            {renderInput('author', 'Writer Name', 'text', 'e.g., Jane Doe')}
                                            {renderInput('readTime', 'Est. Read Time', 'text', 'e.g., 5 min read')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            {renderInput('badge', 'Article Tag', 'text', 'e.g., Travel Guide')}
                                            {renderInput('date', 'Post Date', 'text', 'e.g., October 20, 2023')}
                                        </div>
                                        {renderInput('content', 'Article Content', 'textarea', 'Write the full article story, travel highlights, or visitor tips...')}
                                        {renderGalleryInput('Article Gallery')}
                                        
                                        {!isNew && (
                                            <div className="p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                                                <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Author Contact (Private)</label>
                                                <p className="text-sm font-bold text-slate-700 mb-4">{formData.email || 'No email provided'}</p>
                                                <label className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">Admin Feedback</label>
                                                <textarea 
                                                    value={formData.adminFeedback || ''}
                                                    onChange={e => setFormData({...formData, adminFeedback: e.target.value})}
                                                    className="w-full p-3 border border-blue-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300"
                                                    placeholder="Internal notes or reasons for status change..."
                                                    rows={3}
                                                ></textarea>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {formError && (
                                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-sm font-bold">
                                        <i className="fas fa-exclamation-circle mr-2"></i> {formError}
                                    </div>
                                )}

                                <div className="flex gap-4 pt-2 pb-8">
                                    <button 
                                        type="button" 
                                        onClick={() => !isNew ? setDetailSubView('info') : setIsDetailView(false)}
                                        className="flex-1 px-6 py-4 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={isLoading} 
                                        className="flex-[2] bg-lt-blue text-white font-bold py-4 rounded-xl hover:bg-lt-moss transition-all shadow-lg active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isNew ? 'Create Record' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </>
                )}
            </div>
        </div>
    );
    };

    if (isVerifying) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <i className="fas fa-spinner fa-spin text-4xl text-lt-blue"></i>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
                    <div className="text-center mb-6">
                        <div className="w-16 h-16 bg-lt-blue/10 text-lt-blue rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="fas fa-user-shield text-2xl"></i>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">Admin Console</h1>
                        <p className="text-sm text-slate-500 mt-1">Please verify your access code to continue.</p>
                    </div>

                    {loginError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg flex items-center gap-2">
                            <i className="fas fa-exclamation-circle"></i>
                            {loginError}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Access Code</label>
                            <input 
                                type="password" 
                                placeholder="••••••••" 
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lt-blue outline-none transition-all"
                                value={accessCode}
                                onChange={e => setAccessCode(e.target.value)}
                                disabled={loginLoading}
                                required
                            />
                            <p className="mt-2 text-[10px] text-slate-400 italic">
                                Hint: The default access code is <span className="font-bold text-slate-500">admin123</span>
                            </p>
                        </div>
                        <button 
                            type="submit" 
                            disabled={loginLoading}
                            className="w-full bg-lt-blue text-white font-bold py-3 rounded-lg hover:bg-lt-moss transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md active:scale-95"
                        >
                            {loginLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
                            {loginLoading ? 'Verifying...' : 'Login'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                        <Link to="/" className="text-xs font-bold text-slate-400 hover:text-lt-blue transition-colors flex items-center justify-center gap-2">
                            <i className="fas fa-arrow-left"></i>
                            Back to Homepage
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const sortedData = activeTab === 'blog-posts' 
        ? [...data].sort((a: any, b: any) => {
            const statusOrder: any = { pending: 0, approved: 1, rejected: 2 };
            return (statusOrder[a.status as keyof typeof statusOrder] || 1) - (statusOrder[b.status as keyof typeof statusOrder] || 1);
        })
        : data;

    return (
        <div className="min-h-screen bg-slate-50 flex relative overflow-hidden">
            {/* Sidebar toggle when collapsed */}
            {!isSidebarOpen && !isDetailView && (
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed left-0 top-1/2 -translate-y-1/2 z-50 bg-lt-blue text-white p-2 rounded-r-xl shadow-lg hover:bg-lt-moss transition-all"
                >
                    <i className="fas fa-chevron-right"></i>
                </button>
            )}

            {/* ── Sidebar: hidden when detail view is open ─────────────── */}
            <aside 
                className={`bg-[#0f172a] text-slate-400 flex flex-col h-screen z-40 transition-all duration-300 ease-in-out shrink-0 ${
                    isSidebarOpen && !isDetailView ? 'w-72' : 'w-0 overflow-hidden'
                }`}
            >
                <div className="p-6 border-b border-slate-800/50 flex items-center justify-between min-w-[288px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lt-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-lt-blue/20">
                            <i className="fas fa-user-shield text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-none">Admin</h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Control Panel</p>
                        </div>
                    </div>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar min-w-[288px]">
                    <div className="px-3 mb-4 mt-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Management</p>
                    </div>
                    {TABS.map((tab: any) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group relative ${
                                activeTab === tab.id && viewMode === 'management'
                                ? 'bg-lt-blue/10 text-lt-blue shadow-sm' 
                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                            }`}
                        >
                            <i className={`fas ${tab.icon} w-5 text-center ${activeTab === tab.id && viewMode === 'management' ? 'text-lt-blue' : 'text-slate-500 group-hover:text-lt-blue'}`}></i>
                            <span className="flex-1 text-left">{tab.label}</span>
                            
                            {notifications[tab.badge as keyof typeof notifications] > 0 && tab.badge && (
                                <span className="px-1.5 py-0.5 text-[9px] bg-red-500 text-white rounded-full font-bold min-w-[18px] text-center shadow-lg shadow-red-500/20">
                                    {notifications[tab.badge as keyof typeof notifications]}
                                </span>
                            )}
                            {tab.id === 'tourist-spots' && notifications.touristReviews > 0 && (
                                <span className="px-1.5 py-0.5 text-[9px] bg-lt-orange text-white rounded-full font-bold min-w-[18px] text-center">
                                    {notifications.touristReviews}
                                </span>
                            )}
                            {tab.id === 'dining-spots' && notifications.diningReviews > 0 && (
                                <span className="px-1.5 py-0.5 text-[9px] bg-lt-orange text-white rounded-full font-bold min-w-[18px] text-center">
                                    {notifications.diningReviews}
                                </span>
                            )}
                            {tab.id === 'blog-posts' && notifications.blogPosts > 0 && (
                                <span className="px-1.5 py-0.5 text-[9px] bg-lt-blue text-white rounded-full font-bold min-w-[18px] text-center">
                                    {notifications.blogPosts}
                                </span>
                            )}
                            {activeTab === tab.id && viewMode === 'management' && (
                                <div className="absolute left-0 w-1 h-5 bg-lt-blue rounded-r-full"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-800/50 min-w-[288px]">
                    <button 
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all"
                        onClickCapture={(e) => { e.stopPropagation(); setIsLogoutConfirmOpen(true); }}
                    >
                        <i className="fas fa-power-off w-5 text-center"></i>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main content ──────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
                {/* Top header — hidden when detail view is open (it has its own sticky header) */}
                {!isDetailView && (
                    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 gap-4">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <button 
                                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-lt-blue hover:bg-lt-blue/5 transition-all"
                            >
                                <i className={`fas ${isSidebarOpen ? 'fa-align-left' : 'fa-align-justify'}`}></i>
                            </button>
                            <div className="h-6 w-px bg-slate-100 hidden md:block"></div>
                            <div className="flex items-center gap-3">
                                <h2 className="text-lg font-black text-slate-900 tracking-tight">
                                    {viewMode === 'management' ? TABS.find(t => t.id === activeTab)?.label : 'Site Preview'}
                                </h2>
                                {viewMode === 'management' && activeTab !== 'analytics' && (
                                    <span className="text-[10px] bg-lt-blue/10 text-lt-blue px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                                        {data.length} Records
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                            {viewMode === 'management' && activeTab !== 'reports' && activeTab !== 'analytics' && activeTab !== 'activity-log' && (
                                <button 
                                    onClick={() => handleOpenModal()} 
                                    className="bg-lt-blue hover:bg-[#1d4ed8] text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg shadow-lt-blue/20 transition-all flex items-center gap-2 active:scale-95 border border-lt-blue"
                                >
                                    <i className="fas fa-plus"></i> Add New
                                </button>
                            )}
                            {activeTab === 'analytics' && (
                                <button 
                                    onClick={() => loadData('analytics')} 
                                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <i className="fas fa-sync-alt"></i> Refresh Reports
                                </button>
                            )}
                            <button 
                                onClick={() => {
                                    if (viewMode === 'preview') setViewMode('management');
                                    else setViewMode('preview');
                                }}
                                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
                                    viewMode === 'preview' 
                                    ? 'bg-lt-orange text-white border-lt-orange shadow-lt-orange/20' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <i className={`fas ${viewMode === 'preview' ? 'fa-edit' : 'fa-eye'}`}></i>
                                {viewMode === 'preview' ? 'Management Mode' : 'Live Preview'}
                            </button>
                            <div className="h-8 w-px bg-slate-100 mx-1 hidden sm:block"></div>
                            <div className="flex items-center gap-3 bg-slate-50 pl-1 pr-4 py-1 rounded-full border border-slate-100">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-black shadow-lg">
                                    AD
                                </div>
                                <div className="hidden lg:block">
                                    <p className="text-[10px] font-black text-slate-900 leading-none">Super Admin</p>
                                    <p className="text-[9px] text-slate-400 font-bold mt-0.5">La Trinidad LGU</p>
                                </div>
                            </div>
                        </div>
                    </header>
                )}

                {/* ── Content area ─────────────────────────────────────── */}
                <div className="flex-1 overflow-hidden relative">
                    {/* Detail view: fills the entire content area, no sidebar, no modal */}
                    {isDetailView ? (
                        <div className="h-full overflow-hidden">
                            {renderDetailView()}
                        </div>
                    ) : viewMode === 'management' ? (
                        <div className="h-full overflow-y-auto custom-scrollbar p-8">
                            <AnimatedElement>
                                {activeTab === 'analytics' ? (
                                    renderAnalyticsDashboard()
                                ) : activeTab === 'activity-log' ? (
                                    renderActivityLog()
                                ) : activeTab === 'site-settings' ? (
                                    renderSiteSettings()
                                ) : (
                                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                        {isLoading ? (
                                            <div className="p-32 text-center text-slate-400">
                                                <i className="fas fa-circle-notch fa-spin text-4xl mb-4 text-lt-blue"></i>
                                                <p className="text-sm font-medium">Synchronizing data...</p>
                                            </div>
                                        ) : data.length === 0 ? (
                                            <div className="p-32 text-center">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                                                    <i className="fas fa-folder-open text-3xl text-slate-200"></i>
                                                </div>
                                                <h3 className="text-lg font-black text-slate-900 mb-1">No results found</h3>
                                                <p className="text-sm text-slate-500 mb-8 max-w-xs mx-auto text-pretty">There are no records to display in this section yet. Start by creating a new entry.</p>
                                                {activeTab !== 'reports' && (
                                                    <button 
                                                        onClick={() => handleOpenModal()}
                                                        className="inline-flex items-center gap-2 bg-lt-blue hover:bg-lt-blue/90 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-lt-blue/20 transition-all active:scale-95"
                                                    >
                                                        <i className="fas fa-plus"></i>
                                                        Create first record
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto relative shadow-sm border border-slate-200 rounded-xl">
                                                <table className="w-full text-left border-separate border-spacing-0">
                                                    <thead className="sticky top-0 bg-white/95 backdrop-blur-md z-10 border-b border-slate-200">
                                                        <tr>
                                                            {activeTab !== 'reports' && <th className="p-4 w-24 text-center text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Media</th>}
                                                            {activeTab === 'reports' ? (
                                                                <>
                                                                    <th className="p-4 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Target</th>
                                                                    <th className="p-4 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Reason</th>
                                                                    <th className="p-4 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Description</th>
                                                                </>
                                                            ) : (
                                                                <th className="p-4 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Information</th>
                                                            )}
                                                            {activeTab === 'blog-posts' && <th className="p-4 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Status</th>}
                                                            {activeTab === 'blog-posts' && <th className="p-4 text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Author</th>}
                                                            {(activeTab === 'tourist-spots' || activeTab === 'blog-posts') && <th className="p-4 text-center text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Performance</th>}
                                                            {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && <th className="p-4 text-center text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Community</th>}
                                                            <th className="p-4 text-right text-[10px] uppercase font-black text-slate-400 tracking-widest border-b border-slate-100">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50">
                                                        {sortedData.map((item: any) => (
                                                                <tr 
                                                                    key={item._id} 
                                                                    className="hover:bg-lt-blue/[0.02] transition-colors group cursor-pointer"
                                                                    onClick={() => handleOpenDetailModal(item)}
                                                                >
                                                                 {activeTab !== 'reports' && (
                                                                    <td className="p-4" onClick={e => e.stopPropagation()}>
                                                                        {activeTab === 'jeepney-routes' ? (
                                                                            <div 
                                                                                className="w-16 h-10 rounded-lg flex items-center justify-center text-[8px] font-black uppercase text-center p-1 shadow-sm border border-slate-200"
                                                                                style={{ 
                                                                                    backgroundColor: item.signboard?.backgroundColor || '#000',
                                                                                    color: item.signboard?.color || '#fff'
                                                                                }}
                                                                            >
                                                                                {item.signboard?.text}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 shadow-sm relative group/thumb">
                                                                                <img src={item.image} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                                                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white text-xs">
                                                                                    <i className="fas fa-expand"></i>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </td>
                                                                )}
                                                                
                                                                {activeTab === 'reports' ? (
                                                                    <>
                                                                        <td className="p-4">
                                                                            <div className="flex items-center gap-3">
                                                                                {!item.isSeen && (
                                                                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-sm shadow-red-500/50 flex-shrink-0 animate-pulse" title="Unread report"></div>
                                                                                )}
                                                                                <div className="min-w-0">
                                                                                    <div className="font-bold text-slate-900 text-sm truncate">
                                                                                        {item.targetName || item.name || 'Tourist Destination'}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-2 mt-0.5">
                                                                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                                                                                            {item.targetType || item.category || 'Spot'}
                                                                                        </span>
                                                                                        {(item.createdAt || item.created_at) && (
                                                                                            <>
                                                                                                <span className="text-[10px] text-slate-300">·</span>
                                                                                                <span className="text-[10px] text-slate-400">
                                                                                                    {new Date(item.createdAt || item.created_at).toLocaleDateString()}
                                                                                                </span>
                                                                                            </>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-4">
                                                                            <span className="text-xs text-red-700 bg-red-50 px-3 py-1 rounded-lg font-bold uppercase tracking-wider border border-red-200 inline-block">
                                                                                {item.reason || item.subject || 'Inaccurate Information'}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-4">
                                                                            <p className="text-xs text-slate-700 font-semibold max-w-sm line-clamp-2 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                                                                                "{item.description || item.message || 'No additional details provided.'}"
                                                                            </p>
                                                                        </td>
                                                                    </>
                                                                ) : (
                                                                    <td className="p-4">
                                                                        <div className="flex items-start gap-4">
                                                                            {activeTab === 'blog-posts' && !item.isSeen && (
                                                                                <div className="mt-1.5 flex-shrink-0">
                                                                                    <div className="w-2 h-2 rounded-full bg-lt-blue shadow-[0_0_10px_rgba(59,130,246,0.5)] animate-pulse"></div>
                                                                                </div>
                                                                            )}
                                                                            <div className="min-w-0">
                                                                                <div className="font-black text-slate-900 text-sm group-hover:text-lt-blue transition-colors truncate tracking-tight">{item.name || item.title}</div>
                                                                                <div className="flex items-center gap-2 mt-1">
                                                                                    <div className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-50 text-slate-500 rounded-md border border-slate-100 text-[10px] font-bold">
                                                                                        <i className={`fas ${activeTab === 'jeepney-routes' ? 'fa-bus' : 'fa-map-marker-alt'} text-[8px] opacity-70`}></i>
                                                                                        {activeTab === 'jeepney-routes' ? `Terminal: ${item.terminal?.name}` : (item.location || item.date || 'No meta provided')}
                                                                                    </div>
                                                                                    {activeTab === 'jeepney-routes' && (
                                                                                        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md border border-emerald-100 text-[10px] font-bold">
                                                                                            <i className="fas fa-money-bill-wave text-[8px] opacity-70"></i>
                                                                                            ₱{item.fare?.minimum} / ₱{item.fare?.fullRoute}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {activeTab === 'blog-posts' && (
                                                                    <td className="p-4">
                                                                        <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full border tracking-widest ${
                                                                            item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                                                            item.status === 'approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                                                            'bg-red-50 text-red-600 border-red-200'
                                                                        }`}>
                                                                            {item.status || 'approved'}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                {activeTab === 'blog-posts' && (
                                                                    <td className="p-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="w-6 h-6 rounded-full bg-lt-blue/10 text-lt-blue flex items-center justify-center text-[8px] font-black uppercase">
                                                                                {item.author?.substring(0, 2) || 'AU'}
                                                                            </div>
                                                                            <div className="min-w-0">
                                                                                <div className="text-xs font-bold text-slate-900 leading-none truncate max-w-[120px]">{item.author}</div>
                                                                                <div className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[120px]">{item.email || 'No email provided'}</div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                {(activeTab === 'tourist-spots' || activeTab === 'blog-posts') && (
                                                                    <td className="p-4 text-center">
                                                                        <div className="inline-flex flex-col items-center">
                                                                            <div className="text-xs font-black text-slate-900 font-mono tracking-tighter">
                                                                                {item.views?.toLocaleString() || 0}
                                                                            </div>
                                                                            <div className="text-[9px] text-slate-400 uppercase font-bold mt-0.5 tracking-widest">Views</div>
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                                                    <td className="p-4 text-center" onClick={e => e.stopPropagation()}>
                                                                        <button 
                                                                            onClick={() => handleOpenReviewModal(item)}
                                                                            className="inline-flex items-center gap-2 text-slate-500 hover:text-white hover:bg-slate-900 transition-all border border-slate-200 px-4 py-2 rounded-xl text-xs font-black shadow-sm group/btn"
                                                                        >
                                                                            <i className="fas fa-comment-dots text-[10px] text-slate-400 group-hover/btn:text-white"></i> 
                                                                            {item.reviews?.length || 0}
                                                                        </button>
                                                                    </td>
                                                                )}
                                                                <td className="p-4 text-right" onClick={e => e.stopPropagation()}>
                                                                    <div className="flex justify-end gap-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                                                        {activeTab === 'blog-posts' && item.status === 'pending' && (
                                                                            <button 
                                                                                onClick={() => handleApprove(item._id)} 
                                                                                className="bg-lt-blue text-white w-9 h-9 rounded-xl hover:bg-blue-600 shadow-sm transition-all flex items-center justify-center active:scale-95"
                                                                                title="Approve post"
                                                                            >
                                                                                <i className="fas fa-check text-xs"></i>
                                                                            </button>
                                                                        )}
                                                                        {activeTab === 'reports' ? (
                                                                            <div className="flex items-center gap-1.5">
                                                                                <button 
                                                                                    onClick={() => handleOpenDetailModal(item)} 
                                                                                    className="bg-lt-blue text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-blue-600 shadow-xs transition-all active:scale-95"
                                                                                    title="Review Report Details"
                                                                                >
                                                                                    Review
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleDelete(item._id)} 
                                                                                    className="bg-emerald-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-emerald-700 shadow-xs transition-all active:scale-95"
                                                                                    title="Resolve & Dismiss Report"
                                                                                >
                                                                                    Resolve
                                                                                </button>
                                                                            </div>
                                                                        ) : (
                                                                            <>
                                                                                <button 
                                                                                    onClick={() => handleEdit(item)} 
                                                                                    className="w-9 h-9 flex items-center justify-center text-slate-500 bg-white border border-slate-200 hover:border-lt-blue hover:text-lt-blue rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95" 
                                                                                    title="Edit Record"
                                                                                >
                                                                                    <i className="fas fa-pen text-xs"></i>
                                                                                </button>
                                                                                <button 
                                                                                    onClick={() => handleDelete(item._id)} 
                                                                                    className="w-9 h-9 flex items-center justify-center text-slate-500 bg-white border border-slate-200 hover:border-red-500 hover:text-red-500 rounded-xl transition-all shadow-xs hover:shadow-md active:scale-95" 
                                                                                    title="Delete Record"
                                                                                >
                                                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                                                </button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </AnimatedElement>
                        </div>
                    ) : (
                        /* ── Live Preview ───────────────────────────────── */
                        <div className="w-full h-full bg-slate-200 animate-in fade-in duration-500 flex flex-col">
                            <div className="bg-slate-900 text-white px-6 py-4 flex flex-col gap-4 shadow-2xl z-10 border-b border-slate-800">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 text-green-400 rounded-full border border-green-500/20">
                                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            <span className="text-[10px] font-black uppercase tracking-widest">Live Preview Active</span>
                                        </div>
                                        <div className="h-4 w-px bg-slate-700"></div>
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <i className="fas fa-desktop text-xs"></i>
                                            <span className="text-[11px] font-bold">Desktop View</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setPreviewUrl('/')}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors text-slate-400 hover:text-white"
                                            title="Reset to Home"
                                        >
                                            <i className="fas fa-home text-xs"></i>
                                        </button>
                                        <button 
                                            onClick={() => setViewMode('management')}
                                            className="px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-2 border border-red-500/20"
                                        >
                                            <i className="fas fa-times"></i>
                                            Exit Preview
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4">
                                    <div className="flex-1 flex items-center gap-3 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 shadow-inner group">
                                        <i className="fas fa-lock text-[10px] text-green-500/50"></i>
                                        <span className="text-[10px] font-mono text-slate-500 select-none">https://visitlatrinidad.gov.ph</span>
                                        <span className="text-[11px] font-mono text-lt-blue font-bold">{previewUrl}</span>
                                    </div>
                                    
                                    <nav className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
                                        {NAV_LINKS.map((link) => (
                                            <button
                                                key={link.name}
                                                onClick={() => setPreviewUrl(link.path)}
                                                className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                                                    previewUrl === link.path
                                                    ? 'bg-lt-blue text-white shadow-lg shadow-lt-blue/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-slate-700'
                                                }`}
                                            >
                                                {link.name}
                                            </button>
                                        ))}
                                    </nav>
                                </div>
                            </div>

                            <div className="flex-1 relative bg-slate-800 p-4 md:p-8">
                                <div className="w-full h-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-slate-700 bg-white relative">
                                    <iframe 
                                        src={`${window.location.origin}${previewUrl}`}
                                        className="w-full h-full border-none"
                                        title="Site Preview"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── Logout confirmation modal ─────────────────────────────── */}
            {isLogoutConfirmOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={() => setIsLogoutConfirmOpen(false)}>
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slide-up border border-slate-200" onClick={e => e.stopPropagation()}>
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                <i className="fas fa-sign-out-alt text-2xl"></i>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Sign Out</h3>
                            <p className="text-sm text-slate-500 mb-6">Are you sure you want to end your administrative session?</p>
                            
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setIsLogoutConfirmOpen(false)}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleLogout}
                                    className="flex-1 px-4 py-3 rounded-xl font-bold text-sm text-white bg-red-500 hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                                >
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {alertModal.isOpen && (
                <AlertModal
                    title={alertModal.title}
                    message={alertModal.message}
                    variant={alertModal.variant}
                    onClose={() => setAlertModal(prev => ({ ...prev, isOpen: false }))}
                />
            )}

            {confirmModal.isOpen && (
                <ConfirmationModal
                    title={confirmModal.title}
                    message={confirmModal.message}
                    confirmLabel={confirmModal.confirmLabel}
                    variant={confirmModal.variant}
                    onConfirm={confirmModal.onConfirm}
                    onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                />
            )}
        </div>
    );
};

export default AdminPage;