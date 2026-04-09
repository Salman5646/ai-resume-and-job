"use client";

import React, { useState, useEffect } from "react";
import { Settings, X, Key, Info } from "lucide-react";

interface SettingsPanelProps {
  onKeyChange: (key: string) => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ onKeyChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("gemini_api_key");
    if (saved) {
      setApiKey(saved);
      onKeyChange(saved);
    }
  }, [onKeyChange]);

  const handleSave = () => {
    localStorage.setItem("gemini_api_key", apiKey);
    onKeyChange(apiKey);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-8 right-8 p-3 rounded-full glass-card hover:bg-white/10 transition-all z-50 text-white/60 hover:text-white"
      >
        <Settings className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md glass-card p-8 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 text-white/40 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                <Key className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold">API Configuration</h2>
            </div>

            <p className="text-white/60 text-sm mb-6 flex gap-2">
              <Info className="w-4 h-4 shrink-0 mt-0.5" />
              Enter your Google Gemini API key. This is stored locally in your browser and never sent to our servers.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-white/40 mb-2">Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Paste your key here..."
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>

              <button
                onClick={handleSave}
                className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-cyan-600 font-bold text-white hover:opacity-90 transition-all shadow-lg shadow-purple-500/20"
              >
                Save Settings
              </button>
              
              <a 
                href="https://aistudio.google.com/app/apikey" 
                target="_blank" 
                rel="noreferrer"
                className="block text-center text-xs text-cyan-400 hover:underline"
              >
                Get a free API key here
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
