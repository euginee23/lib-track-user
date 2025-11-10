import React, { useEffect, useState } from "react";
import { FaBook, FaExclamationTriangle, FaHistory, FaReceipt, FaMoneyBill, FaCheckCircle, FaUndo, FaClock, FaStar, FaChevronRight } from 'react-icons/fa';
import authService from "../utils/auth";
import { getTransactionHistory, getOngoingTransactions, getReturnedTransactions } from "../../api/dashboard/getTransactionHistory";
import { getPaymentHistory } from "../../api/dashboard/getPaymentHistory";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ongoing, setOngoing] = useState([]);
  const [finesSummary, setFinesSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('borrowed'); // 'borrowed', 'history', 'returned', 'payments'
  const [isMobile, setIsMobile] = useState(false);

  const [selectedReceipt, setSelectedReceipt] = useState(null);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Get current user id from auth service (tries stored user first, then token)
  const getCurrentUserId = () => {
    const stored = authService.getUser();
    const fromToken = authService.getUserFromToken();
    const user = stored || fromToken || null;
    return user?.user_id || user?.id || null;
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);

      const userId = getCurrentUserId();
      if (!userId) {
        setError('Please login to view your dashboard');
        setLoading(false);
        return;
      }

      try {
        // Fetch all transaction data using the new API functions
        const [ongoingData, allTransactions, returnedData, paymentsData] = await Promise.all([
          getOngoingTransactions(userId),
          getTransactionHistory(userId),
          getReturnedTransactions(userId),
          getPaymentHistory(userId)
        ]);

        if (!mounted) return;

        // Set payment history from API
        setPaymentHistory(paymentsData || []);

        // Fetch penalties for user and merge into ongoing items (so active transactions show up-to-date fines)
        let penaltiesJson = null;
        try {
          const penaltiesRes = await fetch(`${API}/api/penalties?user_id=${userId}`);
          penaltiesJson = await penaltiesRes.json();
        } catch (err) {
          console.warn('Failed to fetch penalties for merging into ongoing items:', err);
        }

        // Fetch fines summary for user
        let finesJson = null;
        try {
          const finesRes = await fetch(`${API}/api/fines/user/${userId}`);
          finesJson = await finesRes.json();
          if (finesRes.ok) {
            setFinesSummary(finesJson.data || null);
          }
        } catch (err) {
          console.warn('Failed to fetch fines summary:', err);
        }

        // Merge penalties into ongoing transactions
        const penaltiesList = penaltiesJson?.data?.penalties || [];
        const penaltyMap = {};
        for (const p of penaltiesList) {
          if (p.transaction_id) penaltyMap[p.transaction_id] = p;
        }

        const mergedOngoing = ongoingData
          .filter(t => {
            // Only show items that are NOT returned
            const status = String(t.status || t.transaction_type || '').toLowerCase();
            return status !== 'returned' && status !== 'return';
          })
          .map(t => {
            const pen = penaltyMap[t.transaction_id];
            const fineFromPenalty = pen && (pen.fine !== undefined && pen.fine !== null) ? Number(pen.fine) : null;
            const penaltyStatus = pen && pen.status ? String(pen.status).toLowerCase() : null;
            return {
              ...t,
              fine: fineFromPenalty !== null ? fineFromPenalty : (t.fine ? Number(t.fine) : 0),
              // expose penalty info for UI (show Paid badge)
              penaltyStatus: penaltyStatus === 'paid' ? 'Paid' : null,
              penalty_id: pen?.penalty_id || null,
              penalty_updated_at: pen?.updated_at || null,
            };
          });

        setOngoing(mergedOngoing);
        
        // Set the full transaction history (for the History tab - shows ALL transactions)
        setHistory(allTransactions);

      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Failed to load dashboard data');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => { mounted = false; };
  }, []);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    try {
      const d = new Date(value);
      return d.toLocaleDateString();
    } catch {
      return value;
    }
  };

  const daysRemaining = (dueDate) => {
    if (!dueDate) return null;
    const d = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((d - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  // Render a compact status badge similar to BookTransactions.getStatusBadge
  const getStatusBadge = (transaction) => {
    const d = daysRemaining(transaction.due_date);
    // build main badge based on due date
    let mainBadge = null;
    if (d === null) mainBadge = <span className="badge bg-secondary small">No due date</span>;
    else if (d < 0) mainBadge = <span className="badge bg-danger small">Overdue</span>;
    else if (d === 0) mainBadge = <span className="badge bg-warning text-dark small">Due today</span>;
    else mainBadge = <span className="badge bg-success small">{d} day{d !== 1 ? 's' : ''}</span>;

    // If there's a paid penalty for this transaction, show a small Paid badge stacked above
    if (transaction && transaction.penaltyStatus === 'Paid') {
      return (
        <div className="d-flex flex-column align-items-start">
          <small className="badge bg-success text-white small" style={{ lineHeight: 1, padding: '2px 6px' }}>Paid</small>
          <div style={{ marginTop: 4 }}>{mainBadge}</div>
        </div>
      );
    }

    return mainBadge;
  };

  const openReceipt = async (transaction) => {
    // If receipt available in the transaction data, use it. Otherwise fetch details.
    const pick = (src) => {
      if (!src) {
        setSelectedReceipt({ src: null, transaction });
        return;
      }
      setSelectedReceipt({ src: normalizeImageSrc(src), transaction });
    };

    if (transaction.receipt_image || transaction.book_cover) {
      return pick(transaction.receipt_image || transaction.book_cover);
    }

    try {
      const res = await fetch(`${API}/api/transactions/${transaction.transaction_id}`);
      if (!res.ok) throw new Error('Failed to fetch transaction');
      const json = await res.json();
      const src = json.data?.receipt_image || json.data?.book_cover || null;
      pick(src);
    } catch (err) {
      console.error('Failed to load receipt image:', err);
      setSelectedReceipt({ src: null, transaction });
    }
  };

  const normalizeImageSrc = (src) => {
    if (!src) return null;

    // If it's already an absolute URL or a data URI, return as-is
    if (typeof src === 'string' && (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:'))) {
      return src;
    }

    // Handle object shapes commonly returned by APIs:
    // - { type: 'Buffer', data: [...] }  (convert to data URI)
    // - { data: { url: '...' } } or { url: '...' }
    if (typeof src === 'object') {
      // Buffer shape
      if (src.type === 'Buffer' && Array.isArray(src.data)) {
        try {
          const uint8Array = new Uint8Array(src.data);
          let binaryString = '';
          const chunkSize = 8192;
          for (let i = 0; i < uint8Array.length; i += chunkSize) {
            binaryString += String.fromCharCode.apply(null, uint8Array.slice(i, i + chunkSize));
          }
          const base64String = btoa(binaryString);
          return `data:image/jpeg;base64,${base64String}`;
        } catch (err) {
          console.error('normalizeImageSrc: failed to convert Buffer to base64', err);
          return null;
        }
      }

      // Nested url in data
      if (src.data && typeof src.data === 'string') return normalizeImageSrc(src.data);
      if (src.data && src.data.url) return normalizeImageSrc(src.data.url);
      if (src.url) return normalizeImageSrc(src.url);

      return null;
    }

    // Otherwise treat as relative path and prepend API host if available
    const apiHost = API ? API.replace(/\/$/, '') : '';
    if (typeof src === 'string' && src.startsWith('/')) return `${apiHost}${src}`;
    return `${apiHost}/${src}`;
  };

  // derive quick stats
  const overdueCount = ongoing.filter(t => {
    try {
      const d = t.due_date ? new Date(t.due_date) : null;
      return d ? (Math.ceil((d - new Date()) / (1000*60*60*24)) < 0) : false;
    } catch {
      return false;
    }
  }).length;

  // Payment history (penalties from API)
  const [paymentHistory, setPaymentHistory] = useState([]);

  // Calculate total paid fines from payment history
  const totalPaidFines = paymentHistory
    .filter(penalty => penalty.status && penalty.status.toLowerCase() === 'paid')
    .reduce((sum, penalty) => sum + Number(penalty.fine || 0), 0);

  const detailsList = finesSummary?.transactions || [];
  const detailsContainerStyle = detailsList.length > 5
    ? { maxHeight: '280px', overflowY: 'auto' }
    : { maxHeight: 'none', overflowY: 'visible' };

  return (
    <div style={{ 
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '100px'
    }}>
      {/* Loading State */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '56px 12px' }}>
          <div style={{
            width: 'min(880px, 96%)',
            background: 'rgba(255,255,255,0.98)',
            borderRadius: '16px',
            padding: '28px 24px',
            boxShadow: '0 18px 40px rgba(12,150,156,0.12)',
            border: '1px solid rgba(12,150,156,0.08)'
          }}>
            <div style={{ display: 'flex', gap: '18px', alignItems: 'center' }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                boxShadow: '0 8px 20px rgba(12,150,156,0.24)'
              }}>
                <FaBook size={28} />
              </div>

              <div style={{ textAlign: 'left', flex: 1 }}>
                <h4 style={{ margin: 0, color: '#0A7075', fontWeight: 800 }}>Loading your dashboard</h4>
                <p style={{ margin: '6px 0 0', color: '#6BA3BE' }}>Fetching your transactions and activity data...</p>
                <div style={{ marginTop: 16 }}>
                  <div style={{ height: 12, background: 'rgba(12,150,156,0.08)', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{
                      width: '48%',
                      height: '100%',
                      background: 'linear-gradient(90deg, rgba(12,150,156,0.9), rgba(107,163,190,0.9))',
                      transform: 'translateX(-10%)',
                      animation: 'ltLoadingBar 1.6s ease-in-out infinite'
                    }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style>{`@keyframes ltLoadingBar { 0% { transform: translateX(-30%); } 50% { transform: translateX(20%); } 100% { transform: translateX(120%); } }`}</style>
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <div className="container-fluid px-3 px-lg-4" style={{ maxWidth: '1200px' }}>
          {/* Hero Section */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: isMobile ? '16px' : '24px',
            padding: isMobile ? '24px' : '40px',
            marginBottom: '20px',
            boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}>
            <div className="row align-items-center">
              <div className="col-lg-8">
                <h2 style={{ 
                  color: '#0C969C',
                  fontWeight: '700',
                  marginBottom: '16px',
                  fontSize: isMobile ? '1.8rem' : '2.5rem'
                }}>
                  My Library Dashboard
                </h2>
                <p style={{ 
                  color: '#0A7075',
                  marginBottom: isMobile ? '24px' : '0',
                  fontSize: isMobile ? '1rem' : '1.1rem',
                  opacity: 0.8
                }}>
                  Track your borrowed books, history, and library activity
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className="col-lg-4 mt-4 mt-lg-0">
                <div className="row g-2 g-lg-4">
                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        {ongoing.length}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Currently Borrowed
                      </small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #EF4444, #F87171)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        {overdueCount}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Overdue
                      </small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #EAB308, #FBBF24)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        ₱{Number(finesSummary?.total_fine || 0).toFixed(2)}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Total Fines
                      </small>
                    </div>
                  </div>

                  <div className="col-6">
                    <div style={{
                      background: 'linear-gradient(135deg, #10B981, #34D399)',
                      borderRadius: isMobile ? '12px' : '16px',
                      padding: isMobile ? '16px 12px' : '20px',
                      textAlign: 'center',
                      color: 'white'
                    }}>
                      <div style={{ 
                        fontSize: isMobile ? '20px' : '24px', 
                        fontWeight: '700' 
                      }}>
                        ₱{totalPaidFines.toFixed(2)}
                      </div>
                      <small style={{ 
                        fontSize: isMobile ? '10px' : '12px', 
                        opacity: 0.9 
                      }}>
                        Total Paid
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mb-3 mb-lg-4">
            <div style={{
              display: isMobile ? 'grid' : 'flex',
              gridTemplateColumns: isMobile ? '1fr 1fr' : 'none',
              gap: isMobile ? '8px' : '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              padding: isMobile ? '8px' : '8px',
              borderRadius: isMobile ? '12px' : '16px',
              boxShadow: '0 4px 20px rgba(12, 150, 156, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              maxWidth: isMobile ? '100%' : '900px',
              margin: '0 auto'
            }}>
              <button
                onClick={() => setActiveTab('history')}
                style={{
                  flex: isMobile ? 'none' : 1,
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: isMobile ? '12px 8px' : '14px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'history'
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                    : 'transparent',
                  color: activeTab === 'history' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'history'
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                    : 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  lineHeight: isMobile ? '1.3' : '1.5',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile && activeTab !== 'history') {
                    e.currentTarget.style.background = 'rgba(12, 150, 156, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && activeTab !== 'history') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                History
              </button>

              <button
                onClick={() => setActiveTab('borrowed')}
                style={{
                  flex: isMobile ? 'none' : 1,
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: isMobile ? '12px 8px' : '14px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'borrowed'
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                    : 'transparent',
                  color: activeTab === 'borrowed' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'borrowed'
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                    : 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  lineHeight: isMobile ? '1.3' : '1.5',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile && activeTab !== 'borrowed') {
                    e.currentTarget.style.background = 'rgba(12, 150, 156, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && activeTab !== 'borrowed') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                Currently Borrowed
              </button>

              <button
                onClick={() => setActiveTab('returned')}
                style={{
                  flex: isMobile ? 'none' : 1,
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: isMobile ? '12px 8px' : '14px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'returned'
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                    : 'transparent',
                  color: activeTab === 'returned' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'returned'
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                    : 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  lineHeight: isMobile ? '1.3' : '1.5',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile && activeTab !== 'returned') {
                    e.currentTarget.style.background = 'rgba(12, 150, 156, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && activeTab !== 'returned') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                Returned
              </button>

              <button
                onClick={() => setActiveTab('payments')}
                style={{
                  flex: isMobile ? 'none' : 1,
                  minWidth: 0,
                  boxSizing: 'border-box',
                  padding: isMobile ? '12px 8px' : '14px 24px',
                  border: 'none',
                  borderRadius: isMobile ? '8px' : '12px',
                  background: activeTab === 'payments'
                    ? 'linear-gradient(135deg, #0C969C, #6BA3BE)'
                    : 'transparent',
                  color: activeTab === 'payments' ? 'white' : '#0C969C',
                  fontWeight: '600',
                  fontSize: isMobile ? '12px' : '15px',
                  transition: 'all 0.3s ease',
                  boxShadow: activeTab === 'payments'
                    ? '0 4px 12px rgba(12, 150, 156, 0.3)'
                    : 'none',
                  cursor: 'pointer',
                  textAlign: 'center',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  lineHeight: isMobile ? '1.3' : '1.5',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  if (!isMobile && activeTab !== 'payments') {
                    e.currentTarget.style.background = 'rgba(12, 150, 156, 0.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isMobile && activeTab !== 'payments') {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                Payment History
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="alert alert-danger mx-3" role="alert">
              <h5 className="alert-heading">Error Loading Dashboard</h5>
              <p>{error}</p>
            </div>
          )}

          {/* Currently Borrowed Tab */}
          {activeTab === 'borrowed' && (
            <div className="row g-3">
              {ongoing.length === 0 ? (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: isMobile ? '16px' : '20px',
                      padding: isMobile ? '32px 20px' : '48px 24px',
                      boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      margin: '0 auto',
                      maxWidth: '400px'
                    }}>
                      <FaBook size={isMobile ? 48 : 56} style={{ color: '#6BA3BE', opacity: 0.5, marginBottom: '16px' }} />
                      <h5 style={{ 
                        fontWeight: '700',
                        marginBottom: '8px',
                        color: '#0A7075',
                        fontSize: isMobile ? '18px' : '20px'
                      }}>
                        No Borrowed Items
                      </h5>
                      <p style={{ 
                        color: '#6BA3BE',
                        marginBottom: '0',
                        fontSize: isMobile ? '14px' : '16px'
                      }}>
                        You don't have any active borrowed items at the moment
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                ongoing.map(t => (
                  <div key={t.transaction_id} className="col-12">
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: isMobile ? '16px' : '20px',
                        overflow: 'hidden',
                        boxShadow: '0 4px 16px rgba(12, 150, 156, 0.12)',
                        border: '1px solid rgba(12, 150, 156, 0.08)',
                        transition: 'all 0.3s ease',
                        cursor: 'pointer'
                      }}
                      onClick={() => openReceipt(t)}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-4px)';
                          e.currentTarget.style.boxShadow = '0 12px 32px rgba(12, 150, 156, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(12, 150, 156, 0.12)';
                        }
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '0' : '20px',
                      }}>
                        {/* Book Cover or Placeholder */}
                        {(t.receipt_image || t.book_cover) ? (
                          <div style={{
                            width: isMobile ? '100%' : '140px',
                            height: isMobile ? '180px' : '200px',
                            flexShrink: 0,
                            overflow: 'hidden',
                            borderRadius: isMobile ? '0' : '12px',
                            boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}>
                            <img
                              src={normalizeImageSrc(t.receipt_image || t.book_cover)}
                              alt={t.book_title || t.research_title || 'Item'}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                              }}
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjI0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                              }}
                            />
                          </div>
                        ) : (
                          <div style={{
                            width: isMobile ? '100%' : '140px',
                            height: isMobile ? '160px' : '200px',
                            flexShrink: 0,
                            background: 'linear-gradient(135deg, #6BA3BE, #0C969C)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: isMobile ? '12px' : '14px',
                            padding: isMobile ? '20px' : '16px',
                            borderRadius: isMobile ? '0' : '12px',
                            boxShadow: isMobile ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.1)'
                          }}>
                            <FaBook size={isMobile ? 40 : 44} style={{ color: 'white', opacity: 0.95 }} />
                            <div style={{
                              color: 'white',
                              fontSize: isMobile ? '10px' : '11px',
                              fontWeight: '700',
                              textAlign: 'center',
                              opacity: 0.95,
                              textTransform: 'uppercase',
                              letterSpacing: '1px',
                              lineHeight: '1.4'
                            }}>
                              No Image<br/>Available
                            </div>
                          </div>
                        )}
                        
                        {/* Transaction Info */}
                        <div style={{ 
                          padding: isMobile ? '16px' : '24px 24px 24px 0',
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column'
                        }}>
                          {/* Status Badge */}
                          <div style={{ marginBottom: isMobile ? '12px' : '16px' }}>
                            {getStatusBadge(t)}
                          </div>

                          <h5 style={{ 
                            fontSize: isMobile ? '16px' : '17px',
                            fontWeight: '700',
                            color: '#0A7075',
                            lineHeight: '1.3',
                            marginBottom: isMobile ? '6px' : '8px'
                          }}>
                            {t.book_title || t.research_title || 'Item'}
                          </h5>
                          
                          <p style={{ 
                            color: '#6BA3BE',
                            fontSize: isMobile ? '11px' : '13px',
                            marginBottom: isMobile ? '12px' : '14px',
                            fontWeight: '500'
                          }}>
                            {t.book_title ? 'Book' : (t.research_title ? 'Research Paper' : (t.transaction_type ? (t.transaction_type.charAt(0).toUpperCase() + t.transaction_type.slice(1)) : 'Item'))}
                            {' • Ref: '}{t.reference_number || t.transaction_id}
                          </p>

                          {/* Transaction Details */}
                          <div style={{
                            background: 'linear-gradient(135deg, rgba(12, 150, 156, 0.03), rgba(107, 163, 190, 0.03))',
                            borderRadius: isMobile ? '10px' : '12px',
                            padding: isMobile ? '10px 12px' : '14px',
                            marginBottom: isMobile ? '12px' : '14px',
                            border: '1px solid rgba(12, 150, 156, 0.08)'
                          }}>
                            <div className="row g-2">
                              <div className="col-6">
                                <small style={{ 
                                  color: '#6BA3BE', 
                                  fontSize: isMobile ? '9px' : '10px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.3px'
                                }}>
                                  Borrowed On
                                </small>
                                <div style={{ 
                                  fontSize: isMobile ? '11px' : '12px',
                                  fontWeight: '700',
                                  color: '#0C969C'
                                }}>
                                  {formatDate(t.transaction_date)}
                                </div>
                              </div>
                              <div className="col-6">
                                <small style={{ 
                                  color: '#6BA3BE', 
                                  fontSize: isMobile ? '9px' : '10px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.3px'
                                }}>
                                  Due Date
                                </small>
                                <div style={{ 
                                  fontSize: isMobile ? '11px' : '12px',
                                  fontWeight: '700',
                                  color: '#0C969C'
                                }}>
                                  {formatDate(t.due_date)}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Fine Info */}
                          {t.fine && t.fine > 0 ? (
                            <div style={{
                              background: t.penaltyStatus === 'Paid' 
                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05))'
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.05), rgba(248, 113, 113, 0.05))',
                              borderRadius: isMobile ? '8px' : '10px',
                              padding: isMobile ? '8px 10px' : '12px 14px',
                              border: t.penaltyStatus === 'Paid'
                                ? '1px solid rgba(16, 185, 129, 0.15)'
                                : '1px solid rgba(239, 68, 68, 0.15)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                color: t.penaltyStatus === 'Paid' ? '#10B981' : '#EF4444',
                                fontSize: isMobile ? '10px' : '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}>
                                {t.penaltyStatus === 'Paid' ? (
                                  <FaCheckCircle style={{ marginRight: '6px', fontSize: isMobile ? '10px' : '11px' }} />
                                ) : (
                                  <FaExclamationTriangle style={{ marginRight: '6px', fontSize: isMobile ? '10px' : '11px' }} />
                                )}
                                Fine Amount {t.penaltyStatus === 'Paid' ? '(Paid)' : ''}
                              </span>
                              <span style={{
                                color: t.penaltyStatus === 'Paid' ? '#10B981' : '#EF4444',
                                fontSize: isMobile ? '14px' : '16px',
                                fontWeight: '700'
                              }}>
                                ₱{Number(t.fine).toFixed(2)}
                              </span>
                            </div>
                          ) : t.penaltyStatus === 'Paid' ? (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05))',
                              borderRadius: isMobile ? '8px' : '10px',
                              padding: isMobile ? '8px 10px' : '12px 14px',
                              border: '1px solid rgba(16, 185, 129, 0.15)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                color: '#10B981',
                                fontSize: isMobile ? '10px' : '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}>
                                <FaCheckCircle style={{ marginRight: '6px', fontSize: isMobile ? '10px' : '11px' }} />
                                Fine Status
                              </span>
                              <span style={{
                                color: '#10B981',
                                fontSize: isMobile ? '12px' : '13px',
                                fontWeight: '700'
                              }}>
                                Paid
                              </span>
                            </div>
                          ) : (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05))',
                              borderRadius: isMobile ? '8px' : '10px',
                              padding: isMobile ? '8px 10px' : '12px 14px',
                              border: '1px solid rgba(16, 185, 129, 0.15)',
                              textAlign: 'center'
                            }}>
                              <span style={{
                                color: '#10B981',
                                fontSize: isMobile ? '10px' : '11px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}>
                                <FaCheckCircle style={{ marginRight: '6px', fontSize: isMobile ? '10px' : '11px' }} />
                                No Fines
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* History Tab */}
          {activeTab === 'history' && (
            <div className="row g-3">
              {history.length === 0 ? (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: isMobile ? '16px' : '20px',
                      padding: isMobile ? '32px 20px' : '48px 24px',
                      boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      margin: '0 auto',
                      maxWidth: '400px'
                    }}>
                      <FaHistory size={isMobile ? 48 : 56} style={{ color: '#6BA3BE', opacity: 0.5, marginBottom: '16px' }} />
                      <h5 style={{ 
                        fontWeight: '700',
                        marginBottom: '8px',
                        color: '#0A7075',
                        fontSize: isMobile ? '18px' : '20px'
                      }}>
                        No History Yet
                      </h5>
                      <p style={{ 
                        color: '#6BA3BE',
                        marginBottom: '0',
                        fontSize: isMobile ? '14px' : '16px'
                      }}>
                        Your borrowing history will appear here
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                history.map(h => {
                  // Determine status badge color and text
                  const status = h.status || h.transaction_type || 'unknown';
                  const statusLower = String(status).toLowerCase();
                  
                  let statusBadge = null;
                  if (statusLower === 'returned' || statusLower === 'return') {
                    statusBadge = {
                      bg: 'linear-gradient(135deg, #10B981, #34D399)',
                      color: 'white',
                      text: 'Returned',
                      icon: FaCheckCircle
                    };
                  } else if (statusLower === 'active' || statusLower === 'borrow') {
                    statusBadge = {
                      bg: 'linear-gradient(135deg, #0C969C, #6BA3BE)',
                      color: 'white',
                      text: 'Active',
                      icon: FaBook
                    };
                  } else if (statusLower === 'reserved' || statusLower === 'reserve') {
                    statusBadge = {
                      bg: 'linear-gradient(135deg, #F59E0B, #FBBF24)',
                      color: 'white',
                      text: 'Reserved',
                      icon: FaClock
                    };
                  } else {
                    statusBadge = {
                      bg: 'rgba(107, 163, 190, 0.1)',
                      color: '#6BA3BE',
                      text: status,
                      icon: FaHistory
                    };
                  }

                  const StatusIcon = statusBadge.icon;

                  return (
                    <div key={h.transaction_id} className="col-12">
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: isMobile ? '14px' : '16px',
                          overflow: 'hidden',
                          boxShadow: '0 2px 12px rgba(12, 150, 156, 0.12)',
                          border: '1px solid rgba(12, 150, 156, 0.15)',
                          transition: 'all 0.3s ease',
                          cursor: 'pointer'
                        }}
                        onClick={() => openReceipt(h)}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(12, 150, 156, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(12, 150, 156, 0.12)';
                          }
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? '0' : '16px'
                        }}>
                          {/* Book Cover or Placeholder */}
                          {(h.receipt_image || h.book_cover) ? (
                            <div style={{
                              width: isMobile ? '100%' : '100px',
                              height: isMobile ? '140px' : '140px',
                              flexShrink: 0,
                              overflow: 'hidden',
                              borderRadius: isMobile ? '0' : '8px'
                            }}>
                              <img
                                src={normalizeImageSrc(h.receipt_image || h.book_cover)}
                                alt={h.book_title || h.research_title || 'Item'}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjE0MCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                                }}
                              />
                            </div>
                          ) : (
                            <div style={{
                              width: isMobile ? '100%' : '100px',
                              height: isMobile ? '120px' : '140px',
                              flexShrink: 0,
                              background: 'linear-gradient(135deg, #6BA3BE, #0C969C)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: isMobile ? '0' : '8px'
                            }}>
                              <FaBook size={isMobile ? 28 : 32} style={{ color: 'white', opacity: 0.9 }} />
                            </div>
                          )}
                          
                          {/* Transaction Info */}
                          <div style={{ 
                            padding: isMobile ? '14px' : '16px 16px 16px 0',
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: isMobile ? '8px' : '10px'
                          }}>
                            <h6 style={{ 
                              fontSize: isMobile ? '15px' : '17px',
                              fontWeight: '700',
                              color: '#0A7075',
                              marginBottom: '0',
                              lineHeight: '1.3'
                            }}>
                              {h.book_title || h.research_title || 'Item'}
                            </h6>

                            <p style={{ 
                              color: '#6BA3BE',
                              fontSize: isMobile ? '11px' : '12px',
                              marginBottom: '0',
                              fontWeight: '500'
                            }}>
                              {h.book_title ? 'Book' : (h.research_title ? 'Research Paper' : 'Item')}
                              {h.book_genre && ` • ${h.book_genre}`}
                              {h.research_department && ` • ${h.research_department}`}
                            </p>
                            
                            <div style={{
                              display: 'flex',
                              gap: isMobile ? '6px' : '8px',
                              flexWrap: 'wrap',
                              alignItems: 'center'
                            }}>
                              {/* Status Badge */}
                              <span style={{
                                background: statusBadge.bg,
                                color: statusBadge.color,
                                padding: isMobile ? '4px 8px' : '5px 10px',
                                borderRadius: '6px',
                                fontSize: isMobile ? '9px' : '10px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.3px'
                              }}>
                                <StatusIcon style={{ fontSize: isMobile ? '8px' : '9px' }} />
                                {statusBadge.text}
                              </span>

                              {/* Transaction Date */}
                              <span style={{
                                background: 'rgba(12, 150, 156, 0.1)',
                                color: '#0C969C',
                                padding: isMobile ? '4px 8px' : '5px 10px',
                                borderRadius: '6px',
                                fontSize: isMobile ? '9px' : '10px',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                <FaClock style={{ fontSize: isMobile ? '8px' : '9px' }} />
                                {formatDate(h.transaction_date)}
                              </span>
                              
                              {/* Fine Badge */}
                              {h.fine && h.fine > 0 ? (
                                <span style={{
                                  background: 'rgba(239, 68, 68, 0.1)',
                                  color: '#EF4444',
                                  padding: isMobile ? '4px 8px' : '5px 10px',
                                  borderRadius: '6px',
                                  fontSize: isMobile ? '9px' : '10px',
                                  fontWeight: '700',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px'
                                }}>
                                  <FaMoneyBill style={{ fontSize: isMobile ? '8px' : '9px' }} />
                                  ₱{Number(h.fine).toFixed(2)}
                                </span>
                              ) : null}
                            </div>

                            {/* Reference Number */}
                            {h.reference_number && (
                              <p style={{ 
                                color: '#6BA3BE',
                                fontSize: isMobile ? '10px' : '11px',
                                marginBottom: '0',
                                fontWeight: '500'
                              }}>
                                Ref: {h.reference_number}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* Returned Tab (shows completed transactions) */}
          {activeTab === 'returned' && (
            <div className="row g-3">
              {history.length === 0 ? (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: isMobile ? '16px' : '20px',
                      padding: isMobile ? '32px 20px' : '48px 24px',
                      boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      margin: '0 auto',
                      maxWidth: '400px'
                    }}>
                      <FaUndo size={isMobile ? 48 : 56} style={{ color: '#6BA3BE', opacity: 0.5, marginBottom: '16px' }} />
                      <h5 style={{ 
                        fontWeight: '700',
                        marginBottom: '8px',
                        color: '#0A7075',
                        fontSize: isMobile ? '18px' : '20px'
                      }}>
                        No Returned Items
                      </h5>
                      <p style={{ 
                        color: '#6BA3BE',
                        marginBottom: '0',
                        fontSize: isMobile ? '14px' : '16px'
                      }}>
                        Your returned items will appear here
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                history.map(h => (
                  <div key={h.transaction_id} className="col-12">
                    <div
                      style={{
                        background: 'rgba(255, 255, 255, 0.98)',
                        backdropFilter: 'blur(20px)',
                        borderRadius: isMobile ? '14px' : '16px',
                        padding: '0',
                        boxShadow: '0 2px 12px rgba(12, 150, 156, 0.12)',
                        border: '1px solid rgba(12, 150, 156, 0.15)',
                        transition: 'all 0.3s ease',
                        overflow: 'hidden'
                      }}
                      onMouseEnter={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(12, 150, 156, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isMobile) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 12px rgba(12, 150, 156, 0.12)';
                        }
                      }}
                    >
                      {/* Header with Return Badge */}
                      <div style={{
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(52, 211, 153, 0.05))',
                        padding: isMobile ? '14px' : '18px',
                        borderBottom: '1px solid rgba(16, 185, 129, 0.1)'
                      }}>
                        <div style={{ display: 'flex', gap: isMobile ? '12px' : '16px', alignItems: 'flex-start' }}>
                          <div style={{
                            background: 'linear-gradient(135deg, #10B981, #34D399)',
                            borderRadius: '10px',
                            width: isMobile ? '44px' : '52px',
                            height: isMobile ? '44px' : '52px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                          }}>
                            <FaUndo style={{ 
                              color: 'white', 
                              fontSize: isMobile ? '18px' : '22px' 
                            }} />
                          </div>
                          
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <h6 style={{ 
                              fontSize: isMobile ? '15px' : '17px',
                              fontWeight: '700',
                              color: '#0A7075',
                              marginBottom: isMobile ? '6px' : '8px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {h.book_title || h.research_title || 'Item'}
                            </h6>
                            
                            <span style={{
                              background: 'linear-gradient(135deg, #10B981, #34D399)',
                              color: 'white',
                              padding: isMobile ? '5px 10px' : '6px 12px',
                              borderRadius: '6px',
                              fontSize: isMobile ? '9px' : '10px',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              textTransform: 'uppercase',
                              letterSpacing: '0.3px'
                            }}>
                              <FaCheckCircle style={{ fontSize: isMobile ? '8px' : '9px' }} />
                              Returned
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div style={{ padding: isMobile ? '14px' : '18px' }}>
                        <div style={{
                          display: 'flex',
                          gap: isMobile ? '6px' : '10px',
                          flexWrap: 'wrap',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            background: 'rgba(12, 150, 156, 0.1)',
                            color: '#0C969C',
                            padding: isMobile ? '5px 10px' : '6px 12px',
                            borderRadius: '6px',
                            fontSize: isMobile ? '10px' : '11px',
                            fontWeight: '600',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <FaClock style={{ fontSize: isMobile ? '9px' : '10px' }} />
                            Returned: {formatDate(h.transaction_date)}
                          </span>
                          
                          {h.fine && h.fine > 0 ? (
                            <span style={{
                              background: 'rgba(239, 68, 68, 0.1)',
                              color: '#EF4444',
                              padding: isMobile ? '5px 10px' : '6px 12px',
                              borderRadius: '6px',
                              fontSize: isMobile ? '10px' : '11px',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaMoneyBill style={{ fontSize: isMobile ? '9px' : '10px' }} />
                              Fine: ₱{Number(h.fine).toFixed(2)}
                            </span>
                          ) : (
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.1)',
                              color: '#10B981',
                              padding: isMobile ? '5px 10px' : '6px 12px',
                              borderRadius: '6px',
                              fontSize: isMobile ? '10px' : '11px',
                              fontWeight: '700',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <FaCheckCircle style={{ fontSize: isMobile ? '9px' : '10px' }} />
                              No Fine
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

          {/* Payments / Payment History Tab */}
          {activeTab === 'payments' && (
            <div className="row g-3">
              {(!paymentHistory || paymentHistory.length === 0) ? (
                <div className="col-12">
                  <div className="text-center py-5">
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: isMobile ? '16px' : '20px',
                      padding: isMobile ? '32px 20px' : '48px 24px',
                      boxShadow: '0 8px 32px rgba(12, 150, 156, 0.15)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      margin: '0 auto',
                      maxWidth: '460px'
                    }}>
                      <FaMoneyBill size={isMobile ? 48 : 56} style={{ color: '#6BA3BE', opacity: 0.5, marginBottom: '16px' }} />
                      <h5 style={{ 
                        fontWeight: '700',
                        marginBottom: '8px',
                        color: '#0A7075',
                        fontSize: isMobile ? '18px' : '20px'
                      }}>
                        No Payment Records
                      </h5>
                      <p style={{ 
                        color: '#6BA3BE',
                        marginBottom: '0',
                        fontSize: isMobile ? '14px' : '16px'
                      }}>
                        You don't have any fines or payment records yet
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                paymentHistory.map((penalty, idx) => {
                  const isPaid = penalty.status && penalty.status.toLowerCase() === 'paid';
                  const itemTitle = penalty.item_title || penalty.book_title || penalty.research_title || 'Unknown Item';
                  const fineAmount = Number(penalty.fine || 0);
                  
                  return (
                    <div key={penalty.penalty_id || idx} className="col-12">
                      <div
                        style={{
                          background: 'rgba(255, 255, 255, 0.98)',
                          backdropFilter: 'blur(20px)',
                          borderRadius: isMobile ? '14px' : '16px',
                          padding: isMobile ? '16px' : '20px',
                          boxShadow: '0 2px 12px rgba(12, 150, 156, 0.12)',
                          border: isPaid 
                            ? '1px solid rgba(16, 185, 129, 0.2)' 
                            : '1px solid rgba(239, 68, 68, 0.2)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 6px 20px rgba(12, 150, 156, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isMobile) {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 12px rgba(12, 150, 156, 0.12)';
                          }
                        }}
                      >
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: isMobile ? 'column' : 'row',
                          gap: isMobile ? '12px' : '20px',
                          alignItems: isMobile ? 'stretch' : 'center'
                        }}>
                          {/* Icon */}
                          <div style={{
                            width: isMobile ? '100%' : '60px',
                            height: isMobile ? '60px' : '60px',
                            borderRadius: '12px',
                            background: isPaid 
                              ? 'linear-gradient(135deg, #10B981, #34D399)' 
                              : 'linear-gradient(135deg, #EF4444, #F87171)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            boxShadow: isPaid 
                              ? '0 4px 12px rgba(16, 185, 129, 0.25)' 
                              : '0 4px 12px rgba(239, 68, 68, 0.25)',
                            margin: isMobile ? '0 auto' : '0'
                          }}>
                            {isPaid ? (
                              <FaCheckCircle style={{ color: 'white', fontSize: isMobile ? '24px' : '28px' }} />
                            ) : (
                              <FaExclamationTriangle style={{ color: 'white', fontSize: isMobile ? '24px' : '28px' }} />
                            )}
                          </div>

                          {/* Content */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: isMobile ? 'flex-start' : 'center',
                              flexDirection: isMobile ? 'column' : 'row',
                              gap: isMobile ? '8px' : '12px',
                              marginBottom: '12px'
                            }}>
                              <h6 style={{ 
                                fontSize: isMobile ? '15px' : '17px',
                                fontWeight: '700',
                                color: '#0A7075',
                                marginBottom: '0',
                                lineHeight: '1.3'
                              }}>
                                {itemTitle}
                              </h6>

                              <span style={{
                                background: isPaid 
                                  ? 'linear-gradient(135deg, #10B981, #34D399)' 
                                  : 'linear-gradient(135deg, #EF4444, #F87171)',
                                color: 'white',
                                padding: isMobile ? '6px 12px' : '8px 16px',
                                borderRadius: '8px',
                                fontSize: isMobile ? '11px' : '12px',
                                fontWeight: '700',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '6px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                boxShadow: isPaid 
                                  ? '0 2px 8px rgba(16, 185, 129, 0.3)' 
                                  : '0 2px 8px rgba(239, 68, 68, 0.3)'
                              }}>
                                {isPaid ? (
                                  <>
                                    <FaCheckCircle style={{ fontSize: isMobile ? '10px' : '11px' }} />
                                    Paid
                                  </>
                                ) : (
                                  <>
                                    <FaClock style={{ fontSize: isMobile ? '10px' : '11px' }} />
                                    Unpaid
                                  </>
                                )}
                              </span>
                            </div>

                            {/* Details */}
                            <div style={{
                              display: 'grid',
                              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                              gap: isMobile ? '8px' : '12px',
                              marginBottom: '12px'
                            }}>
                              <div style={{
                                background: 'rgba(12, 150, 156, 0.05)',
                                borderRadius: '8px',
                                padding: isMobile ? '8px 10px' : '10px 12px'
                              }}>
                                <small style={{ 
                                  color: '#6BA3BE', 
                                  fontSize: isMobile ? '9px' : '10px',
                                  fontWeight: '600',
                                  textTransform: 'uppercase',
                                  letterSpacing: '0.3px',
                                  display: 'block',
                                  marginBottom: '4px'
                                }}>
                                  Reference
                                </small>
                                <div style={{ 
                                  fontSize: isMobile ? '11px' : '12px',
                                  fontWeight: '700',
                                  color: '#0C969C'
                                }}>
                                  {penalty.reference_number || 'N/A'}
                                </div>
                              </div>

                              {penalty.due_date && (
                                <div style={{
                                  background: 'rgba(12, 150, 156, 0.05)',
                                  borderRadius: '8px',
                                  padding: isMobile ? '8px 10px' : '10px 12px'
                                }}>
                                  <small style={{ 
                                    color: '#6BA3BE', 
                                    fontSize: isMobile ? '9px' : '10px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                    display: 'block',
                                    marginBottom: '4px'
                                  }}>
                                    Due Date
                                  </small>
                                  <div style={{ 
                                    fontSize: isMobile ? '11px' : '12px',
                                    fontWeight: '700',
                                    color: '#0C969C'
                                  }}>
                                    {formatDate(penalty.due_date)}
                                  </div>
                                </div>
                              )}

                              {penalty.days_overdue && penalty.days_overdue > 0 && (
                                <div style={{
                                  background: 'rgba(239, 68, 68, 0.05)',
                                  borderRadius: '8px',
                                  padding: isMobile ? '8px 10px' : '10px 12px'
                                }}>
                                  <small style={{ 
                                    color: '#EF4444', 
                                    fontSize: isMobile ? '9px' : '10px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                    display: 'block',
                                    marginBottom: '4px'
                                  }}>
                                    Days Overdue
                                  </small>
                                  <div style={{ 
                                    fontSize: isMobile ? '11px' : '12px',
                                    fontWeight: '700',
                                    color: '#EF4444'
                                  }}>
                                    {penalty.days_overdue} {penalty.days_overdue === 1 ? 'day' : 'days'}
                                  </div>
                                </div>
                              )}

                              {penalty.updated_at && (
                                <div style={{
                                  background: 'rgba(12, 150, 156, 0.05)',
                                  borderRadius: '8px',
                                  padding: isMobile ? '8px 10px' : '10px 12px'
                                }}>
                                  <small style={{ 
                                    color: '#6BA3BE', 
                                    fontSize: isMobile ? '9px' : '10px',
                                    fontWeight: '600',
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.3px',
                                    display: 'block',
                                    marginBottom: '4px'
                                  }}>
                                    {isPaid ? 'Paid On' : 'Updated'}
                                  </small>
                                  <div style={{ 
                                    fontSize: isMobile ? '11px' : '12px',
                                    fontWeight: '700',
                                    color: '#0C969C'
                                  }}>
                                    {formatDate(penalty.updated_at)}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Fine Amount */}
                            <div style={{
                              background: isPaid 
                                ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(52, 211, 153, 0.1))' 
                                : 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.1))',
                              borderRadius: '10px',
                              padding: isMobile ? '12px' : '14px',
                              border: isPaid 
                                ? '1px solid rgba(16, 185, 129, 0.2)' 
                                : '1px solid rgba(239, 68, 68, 0.2)',
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center'
                            }}>
                              <span style={{
                                color: isPaid ? '#10B981' : '#EF4444',
                                fontSize: isMobile ? '11px' : '12px',
                                fontWeight: '700',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                              }}>
                                <FaMoneyBill style={{ marginRight: '8px', fontSize: isMobile ? '11px' : '12px' }} />
                                Fine Amount
                              </span>
                              <span style={{
                                color: isPaid ? '#10B981' : '#EF4444',
                                fontSize: isMobile ? '18px' : '22px',
                                fontWeight: '800'
                              }}>
                                ₱{fineAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

      {/* Receipt/Image Viewer (fullscreen like TransactionDetailModal) */}
      {selectedReceipt && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 1060 }}
          onClick={() => setSelectedReceipt(null)}
        >
          <div className="modal-dialog modal-dialog-centered modal-xl" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title text-white">{selectedReceipt.transaction?.reference_number || 'Image'}</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setSelectedReceipt(null)}></button>
              </div>
              <div className="modal-body text-center p-0">
                {selectedReceipt.src ? (
                  <img
                    src={selectedReceipt.src}
                    alt="receipt-full"
                    className="img-fluid rounded shadow-lg"
                    style={{ maxHeight: '80vh', maxWidth: '100%', objectFit: 'contain' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <div className="text-white text-center p-4">No image available for this transaction.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}