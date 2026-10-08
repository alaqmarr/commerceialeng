import React from "react";
import Link from "next/link";
import { ArrowUpRight, Award } from "lucide-react";
import type { TopProductMetric } from "../analytics.types";

interface TopProductsTableProps {
  topProducts: TopProductMetric[];
  isLoading?: boolean;
}

export function TopProductsTable({ topProducts, isLoading }: TopProductsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Top Enquired Products
            </h3>
            <p className="text-[11px] text-gray-500">
              Ranked by total quantity requested across enquiries
            </p>
          </div>
        </div>
        <Link
          href="/admin/products"
          className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1 font-semibold"
        >
          <span>Catalog</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {topProducts.length === 0 ? (
        <div className="p-8 text-center text-gray-500 text-xs">
          No product enquiry data recorded yet for this period.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/75 text-[11px] uppercase text-gray-600 font-semibold">
                <th className="py-2.5 px-4 w-12 text-center">#</th>
                <th className="py-2.5 px-4">Product & Category</th>
                <th className="py-2.5 px-4 text-center">RFQs</th>
                <th className="py-2.5 px-4 text-center">Qty</th>
                <th className="py-2.5 px-4 text-right">Share of Demand</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {topProducts.map((p, index) => {
                const rank = index + 1;
                return (
                  <tr key={p.productId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                          rank === 1
                            ? "bg-red-600 text-white"
                            : rank === 2
                            ? "bg-red-100 text-red-700"
                            : rank === 3
                            ? "bg-gray-200 text-gray-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{p.productName}</div>
                      <div className="text-[11px] text-gray-500">{p.categoryName}</div>
                    </td>
                    <td className="py-3 px-4 text-center text-gray-700 font-medium">
                      {p.enquiryCount}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-red-600">
                      {p.totalQuantity}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2 justify-end">
                        <div className="w-20 bg-gray-100 rounded-full h-2 overflow-hidden border border-gray-200">
                          <div
                            className="bg-red-600 h-2 rounded-full transition-all"
                            style={{ width: `${Math.min(p.percentageOfTotal, 100)}%` }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-gray-600 w-10 text-right">
                          {p.percentageOfTotal.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
