// @ts-ignore;
import React, { useEffect, useState } from 'react';
// @ts-ignore;
import { Lock, User, Eye, EyeOff } from 'lucide-react';
// @ts-ignore;
import { Button, Input, useToast, Label } from '@/components/ui';

export default function Login({
  $w,
  className = ''
}) {
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    checkLoginAndRedirect();
    document.title = '纸老虎网盘 - 登录';
  }, []);
  const checkLoginAndRedirect = async () => {
    try {
      const currentUserStr = localStorage.getItem('currentUser');
      if (currentUserStr) {
        const currentUser = JSON.parse(currentUserStr);
        console.log('已登录用户:', currentUser);
        $w.utils.navigateTo({
          pageId: 'drive',
          params: {}
        });
      }
    } catch (error) {
      console.log('检查登录状态失败:', error);
    }
  };
  const handleLogin = async e => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: '请输入用户名和密码',
        variant: 'destructive'
      });
      return;
    }
    setLoading(true);
    try {
      const result = await $w.cloud.callDataSource({
        dataSourceName: 'zhl_users',
        methodName: 'wedaGetRecordsV2',
        params: {
          filter: {
            where: {
              $and: [{
                username: {
                  $eq: username
                }
              }]
            }
          },
          select: {
            $master: true
          },
          getCount: true,
          pageSize: 1,
          pageNumber: 1
        }
      });
      if (!result || !result.records || result.records.length === 0) {
        toast({
          title: '登录失败',
          description: '用户名或密码错误',
          variant: 'destructive'
        });
        return;
      }
      const user = result.records[0];
      if (user.password !== password) {
        toast({
          title: '登录失败',
          description: '用户名或密码错误',
          variant: 'destructive'
        });
        return;
      }
      const userData = {
        id: user._id,
        username: user.username,
        name: user.username,
        theme: user.theme || 'dark'
      };
      localStorage.setItem('currentUser', JSON.stringify(userData));
      toast({
        title: '登录成功',
        description: '正在跳转到云盘...'
      });
      setTimeout(() => {
        $w.utils.navigateTo({
          pageId: 'drive',
          params: {}
        });
      }, 500);
    } catch (error) {
      console.error('登录失败:', error);
      toast({
        title: '登录失败',
        description: error.message || '登录过程中出现错误',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return <div className={`min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d5a7b] dark:from-gray-900 dark:to-gray-950 flex items-center justify-center transition-colors ${className}`}>
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3" style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
            纸老虎网盘
          </h1>
          <p className="text-white/70" style={{
          fontFamily: 'JetBrains Mono, monospace'
        }}>
            安全 · 高效 · 可靠的云存储服务
          </p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-white">用户名</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input id="username" type="text" placeholder="请输入用户名" value={username} onChange={e => setUsername(e.target.value)} className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20" disabled={loading} />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="请输入密码" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20" disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-[#ff6b35] hover:bg-[#e55a2a] text-white py-3 rounded-lg font-medium transition-all duration-200" style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </Button>
        </form>
        
        <p className="mt-6 text-white/50 text-sm text-center" style={{
        fontFamily: 'JetBrains Mono, monospace'
      }}>
          首次使用请联系管理员获取账号
        </p>
      </div>
    </div>;
}