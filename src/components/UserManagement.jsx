// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button, Input, useToast } from '@/components/ui';

export function UserManagement({
  currentUser,
  onRefresh
}) {
  const {
    toast
  } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });

  // 加载用户列表
  const loadUsers = () => {
    try {
      const usersStr = localStorage.getItem('zhl_users');
      if (usersStr) {
        setUsers(JSON.parse(usersStr));
      }
    } catch (error) {
      console.error('加载用户列表失败:', error);
    }
  };
  useEffect(() => {
    loadUsers();
  }, []);

  // 添加用户
  const handleAddUser = e => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: '请填写完整信息',
        variant: 'destructive'
      });
      return;
    }

    // 检查用户名是否已存在
    if (users.some(u => u.username === formData.username)) {
      toast({
        title: '用户名已存在',
        variant: 'destructive'
      });
      return;
    }
    const newUser = {
      id: `user_${Date.now()}`,
      username: formData.username,
      password: formData.password,
      role: 'user',
      theme: 'dark',
      createdAt: Date.now()
    };
    const updatedUsers = [...users, newUser];
    localStorage.setItem('zhl_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setFormData({
      username: '',
      password: ''
    });
    setShowForm(false);
    toast({
      title: '添加成功',
      description: `用户 ${formData.username} 已创建`
    });
  };

  // 编辑用户
  const handleEditUser = user => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      password: user.password
    });
    setShowForm(true);
  };

  // 更新用户
  const handleUpdateUser = e => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      toast({
        title: '请填写完整信息',
        variant: 'destructive'
      });
      return;
    }

    // 检查用户名是否被其他用户占用
    if (users.some(u => u.username === formData.username && u.id !== editingUser.id)) {
      toast({
        title: '用户名已存在',
        variant: 'destructive'
      });
      return;
    }
    const updatedUsers = users.map(u => u.id === editingUser.id ? {
      ...u,
      username: formData.username,
      password: formData.password
    } : u);
    localStorage.setItem('zhl_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    setFormData({
      username: '',
      password: ''
    });
    setEditingUser(null);
    setShowForm(false);
    toast({
      title: '更新成功',
      description: `用户 ${formData.username} 已更新`
    });
  };

  // 删除用户
  const handleDeleteUser = userId => {
    const userToDelete = users.find(u => u.id === userId);
    if (!userToDelete) return;

    // 不能删除 admin 账户
    if (userToDelete.username === 'admin') {
      toast({
        title: '无法删除',
        description: '不能删除 admin 账户',
        variant: 'destructive'
      });
      return;
    }
    if (!confirm(`确定要删除用户 ${userToDelete.username} 吗？`)) {
      return;
    }
    const updatedUsers = users.filter(u => u.id !== userId);
    localStorage.setItem('zhl_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    toast({
      title: '删除成功',
      description: `用户 ${userToDelete.username} 已删除`
    });
  };
  const formatDate = timestamp => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  return <div className="space-y-6">
      {/* 添加用户按钮 */}
      {!showForm && <div className="flex justify-end">
          <Button onClick={() => setShowForm(true)} className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white">
            + 添加用户
          </Button>
        </div>}
      
      {/* 添加/编辑表单 */}
      {showForm && <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm transition-colors">
          <h3 className="text-lg font-bold mb-4 dark:text-white">
            {editingUser ? '编辑用户' : '添加用户'}
          </h3>
          <form onSubmit={editingUser ? handleUpdateUser : handleAddUser} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">用户名</label>
              <Input type="text" value={formData.username} onChange={e => setFormData({
            ...formData,
            username: e.target.value
          })} placeholder="请输入用户名" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">密码</label>
              <Input type="password" value={formData.password} onChange={e => setFormData({
            ...formData,
            password: e.target.value
          })} placeholder="请输入密码" className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
            <div className="flex gap-3">
              <Button type="submit" className="flex-1 bg-[#ff6b35] hover:bg-[#e55a2a] text-white">
                {editingUser ? '更新' : '添加'}
              </Button>
              <Button type="button" variant="outline" onClick={() => {
            setShowForm(false);
            setEditingUser(null);
            setFormData({
              username: '',
              password: ''
            });
          }} className="flex-1 dark:border-gray-600 dark:text-gray-300">
                取消
              </Button>
            </div>
          </form>
        </div>}
      
      {/* 用户列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden transition-colors">
          <div className="grid grid-cols-5 gap-4 p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 font-medium text-sm dark:text-gray-300">
            <div>用户名</div>
            <div>角色</div>
            <div>主题</div>
            <div>创建时间</div>
            <div>操作</div>
          </div>
          
          {users.length === 0 ? <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              暂无用户
            </div> : users.map(user => <div key={user.id} className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 dark:border-gray-700 items-center dark:text-gray-300">
                <div className="flex items-center gap-2">
                  {user.username === 'admin' && <span className="bg-[#ff6b35] text-white text-xs px-2 py-0.5 rounded">Admin</span>}
                  {user.username}
                </div>
                <div className="capitalize">{user.role === 'admin' ? '管理员' : '普通用户'}</div>
                <div className="capitalize">{user.theme === 'dark' ? '暗色' : '亮色'}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{formatDate(user.createdAt)}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleEditUser(user)} className="dark:border-gray-600 dark:text-gray-300">
                    编辑
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)} className="dark:border-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20">
                    删除
                  </Button>
                </div>
              </div>)}
        </div>
    </div>;
}