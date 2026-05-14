'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  ChevronDown, 
  ChevronRight, 
  ShieldAlert, 
  User as UserIcon, 
  Clock, 
  Globe, 
  Database,
  Copy,
  ExternalLink
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuditLogTableProps {
  logs: any[];
  total: number;
  hasMore: boolean;
  onLoadMore: () => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({ 
  logs, 
  total, 
  hasMore, 
  onLoadMore 
}) => {
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getActionColor = (action: string) => {
    if (action.includes('DELETE') || action.includes('FAILED') || action.includes('DENIED')) {
      return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
    }
    if (action.includes('ROLE') || action.includes('PERMISSION') || action.includes('SETTINGS')) {
      return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    }
    if (action.includes('CREATE')) {
      return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
    return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast here
  };

  return (
    <div className="w-full space-y-4">
      <div className="rounded-xl border border-white/5 bg-black/40 backdrop-blur-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider w-10"></th>
              <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Timestamp</th>
              <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Action</th>
              <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">User</th>
              <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">Entity</th>
              <th className="p-4 text-xs font-medium text-white/40 uppercase tracking-wider">IP Address</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr 
                  className={cn(
                    "group hover:bg-white/5 transition-colors cursor-pointer",
                    expandedRows[log.id] && "bg-white/5"
                  )}
                  onClick={() => toggleRow(log.id)}
                >
                  <td className="p-4 text-center">
                    {expandedRows[log.id] ? (
                      <ChevronDown className="w-4 h-4 text-white/40" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-white/40 group-hover:text-white" />
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium">
                        {format(new Date(log.createdAt), 'MMM d, HH:mm:ss')}
                      </span>
                      <span className="text-xs text-white/40">
                        {format(new Date(log.createdAt), 'yyyy')}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2.5 py-1 rounded-full text-[10px] font-bold border",
                      getActionColor(log.action)
                    )}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-white/60" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm text-white font-medium">
                          {log.user?.staff?.name || 'System'}
                        </span>
                        <span className="text-xs text-white/40">
                          {log.user?.email || 'automated-task'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-white font-medium flex items-center gap-1.5">
                        <Database className="w-3 h-3 text-white/40" />
                        {log.entityType}
                      </span>
                      <span className="text-xs font-mono text-white/40">
                        {log.entityId || 'N/A'}
                      </span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 text-xs text-white/60">
                      <Globe className="w-3 h-3" />
                      {log.ipAddress}
                    </div>
                  </td>
                </tr>
                {expandedRows[log.id] && (
                  <tr>
                    <td colSpan={6} className="p-0 border-none bg-black/60">
                      <div className="p-6 border-l-2 border-indigo-500/50 space-y-6">
                        <div className="grid grid-cols-3 gap-8">
                          <div className="space-y-2">
                            <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Context Details</h4>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                                <span className="text-white/40">Request ID</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-indigo-400 font-mono">{log.requestId?.substring(0, 8)}...</span>
                                  <button onClick={() => copyToClipboard(log.requestId)} className="hover:text-white transition-colors">
                                    <Copy className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                                <span className="text-white/40">User Agent</span>
                                <span className="text-white/60 truncate max-w-[150px]" title={log.userAgent}>
                                  {log.userAgent}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="col-span-2 space-y-2">
                            <h4 className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Forensic Metadata</h4>
                            <pre className="p-4 rounded-xl bg-black/40 border border-white/5 text-[11px] font-mono text-indigo-300 overflow-x-auto max-h-[300px]">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                          {log.entityId && (
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white transition-colors border border-white/10">
                              <ExternalLink className="w-3 h-3" />
                              View Related Entity
                            </button>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        
        {logs.length === 0 && (
          <div className="p-20 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-8 h-8 text-white/20" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-white">No audit logs found</h3>
              <p className="text-sm text-white/40">Try adjusting your filters to see more results.</p>
            </div>
          </div>
        )}
      </div>

      {hasMore && (
        <div className="flex justify-center pt-4">
          <button 
            onClick={onLoadMore}
            className="px-6 py-2 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-sm font-medium text-white transition-all shadow-lg shadow-indigo-500/20"
          >
            Load More Activity
          </button>
        </div>
      )}
    </div>
  );
};
