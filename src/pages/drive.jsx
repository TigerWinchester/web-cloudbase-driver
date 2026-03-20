// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Search, Grid, List, Upload, FolderPlus, Menu, Share2, LogOut, Cloud } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

import { FolderTree } from '@/components/FolderTree';
import { FileGrid } from '@/components/FileGrid';
function Breadcrumb({
  items = [],
  onSelect,
  className = ''
}) {
  return <div className={`flex items-center gap-2 text-sm ${className}`}>
      {items.map((item, index) => <React.Fragment key={item.id}>
          <button onClick={() => {
        if (onSelect) {
          onSelect(item.id);
        }
      }} className={`hover:text-[#ff6b35] transition-colors ${index === items.length - 1 ? 'text-[#1e3a5f] font-medium' : 'text-gray-600'}`} style={{
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
            {item.name}
          </button>
          {index < items.length - 1 && <span className="text-gray-400">/</span>}
        </React.Fragment>)}
    </div>;
}
export default function Drive({
  $w,
  className = ''
}) {
  const {
    toast
  } = useToast();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);
  const [folders, setFolders] = useState([]);
  const [files, setFiles] = useState([]);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [breadcrumb, setBreadcrumb] = useState([{
    id: 'root',
    name: '我的云盘'
  }]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [userOpenId, setUserOpenId] = useState('');
  useEffect(() => {
    checkLogin();
  }, []);
  useEffect(() => {
    if (userOpenId) {
      loadData();
    }
  }, [userOpenId]);
  const checkLogin = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      const authResult = await tcb.auth().getCurrentUser();
      if (!authResult || authResult.isAnonymous) {
        $w.utils.navigateTo({
          pageId: 'login',
          params: {}
        });
      } else {
        setUser(authResult);
        setUserOpenId(authResult.uid || authResult._id || '');
      }
    } catch (error) {
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    }
  };
  const loadData = async () => {
    if (!userOpenId) return;
    try {
      setLoading(true);

      // 查询文件夹列表
      const foldersResult = await $w.cloud.callDataSource({
        dataSourceName: 'cloud_folders',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                _openid: {
                  $eq: userOpenId
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });

      // 查询文件列表
      const filesResult = await $w.cloud.callDataSource({
        dataSourceName: 'cloud_files',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                _openid: {
                  $eq: userOpenId
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });

      // 转换文件夹数据格式
      const formattedFolders = (foldersResult.records || []).map(f => ({
        id: f._id,
        name: f.name,
        parentId: f.parentId || 'root'
      }));

      // 转换文件数据格式
      const formattedFiles = (filesResult.records || []).map(f => ({
        id: f._id,
        name: f.name,
        parentId: f.parentId || 'root',
        fileType: f.fileType,
        fileSize: f.fileSize,
        fileUrl: f.fileUrl,
        shareToken: f.shareToken,
        shareEnabled: f.shareEnabled
      }));
      setFolders(formattedFolders);
      setFiles(formattedFiles);
    } catch (error) {
      console.error('加载数据失败:', error);
      toast({
        title: '加载数据失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleNewFolder = async (parentId = currentFolderId) => {
    const folderName = prompt('请输入文件夹名称：');
    if (!folderName) return;
    try {
      setLoading(true);

      // 调用数据模型创建文件夹
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'cloud_folders',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: folderName,
            parentId: parentId === 'root' ? '' : parentId,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        }
      });
      if (result && result.id) {
        const newFolder = {
          id: result.id,
          name: folderName,
          parentId: parentId === 'root' ? '' : parentId
        };
        setFolders(prev => [...prev, newFolder]);
        toast({
          title: '创建成功',
          description: `文件夹"${folderName}"已创建`
        });
      }
    } catch (error) {
      console.error('创建文件夹失败:', error);
      toast({
        title: '创建失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleUpload = async e => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    try {
      setLoading(true);

      // 上传文件到云存储
      const tcb = await $w.cloud.getCloudInstance();
      const cloudPath = `cloud-drive/${Date.now()}_${selectedFile.name}`;
      const uploadResult = await tcb.uploadFile({
        cloudPath: cloudPath,
        fileContent: selectedFile
      });
      if (!uploadResult.fileID) {
        throw new Error('文件上传失败');
      }

      // 获取文件下载 URL
      const urlResult = await tcb.getTempFileURL({
        fileList: [uploadResult.fileID]
      });
      const fileUrl = urlResult.fileList[0]?.tempFileURL || uploadResult.fileID;
      const fileType = selectedFile.type.startsWith('image/') ? 'image' : selectedFile.type.startsWith('video/') ? 'video' : 'document';

      // 保存文件信息到数据模型
      const fileResult = await $w.cloud.callDataSource({
        dataSourceName: 'cloud_files',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            name: selectedFile.name,
            parentId: currentFolderId === 'root' ? '' : currentFolderId,
            fileUrl: fileUrl,
            fileSize: selectedFile.size,
            fileType: fileType,
            shareToken: '',
            shareEnabled: false,
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        }
      });
      if (fileResult && fileResult.id) {
        const newFile = {
          id: fileResult.id,
          name: selectedFile.name,
          parentId: currentFolderId,
          fileType,
          fileSize: selectedFile.size,
          fileUrl
        };
        setFiles(prev => [...prev, newFile]);
        toast({
          title: '上传成功',
          description: `文件"${selectedFile.name}"已上传`
        });
      }
    } catch (error) {
      console.error('上传失败:', error);
      toast({
        title: '上传失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  const handleDownload = async file => {
    try {
      if (!file.fileUrl) {
        toast({
          title: '下载失败',
          description: '文件链接不存在',
          variant: 'destructive'
        });
        return;
      }

      // 在浏览器中打开文件链接进行下载
      window.open(file.fileUrl, '_blank');
      toast({
        title: '下载开始',
        description: `正在下载"${file.name}"...`
      });
    } catch (error) {
      console.error('下载失败:', error);
      toast({
        title: '下载失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    }
  };
  const handleDelete = async item => {
    if (!confirm(`确定要删除"${item.name}"吗？`)) return;
    try {
      setLoading(true);
      if (item.type === 'folder') {
        // 删除文件夹（同时删除文件夹下的所有文件）
        // 1. 查询该文件夹下的所有文件
        const filesInFolder = await $w.cloud.callDataSource({
          dataSourceName: 'cloud_files',
          methodName: 'wedaGetRecordsV2',
          params: {
            filter: {
              where: {
                $and: [{
                  _openid: {
                    $eq: userOpenId
                  }
                }, {
                  parentId: {
                    $eq: item.id
                  }
                }]
              }
            },
            select: {
              _id: true
            },
            pageSize: 100
          }
        });

        // 2. 批量删除文件
        if (filesInFolder.records && filesInFolder.records.length > 0) {
          const fileIds = filesInFolder.records.map(f => f._id);
          await $w.cloud.callDataSource({
            dataSourceName: 'cloud_files',
            methodName: 'wedaBatchDeleteV2',
            params: {
              filter: {
                where: {
                  $and: [{
                    _id: {
                      $in: fileIds
                    }
                  }]
                }
              }
            }
          });
        }

        // 3. 删除文件夹
        await $w.cloud.callDataSource({
          dataSourceName: 'cloud_folders',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: item.id
                  }
                }]
              }
            }
          }
        });
        setFolders(prev => prev.filter(f => f.id !== item.id));
        setFiles(prev => prev.filter(f => f.parentId === item.id));
      } else {
        // 删除文件
        await $w.cloud.callDataSource({
          dataSourceName: 'cloud_files',
          methodName: 'wedaDeleteV2',
          params: {
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: item.id
                  }
                }]
              }
            }
          }
        });
        setFiles(prev => prev.filter(f => f.id !== item.id));
      }
      toast({
        title: '删除成功',
        description: `"${item.name}"已删除`
      });
    } catch (error) {
      console.error('删除失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleShare = async file => {
    try {
      setLoading(true);

      // 生成或获取分享 token
      let shareToken = file.shareToken || Math.random().toString(36).substring(2, 15);

      // 更新文件分享信息
      await $w.cloud.callDataSource({
        dataSourceName: 'cloud_files',
        methodName: 'wedaUpdateV2',
        params: {
          data: {
            shareToken: shareToken,
            shareEnabled: true
          },
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: file.id
                }
              }]
            }
          }
        }
      });
      const link = `${window.location.origin}/share/${shareToken}`;
      setShareLink(link);
      setShareDialogOpen(true);

      // 更新本地状态
      setFiles(prev => prev.map(f => f.id === file.id ? {
        ...f,
        shareToken,
        shareEnabled: true
      } : f));
      toast({
        title: '分享链接已生成',
        description: '您可以复制链接分享给他人'
      });
    } catch (error) {
      console.error('生成分享链接失败:', error);
      toast({
        title: '生成分享链接失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleFolderSelect = folderId => {
    setCurrentFolderId(folderId);
    if (folderId === 'root') {
      setBreadcrumb([{
        id: 'root',
        name: '我的云盘'
      }]);
    } else {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        setBreadcrumb([...breadcrumb, {
          id: folderId,
          name: folder.name
        }]);
      }
    }
  };
  const handleDoubleClick = item => {
    if (item.type === 'folder') {
      handleFolderSelect(item.id);
    } else {
      handleDownload(item);
    }
  };
  const handleLogout = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      await tcb.auth().signOut();
      await tcb.auth().signInAnonymously();
      await $w.auth.getUserInfo({
        force: true
      });
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    } catch (error) {
      toast({
        title: '退出失败',
        description: error.message,
        variant: 'destructive'
      });
    }
  };
  const currentItems = [...folders.filter(f => f.parentId === currentFolderId).map(f => ({
    ...f,
    type: 'folder'
  })), ...files.filter(f => f.parentId === currentFolderId).map(f => ({
    ...f,
    type: 'file'
  }))].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      {/* 顶部导航栏 */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Cloud className="w-8 h-8 text-[#1e3a5f]" />
            <h1 className="text-2xl font-bold text-[#1e3a5f]" style={{
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
              CloudDrive
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600" style={{
            fontFamily: 'JetBrains Mono, monospace'
          }}>
              {user?.nickName || user?.name || '用户'}
            </span>
            <Button variant="ghost" size="icon" className="hover:bg-gray-100" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-gray-600" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* 左侧边栏 */}
        <aside className="w-[30%] min-w-[280px] max-w-[400px] bg-gradient-to-b from-[#f5f5f5] to-[#e8e8e8] border-r border-gray-200 p-4 overflow-y-auto">
          <FolderTree folders={folders} currentFolderId={currentFolderId} onSelectFolder={handleFolderSelect} onNewFolder={handleNewFolder} onRefresh={loadData} className="h-full" />
        </aside>

        {/* 右侧主内容区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 工具栏 */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="text" placeholder="搜索文件..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-gray-50 border-gray-200 focus:border-[#1e3a5f]" style={{
                  fontFamily: 'JetBrains Mono, monospace'
                }} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className={viewMode === 'grid' ? 'bg-[#1e3a5f] hover:bg-[#1e3a5f]/80' : 'hover:bg-gray-100'} onClick={() => setViewMode('grid')}>
                  <Grid className="w-5 h-5" />
                </Button>
                <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className={viewMode === 'list' ? 'bg-[#1e3a5f] hover:bg-[#1e3a5f]/80' : 'hover:bg-gray-100'} onClick={() => setViewMode('list')}>
                  <List className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Breadcrumb items={breadcrumb} onSelect={handleFolderSelect} />
            </div>
          </div>

          {/* 操作按钮栏 */}
          <div className="bg-white/50 px-6 py-3 border-b border-gray-200 flex items-center gap-3">
            <Button onClick={() => fileInputRef.current?.click()} className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white" disabled={loading}>
              <Upload className="w-4 h-4 mr-2" />
              上传文件
            </Button>
            <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
            <Button onClick={() => handleNewFolder()} variant="outline" className="border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/10" disabled={loading}>
              <FolderPlus className="w-4 h-4 mr-2" />
              新建文件夹
            </Button>
          </div>

          {/* 文件列表区域 */}
          <div className="flex-1 overflow-y-auto p-6">
            <FileGrid items={currentItems} viewMode={viewMode} onDownload={handleDownload} onDelete={handleDelete} onShare={handleShare} onDoubleClick={handleDoubleClick} />
          </div>
        </main>
      </div>

      {/* 分享链接弹窗 */}
      {shareDialogOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#1e3a5f] mb-4" style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
              分享链接
            </h3>
            <div className="bg-gray-100 rounded p-3 mb-4">
              <p className="text-sm text-gray-600 break-all" style={{
            fontFamily: 'JetBrains Mono, monospace'
          }}>
                {shareLink}
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => {
            navigator.clipboard.writeText(shareLink);
            toast({
              title: '已复制',
              description: '分享链接已复制到剪贴板'
            });
          }} className="flex-1 bg-[#1e3a5f] hover:bg-[#1e3a5f]/80">
                复制链接
              </Button>
              <Button onClick={() => setShareDialogOpen(false)} variant="outline" className="flex-1 border-[#1e3a5f] text-[#1e3a5f] hover:bg-[#1e3a5f]/10">
                关闭
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}