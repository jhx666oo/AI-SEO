import { useState, useEffect, useCallback } from 'react';
import { Settings, DEFAULT_SETTINGS } from '@/types';
import { getSettings as getSettingsFromStorage, saveSettings as saveSettingsToStorage } from '@/utils/storage';

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await getSettingsFromStorage();
      setSettings(loadedSettings);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSettings = useCallback(async (newSettings: Partial<Settings>) => {
    try {
      // 先同步更新本地状态，确保输入框能立即响应
      setSettings(prev => ({ ...prev, ...newSettings }));
      // 异步保存到 localStorage
      await saveSettingsToStorage(newSettings);
      return true;
    } catch (err) {
      console.error('Failed to update settings:', err);
      return false;
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return { settings, loading, updateSettings, reloadSettings: loadSettings };
}


