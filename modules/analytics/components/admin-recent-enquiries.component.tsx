import React from "react";
import Link from "next/link";
import { Mail, ArrowRight, Clock } from "lucide-react";
import type { RecentEnquiryOverview } from "../analytics.types";

export interface AdminRecentEnquiriesProps {
  recentEnquiries: RecentEnquiryOverview[];
  totalEnquiries: number;
}

export function AdminRecentEnquiries({
  recentEnquiries,
  totalEnquiries,
}: AdminRecentEnquiriesProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-red-600" />
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
            Recent Customer RFQ Inquiries
          </h3>
        </div>
        <Link
          href="/admin/enquiries"
          className="text-xs text-red-600 hover:underline inline-flex items-center gap-1 font-medium"
        >
          <span>View All ({totalEnquiries})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {recentEnquiries.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-xs">
          No incoming customer enquiries yet. RFQ enquiries submitted through the cart will appear here.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {recentEnquiries.map((enq) => (
            <div
              key={enq.id}
              className="p-4 sm:px-6 hover:bg-gray-50/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <strong className="text-gray-900 font-medium">{enq.name}</strong>
                  {enq.company && (
                    <span className="text-gray-500">
                      ({enq.company})
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-semibold ${
                      enq.status === "PENDING"
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : enq.status === "CONTACTED"
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-500 text-[11px]">
                  <span>{enq.email}</span>
                  {enq.phone && <span>• {enq.phone}</span>}
                  <span>• {enq.itemCount} line items</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-gray-500 font-sans text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(enq.createdAt).toLocaleDateString()}
                </span>
                <Link
                  href={`/admin/enquiries?id=${enq.id}`}
                  className="px-2.5 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 font-sans text-xs transition-colors"
                >
                  Details &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
