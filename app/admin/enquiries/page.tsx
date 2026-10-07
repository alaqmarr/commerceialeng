"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Search,
  Filter,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  X,
  Phone,
  Building,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";

interface EnquiryItem {
  id: string;
  enquiryId: string;
  productId: string;
  quantity: number;
  notes: string | null;
  product: {
    id: string;
    name: string;
    slug: string;
    imageUrl: string | null;
  } | null;
}

interface Enquiry {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: string; // PENDING, CONTACTED, CLOSED
  items: EnquiryItem[];
  createdAt: string;
}

function EnquiriesContent() {
  const searchParams = useSearchParams();
  const directId = searchParams.get("id");

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState<string | null>(null);

  // Detail Modal State
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Delete State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Enquiry | null>(null);

  const fetchEnquiries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = statusFilter !== "ALL"
        ? `/api/admin/enquiries?status=${statusFilter}`
        : "/api/admin/enquiries";
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load customer enquiries");
      const data = await res.json();
      setEnquiries(data);

      // If direct ID parameter was passed, open it
      if (directId) {
        const found = data.find((e: Enquiry) => e.id === directId);
        if (found) setSelectedEnquiry(found);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error fetching enquiries";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, directId]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  const updateStatus = async (enquiryId: string, newStatus: string) => {
    setStatusUpdating(true);
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      const updated = await res.json();
      if (selectedEnquiry && selectedEnquiry.id === enquiryId) {
        setSelectedEnquiry(updated);
      }
      fetchEnquiries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update status";
      alert(msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeletingId(deleteConfirm.id);

    try {
      const res = await fetch(`/api/admin/enquiries/${deleteConfirm.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete enquiry");
      }

      if (selectedEnquiry && selectedEnquiry.id === deleteConfirm.id) {
        setSelectedEnquiry(null);
      }
      setDeleteConfirm(null);
      fetchEnquiries();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      alert(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    const query = search.toLowerCase();
    return (
      e.name.toLowerCase().includes(query) ||
      e.email.toLowerCase().includes(query) ||
      (e.company && e.company.toLowerCase().includes(query)) ||
      (e.phone && e.phone.includes(query))
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-red-600 uppercase tracking-wider mb-1 font-semibold">
            <Mail className="w-3.5 h-3.5" />
            <span>RFQ Inquiries Inbox</span>
          </div>
          <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">
            Customer Enquiries & RFQ Leads
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Review incoming requests for quotations, cart submissions, and manage follow-up statuses.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "CONTACTED", "CLOSED"].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === s
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search enquiries by client name, email, company..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600"
          />
        </div>
        <div className="text-xs text-gray-500">
          Showing <strong>{filteredEnquiries.length}</strong> enquiries
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Enquiries Table */}
      {loading ? (
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Loading Customer Enquiries...
          </span>
        </div>
      ) : filteredEnquiries.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-xs">
          No enquiries found matching filter criteria.
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50 text-[11px] uppercase text-gray-600">
                <th className="py-3 px-4">Client & Company</th>
                <th className="py-3 px-4">Contact Coordinates</th>
                <th className="py-3 px-4">Cart Items</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {filteredEnquiries.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-gray-900">{e.name}</div>
                    {e.company ? (
                      <div className="text-[11px] text-gray-600 flex items-center gap-1 mt-0.5">
                        <Building className="w-3 h-3 text-red-600" />
                        <span>{e.company}</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 italic">Individual</div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-[11px] text-gray-700 space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span>{e.email}</span>
                    </div>
                    {e.phone && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{e.phone}</span>
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px] border border-gray-200">
                      <Package className="w-3 h-3 text-red-600" />
                      <span>{e.items.length} items</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        e.status === "PENDING"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : e.status === "CONTACTED"
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      }`}
                    >
                      {e.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>{new Date(e.createdAt).toLocaleDateString()}</span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedEnquiry(e)}
                        className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs transition-colors flex items-center gap-1"
                        title="View Enquiry Details"
                      >
                        <Eye className="w-3 h-3" />
                        <span>View</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteConfirm(e)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 border border-red-200 transition-colors"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Enquiry Details Modal */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto font-sans">
          <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4 sticky top-0 bg-white z-10">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-bold uppercase tracking-tight text-gray-900">
                  Enquiry Details & Cart Items
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Client Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-semibold">Client Name</span>
                  <strong className="text-gray-900 text-sm">{selectedEnquiry.name}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-semibold">Company Name</span>
                  <span className="text-gray-700">{selectedEnquiry.company || "None specified"}</span>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-semibold">Email Address</span>
                  <a
                    href={`mailto:${selectedEnquiry.email}`}
                    className="text-red-600 hover:underline"
                  >
                    {selectedEnquiry.email}
                  </a>
                </div>
                <div>
                  <span className="text-gray-500 block uppercase text-[10px] font-semibold">Telephone / Mobile</span>
                  <span className="text-gray-700">{selectedEnquiry.phone || "None"}</span>
                </div>
              </div>

              {/* Status Selector Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-xs text-gray-600">
                  Current Status: <strong className="text-red-600">{selectedEnquiry.status}</strong>
                </span>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500">Change Status:</span>
                  {(["PENDING", "CONTACTED", "CLOSED"] as const).map((s) => (
                    <button
                      key={s}
                      type="button"
                      disabled={statusUpdating}
                      onClick={() => updateStatus(selectedEnquiry.id, s)}
                      className={`px-2.5 py-1 rounded text-[11px] uppercase font-semibold transition-colors ${
                        selectedEnquiry.status === s
                          ? "bg-red-600 text-white"
                          : "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Notes / Project Requirements */}
              {selectedEnquiry.message && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Customer Project Message & Application Notes
                  </label>
                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs text-gray-800 whitespace-pre-wrap leading-relaxed">
                    {selectedEnquiry.message}
                  </div>
                </div>
              )}

              {/* Requested Cart Line Items */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Requested Cart Items ({selectedEnquiry.items.length})
                </label>
                <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase text-gray-600">
                        <th className="py-2.5 px-3">Product</th>
                        <th className="py-2.5 px-3 text-center">Quantity</th>
                        <th className="py-2.5 px-3">Notes / Specs</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {selectedEnquiry.items.map((it) => (
                        <tr key={it.id}>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2">
                              {it.product?.imageUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={it.product.imageUrl}
                                  alt={it.product.name}
                                  className="w-7 h-7 rounded object-cover bg-gray-100 border border-gray-200"
                                />
                              )}
                              <span className="font-semibold text-gray-900">
                                {it.product?.name || `Product ID: ${it.productId}`}
                              </span>
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center text-red-600 font-bold">
                            {it.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-gray-600 text-[11px]">
                            {it.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = selectedEnquiry;
                    setSelectedEnquiry(null);
                    setDeleteConfirm(toDelete);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-sans text-xs transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Enquiry</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs font-sans transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-gray-900 font-sans mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <span>Confirm Enquiry Deletion</span>
            </h3>
            <p className="text-xs text-gray-600 mb-4">
              Are you sure you want to permanently delete enquiry from <strong>&quot;{deleteConfirm.name}&quot;</strong>?
            </p>
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-lg text-xs font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={Boolean(deletingId)}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 font-sans"
              >
                {deletingId && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Delete Enquiry</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminEnquiriesPage() {
  return (
    <Suspense
      fallback={
        <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-gray-400">
          <Loader2 className="w-7 h-7 text-red-600 animate-spin" />
          <span className="text-xs uppercase tracking-wider font-semibold">
            Loading Enquiry Management...
          </span>
        </div>
      }
    >
      <EnquiriesContent />
    </Suspense>
  );
}
