import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
    fetchTouristSpots, fetchDiningSpots, fetchBlogPosts, fetchLocalEvents, fetchReports,
    deleteItem, createItem, updateItem, uploadImage, deleteReview, deleteReport, verifyAdminToken,
    fetchAnalyticsSummary,
    fetchAnalyticsDebug,
    fetchAdminLogs,
    logoutAdmin,
    fetchSiteSettings,
    updateSiteSettings,
    markReviewAsSeen,
    markReviewAsResolved,
    markReportAsSeen,
    markBlogPostAsSeen
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
    { id: 'analytics', label: 'Analytics', icon: 'fa-chart-line' },
    { id: 'activity-log', label: 'Activity Log', icon: 'fa-history' }
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
            const token = localStorage.getItem('adminToken');
            if (token) {
                try {
                    await verifyAdminToken(token);
                    setIsAuthenticated(true);
                } catch (err) {
                    console.error('Auth verification failed', err);
                    localStorage.removeItem('adminToken');
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
            localStorage.setItem('adminToken', accessCode);
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
        localStorage.removeItem('adminToken');
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
    setFormData(item ? { ...item } : {});
    setFormError(null);
    setDetailItem(item);
    setDetailSubView(subView);
    
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string) => void) => {
        if (e.target.files && e.target.files[0]) {
            setIsLoading(true);
            setFormError(null);
            try {
                const file = e.target.files[0];
                
                // Convert to PNG to avoid Supabase JPEG restrictions
                const convertToPng = (file: File): Promise<File> => {
                    return new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const img = new Image();
                            img.onload = () => {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                if (!ctx) {
                                    reject(new Error('Failed to get canvas context'));
                                    return;
                                }
                                ctx.drawImage(img, 0, 0);
                                canvas.toBlob((blob) => {
                                    if (blob) {
                                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".png", { type: 'image/png' });
                                        resolve(newFile);
                                    } else {
                                        reject(new Error('Failed to convert image'));
                                    }
                                }, 'image/png');
                            };
                            img.onerror = () => reject(new Error('Failed to load image'));
                            img.src = event.target?.result as string;
                        };
                        reader.onerror = () => reject(new Error('Failed to read file'));
                        reader.readAsDataURL(file);
                    });
                };

                const processedFile = file.type === 'image/png' ? file : await convertToPng(file);
                const result = await uploadImage(processedFile);
                callback(result.url);
            } catch (error: any) {
                console.error('Upload failed:', error);
                setFormError(error.message || "Upload failed.");
            } finally {
                setIsLoading(false);
                e.target.value = ''; 
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        try {
            const payload = { ...formData };
            if (typeof payload.tags === 'string') payload.tags = payload.tags.split(',').map((t: string) => t.trim());
            if (typeof payload.gallery === 'string') payload.gallery = payload.gallery.split(',').map((t: string) => t.trim());

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

                            <div className="space-y-6">
                                {Array.isArray(siteSettingsForm.home.heroImages) && siteSettingsForm.home.heroImages.map((img: any, idx: number) => (
                                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                        <span className="absolute -top-2 -left-2 w-6 h-6 bg-slate-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-md">
                                            {idx + 1}
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <div className="sm:col-span-1">
                                                <div className="aspect-video rounded-lg overflow-hidden border border-slate-200 bg-white">
                                                    <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                                                </div>
                                            </div>
                                            <div className="sm:col-span-2 space-y-3">
                                                <div className="flex gap-2">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Image URL"
                                                        value={img.url}
                                                        onChange={(e) => updateHomeHeroImage(idx, 'url', e.target.value)}
                                                        className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-lt-orange outline-none"
                                                    />
                                                    <input 
                                                        type="file" 
                                                        id={`hero-img-${idx}`}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={(e) => handleFileUpload(e, (url) => updateHomeHeroImage(idx, 'url', url))}
                                                    />
                                                    <label 
                                                        htmlFor={`hero-img-${idx}`}
                                                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center justify-center whitespace-nowrap"
                                                    >
                                                        {isLoading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-upload"></i>}
                                                    </label>
                                                </div>
                                                <input 
                                                    type="text" 
                                                    placeholder="Alt Text"
                                                    value={img.alt}
                                                    onChange={(e) => updateHomeHeroImage(idx, 'alt', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs focus:border-lt-orange outline-none"
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
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Hero Image URL</label>
                                    <div className="flex gap-3">
                                        <div className="w-16 h-12 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
                                            <img src={siteSettingsForm.about.heroImage} alt="" className="w-full h-full object-cover" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={siteSettingsForm.about.heroImage}
                                            onChange={(e) => updateAboutField('heroImage', e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-lt-blue/20 focus:border-lt-blue outline-none transition-all"
                                        />
                                    </div>
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

                        <div className="space-y-6">
                            {(siteSettingsForm.about.journeyThroughTime || []).map((item: any, idx: number) => (
                                <div key={idx} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 relative">
                                    <button 
                                        onClick={() => removeJourneyItem(idx)}
                                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors"
                                    >
                                        <i className="fas fa-trash-alt"></i>
                                    </button>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <div className="md:col-span-1 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Year</label>
                                                <input 
                                                    type="text" 
                                                    value={item.year}
                                                    onChange={(e) => updateJourneyItem(idx, 'year', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-lt-blue"
                                                    placeholder="e.g. 1900"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Image</label>
                                                <div className="aspect-square rounded-lg overflow-hidden border border-slate-200 bg-white mb-2">
                                                    {item.image ? (
                                                        <img src={item.image} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                            <i className="fas fa-image text-2xl"></i>
                                                        </div>
                                                    )}
                                                </div>
                                                <input 
                                                    type="file" 
                                                    id={`journey-img-${idx}`}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileUpload(e, (url) => updateJourneyItem(idx, 'image', url))}
                                                />
                                                <label 
                                                    htmlFor={`journey-img-${idx}`}
                                                    className="block w-full text-center py-2 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
                                                >
                                                    {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Upload Image'}
                                                </label>
                                            </div>
                                        </div>
                                        <div className="md:col-span-3 space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Title</label>
                                                <input 
                                                    type="text" 
                                                    value={item.title}
                                                    onChange={(e) => updateJourneyItem(idx, 'title', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-lt-blue"
                                                    placeholder="Event Title"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Content</label>
                                                <textarea 
                                                    rows={4}
                                                    value={item.content}
                                                    onChange={(e) => updateJourneyItem(idx, 'content', e.target.value)}
                                                    className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-lt-blue resize-none"
                                                    placeholder="Describe this historical event..."
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Local Government */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mt-8">
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                            <div className="w-10 h-10 rounded-full bg-lt-yellow/10 text-lt-yellow flex items-center justify-center">
                                <i className="fas fa-landmark"></i>
                            </div>
                            <h3 className="font-bold text-slate-800">Local Government Section</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="md:col-span-1 space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Section Title</label>
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
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-lt-yellow"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Main Image</label>
                                    <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mb-3">
                                        {siteSettingsForm.about.localGovernment?.image ? (
                                            <img src={siteSettingsForm.about.localGovernment.image} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <i className="fas fa-image text-3xl"></i>
                                            </div>
                                        )}
                                    </div>
                                    <input 
                                        type="file" 
                                        id="gov-main-img"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => handleFileUpload(e, (url) => setSiteSettingsForm({
                                            ...siteSettingsForm,
                                            about: {
                                                ...siteSettingsForm.about,
                                                localGovernment: { ...siteSettingsForm.about.localGovernment, image: url }
                                            }
                                        }))}
                                    />
                                    <label 
                                        htmlFor="gov-main-img"
                                        className="block w-full text-center py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 cursor-pointer hover:bg-slate-50 transition-colors"
                                    >
                                        {isLoading ? <i className="fas fa-spinner fa-spin"></i> : 'Change Main Image'}
                                    </label>
                                </div>
                            </div>
                            <div className="md:col-span-2 space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Government Content</label>
                                    <textarea 
                                        rows={6}
                                        value={siteSettingsForm.about.localGovernment?.content || ''}
                                        onChange={(e) => setSiteSettingsForm({
                                            ...siteSettingsForm,
                                            about: {
                                                ...siteSettingsForm.about,
                                                localGovernment: { ...siteSettingsForm.about.localGovernment, content: e.target.value }
                                            }
                                        })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-lt-yellow resize-none"
                                    />
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest">Government Officials</label>
                                        <button 
                                            onClick={addOfficial}
                                            className="text-[10px] font-bold text-lt-yellow hover:text-lt-orange flex items-center gap-1"
                                        >
                                            <i className="fas fa-plus-circle"></i> Add Official
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {(siteSettingsForm.about.localGovernment?.officials || []).map((official: any, idx: number) => (
                                            <div key={idx} className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm relative group">
                                                <button 
                                                    onClick={() => removeOfficial(idx)}
                                                    className="absolute top-2 right-2 text-slate-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <i className="fas fa-times-circle"></i>
                                                </button>
                                                <div className="flex gap-4">
                                                    <div className="w-16 h-16 rounded-full overflow-hidden border border-slate-100 bg-slate-50 flex-shrink-0">
                                                        {official.image ? (
                                                            <img src={official.image} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                                <i className="fas fa-user"></i>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <input 
                                                            type="text" 
                                                            placeholder="Name"
                                                            value={official.name}
                                                            onChange={(e) => updateOfficial(idx, 'name', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs outline-none focus:border-lt-yellow"
                                                        />
                                                        <input 
                                                            type="text" 
                                                            placeholder="Position"
                                                            value={official.position}
                                                            onChange={(e) => updateOfficial(idx, 'position', e.target.value)}
                                                            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 text-xs outline-none focus:border-lt-yellow"
                                                        />
                                                        <input 
                                                            type="file" 
                                                            id={`official-img-${idx}`}
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={(e) => handleFileUpload(e, (url) => updateOfficial(idx, 'image', url))}
                                                        />
                                                        <label 
                                                            htmlFor={`official-img-${idx}`}
                                                            className="block text-[9px] font-bold text-lt-yellow cursor-pointer hover:underline"
                                                        >
                                                            {isLoading ? 'Uploading...' : 'Upload Photo'}
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
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

    const renderInput = (key: string, label: string, type: string = 'text', placeholder: string = ''): React.ReactElement => (
        <div className="mb-4">
            <label className="block text-sm font-bold text-slate-700 mb-1">{label}</label>
            {type === 'textarea' ? (
                <textarea 
                    value={formData[key] || ''} 
                    onChange={e => setFormData({...formData, [key]: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-lt-blue outline-none"
                    rows={4}
                    placeholder={placeholder}
                />
            ) : (
                <input 
                    type={type} 
                    value={formData[key] || ''} 
                    onChange={e => setFormData({...formData, [key]: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-lt-blue outline-none"
                    placeholder={placeholder}
                />
            )}
        </div>
    );

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
        
        const fields = Object.entries(item).filter(([key]) => !['_id', '__v', 'updatedAt', 'reviews', 'image', 'gallery'].includes(key));

        const renderValue = (key: string, value: any) => {
            if (Array.isArray(value)) {
                return (
                    <div className="flex flex-wrap gap-2">
                        {value.map((item, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200">
                                {String(item)}
                            </span>
                        ))}
                    </div>
                );
            }
            if (typeof value === 'object' && value !== null) {
                return <pre className="text-[10px] bg-slate-900 text-slate-300 p-3 rounded-xl overflow-x-auto">{JSON.stringify(value, null, 2)}</pre>;
            }
            if (key.toLowerCase().includes('date') || key === 'createdAt') {
    const parsed = new Date(value);
    // If it's a valid ISO date (createdAt, updatedAt) format it, otherwise show raw string
    return (
        <span className="text-slate-700 font-medium">
            {!isNaN(parsed.getTime()) && key !== 'date' 
                ? parsed.toLocaleString() 
                : value}
        </span>
    );
}
            if (key === 'status') {
                const colors: any = { approved: 'bg-green-100 text-green-600', pending: 'bg-amber-100 text-amber-600', rejected: 'bg-red-100 text-red-600' };
                return <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${colors[value] || 'bg-slate-100 text-slate-600'}`}>{value}</span>;
            }
            return <span className="text-slate-700 leading-relaxed">{String(value)}</span>;
        };

        return (
            <div className="h-full flex flex-col bg-slate-50 animate-in slide-in-from-right duration-300">
                {/* ── Sticky header ─────────────────────────────────────── */}
                <div className="sticky top-0 z-30 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-5">
                        {/* Back button with breadcrumb */}
                        <button 
                            onClick={() => setIsDetailView(false)}
                            className="flex items-center gap-2 text-slate-500 hover:text-lt-blue transition-colors group"
                        >
                            <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 group-hover:bg-lt-blue/10 transition-colors">
                                <i className="fas fa-arrow-left text-sm"></i>
                            </span>
                            <span className="text-xs font-bold hidden sm:block">
                                Back to {TABS.find(t => t.id === activeTab)?.label}
                            </span>
                        </button>

                        <i className="fas fa-chevron-right text-slate-300 text-xs hidden sm:block"></i>

                        <div>
                            <h3 className="font-bold text-slate-900 text-lg leading-none">
                                {isNew ? `New ${TABS.find(t => t.id === activeTab)?.label.replace(/s$/, '')}` : (item.name || item.title || item.key)}
                            </h3>
                            {!isNew && (
                                <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                                    ID: {item._id} &nbsp;·&nbsp; Updated: {new Date(item.updatedAt || Date.now()).toLocaleString()}
                                </p>
                            )}
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        {/* Sub-view tabs */}
                        <nav className="flex bg-slate-100 p-1 rounded-xl gap-1">
                            {!isNew && (
                                <>
                                    <button 
                                        onClick={() => setDetailSubView('info')}
                                        className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${detailSubView === 'info' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                    >
                                        Details
                                    </button>
                                    {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                        <button 
                                            onClick={() => setDetailSubView('reviews')}
                                            className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${detailSubView === 'reviews' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                                        >
                                            Reviews ({item.reviews?.length || 0})
                                        </button>
                                    )}
                                </>
                            )}
                            <button 
                                onClick={() => setDetailSubView('edit')}
                                className={`px-4 py-1.5 text-xs rounded-lg font-bold transition-all ${detailSubView === 'edit' ? 'bg-white text-lt-blue shadow-sm' : 'text-slate-500 hover:bg-slate-200/50'}`}
                            >
                                {isNew ? 'Create' : 'Edit'}
                            </button>
                        </nav>
                        
                        {!isNew && (
                            <button 
                                onClick={() => handleDelete(item._id)}
                                className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                                title="Delete Record"
                            >
                                <i className="fas fa-trash-alt text-xs"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Scrollable content ────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {detailSubView === 'info' && (
                        <div className="max-w-5xl mx-auto">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-8">
                                    {fields.map(([key, value]: [string, any]) => (
                                        <div key={key} className="group bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 group-hover:text-lt-blue transition-colors">
                                                {key.replace(/([A-Z])/g, ' $1').trim()}
                                            </label>
                                            <div className="text-slate-700 text-sm leading-relaxed">
                                                {renderValue(key, value)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="space-y-6">
                                    {item.image && (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="p-4 border-b border-slate-100">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Featured Image</label>
                                            </div>
                                            <div className="aspect-video">
                                                <img src={item.image} alt="" className="w-full h-full object-cover" />
                                            </div>
                                        </div>
                                    )}
                                    
                                    {item.gallery && item.gallery.length > 0 && (
                                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                            <div className="p-4 border-b border-slate-100">
                                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gallery ({item.gallery.length})</label>
                                            </div>
                                            <div className="p-4 grid grid-cols-2 gap-3">
                                                {item.gallery.map((img: string, i: number) => (
                                                    <div key={i} className="aspect-square rounded-xl overflow-hidden border border-slate-200 hover:ring-2 hover:ring-lt-blue transition-all cursor-pointer">
                                                        <img src={img} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Quick actions sidebar card */}
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-2">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Quick Actions</p>
                                        <button
                                            onClick={() => setDetailSubView('edit')}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-lt-blue/5 text-lt-blue hover:bg-lt-blue hover:text-white rounded-xl text-xs font-bold transition-all"
                                        >
                                            <i className="fas fa-pen w-4 text-center"></i>
                                            Edit this record
                                        </button>
                                        {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                            <button
                                                onClick={() => setDetailSubView('reviews')}
                                                className="w-full flex items-center gap-3 px-4 py-3 bg-lt-orange/5 text-lt-orange hover:bg-lt-orange hover:text-white rounded-xl text-xs font-bold transition-all"
                                            >
                                                <i className="fas fa-comment-dots w-4 text-center"></i>
                                                View reviews ({item.reviews?.length || 0})
                                            </button>
                                        )}
                                        {activeTab === 'blog-posts' && item.status === 'pending' && (
                                            <button
                                                onClick={() => handleApprove(item._id)}
                                                className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 text-green-600 hover:bg-green-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                                            >
                                                <i className="fas fa-check w-4 text-center"></i>
                                                Approve post
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(item._id)}
                                            className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-xl text-xs font-bold transition-all"
                                        >
                                            <i className="fas fa-trash-alt w-4 text-center"></i>
                                            Delete record
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {detailSubView === 'reviews' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center justify-between mb-8">
                                <h4 className="font-bold text-slate-800 text-lg">User Reviews</h4>
                                <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">{item.reviews?.length || 0} Total</span>
                            </div>
                            
                            <div className="space-y-4">
                                {(!item.reviews || item.reviews.length === 0) ? (
                                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                                        <i className="fas fa-comment-slash text-3xl text-slate-300 mb-4"></i>
                                        <p className="text-slate-500 text-sm">No reviews yet for this spot.</p>
                                    </div>
                                ) : (
                                    item.reviews.map((review: any) => (
                                        <div key={review._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-lt-blue transition-all group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold relative">
                                                        {review.user?.charAt(0) || 'U'}
                                                        {!review.isSeen && (
                                                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-bold text-slate-800 text-sm">{review.user}</p>
                                                            {review.isResolved && (
                                                                <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[8px] font-bold rounded-full uppercase">Resolved</span>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <div className="flex text-lt-orange text-[10px]">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <i key={i} className={`fas fa-star ${i < review.rating ? '' : 'opacity-20'}`}></i>
                                                                ))}
                                                            </div>
                                                            <span className="text-[10px] text-slate-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                    {!review.isSeen && (
                                                        <button 
                                                            onClick={() => handleMarkReviewSeen(review._id)}
                                                            className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-lt-blue hover:text-white rounded-lg text-[10px] font-bold transition-all"
                                                            title="Mark as Seen"
                                                        >
                                                            Mark Seen
                                                        </button>
                                                    )}
                                                    {!review.isResolved && (
                                                        <button 
                                                            onClick={() => handleMarkReviewResolved(review._id)}
                                                            className="px-3 py-1 bg-slate-100 text-slate-600 hover:bg-green-500 hover:text-white rounded-lg text-[10px] font-bold transition-all"
                                                            title="Mark as Resolved"
                                                        >
                                                            Resolve
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => handleDeleteReview(review._id)}
                                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all"
                                                    >
                                                        <i className="fas fa-trash-alt text-xs"></i>
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-slate-600 text-sm leading-relaxed italic">"{review.comment}"</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {detailSubView === 'edit' && (
                        <div className="max-w-3xl mx-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Basic Information</p>

                                    {activeTab !== 'events' && activeTab !== 'blog-posts' && renderInput('name', 'Name', 'text', 'e.g., Strawberry Farm')}
                                    {(activeTab === 'blog-posts' || activeTab === 'events') && renderInput('title', 'Title', 'text', 'e.g., My Trip to the Valley')}
                                    
                                    <UniversalImageSelector 
                                        onImageSelected={(url) => setFormData({...formData, image: url})}
                                        aspectRatio={activeTab === 'blog-posts' || activeTab === 'events' ? 16 / 9 : 4 / 3}
                                        label="Display Image"
                                        currentImage={formData.image}
                                    />

                                    {renderInput('description', 'Short Summary', 'textarea', 'A brief overview of this spot or event...')}
                                    {activeTab !== 'blog-posts' && renderInput('location', 'Location', 'text', 'e.g., Km. 6, La Trinidad')}
                                </div>

                                {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Spot Details</p>
                                        {activeTab === 'tourist-spots' && renderInput('history', 'Background Story', 'textarea', 'The historical significance or origin story...')}
                                        <div className="grid grid-cols-2 gap-4">
                                            {renderInput('category', 'Category Label', 'text', 'e.g., Nature / Farm')}
                                            {renderInput('openingHours', 'Business Hours', 'text', 'e.g., 8:00 AM - 5:00 PM')}
                                        </div>
                                        {renderInput('bestTimeToVisit', 'Best Visit Time', 'text', 'e.g., November to April')}
                                    </div>
                                )}

                                {activeTab === 'tourist-spots' && renderGalleryInput('Gallery Images')}

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
        <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
            <i className="fas fa-calendar-check text-lt-blue"></i>
            Saves as: <span className="font-bold text-slate-700">{formData.date}</span>
        </p>
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
                                        {renderInput('content', 'Article Body (Markdown/HTML)', 'textarea', 'Write the full article content here...')}
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
                        </div>
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
                className={`bg-white border-r border-slate-200 flex flex-col h-screen z-40 transition-all duration-300 ease-in-out shrink-0 ${
                    isSidebarOpen && !isDetailView ? 'w-72' : 'w-0 overflow-hidden'
                }`}
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between min-w-[288px]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-lt-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-lt-blue/20">
                            <i className="fas fa-user-shield text-xl"></i>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-900 leading-none">Admin</h1>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Control Panel</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-slate-400 hover:text-lt-blue transition-colors"
                    >
                        <i className="fas fa-chevron-left"></i>
                    </button>
                </div>

                <nav className="flex-grow p-4 space-y-1 overflow-y-auto custom-scrollbar min-w-[288px]">
                    <div className="px-3 mb-2 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Management</p>
                        {viewMode === 'preview' && (
                            <button 
                                onClick={() => setViewMode('management')}
                                className="text-[10px] font-bold text-lt-blue hover:underline"
                            >
                                Back to Data
                            </button>
                        )}
                    </div>
                    {TABS.map((tab: any) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all group ${
                                activeTab === tab.id && viewMode === 'management'
                                ? 'bg-lt-blue text-white shadow-md shadow-lt-blue/20' 
                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <i className={`fas ${tab.icon} w-5 text-center ${activeTab === tab.id && viewMode === 'management' ? 'text-white' : 'text-slate-400 group-hover:text-lt-blue'}`}></i>
                            {tab.label}
                            {tab.id === 'tourist-spots' && notifications.touristReviews > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold min-w-[18px] text-center">
                                    {notifications.touristReviews}
                                </span>
                            )}
                            {tab.id === 'dining-spots' && notifications.diningReviews > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold min-w-[18px] text-center">
                                    {notifications.diningReviews}
                                </span>
                            )}
                            {tab.id === 'reports' && notifications.reports > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold min-w-[18px] text-center">
                                    {notifications.reports}
                                </span>
                            )}
                            {tab.id === 'blog-posts' && notifications.blogPosts > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-red-500 text-white rounded-full font-bold min-w-[18px] text-center">
                                    {notifications.blogPosts}
                                </span>
                            )}
                            {activeTab === tab.id && viewMode === 'management' && (
                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white"></div>
                            )}
                        </button>
                    ))}
                </nav>

                <div className="p-4 border-t border-slate-100 min-w-[288px]">
                    <button 
                        onClick={() => setIsLogoutConfirmOpen(true)} 
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm text-red-500 hover:bg-red-50 transition-all"
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
                    <header className="bg-white border-b border-slate-200 px-8 py-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-20 gap-4">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <div className="flex items-center gap-3">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {viewMode === 'management' ? TABS.find(t => t.id === activeTab)?.label : 'Site Preview'}
                                </h2>
                                {viewMode === 'management' && activeTab !== 'analytics' && (
                                    <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                                        {data.length} Records
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto justify-end">
                            {viewMode === 'management' && activeTab !== 'reports' && activeTab !== 'analytics' && activeTab !== 'activity-log' && (
                                <button 
                                    onClick={() => handleOpenModal()} 
                                    className="bg-lt-blue hover:bg-lt-moss text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md shadow-lt-blue/10 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <i className="fas fa-plus"></i> Add New
                                </button>
                            )}
                            {activeTab === 'analytics' && (
                                <button 
                                    onClick={() => loadData('analytics')} 
                                    className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-50 transition-all flex items-center gap-2 active:scale-95"
                                >
                                    <i className="fas fa-sync-alt"></i> Refresh
                                </button>
                            )}
                            <button 
                                onClick={() => {
                                    if (viewMode === 'preview') setViewMode('management');
                                    else setViewMode('preview');
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 border ${
                                    viewMode === 'preview' 
                                    ? 'bg-lt-orange text-white border-lt-orange shadow-md shadow-lt-orange/20' 
                                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                <i className={`fas ${viewMode === 'preview' ? 'fa-edit' : 'fa-eye'}`}></i>
                                {viewMode === 'preview' ? 'Exit Preview' : 'Live Preview'}
                            </button>
                            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-lt-orange/10 text-lt-orange flex items-center justify-center text-xs font-bold">
                                    AD
                                </div>
                                <span className="text-xs font-bold text-slate-600 hidden sm:block">Administrator</span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 mx-2 hidden sm:block"></div>
                            <Link 
                                to="/" 
                                className="flex items-center gap-2 px-3 py-2 text-slate-500 hover:text-lt-blue transition-colors group"
                                title="Return to public website"
                            >
                                <i className="fas fa-external-link-alt text-xs group-hover:scale-110 transition-transform"></i>
                                <span className="text-xs font-bold hidden lg:block">Website</span>
                            </Link>
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
                                            <div className="p-32 text-center text-slate-400">
                                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                                    <i className="fas fa-folder-open text-3xl opacity-20"></i>
                                                </div>
                                                <h3 className="text-lg font-bold text-slate-900 mb-1">No results found</h3>
                                                <p className="text-sm text-slate-500">There are no records to display in this section yet.</p>
                                                {activeTab !== 'reports' && (
                                                    <button 
                                                        onClick={() => handleOpenModal()}
                                                        className="mt-6 text-lt-blue font-bold text-sm hover:underline"
                                                    >
                                                        Create your first entry
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left">
                                                    <thead className="bg-slate-50/50 text-slate-400 text-[10px] uppercase tracking-widest font-bold border-b border-slate-200">
                                                        <tr>
                                                            {activeTab !== 'reports' && <th className="p-5 w-20 text-center">Media</th>}
                                                            {activeTab === 'reports' ? (
                                                                <>
                                                                    <th className="p-5">Target</th>
                                                                    <th className="p-5">Reason</th>
                                                                    <th className="p-5">Description</th>
                                                                </>
                                                            ) : (
                                                                <th className="p-5">Information</th>
                                                            )}
                                                            {activeTab === 'blog-posts' && <th className="p-5">Status</th>}
                                                            {activeTab === 'blog-posts' && <th className="p-5">Author</th>}
                                                            {(activeTab === 'tourist-spots' || activeTab === 'blog-posts') && <th className="p-5 text-center">Views</th>}
                                                            {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && <th className="p-5 text-center">Reviews</th>}
                                                            <th className="p-5 text-right">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-100">
                                                        {sortedData.map((item: any) => (
                                                            <tr 
                                                                key={item._id} 
                                                                className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                                                                onClick={() => handleOpenDetailModal(item)}
                                                            >
                                                                {activeTab !== 'reports' && (
                                                                    <td className="p-5" onClick={e => e.stopPropagation()}>
                                                                        <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                                                                            <img src={item.image} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                
                                                                {activeTab === 'reports' ? (
                                                                    <>
                                                                        <td className="p-5">
                                                                            <div className="flex items-start gap-3">
                                                                                {!item.isSeen && (
                                                                                    <div className="mt-1.5">
                                                                                        <span className="relative flex h-2 w-2">
                                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                                                        </span>
                                                                                    </div>
                                                                                )}
                                                                                <div>
                                                                                    <div className="font-bold text-slate-800 text-sm">{item.targetName}</div>
                                                                                    <div className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">{item.targetType}</div>
                                                                                </div>
                                                                            </div>
                                                                        </td>
                                                                        <td className="p-5">
                                                                            <span className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-2 py-1 rounded-lg font-bold uppercase tracking-wider">
                                                                                {item.reason}
                                                                            </span>
                                                                        </td>
                                                                        <td className="p-5 text-xs text-slate-500 max-w-xs truncate">{item.description}</td>
                                                                    </>
                                                                ) : (
                                                                    <td className="p-5">
                                                                        <div className="flex items-start gap-3">
                                                                            {activeTab === 'blog-posts' && !item.isSeen && (
                                                                                <div className="mt-1.5">
                                                                                    <span className="relative flex h-2 w-2">
                                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                                                    </span>
                                                                                </div>
                                                                            )}
                                                                            <div>
                                                                                <div className="font-bold text-slate-800 text-sm group-hover:text-lt-blue transition-colors">{item.name || item.title}</div>
                                                                                <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-1">
                                                                                    <i className="fas fa-map-marker-alt text-[8px]"></i>
                                                                                    {item.location || item.date || 'No meta provided'}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </td>
                                                                )}

                                                                {activeTab === 'blog-posts' && (
                                                                    <td className="p-5">
                                                                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-lg border ${
                                                                            item.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                                            item.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' :
                                                                            'bg-red-50 text-red-600 border-red-200'
                                                                        }`}>
                                                                            {item.status || 'approved'}
                                                                        </span>
                                                                    </td>
                                                                )}
                                                                {activeTab === 'blog-posts' && (
                                                                    <td className="p-5">
                                                                        <div className="text-xs font-bold text-slate-700">{item.author}</div>
                                                                        {item.email && <div className="text-[10px] text-slate-400">{item.email}</div>}
                                                                    </td>
                                                                )}
                                                                {(activeTab === 'tourist-spots' || activeTab === 'blog-posts') && (
                                                                    <td className="p-5 text-center">
                                                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold">
                                                                            <i className="fas fa-eye text-[8px]"></i>
                                                                            {item.views || 0}
                                                                        </div>
                                                                    </td>
                                                                )}
                                                                {(activeTab === 'tourist-spots' || activeTab === 'dining-spots') && (
                                                                    <td className="p-5 text-center" onClick={e => e.stopPropagation()}>
                                                                        <button 
                                                                            onClick={() => handleOpenReviewModal(item)}
                                                                            className="inline-flex items-center gap-2 text-slate-400 hover:text-lt-orange transition-colors bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm"
                                                                        >
                                                                            <i className="fas fa-comment-dots text-[10px]"></i> 
                                                                            {item.reviews?.length || 0}
                                                                        </button>
                                                                    </td>
                                                                )}
                                                                <td className="p-5 text-right" onClick={e => e.stopPropagation()}>
                                                                    <div className="flex justify-end gap-2">
                                                                        {activeTab === 'blog-posts' && item.status === 'pending' && (
                                                                            <button onClick={() => handleApprove(item._id)} className="bg-lt-blue text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-lt-moss shadow-sm transition-all">
                                                                                Approve
                                                                            </button>
                                                                        )}
                                                                        {activeTab === 'reports' ? (
                                                                            <button onClick={() => handleDelete(item._id)} className="bg-lt-blue text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-lt-moss shadow-sm transition-all">
                                                                                Resolve
                                                                            </button>
                                                                        ) : (
                                                                            <>
                                                                                <button onClick={() => handleOpenModal(item)} className="p-2 text-slate-400 hover:text-lt-blue hover:bg-slate-100 rounded-lg transition-colors" title="Edit Item">
                                                                                    <i className="fas fa-pen text-xs"></i>
                                                                                </button>
                                                                                <button onClick={() => handleDelete(item._id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete Item">
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