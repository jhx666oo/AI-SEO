import { useState, useCallback } from 'react';
import { PageContent } from '@/types';

export function usePageContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPageContentByUrl = useCallback(async (_url: string): Promise<PageContent | null> => {
    setLoading(true);
    setError(null);

    try {
      // TODO: 通过后端代理接口获取网页内容
      // 示例接口调用（需要根据实际后端 API 调整）:
      // const response = await fetch('/api/proxy/fetch-page', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ url }),
      // });
      // if (!response.ok) {
      //   throw new Error(`HTTP error! status: ${response.status}`);
      // }
      // const data = await response.json();
      // return data as PageContent;

      // 临时占位实现：返回 null，等待后端接口对接
      setError('Web 版受限于跨域限制，建议使用公司货盘模式，或安装 CORS 解锁插件进行测试');
      return null;
    } catch (err) {
      // 捕获 CORS 或其他网络错误
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage.includes('CORS') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        setError('Web 版受限于跨域限制，建议使用公司货盘模式，或安装 CORS 解锁插件进行测试');
      } else {
        setError(errorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPageContent = useCallback(async (): Promise<PageContent | null> => {
    // 在 Web 环境下，不再支持直接读取当前页面
    // 请使用 getPageContentByUrl 方法，传入 URL
    setError('Please use getPageContentByUrl with a URL parameter in web environment');
    return null;
  }, []);

  const getSelectedText = useCallback(async (): Promise<string | null> => {
    // 在 Web 环境下，不再支持获取选中文本
    return null;
  }, []);

  return { loading, error, getPageContent, getPageContentByUrl, getSelectedText };
}
