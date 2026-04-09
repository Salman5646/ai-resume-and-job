"use client";

import React, { useState, useCallback } from "react";
import { Upload, FileText, CheckCircle2, Loader2, X } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";

// Set worker source for pdfjs using unpkg for better version matching
// Set worker source for pdfjs using jsDelivr for reliability
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface UploadZoneProps {
  onTextExtracted: (text: string, fileData?: { data: string; mimeType: string }) => void;
  isProcessing: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onTextExtracted, isProcessing }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const extractText = async (file: File) => {
    try {
      console.log("Starting extraction for:", file.name, "Type:", file.type);
      if (file.type === "application/pdf") {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        console.log("ArrayBuffer converted to Uint8Array, size:", uint8Array.length);

        const loadingTask = pdfjsLib.getDocument({
          data: uint8Array,
          cMapUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`,
          cMapPacked: true,
          standardFontDataUrl: `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/standard_fonts/`,
          isEvalSupported: false, // Disable eval for better security/compatibility
        });

        loadingTask.onProgress = (progress: { loaded: number; total: number }) => {
          console.log(`Loading PDF: ${Math.round(progress.loaded / progress.total * 100)}%`);
        };

        const pdf = await loadingTask.promise;
        console.log("PDF loaded, pages:", pdf.numPages);
        let text = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          console.log(`Page ${i} - Items found:`, content.items.length);

          let lastY = -1;
          let pageText = "";

          for (const item of content.items) {
            const textItem = item as any;
            if (textItem.str !== undefined) {
              const y = textItem.transform ? textItem.transform[5] : -1;

              if (lastY !== -1 && y !== lastY && y !== -1) {
                pageText += "\n";
              } else if (pageText.length > 0 && !pageText.endsWith("\n")) {
                pageText += " ";
              }
              pageText += textItem.str;
              lastY = y;
            }
          }

          if (pageText.trim().length === 0 && content.items.length > 0) {
            console.log("Warning: Items found but no string extracted. First item structure:", JSON.stringify(content.items[0]));
          }

          text += pageText + "\n\n";
          console.log(`Page ${i} extracted, length: ${pageText.length}`);
        }
        console.log("Final total extracted length:", text.length);
        return text;
      } else if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        console.log("DOCX extracted, length:", result.value.length);
        return result.value;
      }
      throw new Error("Unsupported file type. Please upload PDF or DOCX.");
    } catch (err: any) {
      console.error("Extraction error details:", err);
      throw new Error(`Extraction failed: ${err.message || "Unknown error"}. Check console for details.`);
    }
  };

  const handleFile = async (selectedFile: File) => {
    if (!selectedFile) return;

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(selectedFile.type)) {
      setError("Please upload a PDF or DOCX file.");
      return;
    }

    setFile(selectedFile);
    setError(null);

    try {
      const text = await extractText(selectedFile);

      // Convert to base64 for multimodal fallback
      const arrayBuffer = await selectedFile.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ""));

      onTextExtracted(text, { data: base64, mimeType: selectedFile.type });
    } catch (err: any) {
      setError(err.message);
      setFile(null);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className={`relative group cursor-pointer transition-all duration-300 p-12 text-center glass-card border-dashed border-2 ${file ? "border-cyan-500/50" : "border-white/10 hover:border-cyan-500/30"
          }`}
      >
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          accept=".pdf,.docx"
        />

        <div className="flex flex-col items-center gap-4">
          <div className={`p-4 rounded-full transition-colors ${file ? "bg-cyan-500/10" : "bg-white/5 group-hover:bg-cyan-500/10"}`}>
            {isProcessing ? (
              <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            ) : file ? (
              <CheckCircle2 className="w-10 h-10 text-cyan-500" />
            ) : (
              <Upload className="w-10 h-10 text-white/40 group-hover:text-cyan-400" />
            )}
          </div>

          <div>
            <h3 className="text-xl font-medium text-white mb-1">
              {file ? file.name : "Upload your resume"}
            </h3>
            <p className="text-white/40 text-sm">
              {file ? "File ready for analysis" : "Drag and drop or click to browse (PDF, DOCX)"}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
          <X className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};
