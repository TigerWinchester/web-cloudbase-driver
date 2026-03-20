// @ts-ignore;
import React, { useState, useEffect, useRef } from 'react';
// @ts-ignore;
import { Search, Grid, List, Upload, FolderPlus, Menu, Share2, LogOut, Cloud } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

import { FolderTree } from '@/components/FolderTree';
import { FileGrid } from '@/components/FileGrid';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { UserManagement } from '@/components/UserManagement';
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
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [activeTab, setActiveTab] = useState('files');
  const [breadcrumb, setBreadcrumb] = useState([{
    id: 'root',
    name: '我的云盘'
  }]);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [userOpenId, setUserOpenId] = useState('');
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

      // 更新文件夹列表
      if (foldersResult && foldersResult.records) {
        setFolders(foldersResult.records);
      }

      // 更新文件列表
      if (filesResult && filesResult.records) {
        setFiles(filesResult.records);
      }
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
  const checkLogin = async () => {
    try {
      setCheckingAuth(true);

      // 从 localStorage 获取当前用户
      const currentUserStr = localStorage.getItem('currentUser');
      if (!currentUserStr) {
        console.log('未找到用户信息，跳转到登录页');
        $w.utils.navigateTo({
          pageId: 'login',
          params: {}
        });
        return;
      }
      const currentUser = JSON.parse(currentUserStr);
      console.log('当前用户:', currentUser);
      setUser(currentUser);
      setUserOpenId(currentUser.id || currentUser._id || '');

      // 如果当前用户是 admin，默认显示文件管理标签
      if (currentUser.username === 'admin') {
        setActiveTab('files');
      }
    } catch (error) {
      console.error('检查登录状态失败:', error);
      $w.utils.navigateTo({
        pageId: 'login',
        params: {}
      });
    } finally {
      setCheckingAuth(false);
    }
  };

  // 初始化主题
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  useEffect(() => {
    checkLogin();
    document.title = '纸老虎网盘';
  }, []);
  useEffect(() => {
    if (userOpenId) {
      loadData();
    }
  }, [userOpenId]);

  // 如果正在检查登录状态，显示加载提示
  if (checkingAuth) {
    return <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">正在检查登录状态...</p>
        </div>
      </div>;
  }
  const handleThemeChange = async newTheme => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // 如果用户已登录，更新 localStorage 中的用户信息
    if (user && user.id) {
      try {
        // 从 localStorage 读取用户列表
        const usersStr = localStorage.getItem('zhl_users');
        if (usersStr) {
          const users = JSON.parse(usersStr);
          const updatedUsers = users.map(u => u.id === user.id ? {
            ...u,
            theme: newTheme
          } : u);
          localStorage.setItem('zhl_users', JSON.stringify(updatedUsers));

          // 更新当前用户信息
          const updatedUser = {
            ...user,
            theme: newTheme
          };
          localStorage.setItem('currentUser', JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      } catch (error) {
        console.error('更新用户主题失败:', error);
      }
    }
  };
  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    $w.utils.navigateTo({
      pageId: 'login',
      params: {}
    });
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
  const currentItems = [...folders.filter(f => f.parentId === currentFolderId).map(f => ({
    ...f,
    type: 'folder'
  })), ...files.filter(f => f.parentId === currentFolderId).map(f => ({
    ...f,
    type: 'file'
  }))].filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()));
  return <div className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ${className}`}>
      {/* 顶部导航栏 */}
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Cloud className="w-8 h-8 text-[#1e3a5f] dark:text-blue-400" />
            <h1 className="text-2xl font-bold text-[#1e3a5f] dark:text-blue-400" style={{
            fontFamily: 'Space Grotesk, sans-serif'
          }}>
              纸老虎网盘
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 dark:text-gray-300" style={{
            fontFamily: 'JetBrains Mono, monospace'
          }}>
              {user?.username || user?.name || '用户'}
            </span>
            <ThemeSwitcher theme={theme} onThemeChange={handleThemeChange} />
            <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800" onClick={handleLogout}>
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </Button>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <div className="flex h-[calc(100vh-73px)]">
        {/* 左侧边栏 */}
        <aside className="w-[30%] min-w-[280px] max-w-[400px] bg-gradient-to-b from-[#f5f5f5] to-[#e8e8e8] dark:from-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-800 p-4 overflow-y-auto transition-colors">
          <FolderTree folders={folders} currentFolderId={currentFolderId} onSelectFolder={handleFolderSelect} onNewFolder={handleNewFolder} onRefresh={loadData} className="h-full" />
        </aside>

        {/* 右侧主内容区 */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* 标签页 - 只有 admin 显示用户管理 */}
          {user && user.username === 'admin' ? <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <TabsList className="bg-gray-100 dark:bg-gray-800">
                    <TabsTrigger value="files" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                      文件管理
                    </TabsTrigger>
                    <TabsTrigger value="users" className="data-[state=active]:bg-[#ff6b35] data-[state=active]:text-white">
                      用户管理
                    </TabsTrigger>
                  </TabsList>
                  
                  {activeTab === 'files' && <div className="flex-1 flex items-center gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <Input type="text" placeholder="搜索文件..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-[#1e3a5f] dark:focus:border-blue-400 text-gray-900 dark:text-gray-100" style={{
                    fontFamily: 'JetBrains Mono, monospace'
                  }} />
                      </div>
                    </div>}
                </div>
                
                {activeTab === 'files' && <div className="flex items-center gap-2 mt-4">
                    <Breadcrumb items={breadcrumb} onSelect={handleFolderSelect} />
                  </div>}
              </div>
              
              <TabsContent value="files" className="flex-1 flex flex-col overflow-hidden m-0">
                {/* 文件管理视图 */}
                <div className="flex flex-col h-full">
                  <div className="bg-white/50 dark:bg-gray-800/50 px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 transition-colors">
                    <Button onClick={() => fileInputRef.current?.click()} className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white" disabled={loading}>
                      <Upload className="w-4 h-4 mr-2" />
                      上传文件
                    </Button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
                    <Button onClick={() => handleNewFolder()} variant="outline" className="border-[#1e3a5f] dark:border-blue-400 text-[#1e3a5f] dark:text-blue-400 hover:bg-[#1e3a5f]/10 dark:hover:bg-blue-400/10" disabled={loading}>
                      <FolderPlus className="w-4 h-4 mr-2" />
                      新建文件夹
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900 transition-colors">
                    <FileGrid items={currentItems} viewMode={viewMode} onDownload={handleDownload} onDelete={handleDelete} onShare={handleShare} onDoubleClick={handleDoubleClick} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="users" className="flex-1 overflow-auto m-0">
                <UserManagement currentUser={user} onRefresh={() => {}} />
              </TabsContent>
            </Tabs> : <div className="flex flex-col h-full">
            {/* 非管理员，只显示文件管理 */}
              {/* 工具栏 */}
              <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 flex items-center gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                      <Input type="text" placeholder="搜索文件..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:border-[#1e3a5f] dark:focus:border-blue-400 text-gray-900 dark:text-gray-100" style={{
                    fontFamily: 'JetBrains Mono, monospace'
                  }} />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="icon" className={viewMode === 'grid' ? 'bg-[#1e3a5f] hover:bg-[#1e3a5f]/80' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} onClick={() => setViewMode('grid')}>
                      <Grid className="w-5 h-5" />
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="icon" className={viewMode === 'list' ? 'bg-[#1e3a5f] hover:bg-[#1e3a5f]/80' : 'hover:bg-gray-100 dark:hover:bg-gray-800'} onClick={() => setViewMode('list')}>
                      <List className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Breadcrumb items={breadcrumb} onSelect={handleFolderSelect} />
                </div>
              </div>

              {/* 操作按钮栏 */}
              <div className="bg-white/50 dark:bg-gray-800/50 px-6 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center gap-3 transition-colors">
                <Button onClick={() => fileInputRef.current?.click()} className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white" disabled={loading}>
                  <Upload className="w-4 h-4 mr-2" />
                  上传文件
                </Button>
                <input ref={fileInputRef} type="file" className="hidden" onChange={handleUpload} />
                <Button onClick={() => handleNewFolder()} variant="outline" className="border-[#1e3a5f] dark:border-blue-400 text-[#1e3a5f] dark:text-blue-400 hover:bg-[#1e3a5f]/10 dark:hover:bg-blue-400/10" disabled={loading}>
                  <FolderPlus className="w-4 h-4 mr-2" />
                  新建文件夹
                </Button>
              </div>

              {/* 文件列表区域 */}
              <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-900 transition-colors">
                <FileGrid items={currentItems} viewMode={viewMode} onDownload={handleDownload} onDelete={handleDelete} onShare={handleShare} onDoubleClick={handleDoubleClick} />
              </div>
            </div>}
        </main>
      </div>

      {/* 分享链接弹窗 */}
      {shareDialogOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transition-colors">
            <h3 className="text-lg font-bold text-[#1e3a5f] dark:text-blue-400 mb-4" style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
              分享链接
            </h3>
            <div className="bg-gray-100 dark:bg-gray-800 rounded p-3 mb-4">
              <p className="text-sm text-gray-600 dark:text-gray-300 break-all" style={{
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
          }} className="flex-1 bg-[#1e3a5f] dark:bg-blue-600 hover:bg-[#1e3a5f]/80 dark:hover:bg-blue-500">
                复制链接
              </Button>
              <Button onClick={() => setShareDialogOpen(false)} variant="outline" className="flex-1 border-[#1e3a5f] dark:border-blue-400 text-[#1e3a5f] dark:text-blue-400 hover:bg-[#1e3a5f]/10 dark:hover:bg-blue-400/10">
                关闭
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}