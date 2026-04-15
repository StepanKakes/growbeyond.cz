"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, ChevronLeft, LayoutGrid, Folder } from 'lucide-react';
import { SOPCard, SOPItem } from '@/components/SOPCard';
import { instrumentSerif } from "@/app/fonts";

export default function SOPLibraryPage() {
  const [items, setItems] = useState<SOPItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  const fetchItems = async (folderId: string | null = null, q: string = '') => {
    setIsLoading(true);
    try {
      // Normalize query for diacritics
      const normalizedQ = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

      let url = folderId ? `/api/sop/items?folderId=${folderId}` : '/api/sop/items';
      if (normalizedQ.trim()) {
        url += `${url.includes('?') ? '&' : '?'}q=${encodeURIComponent(normalizedQ.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (Array.isArray(data)) {
        setItems(data);
      } else {
        setItems([]);
      }
    } catch (error) {
      setItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Start loading immediately when params change to prevent flickering old data
    setIsLoading(true);

    const timer = setTimeout(() => {
      fetchItems(currentFolderId, searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentFolderId, searchQuery]);

  const handleItemClick = (item: SOPItem) => {
    if (item.isFolder) {
      setItems([]); // Clear items immediately
      setFolderPath(prev => [...prev, { id: item.id, name: item.name }]);
      setCurrentFolderId(item.id);
      setSearchQuery('');
    } else {
      const targetUrl = item.externalLink || item.webViewLink;
      if (targetUrl) {
        window.open(targetUrl, '_blank');
      }
    }
  };

  const navigateBack = () => {
    setItems([]); // Clear items immediately
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    setSearchQuery('');
  };

  const navigateToRoot = () => {
    setItems([]); // Clear items immediately
    setFolderPath([]);
    setCurrentFolderId(null);
    setSearchQuery('');
  };

  const isListView = searchQuery.trim() !== '' || folderPath.length > 0;

  return (
    <main className="min-h-screen bg-[#050505] text-white selection:bg-brand-red/30 relative font-sans">
      <div className="max-w-4xl mx-auto px-6 pt-16 pb-12">
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <h2 className={`${instrumentSerif.className} italic text-4xl text-white mb-2 cursor-pointer`} onClick={navigateToRoot}>
            Beyond
          </h2>
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            SOP Knihovna
          </h1>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative group mb-12">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-white/30 group-focus-within:text-brand-red transition-colors" />
          </div>
          <input
            type="text"
            placeholder="Hledat v dokumentaci..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-white/[0.08] focus:border-brand-red/50 rounded-xl py-4 px-12 text-sm focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Breadcrumbs / Group Header */}
        {isListView && (
          <div className="mb-6">
            <button
              onClick={navigateBack}
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors mb-4 group px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-widest text-[10px]">Zpět</span>
            </button>

            <div className="bg-[#121212] border border-white/[0.05] rounded-2xl p-6 mb-4 flex items-center gap-5 shadow-2xl">
              <div className="p-3 rounded-xl bg-white/[0.03] text-brand-red">
                {searchQuery.trim() ? <Search className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red/60 mb-1">
                  SOP Knihovna
                </p>
                <h2 className="text-xl font-bold leading-tight">
                  {searchQuery.trim() ? 'Výsledky hledání' : folderPath[folderPath.length - 1]?.name}
                </h2>
                <p className="text-xs text-white/20 mt-1">
                  {items.length} {items.length === 1 ? 'položka' : (items.length < 5 ? 'položky' : 'položek')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Grid or List View */}
        <div className="relative min-h-[400px]">
          {isLoading ? (
            <div className="absolute inset-x-0 top-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-6 h-6 text-brand-red animate-spin" />
              <p className="text-[10px] uppercase tracking-widest text-white/10 font-bold">Syncing...</p>
            </div>
          ) : (
            <div className={isListView ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
              {items.length > 0 ? (
                items.map((item) => (
                  <SOPCard
                    key={item.id}
                    item={item}
                    variant={isListView ? 'list' : 'grid'}
                    onClick={() => handleItemClick(item)}
                  />
                ))
              ) : (
                <div className="py-24 text-center opacity-10 flex flex-col items-center">
                  <Search className="w-12 h-12 mb-4" />
                  <p className="text-sm font-bold uppercase tracking-widest">Žádné výsledky</p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-[10px] text-brand-red font-black uppercase tracking-widest hover:underline">Zobrazit vše</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Branding */}
      {!isLoading && !isListView && (
        <div className="py-20 flex flex-col items-center justify-center opacity-[0.05] selection:bg-transparent pointer-events-none">
          <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-4">SOP Knihovna</p>
          <span className={`${instrumentSerif.className} italic text-[120px] leading-none tracking-tighter`}>Beyond</span>
        </div>
      )}
    </main>
  );
}
