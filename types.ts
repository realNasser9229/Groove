export type BrowserView = 'home' | 'web' | 'settings' | 'privacy' | 'inspect' | 'error' | 'downloads' | 'reading-list' | 'history' | 'bookmarks';

export interface Tab {
  id: string;
  url: string;
  title: string;
  view: BrowserView;
  history: string[];
  historyIndex: number;
}

export type ThemeType = 'deep-sea' | 'midnight' | 'sunset' | 'cyberpunk' | 'nordic';

export interface BrowserSettings {
  adBlock: boolean;
  antiTracker: boolean;
  jsEnabled: boolean;
  thirdPartyBlock: boolean;
  blockAutoplay: boolean;
  blockPopups: boolean;
  httpsEnforce: boolean;
  ephemeral: boolean;
  desktopMode: boolean;
  theme: ThemeType;
}

export interface HistoryItem {
  url: string;
  title: string;
  timestamp: number;
}

export interface PrivacyCounters {
  ads: number;
  trackers: number;
  scripts: number;
  ramOptimized: number; // In MB
}

export interface DownloadItem {
  id: string;
  name: string;
  url: string;
  status: 'completed' | 'downloading' | 'failed';
  size: string;
  timestamp: number;
}

export interface ReadingListItem {
  id: string;
  url: string;
  title: string;
  timestamp: number;
}

export interface Bookmark {
  url: string;
  title: string;
  added: number;
}
