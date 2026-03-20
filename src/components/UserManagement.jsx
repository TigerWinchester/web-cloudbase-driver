// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { User as UserIcon, Plus, Edit2, Trash2, Shield } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

export function UserManagement({
  currentUser,
  onRefresh
}) {
  const {
    toast
  } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'user'
  });
  const {
    $w
  } = window;
  useEffect(() => {
    loadUsers();
  }, []);
  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'zhl_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {}
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 100,
          pageNumber: 1
        }
      });
      if (result && result.records) {
        setUsers(result.records);
      }
    } catch (error) {
      console.error('加载用户失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '无法加载用户列表',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      role: 'user'
    });
    setIsDialogOpen(true);
  };
  const handleEditUser = user => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password,
      role: user.role
    });
    setIsDialogOpen(true);
  };
  const handleDeleteUser = async user => {
    if (user.username === 'admin') {
      toast({
        title: '无法删除',
        description: '管理员账户不能被删除',
        variant: 'destructive'
      });
      return;
    }
    if (!confirm(`确定要删除用户 "${user.username}" 吗？`)) {
      return;
    }
    try {
      await $w.cloud.callDataSource({
        dataSourceName: 'zhl_users',
        methodName: 'wedaDeleteV2',
        params: {
          filter: {
            where: {
              $and: [{
                _id: {
                  $eq: user._id
                }
              }]
            }
          }
        }
      });
      toast({
        title: '删除成功',
        description: `用户 "${user.username}" 已删除`
      });
      loadUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('删除用户失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '无法删除用户',
        variant: 'destructive'
      });
    }
  };
  const handleSaveUser = async () => {
    if (!formData.username || !formData.password) {
      toast({
        title: '填写不完整',
        description: '请填写用户名和密码',
        variant: 'destructive'
      });
      return;
    }
    try {
      if (editingUser) {
        await $w.cloud.callDataSource({
          dataSourceName: 'zhl_users',
          methodName: 'wedaUpdateV2',
          params: {
            data: {
              username: formData.username,
              password: formData.password,
              role: formData.role
            },
            filter: {
              where: {
                $and: [{
                  _id: {
                    $eq: editingUser._id
                  }
                }]
              }
            }
          }
        });
        toast({
          title: '更新成功',
          description: `用户 "${formData.username}" 已更新`
        });
      } else {
        const result = await $w.cloud.callDataSource({
          dataSourceName: 'zhl_users',
          methodName: 'wedaCreateV2',
          params: {
            data: {
              username: formData.username,
              password: formData.password,
              role: formData.role,
              theme: 'dark'
            }
          }
        });
        toast({
          title: '创建成功',
          description: `用户 "${formData.username}" 已创建`
        });
      }
      setIsDialogOpen(false);
      loadUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('保存用户失败:', error);
      toast({
        title: '保存失败',
        description: error.message || '无法保存用户',
        variant: 'destructive'
      });
    }
  };
  return <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100" style={{
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
          用户管理
        </h2>
        <Button onClick={handleAddUser} className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white" style={{
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>
      
      {loading ? <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6b35] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">加载中...</p>
        </div> : <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                  用户名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                  密码
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                  角色
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                  主题
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === 'admin' ? 'bg-[#ff6b35]' : 'bg-gray-200 dark:bg-gray-700'}`}>
                        {user.role === 'admin' ? <Shield className="w-5 h-5 text-white" /> : <UserIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100" style={{
                    fontFamily: 'Space Grotesk, sans-serif'
                  }}>
                          {user.username}
                        </div>
                        {user.role === 'admin' && <div className="text-xs text-[#ff6b35]">管理员</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" style={{
              fontFamily: 'JetBrains Mono, monospace'
            }}>
                    {user.password}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-[#ff6b35]/10 text-[#ff6b35]' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'}`}>
                      {user.role === 'admin' ? '管理员' : '普通用户'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.theme === 'dark' ? '暗色' : '亮色'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleEditUser(user)} className="text-[#1e3a5f] dark:text-blue-400 hover:text-[#ff6b35] mr-4" disabled={user.username === 'admin'} title={user.username === 'admin' ? '不能编辑管理员' : '编辑'}>
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteUser(user)} className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" disabled={user.username === 'admin'} title={user.username === 'admin' ? '不能删除管理员' : '删除'}>
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}
      
      {isDialogOpen && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl transition-colors">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4" style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
              {editingUser ? '编辑用户' : '添加用户'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">用户名</label>
                <input type="text" value={formData.username} onChange={e => setFormData({
              ...formData,
              username: e.target.value
            })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35] dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">密码</label>
                <input type="text" value={formData.password} onChange={e => setFormData({
              ...formData,
              password: e.target.value
            })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35] dark:bg-gray-800 dark:text-gray-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">角色</label>
                <select value={formData.role} onChange={e => setFormData({
              ...formData,
              role: e.target.value
            })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff6b35] dark:bg-gray-800 dark:text-gray-100">
                  <option value="user">普通用户</option>
                  <option value="admin">管理员</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleSaveUser} className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2a] text-white">
                {editingUser ? '更新' : '创建'}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)} variant="outline" className="flex-1 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                取消
              </Button>
            </div>
          </div>
        </div>}
    </div>;
}