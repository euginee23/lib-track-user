import React, { useEffect, useState } from "react";
import { FaBook, FaExclamationTriangle, FaHistory, FaReceipt, FaMoneyBill } from 'react-icons/fa';
import authService from "../utils/auth";

const API = import.meta.env.VITE_API_URL;

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [ongoing, setOngoing] = useState([]);
  const [finesSummary, setFinesSummary] = useState(null);
  const [history, setHistory] = useState([]);

  const [selectedReceipt, setSelectedReceipt] = useState(null);

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
        // Fetch ongoing borrowed items
        const ongoingRes = await fetch(`${API}/api/transactions/ongoing?user_id=${userId}`);
        const ongoingJson = await ongoingRes.json();

        // Fetch fines summary for user
        const finesRes = await fetch(`${API}/api/fines/user/${userId}`);
        const finesJson = await finesRes.json();

        // Fetch history
        const historyRes = await fetch(`${API}/api/transactions/history?user_id=${userId}`);
        const historyJson = await historyRes.json();

        if (!mounted) return;

        if (ongoingRes.ok) setOngoing(ongoingJson.data || []);
        if (finesRes.ok) setFinesSummary(finesJson.data || null);
        if (historyRes.ok) setHistory(historyJson.data || []);

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

  // Static fine payment history (temporary placeholder)
  const paymentHistory = [
    {
      label: 'Today',
      items: [
        { time: '1:49 AM', title: 'Pay via Scanned QR', amount: -100.00 },
      ]
    },
    {
      label: 'Yesterday',
      items: [
        { time: '3:35 AM', title: 'Send Money', amount: -135.00 },
      ]
    },
    {
      label: 'Feb 21, 2025',
      items: [
        { time: '10:09 PM', title: 'Send Money', amount: 2600.00 },
      ]
    },
    {
      label: 'Feb 19, 2025',
      items: [
        { time: '8:12 PM', title: 'Library Fine Payment', amount: -55.00 },
      ]
    }
  ];

  return (
    <div className="container py-4">
      {/* Top summary stats */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="d-flex gap-3 flex-wrap">
            <div className="card flex-fill shadow-sm" style={{ minWidth: 180 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small">Active Transactions</div>
                    <div className="h4 mb-0">{ongoing.length}</div>
                  </div>
                  <div className="text-primary" style={{ fontSize: 28 }}><FaBook /></div>
                </div>
              </div>
            </div>

            <div className="card flex-fill shadow-sm" style={{ minWidth: 180 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small">Overdue</div>
                    <div className="h4 mb-0 text-danger">{overdueCount}</div>
                  </div>
                  <div className="text-danger" style={{ fontSize: 28 }}><FaExclamationTriangle /></div>
                </div>
              </div>
            </div>

            <div className="card flex-fill shadow-sm" style={{ minWidth: 180 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small">Total Fines</div>
                    <div className="h4 mb-0">₱{Number(finesSummary?.total_fine || 0).toFixed(2)}</div>
                  </div>
                  <div className="text-success" style={{ fontSize: 28 }}><FaMoneyBill /></div>
                </div>
              </div>
            </div>

            <div className="card flex-fill shadow-sm" style={{ minWidth: 180 }}>
              <div className="card-body">
                <div className="d-flex align-items-center justify-content-between">
                  <div>
                    <div className="text-muted small">History Entries</div>
                    <div className="h4 mb-0">{history.length}</div>
                  </div>
                  <div className="text-secondary" style={{ fontSize: 28 }}><FaHistory /></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* main content */}
      {error && (
        <div className="alert alert-warning">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="card mb-3">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0"><FaBook className="me-2" />Current Active Transactions</h5>
                </div>

                {ongoing.length === 0 ? (
                  <div className="text-center py-4 text-muted">No borrowed items found.</div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Ref</th>
                          <th>Item</th>
                          <th>Type</th>
                          <th>Due Date</th>
                          <th>Days</th>
                          <th>Fine</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {ongoing.map(t => (
                          <tr key={t.transaction_id} className="align-middle">
                            <td><strong>{t.reference_number || t.transaction_id}</strong></td>
                            <td>
                              <div className="fw-semibold">{t.book_title || t.research_title || 'Item'}</div>
                              <small className="text-muted">{t.position ? t.position : ''} {t.department_acronym ? `· ${t.department_acronym}` : ''}</small>
                            </td>
                            <td>
                              <span className={`badge ${t.transaction_type === 'borrow' ? 'bg-primary' : t.transaction_type === 'reserve' ? 'bg-info text-dark' : 'bg-secondary'}`}>
                                {t.transaction_type ? t.transaction_type.charAt(0).toUpperCase() + t.transaction_type.slice(1) : 'N/A'}
                              </span>
                            </td>
                          
                            <td>{formatDate(t.due_date)}</td>
                            <td>
                              {(() => {
                                const d = daysRemaining(t.due_date);
                                if (d === null) return '—';
                                if (d < 0) return <span className="text-danger">{Math.abs(d)} overdue</span>;
                                if (d === 0) return <span className="text-warning">Due today</span>;
                                return <span className="text-success">{d} day{d !== 1 ? 's' : ''}</span>;
                              })()}
                            </td>
                            <td>
                              {t.fine && t.fine > 0 ? (
                                <span className="badge bg-danger">₱{Number(t.fine).toFixed(2)}</span>
                              ) : (
                                <span className="badge bg-success">No fine</span>
                              )}
                            </td>
                            <td className="text-end">
                              {(t.receipt_image || t.book_cover) ? (
                                <button className="btn btn-sm btn-outline-secondary" onClick={() => openReceipt(t)}>
                                  <FaReceipt /> <span className="ms-1">View Receipt</span>
                                </button>
                              ) : (
                                <button className="btn btn-sm btn-outline-secondary" disabled>
                                  <FaReceipt /> <span className="ms-1">No receipt</span>
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h5 className="mb-3"><FaHistory className="me-2" />History</h5>
                {history.length === 0 ? (
                  <div className="text-center text-muted">No history available.</div>
                ) : (
                  <ul className="list-group list-group-flush">
                    {history.slice(0, 8).map(h => (
                      <li key={h.transaction_id} className="list-group-item d-flex justify-content-between align-items-start">
                        <div>
                          <div className="fw-semibold">{h.book_title || h.research_title || 'Item'}</div>
                          <small className="text-muted">Returned on: {formatDate(h.transaction_date)}</small>
                        </div>
                        <div className="text-end">
                          <small className="text-muted">Fine: ₱{Number(h.fine || 0).toFixed(2)}</small>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card mb-3">
              <div className="card-body">
                <h5 className="mb-3"><FaMoneyBill className="me-2" />Fines & Penalties</h5>
                {!finesSummary ? (
                  <div className="text-muted">No fines data available.</div>
                ) : (
                  <div>
                    <div className="mb-2">
                      <strong>Total Fine:</strong> <span className="ms-2">₱{Number(finesSummary.total_fine || 0).toFixed(2)}</span>
                    </div>
                    <div className="mb-2">
                      <strong>Overdue items:</strong> <span className="ms-2">{finesSummary.total_overdue_items || 0}</span>
                    </div>

                    <div className="mt-3">
                      <h6 className="mb-2">Details</h6>
                      <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                        {(finesSummary.transactions || []).length === 0 ? (
                          <div className="text-muted">No overdue transactions.</div>
                        ) : (
                          (finesSummary.transactions || []).map(tx => (
                              <div key={tx.transaction_id} className="border rounded p-2 mb-2">
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <div className="fw-semibold">{tx.reference_number || tx.reference || tx.transaction_id}</div>
                                    <small className="text-muted">{tx.item_title || tx.book_title || tx.research_title || 'Unknown Item'} · Due: {formatDate(tx.due_date)}</small>
                                  </div>
                                  <div className="text-end">
                                    <div className="text-danger">₱{Number(tx.fine || 0).toFixed(2)}</div>
                                    <small className="text-muted">{tx.daysOverdue || 0} day(s)</small>
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Fine Payment History (static placeholder) */}
            <div className="card">
              <div className="card-body">
                <h5 className="mb-3"><FaReceipt className="me-2" />Fine Payment History</h5>
                <div className="list-group list-group-flush">
                  {paymentHistory.map(section => (
                    <div key={section.label} className="mb-3">
                      <div className="text-muted small mb-2">{section.label}</div>
                      {section.items.map((it, idx) => (
                        <div key={idx} className="d-flex justify-content-between align-items-center py-2 border-top">
                          <div>
                            <div className="fw-semibold">{it.title}</div>
                            <small className="text-muted">{it.time}</small>
                          </div>
                          <div className={`fw-bold ${it.amount < 0 ? 'text-danger' : 'text-success'}`}>{it.amount < 0 ? '-' : '+'}₱{Math.abs(it.amount).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
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