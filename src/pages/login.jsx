// @ts-ignore;
import React, { useEffect } from 'react';
// @ts-ignore;
import { Lock } from 'lucide-react';
// @ts-ignore;
import { Button, useToast } from '@/components/ui';

export default function Login({
  $w,
  className = ''
}) {
  const {
    toast
  } = useToast();
  useEffect(() => {
    // 自动跳转到托管登录页
    handleLogin();
  }, []);
  const handleLogin = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      console.log('准备跳转到登录页面...');
      console.log('当前域名:', window.location.origin);

      // 跳转到托管登录页
      tcb.auth().toDefaultLoginPage({
        redirect_uri: window.location.href
      });
    } catch (error) {
      console.error('登录跳转失败:', error);
      console.error('错误详情:', {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      toast({
        title: '登录跳转失败',
        description: `错误: ${error.message || '请检查云开发登录配置'}`,
        variant: 'destructive'
      });
    }
  };
  return <div className={`min-h-screen bg-gradient-to-br from-[#1e3a5f] to-[#2d5a7b] flex items-center justify-center ${className}`}>
      <div className="text-center">
        <div className="mb-8">
          <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
            <Lock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3" style={{
          fontFamily: 'Space Grotesk, sans-serif'
        }}>
            CloudDrive
          </h1>
          <p className="text-white/70" style={{
          fontFamily: 'JetBrains Mono, monospace'
        }}>
            安全 · 高效 · 可靠的云存储服务
          </p>
        </div>
        <Button onClick={handleLogin} className="bg-[#ff6b35] hover:bg-[#e55a2a] text-white px-8 py-3 rounded-lg font-medium transition-all duration-200" style={{
        fontFamily: 'Space Grotesk, sans-serif'
      }}>
          跳转到登录页面
        </Button>
        <p className="mt-6 text-white/50 text-sm" style={{
        fontFamily: 'JetBrains Mono, monospace'
      }}>
          正在自动跳转中...
        </p>
      </div>
    </div>;
}