"use client";

// Final clean version of SOPCard to resolve persistent build error
import React from 'react';
import { 
  MessageSquare, Phone, Video, BarChart3, Package, Users, 
  Settings, UserCircle, Diamond, Heart, FileText, ExternalLink, Folder
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
}

const getIcon = (name: string, isFolder: boolean) => {
  if (!isFolder) return <FileText className="w-5 h-5" />;
  
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes('dm') || lowerName.includes('setting')) return <MessageSquare className="w-5 h-5" />;
  if (lowerName.includes('sale') || lowerName.includes('call') || lowerName.includes('closing')) return <Phone className="w-5 h-5" />;
  if (lowerName.includes('marketing') || lowerName.includes('content') || lowerName.includes('youtube')) return <Video className="w-5 h-5" />;
  if (lowerName.includes('report') || lowerName.includes('kpi') || lowerName.includes('data')) return <BarChart3 className="w-5 h-5" />;
  if (lowerName.includes('fulfillment') || lowerName.includes('delivery') || lowerName.includes('onboarding')) return <Package className="w-5 h-5" />;
  if (lowerName.includes('team') || lowerName.includes('management') || lowerName.includes('hiring')) return <Users className="w-5 h-5" />;
  if (lowerName.includes('system') || lowerName.includes('operation') || lowerName.includes('automation')) return <Settings className="w-5 h-5" />;
  if (lowerName.includes('va ') || lowerName.includes('assistant') || lowerName.includes('delegat')) return <UserCircle className="w-5 h-5" />;
  if (lowerName.includes('offer') || lowerName.includes('building') || lowerName.includes('pitch')) return <Diamond className="w-5 h-5" />;
  if (lowerName.includes('success') || lowerName.includes('client') || lowerName.includes('retention')) return <Heart className="w-5 h-5" />;
  
  return <Folder className="w-5 h-5" />;
};

export const SOPCard = ({ item, onClick, variant = 'grid' }: { item: SOPItem; onClick: () => void; variant?: 'grid' | 'list' }) => {
  if (variant === 'list') {
    return (
      <div
        onClick={onClick}
        className="group flex items-center gap-4 bg-[#0d0d0d] hover:bg-[#121212] border border-white/[0.04] rounded-xl p-4 cursor-pointer transition-all"
      >
        <div className="p-2.5 rounded-lg bg-white/[0.02] text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all">
          {getIcon(item.name, item.isFolder)}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-white group-hover:text-brand-red transition-colors truncate">
            {item.name}
          </h4>
          <p className="text-[10px] font-medium text-white/10 uppercase tracking-widest truncate">
             {item.isFolder ? 'Category' : 'Document'}
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
      className="group relative bg-[#0d0d0d] border border-white/[0.04] hover:border-white/[0.08] rounded-2xl p-6 cursor-pointer transition-all flex flex-col h-full"
    >
      <div className="flex justify-between items-start mb-6">
        <div className="p-2.5 rounded-xl bg-white/[0.02] text-brand-red group-hover:bg-brand-red group-hover:text-white transition-all">
          {getIcon(item.name, item.isFolder)}
        </div>
        
        {item.isFolder && item.itemCount !== undefined && (
          <div className="w-8 h-8 rounded-lg bg-brand-red/5 flex items-center justify-center text-[10px] font-black text-brand-red/40 border border-brand-red/10">
            {item.itemCount}
          </div>
        )}
      </div>

      <div className="space-y-0.5 mt-auto">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-brand-red/60 mb-2">
          GrowBeyond
        </p>
        
        <h3 className="text-base font-bold text-white group-hover:text-brand-red transition-colors line-clamp-1 tracking-tight">
          {item.name}
        </h3>
        
        {item.description && (
          <p className="text-[11px] text-white/20 line-clamp-2 mt-2 leading-relaxed">
            {item.description.replace(/https?:\/\/[^\s]+/g, '').trim()}
          </p>
        )}
      </div>
    </div>
  );
};
