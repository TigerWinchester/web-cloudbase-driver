// @ts-ignore;
import React, { useState } from 'react';
// @ts-ignore;
import { File, Image as ImageIcon, FileText, Film, Download, Trash2, Link, MoreVertical, Folder } from 'lucide-react';
// @ts-ignore;
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui';

export function FileGrid({
  items = [],
  viewMode = 'grid',
  onDownload,
  onDelete,
  onShare,
  onDoubleClick,
  className = ''
}) {
  const [hoverItem, setHoverItem] = useState(null);
  const getFileIcon = item => {
    if (item.type === 'folder') {
      return <Folder className="w-8 h-8 text-[#ff9800]" />;
    }
    switch (item.fileType) {
      case 'image':
        return <ImageIcon className="w-8 h-8 text-[#4CAF50]" />;
      case 'document':
        return <FileText className="w-8 h-8 text-[#2196F3]" />;
      case 'video':
        return <Film className="w-8 h-8 text-[#9C27B0]" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };
  const formatFileSize = bytes => {
    if (!bytes) return '-';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };
  if (viewMode === 'list') {
    return <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-4 text-sm font-medium text-gray-600" style={{
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
                名称
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600" style={{
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
                大小
              </th>
              <th className="text-left p-4 text-sm font-medium text-gray-600" style={{
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
                类型
              </th>
              <th className="text-right p-4 text-sm font-medium text-gray-600" style={{
              fontFamily: 'Space Grotesk, sans-serif'
            }}>
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer" onDoubleClick={() => onDoubleClick(item)} onMouseEnter={() => setHoverItem(item.id)} onMouseLeave={() => setHoverItem(null)}>
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(item)}
                    <span className="text-sm font-medium text-gray-800" style={{
                  fontFamily: 'JetBrains Mono, monospace'
                }}>
                      {item.name}
                    </span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                  {formatFileSize(item.fileSize)}
                </td>
                <td className="p-4 text-sm text-gray-600" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                  {item.fileType === 'folder' ? '文件夹' : item.fileType || '文件'}
                </td>
                <td className="p-4 text-right">
                  <div className={`flex justify-end gap-2 ${hoverItem === item.id ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
                    {item.type !== 'folder' && <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-[#1e3a5f]/10" onClick={() => onDownload(item)}>
                        <Download className="w-4 h-4 text-[#1e3a5f]" />
                      </Button>}
                    {item.type !== 'folder' && <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-[#ff6b35]/10" onClick={() => onShare(item)}>
                        <Link className="w-4 h-4 text-[#ff6b35]" />
                      </Button>}
                    <Button variant="ghost" size="icon" className="w-8 h-8 hover:bg-red-100" onClick={() => onDelete(item)}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>)}
          </tbody>
        </table>
        {items.length === 0 && <div className="p-12 text-center text-gray-400" style={{
        fontFamily: 'JetBrains Mono, monospace'
      }}>
            暂无文件
          </div>}
      </div>;
  }
  return <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
      {items.map(item => <div key={item.id} className="bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all cursor-pointer group relative" onDoubleClick={() => onDoubleClick(item)} onMouseEnter={() => setHoverItem(item.id)} onMouseLeave={() => setHoverItem(null)}>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 flex items-center justify-center mb-3 bg-gray-50 rounded-lg group-hover:bg-gray-100 transition-colors">
              {getFileIcon(item)}
            </div>
            <h3 className="text-sm font-medium text-gray-800 text-center truncate w-full" style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
              {item.name}
            </h3>
            <p className="text-xs text-gray-500 mt-1" style={{
          fontFamily: 'JetBrains Mono, monospace'
        }}>
              {formatFileSize(item.fileSize)}
            </p>
          </div>
          <div className={`absolute top-2 right-2 flex gap-1 ${hoverItem === item.id ? 'opacity-100' : 'opacity-0'} transition-opacity bg-white rounded-lg shadow-sm`}>
            {item.type !== 'folder' && <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-[#1e3a5f]/10" onClick={() => onDownload(item)}>
                <Download className="w-3.5 h-3.5 text-[#1e3a5f]" />
              </Button>}
            {item.type !== 'folder' && <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-[#ff6b35]/10" onClick={() => onShare(item)}>
                <Link className="w-3.5 h-3.5 text-[#ff6b35]" />
              </Button>}
            <Button variant="ghost" size="icon" className="w-7 h-7 hover:bg-red-100" onClick={() => onDelete(item)}>
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
            </Button>
          </div>
        </div>)}
      {items.length === 0 && <div className="col-span-full p-12 text-center text-gray-400" style={{
      fontFamily: 'JetBrains Mono, monospace'
    }}>
          暂无文件
        </div>}
    </div>;
}