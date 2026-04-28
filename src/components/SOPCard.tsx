"use client";

// Final clean version of SOPCard to resolve persistent build error
import React from 'react';
import { 
  MessageSquare, Phone, Video, BarChart3, Package, Users, 
  Settings, UserCircle, Diamond, Heart, FileText, ExternalLink, Folder, LayoutGrid, Filter
} from 'lucide-react';

export interface SOPItem {
  id: string;
  name: string;
  mimeType: string;
  description?: string;
  webViewLink?: string;
  externalLink?: string;
  isFolder: boolean;
  itemCount?: number;
  parents?: string[];
}

const getIcon = (item: SOPItem) => {
  if (item.isFolder) {
    const searchText = `${item.name} ${item.description || ""}`.toLowerCase();
    if (searchText.includes('dm') || searchText.includes('setting')) return <MessageSquare className="w-5 h-5" />;
    if (searchText.includes('sale') || searchText.includes('call') || searchText.includes('closing')) return <Phone className="w-5 h-5" />;
    if (searchText.includes('marketing') || searchText.includes('content') || searchText.includes('youtube')) return <Video className="w-5 h-5" />;
    if (searchText.includes('report') || searchText.includes('kpi') || searchText.includes('data')) return <BarChart3 className="w-5 h-5" />;
    if (searchText.includes('fulfillment') || searchText.includes('delivery') || searchText.includes('onboarding')) return <Package className="w-5 h-5" />;
    if (searchText.includes('team') || searchText.includes('management') || searchText.includes('hiring')) return <Users className="w-5 h-5" />;
    if (searchText.includes('system') || searchText.includes('operation') || searchText.includes('automation')) return <Settings className="w-5 h-5" />;
    if (searchText.includes('va ') || searchText.includes('assistant') || searchText.includes('delegat')) return <UserCircle className="w-5 h-5" />;
    if (searchText.includes('offer') || searchText.includes('building') || searchText.includes('pitch')) return <Diamond className="w-5 h-5" />;
    if (searchText.includes('success') || searchText.includes('client') || searchText.includes('retention')) return <Heart className="w-5 h-5" />;
    if (searchText.includes('funnel')) return <Filter className="w-5 h-5" />;
    return <Folder className="w-5 h-5" />;
  }
  
  // Detect specific service icons for external links
  if (item.externalLink) {
    const link = item.externalLink.toLowerCase();
    if (link.includes('loom.com') || link.includes('youtube.com') || link.includes('vimeo.com')) return <Video className="w-5 h-5" />;
    if (link.includes('miro.com')) return <LayoutGrid className="w-5 h-5" />;
    return <ExternalLink className="w-5 h-5" />;
  }
  
  return <FileText className="w-5 h-5" />;
};

const getTypeLabel = (item: SOPItem) => {
  if (item.isFolder) return 'Kategorie';
  if (item.externalLink) {
    const link = item.externalLink.toLowerCase();
    if (link.includes('loom.com')) return 'Loom Video';
    if (link.includes('youtube.com')) return 'YouTube';
    if (link.includes('miro.com')) return 'Miro Board';
    return 'Externí odkaz';
  }
  return 'Dokument';
};

export const SOPCard = ({ item, onClick, variant = 'grid', parentName, isSearching }: { item: SOPItem; onClick: () => void; variant?: 'grid' | 'list'; parentName?: string | null; isSearching?: boolean }) => {
  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className="group flex items-center gap-4 bg-[#1a1a1a] hover:bg-brand-red/[0.02] hover:border-brand-red/50 border border-white/[0.04] rounded-xl p-4 cursor-pointer transition-all"
      >
        <div className="p-2.5 rounded-lg bg-white/[0.02] text-brand-red transition-all">
          {getIcon(item)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white transition-colors truncate">
            {item.name}
          </h4>
          <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest truncate">
             {isSearching && parentName ? (
               <span className="text-brand-red">{parentName} <span className="opacity-50">•</span> {getTypeLabel(item)}</span>
             ) : (
               getTypeLabel(item)
             )}
          </p>
        </div>
        {item.externalLink && (
           <ExternalLink className="w-4 h-4 text-white/10 group-hover:text-brand-red transition-all" />
        )}
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className="group relative bg-[#1a1a1a] border border-white/[0.04] hover:border-brand-red/50 hover:bg-brand-red/[0.02] rounded-2xl p-6 cursor-pointer transition-all flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-3 rounded-xl bg-white/[0.02] text-brand-red transition-all">
          {getIcon(item)}
        </div>
        
        {item.isFolder && item.itemCount !== undefined && (
          <div className="w-8 h-8 rounded-lg bg-brand-red/10 flex items-center justify-center text-[10px] font-black text-brand-red/80 border border-brand-red/20">
            {item.itemCount}
          </div>
        )}
      </div>

      <div className="space-y-0.5 mt-auto">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-red/60 mb-2 truncate">
          {isSearching && parentName ? parentName : "GrowBeyond"}
        </p>
        
        <h3 className="text-base font-bold text-white transition-colors line-clamp-1 tracking-tight">
          {item.name}
        </h3>
        
        <p className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">
           {getTypeLabel(item)}
        </p>
        
        {item.description && !item.externalLink && !item.isFolder && (
          <p className="text-[11px] text-white/20 line-clamp-2 mt-2 leading-relaxed">
            {item.description.replace(/https?:\/\/[^\s]+/g, '').trim()}
          </p>
        )}
      </div>
    </div>
  );
};
