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
    checkLoginAndRedirect();
  }, []);
  const checkLoginAndRedirect = async () => {
    try {
      console.log('检查登录状态...');
      const tcb = await $w.cloud.getCloudInstance();
      const authResult = await tcb.auth().getCurrentUser();
      console.log('登录状态:', authResult);

      // 如果已经登录，跳转到云盘页面
      if (authResult && !authResult.isAnonymous) {
        console.log('用户已登录，跳转到云盘页面');
        $w.utils.navigateTo({
          pageId: 'drive',
          params: {}
        });
        return;
      }

      // 未登录，跳转到托管登录页
      console.log('用户未登录，跳转到托管登录页');
      handleLogin();
    } catch (error) {
      console.error('检查登录状态失败:', error);
      // 出错时也跳转到登录页
      handleLogin();
    }
  };
  const handleLogin = async () => {
    try {
      const tcb = await $w.cloud.getCloudInstance();
      console.log('准备跳转到登录页面...');

      // 构建登录后的返回URL
      const baseUrl = $w.utils.resolveStaticResourceUrl('/');
      const s_domain = baseUrl.replace(/^https?:\/\//, '').split('/')[0];
      const redirectUrl = `${baseUrl}?pageId=drive`;
      console.log('登录配置:', {
        baseUrl,
        s_domain,
        redirectUrl
      });

      // 跳转到托管登录页
      tcb.auth().toDefaultLoginPage({
        config_version: 'env',
        redirect_uri: redirectUrl,
        query: {
          s_domain: s_domain
        }
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
          重新登录
        </Button>
        <p className="mt-6 text-white/50 text-sm" style={{
        fontFamily: 'JetBrains Mono, monospace'
      }}>
          正在自动跳转中...
        </p>
      </div>
    </div>;
}