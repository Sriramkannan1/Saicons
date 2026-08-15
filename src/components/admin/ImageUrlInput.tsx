import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Image as ImageIcon, ExternalLink, X } from "lucide-react";

export function extractGoogleDriveId(url: string): string | null {
  if (!url) return null;
  const patterns = [
    /drive\.google\.com\/file\/d\/([^/]+)/,
    /drive\.google\.com\/open\?id=([^&]+)/,
    /drive\.google\.com\/uc\?id=([^&]+)/
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

interface ImageUrlInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export function ImageUrlInput({ label, value, onChange, required = false }: ImageUrlInputProps) {
  const [fileId, setFileId] = useState<string | null>(null);

  useEffect(() => {
    setFileId(extractGoogleDriveId(value));
  }, [value]);

  const isValid = fileId !== null;
  const showPreview = value.length > 0;

  return (
    <div className="space-y-3">
      <Label className="text-slate-900">{label} {required && <span className="text-red-500">*</span>}</Label>
      
      <div className="flex space-x-2">
        <div className="relative flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste Google Drive URL here"
            className={`text-slate-900 border-gray-300 ${showPreview ? (isValid ? "pr-10 border-green-300 focus-visible:ring-green-500" : "pr-10 border-red-300 focus-visible:ring-red-500") : ""}`}
          />
          {showPreview && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isValid ? (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </div>
          )}
        </div>
        {value && (
          <Button type="button" variant="outline" size="icon" onClick={() => onChange("")}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showPreview && (
        <div className="mt-2 rounded-md border border-gray-200 bg-gray-50 overflow-hidden">
          <div className="p-3 border-b border-gray-200 bg-white flex justify-between items-center">
            <div className="flex items-center text-sm font-medium text-gray-700">
              <ImageIcon className="h-4 w-4 mr-2 text-gray-500" />
              Image Preview
            </div>
            {isValid ? (
              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                Valid Google Drive URL
              </span>
            ) : (
              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                Invalid URL format
              </span>
            )}
          </div>
          
          <div className="p-4 flex justify-center items-center min-h-[200px] bg-gray-100/50">
            {isValid ? (
              <img 
                src={`https://drive.google.com/uc?export=view&id=${fileId}`} 
                alt="Preview" 
                className="max-h-[300px] max-w-full rounded shadow-sm object-contain"
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (img.src.includes('uc?export=view')) {
                    // Fallback to thumbnail API if direct view fails
                    img.src = `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
                  } else {
                    img.style.display = 'none';
                    if (img.parentElement) {
                      img.parentElement.innerHTML = '<div class="text-center text-red-500 text-sm"><p>Preview could not be loaded.</p><p class="text-xs mt-1 text-gray-500">Ensure the file is publicly shared ("Anyone with the link").</p></div>';
                    }
                  }
                }}
              />
            ) : (
              <div className="text-center text-sm text-gray-500">
                <p>Please enter a valid Google Drive file URL.</p>
                <p className="text-xs mt-1">Example: https://drive.google.com/file/d/FILE_ID/view</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
