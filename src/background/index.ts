// Service Worker - Background Script
import { Settings, ChromeMessage } from '@/types';
import { getSettings, saveSettings } from '@/utils/storage';

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Page Reader extension installed');
});

chrome.runtime.onMessage.addListener((message: ChromeMessage, _sender, sendResponse) => {
  (async () => {
    try {
      const result = await handleMessage(message);
      sendResponse(result);
    } catch (error) {
      sendResponse({ success: false, error: String(error) });
    }
  })();
  return true;
});

async function handleMessage(message: ChromeMessage): Promise<unknown> {
    switch (message.type) {
    case 'GET_SETTINGS': {
        const settings = await getSettings();
      return { success: true, data: settings };
    }

    case 'SAVE_SETTINGS': {
        await saveSettings(message.payload as Partial<Settings>);
      return { success: true };
        }

      case 'GET_PAGE_CONTENT':
    case 'GET_SELECTED_TEXT': {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs[0]?.id) {
        return { success: false, error: 'No active tab' };
        }
      
      const tabUrl = tabs[0].url || '';
      if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('chrome-extension://')) {
        return { success: false, error: 'Cannot read browser internal pages' };
      }
      
      try {
        const response = await chrome.tabs.sendMessage(tabs[0].id, { type: message.type });
        return { success: true, data: response };
      } catch {
        return { success: false, error: 'Please refresh the page and try again' };
      }
    }

    case 'VIDEO_REQUEST': {
      // Handle video generation requests (e.g., Google Veo) to avoid CORS issues
      const payload = message.payload as {
        url: string;
        method: string;
        headers: Record<string, string>;
        body: string;
      };

      console.log('[Background] Video request received:', payload.url);

      try {
        const response = await fetch(payload.url, {
          method: payload.method || 'POST',
          headers: payload.headers || {},
          body: payload.body || undefined,
        });

        const responseText = await response.text();
        
        return {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
        };
      } catch (error) {
        console.error('[Background] Video request error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    case 'GENERATE_VIDEO_VEO': {
      // Handle Google Veo video generation requests to avoid CORS issues
      const payload = message.payload as {
        apiUrl: string;
        requestBody: any;
        headers: Record<string, string>;
      };

      console.log('[Background] GENERATE_VIDEO_VEO request received:', payload.apiUrl);
      console.log('[Background] Request body:', JSON.stringify(payload.requestBody, null, 2));

      try {
        const response = await fetch(payload.apiUrl, {
          method: 'POST',
          headers: payload.headers || {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload.requestBody),
        });

        const responseText = await response.text();
        
        console.log('[Background] Veo API response status:', response.status);
        console.log('[Background] Veo API response body:', responseText.substring(0, 500));

        return {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          headers: Object.fromEntries(response.headers.entries()),
          body: responseText,
        };
      } catch (error) {
        console.error('[Background] GENERATE_VIDEO_VEO error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        };
      }
    }

    default:
      return { success: false, error: 'Unknown message type' };
    }
  }

console.log('[Background] Page Reader started');
