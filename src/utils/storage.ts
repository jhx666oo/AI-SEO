import { Settings, DEFAULT_SETTINGS, FormatTemplate } from '@/types';

const KEYS = {
  SETTINGS: 'page_reader_settings',
  FORMAT_TEMPLATE: 'page_reader_format_template',
};

// Settings
export async function getSettings(): Promise<Settings> {
  try {
    const stored = localStorage.getItem(KEYS.SETTINGS);
    if (stored) {
      const parsed = JSON.parse(stored);
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
    return DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  localStorage.setItem(KEYS.SETTINGS, JSON.stringify(updated));
}

// Format Template
export async function getFormatTemplate(): Promise<FormatTemplate> {
  try {
    const stored = localStorage.getItem(KEYS.FORMAT_TEMPLATE);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      type: 'json',
      content: `{
  "title": "文章标题",
  "summary": "文章摘要（100-200字）",
  "keywords": ["关键词1", "关键词2", "关键词3"],
  "main_points": [
    "要点1",
    "要点2",
    "要点3"
  ],
  "category": "文章分类"
}`,
    };
  } catch {
    return { type: 'json', content: '{}' };
  }
}

export async function saveFormatTemplate(template: FormatTemplate): Promise<void> {
  localStorage.setItem(KEYS.FORMAT_TEMPLATE, JSON.stringify(template));
}


