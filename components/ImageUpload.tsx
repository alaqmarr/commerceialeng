"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Image as ImageIcon,
} from "lucide-react";

export interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  onRemove?: () => void;
  folder?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function ImageUpload({
  value,
  onChange,
  onRemove,
  folder = "uploads",
  label = "Image Upload",
  disabled = false,
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progressText, setProgressText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setError(null);
      setUploading(true);
      setProgressText(`Uploading ${file.name} to Cloudflare R2...`);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Failed to upload image");
        }

        if (data.url) {
          onChange(data.url);
          setProgressText("Upload complete!");
          setTimeout(() => setProgressText(null), 2000);
        } else {
          throw new Error("No URL returned from upload server");
        }
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : "Upload failed";
        console.error("Upload error:", err);
        setError(errMsg);
      } finally {
        setUploading(false);
      }
    },
    [folder, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/gif": [".gif"],
      "image/svg+xml": [".svg"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB limit
    disabled: disabled || uploading,
    onDropRejected: (rejections) => {
      const firstError = rejections[0]?.errors[0]?.message || "Invalid file";
      setError(firstError);
    },
  });

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    if (onRemove) onRemove();
    setError(null);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block text-xs font-sans font-medium text-gray-700 uppercase tracking-wider">
            {label}
          </label>
          {value && (
            <span className="text-[10px] font-sans font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200">
              Cloudflare R2 Synced
            </span>
          )}
        </div>
      )}

      {/* Existing Image Preview Card */}
      {value ? (
        <div className="relative group rounded-xl border border-gray-200 bg-white p-3 flex flex-col sm:flex-row items-center gap-4 shadow-sm">
          <div className="relative w-28 h-28 sm:w-24 sm:h-24 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Uploaded preview"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="flex-1 min-w-0 w-full space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-semibold text-gray-800">
                Image Uploaded
              </span>
            </div>
            <p className="text-[11px] font-sans text-gray-600 break-all line-clamp-2 bg-gray-50 p-1.5 rounded border border-gray-200">
              {value}
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href={value}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-sans text-red-600 hover:text-red-700 underline underline-offset-2"
              >
                <span>View Full Size</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled}
                className="inline-flex items-center gap-1 text-[11px] font-sans text-red-600 hover:text-red-700 transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Remove Image</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Active Area */
        <div
          {...getRootProps()}
          data-testid="dropzone"
          className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragActive
              ? "border-red-500 bg-red-50/50 scale-[0.99]"
              : isDragReject
              ? "border-red-500 bg-red-50/50"
              : "border-gray-300 hover:border-red-500 bg-gray-50/60 hover:bg-gray-50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center gap-2">
            {uploading ? (
              <div className="flex flex-col items-center gap-2 py-2">
                <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
                <span className="text-xs font-sans text-red-600 animate-pulse">
                  {progressText || "Uploading to Cloudflare R2..."}
                </span>
              </div>
            ) : (
              <>
                <div className="p-3 rounded-full bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
                  {isDragActive ? (
                    <UploadCloud className="w-6 h-6 text-red-600 animate-bounce" />
                  ) : (
                    <ImageIcon className="w-6 h-6" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {isDragActive
                      ? "Drop the image here to upload"
                      : "Drag & drop image here, or click to browse"}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1 font-sans">
                    Supports PNG, JPG, WEBP, GIF, SVG up to 10MB
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg font-sans">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
