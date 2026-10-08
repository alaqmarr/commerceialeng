"use client";
import React, { useState } from "react";
import { TrendingUp } from "lucide-react";
import type { ActivityTrendPoint } from "../analytics.types";

interface ActivityTrendsProps {
  activityTrends: ActivityTrendPoint[];
  days: number;
  isLoading?: boolean;
}

export function ActivityTrends({
  activityTrends,
  days,
  isLoading,
}: ActivityTrendsProps) {
  const [hoveredPoint, setHoveredPoint] = useState<ActivityTrendPoint | null>(null);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-52 bg-gray-100 rounded animate-pulse" />
      </div>
    );
  }

  const maxVal = Math.max(
    ...activityTrends.map((p) => Math.max(p.enquiries, p.items)),
    4
  );

  const chartHeight = 150, chartWidth = 560;
  const paddingLeft = 32, paddingRight = 16, paddingTop = 20, paddingBottom = 30;

  const usableWidth = chartWidth - paddingLeft - paddingRight;
  const totalPoints = activityTrends.length;
  const stepX = totalPoints > 1 ? usableWidth / (totalPoints - 1) : usableWidth;

  const formatDateLabel = (dateStr: string) => {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return dateStr;
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
              Enquiry Activity Trends
            </h3>
            <p className="text-[11px] text-gray-500">
              Daily RFQs and items requested over the last {days} days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-red-600 shrink-0" />
            <span className="text-gray-700 font-medium">RFQs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-gray-400 shrink-0" />
            <span className="text-gray-700 font-medium">Items</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        {hoveredPoint && (
          <div className="mb-2 p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs flex items-center justify-between font-mono">
            <span className="text-gray-600">
              Date: <strong className="text-gray-900">{hoveredPoint.date}</strong>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-red-600 font-bold">
                RFQs: {hoveredPoint.enquiries}
              </span>
              <span className="text-gray-700 font-bold">
                Items: {hoveredPoint.items}
              </span>
            </div>
          </div>
        )}

        {activityTrends.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-xs">
            No activity points found for this range.
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight + paddingTop + paddingBottom}`}
              className="w-full h-52 text-gray-400 select-none"
            >
              {/* Horizontal Gridlines */}
              {[0, 0.5, 1].map((pct, i) => {
                const y = paddingTop + chartHeight * (1 - pct);
                const val = Math.round(maxVal * pct);
                return (
                  <g key={i}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={chartWidth - paddingRight}
                      y2={y}
                      stroke="#e5e7eb"
                      strokeDasharray={pct === 0 ? "none" : "3 3"}
                    />
                    <text
                      x={paddingLeft - 6}
                      y={y + 3}
                      textAnchor="end"
                      fontSize="9"
                      fill="#9ca3af"
                      fontFamily="monospace"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Data Bars */}
              {activityTrends.map((pt, i) => {
                const x = paddingLeft + i * stepX;
                const enqHeight = (pt.enquiries / maxVal) * chartHeight;
                const itemHeight = (pt.items / maxVal) * chartHeight;
                const barWidth = Math.max(2, Math.min(10, (usableWidth / totalPoints) * 0.4));

                return (
                  <g
                    key={pt.date}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    {/* Item bar (gray) */}
                    <rect
                      x={x - barWidth}
                      y={paddingTop + chartHeight - itemHeight}
                      width={barWidth}
                      height={Math.max(itemHeight, 1)}
                      fill="#94a3b8"
                      rx="1"
                      className="transition-colors group-hover:fill-gray-600"
                    />
                    {/* Enquiry bar (red) */}
                    <rect
                      x={x + 1}
                      y={paddingTop + chartHeight - enqHeight}
                      width={barWidth}
                      height={Math.max(enqHeight, 1)}
                      fill="#dc2626"
                      rx="1"
                      className="transition-colors group-hover:fill-red-700"
                    />
                    {/* Sampled X-axis labels */}
                    {(i === 0 ||
                      i === Math.floor(totalPoints / 2) ||
                      i === totalPoints - 1) && (
                      <text
                        x={x}
                        y={paddingTop + chartHeight + 18}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#6b7280"
                        fontFamily="sans-serif"
                      >
                        {formatDateLabel(pt.date)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
