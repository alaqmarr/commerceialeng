'use client';

/**
 * modules/enquiries/components/admin-enquiry-status-badge.component.tsx
 * Reusable status badge component for admin enquiry list and modal.
 * Strictly under 200 lines.
 */

import React from 'react';
import { getEnquiryStatusBadgeClasses } from '../enquiries.lib';

export interface AdminEnquiryStatusBadgeProps {
  status: string;
  className?: string;
}

export function AdminEnquiryStatusBadge({ status, className = '' }: AdminEnquiryStatusBadgeProps) {
  const badgeClasses = getEnquiryStatusBadgeClasses(status);

  return (
    <span
      className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold inline-block ${badgeClasses} ${className}`}
    >
      {status}
    </span>
  );
}
