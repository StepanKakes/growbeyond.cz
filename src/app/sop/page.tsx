"use client";

import React, { useState, useEffect } from 'react';
import { Search, Loader2, ChevronLeft, LayoutGrid, Folder } from 'lucide-react';
import { SOPCard, SOPItem } from '@/components/SOPCard';
import { instrumentSerif } from "@/app/fonts";

export default function SOPLibraryPage() {
  const [allItems, setAllItems] = useState<SOPItem[]>([]);
  const [rootItems, setRootItems] = useState<SOPItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [folderPath, setFolderPath] = useState<{ id: string; name: string }[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [allRes, rootRes] = await Promise.all([
          fetch('/api/sop/items?all=true'),
          fetch('/api/sop/items')
        ]);
        const allData = await allRes.json();
        const rootData = await rootRes.json();

        if (Array.isArray(allData)) setAllItems(allData);
        if (Array.isArray(rootData)) setRootItems(rootData);
      } catch (error) {
        console.error("Failed to fetch SOP items", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const displayedItems = React.useMemo(() => {
    if (searchQuery.trim()) {
      const normalizedQuery = searchQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
      return allItems.filter(item => 
        (item.name?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery)) ||
        (item.description?.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().includes(normalizedQuery))
      );
    }
    
    if (currentFolderId) {
      return allItems.filter(item => item.parents?.includes(currentFolderId));
    }

    return rootItems;
  }, [allItems, rootItems, searchQuery, currentFolderId]);

  const handleItemClick = (item: SOPItem) => {
    if (item.isFolder) {
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
    const newPath = [...folderPath];
    newPath.pop();
    setFolderPath(newPath);
    setCurrentFolderId(newPath.length > 0 ? newPath[newPath.length - 1].id : null);
    setSearchQuery('');
  };

  const navigateToRoot = () => {
    if (currentFolderId !== null || searchQuery !== '') {
      setFolderPath([]);
      setCurrentFolderId(null);
      setSearchQuery('');
    }
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

        {/* Back Button outside the window */}
        {isListView && (
          <div className="mb-4">
            <button
              onClick={navigateBack}
              className="flex items-center gap-1.5 text-white/40 hover:text-white transition-colors group px-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-widest text-[10px]">Zpět</span>
            </button>
          </div>
        )}

        {/* Window Container */}
        <div className={isListView ? "bg-[#121212] border border-white/[0.05] rounded-[24px] shadow-2xl flex flex-col overflow-hidden" : ""}>
          
          {/* Group Header inside window */}
          {isListView && (
            <div className="p-8 border-b border-white/[0.05] shrink-0 bg-[#121212] flex items-center gap-5 relative z-10">
              <div className="p-3 rounded-xl bg-brand-red/10 border border-brand-red/20 text-brand-red">
                {searchQuery.trim() ? <Search className="w-6 h-6" /> : <Folder className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-red/60 mb-1">
                  SOP Knihovna
                </p>
                <h2 className="text-xl font-bold leading-tight text-white/90">
                  {searchQuery.trim() ? 'Výsledky hledání' : folderPath[folderPath.length - 1]?.name}
                </h2>
                <p className="text-xs text-white/30 mt-1">
                  {displayedItems.length} SOPs
                </p>
              </div>
            </div>
          )}

          {/* Grid or List View */}
          <div className={`relative ${isListView ? "p-8 max-h-[60vh] overflow-y-auto" : "min-h-[400px]"}`}>
            {isLoading ? (
            <div className="absolute inset-x-0 top-32 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-6 h-6 text-brand-red animate-spin" />
              <p className="text-[10px] uppercase tracking-widest text-white/10 font-bold">Syncing...</p>
            </div>
          ) : (
            <div className={isListView ? "space-y-2" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"}>
              {displayedItems.length > 0 ? (
                displayedItems.map((item) => {
                  let parentName = null;
                  if (item.parents && item.parents.length > 0) {
                    const parent = allItems.find(p => p.id === item.parents![0]);
                    if (parent) parentName = parent.name;
                  }

                  return (
                    <SOPCard
                      key={item.id}
                      item={item}
                      variant={isListView ? 'list' : 'grid'}
                      isSearching={searchQuery.trim() !== ''}
                      parentName={parentName}
                      onClick={() => handleItemClick(item)}
                    />
                  );
                })
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
