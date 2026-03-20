// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, useToast, Label } from '@/components/ui';
// @ts-ignore;
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';

export function UserManagement({
  currentUser,
  onRefresh
}) {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const loadUsers = async () => {
    try {
      setLoading(true);
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'zhl_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {},
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
      console.error('加载用户列表失败:', error);
      toast({
        title: '加载失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);
  const handleAddUser = async e => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: '请填写完整信息',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);
      await $w.cloud.callDataSource({
        dataSourceName: 'zhl_users',
        methodName: 'wedaCreateV2',
        params: {
          data: {
            username: formData.username,
            password: formData.password,
            theme: 'dark',
            createdAt: Date.now(),
            updatedAt: Date.now()
          }
        }
      });
      toast({
        title: '创建成功',
        description: `用户 ${formData.username} 已创建`
      });
      setFormData({
        username: '',
        password: ''
      });
      setShowForm(false);
      loadUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('创建用户失败:', error);
      toast({
        title: '创建失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleEditUser = user => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: ''
    });
    setShowForm(true);
  };
  const handleUpdateUser = async e => {
    e.preventDefault();
    if (!formData.username) {
      toast({
        title: '用户名不能为空',
        variant: 'destructive'
      });
      return;
    }
    try {
      setLoading(true);
      const updateData = {
        username: formData.username,
        updatedAt: Date.now()
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await $w.cloud.callDataSource({
        dataSourceName: 'zhl_users',
        methodName: 'wedaUpdateV2',
        params: {
          data: updateData,
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
        description: `用户 ${formData.username} 已更新`
      });
      setEditingUser(null);
      setFormData({
        username: '',
        password: ''
      });
      setShowForm(false);
      loadUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('更新用户失败:', error);
      toast({
        title: '更新失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteUser = async user => {
    if (user.username === 'admin') {
      toast({
        title: '无法删除',
        description: '管理员账户不能删除',
        variant: 'destructive'
      });
      return;
    }
    if (!confirm(`确定要删除用户 ${user.username} 吗？`)) {
      return;
    }
    try {
      setLoading(true);
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
        description: `用户 ${user.username} 已删除`
      });
      loadUsers();
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('删除用户失败:', error);
      toast({
        title: '删除失败',
        description: error.message || '请稍后重试',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setFormData({
      username: '',
      password: ''
    });
  };
  return <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white" style={{
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
          用户管理
        </h2>
        <Button onClick={() => setShowForm(true)} className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white">
          <Plus className="w-4 h-4 mr-2" />
          添加用户
        </Button>
      </div>
      
      {showForm && <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            {editingUser ? '编辑用户' : '添加新用户'}
          </h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            <div>
              <Label htmlFor="username">用户名</Label>
              <Input id="username" value={formData.username} onChange={e => setFormData({
            ...formData,
            username: e.target.value
          })} className="mt-1" disabled={loading} />
            </div>
            <div>
              <Label htmlFor="password">密码 {editingUser && '(留空不修改)'}</Label>
              <Input id="password" type="password" value={formData.password} onChange={e => setFormData({
            ...formData,
            password: e.target.value
          })} className="mt-1" disabled={loading} placeholder={editingUser ? '留空则不修改密码' : ''} />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white" disabled={loading}>
                {loading ? '处理中...' : editingUser ? '更新' : '创建'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancelForm} disabled={loading}>
                取消
              </Button>
            </div>
          </form>
        </div>}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors">
        {loading && users.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            加载中...
          </div> : users.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            暂无用户
          </div> : <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  用户名
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  主题
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  创建时间
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map(user => <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.username}
                    {user.username === 'admin' && <span className="ml-2 px-2 py-1 text-xs font-medium text-blue-600 bg-blue-100 rounded">
                        管理员
                      </span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.theme === 'dark' ? '深色' : '浅色'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleString('zh-CN')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEditUser(user)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user)} className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" disabled={user.username === 'admin'}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>}
      </div>
    </div>;
}