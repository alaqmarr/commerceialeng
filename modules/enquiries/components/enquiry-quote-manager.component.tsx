'use client';

import React, { useState, useMemo } from 'react';
import { Mail, Save, FileText, ArrowLeft, Loader, CheckCircle2, Copy } from 'lucide-react';
import type { EnquiryDTO, EnquiryItemDTO } from '../enquiries.types';
import { formatEnquiryDate } from '../enquiries.lib';
import { AdminEnquiryStatusBadge } from './admin-enquiry-status-badge.component';
import Link from 'next/link';

interface EnquiryQuoteManagerProps {
  initialEnquiry: EnquiryDTO;
}

export function EnquiryQuoteManager({ initialEnquiry }: EnquiryQuoteManagerProps) {
  const [enquiry, setEnquiry] = useState<EnquiryDTO>(initialEnquiry);
  const [isQuoteMode, setIsQuoteMode] = useState(initialEnquiry.isQuote || false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [items, setItems] = useState<EnquiryItemDTO[]>(initialEnquiry.items);
  const [bankDetails, setBankDetails] = useState(initialEnquiry.bankDetails || '');

  const calculations = useMemo(() => {
    let subtotal = 0;
    let gstTotal = 0;
    items.forEach((item) => {
      const rate = item.rate || 0;
      const qty = item.quantity || 1;
      const gstRate = item.gstRate || 0;
      const lineTotal = rate * qty;
      const lineGst = (lineTotal * gstRate) / 100;
      subtotal += lineTotal;
      gstTotal += lineGst;
    });
    return {
      subtotal,
      gstTotal,
      grandTotal: subtotal + gstTotal,
    };
  }, [items]);

  const handleItemChange = (index: number, field: keyof EnquiryItemDTO, value: number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSaveQuote = async () => {
    setSaving(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isQuote: true,
          items,
          bankDetails,
          ...calculations,
        }),
      });
      if (!res.ok) throw new Error('Failed to save quote');
      const data = await res.json();
      setEnquiry(data.enquiry);
      setSuccessMsg('Quote saved successfully.');
    } catch (err) {
      console.error(err);
      alert('Error saving quote');
    } finally {
      setSaving(false);
    }
  };

  const handleSendEmail = async () => {
    if (!enquiry.isQuote && !isQuoteMode) {
      alert("Please save the quote first.");
      return;
    }
    setSending(true);
    setSuccessMsg('');
    try {
      const res = await fetch(`/api/admin/enquiries/${enquiry.id}/send-quote`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to send email');
      const data = await res.json();
      setEnquiry(data.enquiry);
      setSuccessMsg('Quote sent via email successfully!');
    } catch (err) {
      console.error(err);
      alert('Error sending email. Check SMTP settings.');
    } finally {
      setSending(false);
    }
  };

  const copyToClipboard = () => {
    let text = `Quotation for ${enquiry.name} (${enquiry.company || 'Individual'})\n\n`;
    items.forEach(item => {
      text += `- ${item.product?.name || 'Item'}: ${item.quantity} units @ ₹${item.rate || 0}/unit (GST: ${item.gstRate || 0}%)\n`;
    });
    text += `\nSubtotal: ₹${calculations.subtotal.toFixed(2)}`;
    text += `\nGST: ₹${calculations.gstTotal.toFixed(2)}`;
    text += `\nGrand Total: ₹${calculations.grandTotal.toFixed(2)}\n\n`;
    text += `Bank Details:\n${bankDetails}\n`;
    
    navigator.clipboard.writeText(text);
    setSuccessMsg('Quote copied to clipboard!');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/enquiries" className="p-2 rounded-full hover:bg-gray-100 text-gray-500">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold font-sans text-gray-900">Enquiry #{enquiry.id.slice(-6).toUpperCase()}</h1>
          <AdminEnquiryStatusBadge status={enquiry.status} />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQuoteMode(!isQuoteMode)}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
          >
            {isQuoteMode ? 'View Details' : 'Generate Quote'}
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-700 flex items-center gap-2 text-sm">
          <CheckCircle2 className="w-4 h-4" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-red-600" />
              Requested Items
            </h3>
            <div className="space-y-4">
              {items.map((item, index) => (
                <div key={item.id} className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="font-semibold text-gray-900 mb-2">{item.product?.name}</div>
                  <div className="text-xs text-gray-600 mb-3">Qty: {item.quantity} | Notes: {item.notes || 'None'}</div>
                  
                  {isQuoteMode && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-200">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Rate (₹)</label>
                        <input
                          type="number"
                          value={item.rate || ''}
                          onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))}
                          className="w-full text-sm border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">GST (%)</label>
                        <input
                          type="number"
                          value={item.gstRate || ''}
                          onChange={(e) => handleItemChange(index, 'gstRate', parseFloat(e.target.value))}
                          className="w-full text-sm border-gray-300 rounded-lg focus:border-red-500 focus:ring-red-500"
                        />
                      </div>
                      <div className="col-span-2 text-right pt-5">
                        <span className="text-xs text-gray-500 font-medium">Line Total: </span>
                        <span className="font-bold text-gray-900">
                          ₹{(((item.rate || 0) * item.quantity) * (1 + (item.gstRate || 0) / 100)).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {isQuoteMode && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex flex-col gap-2 items-end">
                  <div className="text-sm text-gray-600">Subtotal: <span className="font-medium text-gray-900 w-32 inline-block text-right">₹{calculations.subtotal.toFixed(2)}</span></div>
                  <div className="text-sm text-gray-600">GST: <span className="font-medium text-gray-900 w-32 inline-block text-right">₹{calculations.gstTotal.toFixed(2)}</span></div>
                  <div className="text-base font-bold text-gray-900 mt-2">Grand Total: <span className="text-red-600 w-32 inline-block text-right">₹{calculations.grandTotal.toFixed(2)}</span></div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bank Account Details (Printed on Quote)</label>
                  <textarea
                    rows={4}
                    value={bankDetails}
                    onChange={(e) => setBankDetails(e.target.value)}
                    className="w-full border-gray-300 rounded-lg text-sm focus:border-red-500 focus:ring-red-500"
                    placeholder="Bank Name: HDFC Bank\nA/C No: 123456789\nIFSC: HDFC000123"
                  />
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={copyToClipboard} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-semibold text-sm hover:bg-gray-50 flex items-center gap-2">
                    <Copy className="w-4 h-4" /> Copy Text
                  </button>
                  <button onClick={handleSaveQuote} disabled={saving} className="px-4 py-2 bg-gray-900 text-white rounded-lg font-semibold text-sm hover:bg-gray-800 flex items-center gap-2 disabled:opacity-50">
                    {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Quote
                  </button>
                  <button onClick={handleSendEmail} disabled={sending} className="px-4 py-2 bg-red-600 text-white rounded-lg font-semibold text-sm hover:bg-red-700 flex items-center gap-2 disabled:opacity-50">
                    {sending ? <Loader className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />} Send via Email
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Client Details</h3>
            <div className="space-y-3 text-sm">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium">{enquiry.name}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium">{enquiry.email}</span></div>
              <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{enquiry.phone || 'N/A'}</span></div>
              <div><span className="text-gray-500">Company:</span> <span className="font-medium">{enquiry.company || 'N/A'}</span></div>
              <div><span className="text-gray-500">GST No:</span> <span className="font-medium">{enquiry.gstNumber || 'N/A'}</span></div>
              <div><span className="text-gray-500">Date:</span> <span className="font-medium">{formatEnquiryDate(enquiry.createdAt)}</span></div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-2">Message</h3>
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{enquiry.message || 'No additional message.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
