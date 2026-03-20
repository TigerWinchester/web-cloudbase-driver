// @ts-ignore;
import React from 'react';
// @ts-ignore;
import { Sun, Moon } from 'lucide-react';
// @ts-ignore;
import { Button } from '@/components/ui';

export function ThemeSwitcher({
  theme,
  onThemeChange
}) {
  const isDark = theme === 'dark';
  return <Button variant="ghost" size="icon" className="hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200" onClick={() => onThemeChange(isDark ? 'light' : 'dark')} title={isDark ? '切换到亮色主题' : '切换到暗色主题'}>
      {isDark ? <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" /> : <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />}
    </Button>;
}
export default ThemeSwitcher;