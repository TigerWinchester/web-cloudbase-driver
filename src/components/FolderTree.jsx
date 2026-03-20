// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { Folder, FolderOpen, ChevronRight, ChevronDown, Plus, MoreVertical } from 'lucide-react';
// @ts-ignore;
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';

export function FolderTree({
  folders = [],
  currentFolderId,
  onSelectFolder,
  onNewFolder,
  onRefresh,
  className = ''
}) {
  const [expandedFolders, setExpandedFolders] = useState(new Set(['root']));
  const [hoverFolder, setHoverFolder] = useState(null);
  const toggleExpand = folderId => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderId)) {
        next.delete(folderId);
      } else {
        next.add(folderId);
      }
      return next;
    });
  };
  const renderFolder = (folder, level = 0) => {
    const isExpanded = expandedFolders.has(folder.id);
    const isActive = currentFolderId === folder.id;
    const children = folders.filter(f => f.parentId === folder.id);
    const hasChildren = children.length > 0;
    return <div key={folder.id}>
        <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group ${isActive ? 'bg-[#ff6b35]/10 border-l-3 border-[#ff6b35]' : 'hover:bg-white/30 border-l-3 border-transparent'}`} style={{
        marginLeft: `${level * 16}px`
      }} onMouseEnter={() => setHoverFolder(folder.id)} onMouseLeave={() => setHoverFolder(null)} onClick={() => onSelectFolder(folder.id)}>
          {hasChildren ? <Button variant="ghost" size="icon" className="w-5 h-5 hover:bg-transparent p-0" onClick={e => {
          e.stopPropagation();
          toggleExpand(folder.id);
        }}>
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </Button> : <div className="w-5" />}
          {isExpanded ? <FolderOpen className={`w-5 h-5 ${isActive ? 'text-[#ff6b35]' : 'text-[#1e3a5f]'}`} /> : <Folder className={`w-5 h-5 ${isActive ? 'text-[#ff6b35]' : 'text-[#1e3a5f]'}`} />}
          <span className={`text-sm font-medium truncate ${isActive ? 'text-[#ff6b35]' : 'text-gray-700'}`} style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
            {folder.name}
          </span>
          <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-6 h-6 hover:bg-white/50">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={e => {
                e.stopPropagation();
                onNewFolder(folder.id);
              }}>
                  <Plus className="w-4 h-4 mr-2" />
                  新建子文件夹
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {hasChildren && isExpanded && <div className="overflow-hidden">
            {children.map(child => renderFolder(child, level + 1))}
          </div>}
      </div>;
  };
  return <div className={className}>
      <div className="flex items-center justify-between mb-4 px-3">
        <h2 className="text-lg font-bold text-[#1e3a5f]" style={{
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
          文件夹
        </h2>
        <Button variant="ghost" size="icon" className="hover:bg-white/50" onClick={onRefresh}>
          ↻
        </Button>
      </div>
      <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
        {renderFolder({
        id: 'root',
        name: '我的云盘',
        parentId: null
      })}
        {folders.filter(f => f.parentId === 'root').map(folder => renderFolder(folder))}
      </div>
    </div>;
}