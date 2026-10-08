import React from "react";
import { FileText, CheckCircle2 } from "lucide-react";

export interface ProductDetailSpecsTableProps {
  productName: string;
  specs: Record<string, string>;
}

export function ProductDetailSpecsTable({
  productName,
  specs,
}: ProductDetailSpecsTableProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="font-sans text-xl font-bold uppercase tracking-tight text-gray-900 flex items-center gap-2">
          <FileText className="h-5 w-5 text-red-600" />
          <span>Technical Specifications</span>
        </h2>
        <p className="mt-1 text-xs text-gray-500 font-sans">
          Performance data and testing parameters for {productName}.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table
          data-testid="specs-table"
          className="w-full border-collapse text-left font-sans text-xs sm:text-sm"
        >
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50 text-red-600">
              <th className="py-3 px-4 uppercase font-bold tracking-wider">
                Parameter
              </th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider">
                Specification
              </th>
              <th className="py-3 px-4 uppercase font-bold tracking-wider hidden sm:table-cell">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 text-gray-700">
            {Object.entries(specs).map(([param, value]) => (
              <tr key={param} className="hover:bg-gray-50/60 transition-colors">
                <td className="py-3 px-4 font-semibold text-gray-900">
                  {param}
                </td>
                <td className="py-3 px-4 text-gray-700 font-sans">
                  {value}
                </td>
                <td className="py-3 px-4 text-emerald-600 hidden sm:table-cell">
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Verified</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
