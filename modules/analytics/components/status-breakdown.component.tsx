import React from "react";
import { Clock, PhoneCall, CheckCircle2, ShieldCheck } from "lucide-react";

interface StatusBreakdownProps {
  statusBreakdown: { status: string; count: number; percentage: number }[];
  totalEnquiries: number;
  isLoading?: boolean;
}

export function StatusBreakdown({
  statusBreakdown,
  totalEnquiries: _totalEnquiries,
  isLoading,
}: StatusBreakdownProps) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 bg-gray-100 rounded-full animate-pulse" />
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case "PENDING":
        return {
          icon: Clock,
          color: "bg-red-500",
          cardBg: "bg-red-50/50 border-red-200",
          textColor: "text-red-700",
          iconColor: "text-red-600",
          desc: "Awaiting sales review and customer contact",
        };
      case "CONTACTED":
        return {
          icon: PhoneCall,
          color: "bg-blue-500",
          cardBg: "bg-blue-50/50 border-blue-200",
          textColor: "text-blue-700",
          iconColor: "text-blue-600",
          desc: "Quote sent or client discussions underway",
        };
      case "CLOSED":
        return {
          icon: CheckCircle2,
          color: "bg-emerald-500",
          cardBg: "bg-emerald-50/50 border-emerald-200",
          textColor: "text-emerald-700",
          iconColor: "text-emerald-600",
          desc: "Fulfilled enquiry or completed customer order",
        };
      default:
        return {
          icon: ShieldCheck,
          color: "bg-gray-400",
          cardBg: "bg-gray-50 border-gray-200",
          textColor: "text-gray-700",
          iconColor: "text-gray-600",
          desc: "Other enquiry status",
        };
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Enquiry Pipeline Status
        </h3>
        <p className="text-[11px] text-gray-500">
          Conversion lifecycle breakdown for all active and historical RFQs
        </p>
      </div>

      <div className="p-5 space-y-4">
        {/* Horizontal Proportional Bar */}
        <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex border border-gray-200">
          {statusBreakdown.map((item) => {
            const config = getStatusConfig(item.status);
            return (
              <div
                key={item.status}
                className={`${config.color} transition-all`}
                style={{ width: `${item.percentage}%` }}
                title={`${item.status}: ${item.percentage.toFixed(1)}%`}
              />
            );
          })}
        </div>

        {/* Status Breakdown Cards */}
        <div className="space-y-2.5">
          {statusBreakdown.map((item) => {
            const config = getStatusConfig(item.status);
            const Icon = config.icon;
            return (
              <div
                key={item.status}
                className={`p-3 rounded-xl border ${config.cardBg} flex items-center justify-between text-xs`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-white border border-gray-200 ${config.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className={`font-bold uppercase ${config.textColor}`}>
                        {item.status}
                      </strong>
                      <span className="text-[11px] text-gray-500 font-mono">
                        ({item.percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{config.desc}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-gray-900">
                    {item.count}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
