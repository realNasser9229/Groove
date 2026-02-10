import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  Search, 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  Layers, 
  MoreVertical, 
  X, 
  Plus, 
  RefreshCw, 
  Settings, 
  Lock, 
  ShieldCheck, 
  Eye, 
  Globe, 
  Star, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  ExternalLink, 
  Flame, 
  Zap, 
  Monitor, 
  Menu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from './utils/cn';
import { 
  Download, 
  Cpu, 
  Palette, 
  BookOpen, 
  FileText 
} from 'lucide-react';
import type { Tab, BrowserSettings, BrowserView, PrivacyCounters, Bookmark, HistoryItem, ThemeType, DownloadItem, ReadingListItem } from './types';

const DEFAULT_SETTINGS: BrowserSettings = {
  adBlock: true,
  antiTracker: true,
  jsEnabled: true,
  thirdPartyBlock: true,
  blockAutoplay: true,
  blockPopups: true,
  httpsEnforce: true,
  ephemeral: false,
  desktopMode: false,
  theme: 'deep-sea'
};

const THEMES: Record<ThemeType, { name: string, colors: Record<string, string> }> = {
  'deep-sea': {
    name: 'Deep Sea',
    colors: {
      '--color-bg': '#0a0a0f',
      '--color-bg2': '#12121a',
      '--color-accent': '#6c5ce7',
      '--color-accent2': '#a29bfe'
    }
  },
  'midnight': {
    name: 'Midnight',
    colors: {
      '--color-bg': '#000000',
      '--color-bg2': '#0a0a0a',
      '--color-accent': '#3b82f6',
      '--color-accent2': '#60a5fa'
    }
  },
  'sunset': {
    name: 'Sunset',
    colors: {
      '--color-bg': '#0f050a',
      '--color-bg2': '#1a0d14',
      '--color-accent': '#ff4757',
      '--color-accent2': '#ff6b81'
    }
  },
  'cyberpunk': {
    name: 'Cyberpunk',
    colors: {
      '--color-bg': '#0b001a',
      '--color-bg2': '#15002b',
      '--color-accent': '#00ffcc',
      '--color-accent2': '#ff00ff'
    }
  },
  'nordic': {
    name: 'Nordic',
    colors: {
      '--color-bg': '#2e3440',
      '--color-bg2': '#3b4252',
      '--color-accent': '#88c0d0',
      '--color-accent2': '#8fbcbb'
    }
  }
};

const SEARCH_URL = 'https://www.bing.com/search?q=';

const MOCK_NEWS = [
  { id: 1, title: "Groove 2.0: The Future of Private Browsing is Here", source: "Groove Blog", time: "2h ago", category: "Updates", image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80" },
  { id: 2, title: "Why Privacy is More Important Than Ever in 2024", source: "TechPulse", time: "5h ago", category: "Security", image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&q=80" },
  { id: 3, title: "10 Tips to Secure Your Digital Identity Today", source: "CyberShield", time: "1d ago", category: "Privacy", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80" }
];

export function App() {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [settings, setSettings] = useState<BrowserSettings>(DEFAULT_SETTINGS);
  const [counters, setCounters] = useState<PrivacyCounters>({ ads: 0, trackers: 0, scripts: 0, ramOptimized: 0 });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [readingList, setReadingList] = useState<ReadingListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTabSwitcherOpen, setIsTabSwitcherOpen] = useState(false);
  const [toast, setToast] = useState<{ icon: string; msg: string } | null>(null);
  const [urlInput, setUrlInput] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [mounted, setMounted] = useState(false);

  const activeTab = useMemo(() => tabs.find(t => t.id === activeTabId) || null, [tabs, activeTabId]);

  // Sync URL Input with active tab ONLY when the tab changes or a navigation finishes
  useEffect(() => {
    if (isInputFocused) return; // Don't overwrite if user is typing
    
    if (activeTab) {
      if (activeTab.view === 'web' && activeTab.url) {
        setUrlInput(prettifyUrl(activeTab.url));
      } else if (activeTab.view === 'home') {
        // Clear if we just switched to home
        setUrlInput('');
      } else if (['settings', 'privacy', 'inspect', 'downloads', 'reading-list', 'history', 'bookmarks'].includes(activeTab.view)) {
        setUrlInput(`groove://${activeTab.view}`);
      }
    } else {
      setUrlInput('');
    }
  }, [activeTabId, activeTab?.view, activeTab?.url, isInputFocused]);

  // Theme Application
  useEffect(() => {
    const theme = THEMES[settings.theme];
    if (theme) {
      Object.entries(theme.colors).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [settings.theme]);

  // Initialization
  useEffect(() => {
    const savedSettings = localStorage.getItem('groove_settings');
    const savedCounters = localStorage.getItem('groove_counters');
    const savedBookmarks = localStorage.getItem('groove_bookmarks');
    const savedHistory = localStorage.getItem('groove_history');
    const savedDownloads = localStorage.getItem('groove_downloads');
    const savedReadingList = localStorage.getItem('groove_reading_list');

    if (savedSettings) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) });
    if (savedCounters) setCounters(JSON.parse(savedCounters));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedDownloads) setDownloads(JSON.parse(savedDownloads));
    if (savedReadingList) setReadingList(JSON.parse(savedReadingList));

    const initialTab = createTabObject();
    setTabs([initialTab]);
    setActiveTabId(initialTab.id);
    setMounted(true);
  }, []);

  // Save State
  useEffect(() => {
    if (!settings.ephemeral && mounted) {
      localStorage.setItem('groove_settings', JSON.stringify(settings));
      localStorage.setItem('groove_counters', JSON.stringify(counters));
      localStorage.setItem('groove_bookmarks', JSON.stringify(bookmarks));
      localStorage.setItem('groove_history', JSON.stringify(history));
      localStorage.setItem('groove_downloads', JSON.stringify(downloads));
      localStorage.setItem('groove_reading_list', JSON.stringify(readingList));
    }
  }, [settings, counters, bookmarks, history, downloads, readingList, mounted]);

  const createTabObject = (url = '', view: BrowserView = 'home'): Tab => ({
    id: `tab_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`,
    url,
    title: url ? (new URL(url).hostname || url) : 'New Tab',
    view,
    history: url ? [url] : [],
    historyIndex: url ? 0 : -1,
  });

  const showToast = (icon: string, msg: string) => {
    setToast({ icon, msg });
    setTimeout(() => setToast(null), 2500);
  };

  const createNewTab = () => {
    const newTab = createTabObject();
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
    setUrlInput('');
    showToast('📑', 'New tab opened');
  };

  const closeTab = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setTabs(prev => {
      const newTabs = prev.filter(t => t.id !== id);
      if (newTabs.length === 0) {
        const fallback = createTabObject();
        setActiveTabId(fallback.id);
        return [fallback];
      }
      if (activeTabId === id) {
        const idx = prev.findIndex(t => t.id === id);
        const nextTab = newTabs[Math.min(idx, newTabs.length - 1)];
        setActiveTabId(nextTab.id);
      }
      return newTabs;
    });
  };

  const navigateTo = (url: string) => {
    if (!activeTabId) return;
    
    let targetUrl = url.trim();
    if (!targetUrl) return;

    if (targetUrl.startsWith('groove://')) {
      const view = targetUrl.replace('groove://', '') as BrowserView;
      const validViews: BrowserView[] = ['home', 'settings', 'privacy', 'inspect', 'downloads', 'reading-list', 'history', 'bookmarks'];
      if (validViews.includes(view)) {
        openInternal(view);
        return;
      }
    }

    if (!/^https?:\/\//i.test(targetUrl)) {
      // Check if it's a valid URL pattern (e.g., google.com, example.org)
      const urlPattern = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/.*)?$/;
      if (urlPattern.test(targetUrl)) {
        targetUrl = 'https://' + targetUrl;
      } else {
        // Otherwise, treat as search query
        targetUrl = SEARCH_URL + encodeURIComponent(targetUrl);
      }
    }

    if (settings.httpsEnforce && /^http:\/\//i.test(targetUrl)) {
      targetUrl = targetUrl.replace(/^http:\/\//i, 'https://');
    }

    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newHistory = t.history.slice(0, t.historyIndex + 1);
        newHistory.push(targetUrl);
        return {
          ...t,
          url: targetUrl,
          view: 'web' as BrowserView,
          title: new URL(targetUrl).hostname,
          history: newHistory,
          historyIndex: newHistory.length - 1
        };
      }
      return t;
    }));

    if (!settings.ephemeral) {
      setHistory(prev => {
        const newItem = { url: targetUrl, title: new URL(targetUrl).hostname, timestamp: Date.now() };
        return [newItem, ...prev.filter(h => h.url !== targetUrl)].slice(0, 50);
      });
    }

    setUrlInput(prettifyUrl(targetUrl));
    setIsLoading(true);
    simulateBlocking();
    setTimeout(() => setIsLoading(false), 800);
  };

  const prettifyUrl = (url: string) => {
    try {
      const u = new URL(url);
      return u.hostname + (u.pathname === '/' ? '' : u.pathname);
    } catch {
      return url;
    }
  };

  const simulateBlocking = () => {
    const ads = settings.adBlock ? Math.floor(Math.random() * 5) + 1 : 0;
    const trackers = settings.antiTracker ? Math.floor(Math.random() * 3) + 1 : 0;
    const scripts = settings.thirdPartyBlock ? Math.floor(Math.random() * 2) : 0;
    const ram = Math.floor(Math.random() * 45) + 10;
    setCounters(prev => ({
      ads: prev.ads + ads,
      trackers: prev.trackers + trackers,
      scripts: prev.scripts + scripts,
      ramOptimized: prev.ramOptimized + ram
    }));
  };

  const goBack = () => {
    if (!activeTab || activeTab.historyIndex <= 0) {
      setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, view: 'home', url: '' } : t));
      setUrlInput('');
      return;
    }
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newIdx = t.historyIndex - 1;
        const url = t.history[newIdx];
        return { ...t, historyIndex: newIdx, url, view: 'web', title: new URL(url).hostname };
      }
      return t;
    }));
  };

  const goForward = () => {
    if (!activeTab || activeTab.historyIndex >= activeTab.history.length - 1) return;
    setTabs(prev => prev.map(t => {
      if (t.id === activeTabId) {
        const newIdx = t.historyIndex + 1;
        const url = t.history[newIdx];
        return { ...t, historyIndex: newIdx, url, view: 'web', title: new URL(url).hostname };
      }
      return t;
    }));
  };

  const toggleBookmark = () => {
    if (!activeTab?.url) return;
    const exists = bookmarks.some(b => b.url === activeTab.url);
    if (exists) {
      setBookmarks(prev => prev.filter(b => b.url !== activeTab.url));
      showToast('🗑️', 'Bookmark removed');
    } else {
      setBookmarks(prev => [{ url: activeTab.url, title: activeTab.title, added: Date.now() }, ...prev]);
      showToast('⭐', 'Page bookmarked');
    }
    setIsMenuOpen(false);
  };

  const openInternal = (view: BrowserView) => {
    setTabs(prev => prev.map(t => t.id === activeTabId ? { ...t, view } : t));
    setIsMenuOpen(false);
  };

  // Renderers
  return (
    <div className={cn(
      "h-full w-full flex flex-col md:flex-row bg-bg text-text overflow-hidden transition-all duration-500",
      settings.ephemeral && "border-t-4 border-accent"
    )}>
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex w-20 lg:w-64 flex-col bg-bg2 border-r border-border shrink-0 z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-accent to-green-custom rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">G</div>
          <span className="hidden lg:block font-black text-xl tracking-tight">Groove</span>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <SidebarBtn icon={<Home />} label="Dashboard" active={activeTab?.view === 'home'} onClick={() => openInternal('home')} />
          <SidebarBtn icon={<Layers />} label="Tabs" badge={tabs.length} onClick={() => setIsTabSwitcherOpen(true)} />
          <SidebarBtn icon={<Download />} label="Downloads" active={activeTab?.view === 'downloads'} onClick={() => openInternal('downloads')} />
          <SidebarBtn icon={<BookOpen />} label="Reading List" active={activeTab?.view === 'reading-list'} onClick={() => openInternal('reading-list')} />
          <SidebarBtn icon={<Clock />} label="History" active={activeTab?.view === 'history'} onClick={() => openInternal('history')} />
          <SidebarBtn icon={<Star />} label="Bookmarks" active={activeTab?.view === 'bookmarks'} onClick={() => openInternal('bookmarks')} />
          <div className="pt-6 pb-2">
            <div className="h-px bg-border lg:mx-2" />
          </div>
          <SidebarBtn icon={<Settings />} label="Settings" active={activeTab?.view === 'settings'} onClick={() => openInternal('settings')} />
          <SidebarBtn icon={<Shield />} label="Privacy" active={activeTab?.view === 'privacy'} onClick={() => openInternal('privacy')} />
        </nav>

        <div className="p-4">
          <button 
            onClick={() => setSettings(s => ({ ...s, desktopMode: !s.desktopMode }))}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
              settings.desktopMode ? "bg-accent/10 text-accent" : "hover:bg-surface text-text3"
            )}
          >
            <Monitor size={20} />
            <span className="hidden lg:block text-xs font-bold uppercase tracking-widest">Desktop Mode</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Bar */}
        <header className="bg-glass2 backdrop-blur-3xl border-b border-border z-40 px-3 py-2 md:px-6 md:py-4">
          <div className="max-w-5xl mx-auto flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center gap-1">
              <button onClick={goBack} className="p-2 text-text3 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
              <button onClick={goForward} className="p-2 text-text3 hover:text-white transition-colors"><ChevronRight size={20} /></button>
              <button onClick={() => activeTab?.view === 'web' && navigateTo(activeTab.url)} className="p-2 text-text3 hover:text-white transition-colors"><RefreshCw size={18} /></button>
            </div>

            <div className={cn(
              "flex-1 flex items-center gap-2 bg-surface2 border border-border rounded-2xl px-3 h-12 transition-all duration-300",
              "focus-within:border-accent focus-within:ring-2 focus-within:ring-accent-glow focus-within:bg-surface3"
            )}>
              <div className={cn("shrink-0", activeTab?.url?.startsWith('https') ? "text-green-custom" : "text-text3")}>
                {activeTab?.url?.startsWith('https') ? <Lock size={16} /> : <Globe size={16} />}
              </div>
              <input 
                type="text" 
                className="flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-text3"
                placeholder="Search or enter URL"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    navigateTo(urlInput);
                    (e.target as HTMLInputElement).blur();
                  }
                }}
              />
              {isLoading ? (
                <RefreshCw size={16} className="animate-spin text-accent" />
              ) : (
                <button 
                  onClick={() => navigateTo(urlInput)}
                  className="p-2 text-accent hover:text-accent2 transition-colors"
                  aria-label="Search"
                >
                  <Search size={18} />
                </button>
              )}
              <button onClick={() => setIsMenuOpen(true)} className="p-1 text-text3 hover:text-white"><MoreVertical size={18} /></button>
            </div>

            <button onClick={createNewTab} className="hidden md:flex items-center gap-2 px-4 h-12 bg-surface border border-border rounded-2xl font-bold text-sm hover:bg-surface2 transition-colors">
              <Plus size={18} /> <span className="hidden lg:inline">New Tab</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 relative overflow-hidden bg-bg">
          <AnimatePresence mode="wait">
            {activeTab?.view === 'home' && (
              <HomePage 
                key="home"
                counters={counters}
                bookmarks={bookmarks}
                history={history}
                navigateTo={navigateTo}
                openInternal={openInternal}
                onToast={showToast}
              />
            )}
            {activeTab?.view === 'web' && (
              <WebPage 
                key={`web-${activeTab.id}`}
                url={activeTab.url}
                jsEnabled={settings.jsEnabled}
                desktopMode={settings.desktopMode}
              />
            )}
            {activeTab?.view === 'settings' && (
              <SettingsPage 
                key="settings"
                settings={settings}
                setSettings={setSettings}
                onBack={() => openInternal('home')}
              />
            )}
            {activeTab?.view === 'privacy' && (
              <PrivacyPage 
                key="privacy"
                settings={settings}
                setSettings={setSettings}
                counters={counters}
                onBack={() => openInternal('home')}
              />
            )}
            {activeTab?.view === 'inspect' && (
              <InspectPage 
                key="inspect"
                tab={activeTab}
                settings={settings}
                counters={counters}
                onBack={() => openInternal('home')}
              />
            )}
            {activeTab?.view === 'downloads' && (
              <DownloadsPage 
                key="downloads"
                downloads={downloads}
                onBack={() => openInternal('home')}
              />
            )}
            {activeTab?.view === 'reading-list' && (
              <ReadingListPage 
                key="reading-list"
                readingList={readingList}
                navigateTo={navigateTo}
                onBack={() => openInternal('home')}
              />
            )}
            {activeTab?.view === 'history' && (
              <HistoryPage 
                key="history"
                history={history}
                navigateTo={navigateTo}
                onClear={() => setHistory([])}
                onBack={() => openInternal('home')}
              />
            )}
            {activeTab?.view === 'bookmarks' && (
              <BookmarksPage 
                key="bookmarks"
                bookmarks={bookmarks}
                navigateTo={navigateTo}
                onRemove={(url) => setBookmarks(prev => prev.filter(b => b.url !== url))}
                onBack={() => openInternal('home')}
              />
            )}
          </AnimatePresence>
        </main>

        {/* Bottom Nav for Mobile */}
        <nav className="md:hidden h-16 bg-glass2 backdrop-blur-3xl border-t border-border flex items-center justify-around px-2 pb-[var(--safe-bottom)] z-50">
          <NavButton icon={<ChevronLeft size={22} />} label="Back" onClick={goBack} disabled={!activeTab || activeTab.view === 'home'} />
          <NavButton icon={<Home size={22} />} label="Home" active={activeTab?.view === 'home'} onClick={() => openInternal('home')} />
          <NavButton 
            icon={<Layers size={22} />} 
            label="Tabs" 
            badge={tabs.length}
            onClick={() => setIsTabSwitcherOpen(true)} 
          />
          <NavButton icon={<Menu size={22} />} label="Menu" onClick={() => setIsMenuOpen(true)} />
        </nav>
      </div>

      {/* Overlays */}
      <TabSwitcher 
        isOpen={isTabSwitcherOpen} 
        onClose={() => setIsTabSwitcherOpen(false)} 
        tabs={tabs}
        activeTabId={activeTabId}
        onSelectTab={(id) => { setActiveTabId(id); setIsTabSwitcherOpen(false); }}
        onCloseTab={closeTab}
        onNewTab={createNewTab}
      />

      <MenuOverlay 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onToggleBookmark={toggleBookmark}
        onReload={() => activeTab?.view === 'web' && navigateTo(activeTab.url)}
        onCloseActiveTab={() => {
          if (activeTabId) {
            closeTab(activeTabId);
            setIsMenuOpen(false);
          }
        }}
        onAddToReadingList={() => {
          if (!activeTab?.url) return;
          const exists = readingList.some(r => r.url === activeTab.url);
          if (!exists) {
            setReadingList(prev => [{ id: Math.random().toString(), url: activeTab.url, title: activeTab.title, timestamp: Date.now() }, ...prev]);
            showToast('📖', 'Added to Reading List');
          } else {
            showToast('📖', 'Already in Reading List');
          }
          setIsMenuOpen(false);
        }}
        onOpenInternal={openInternal}
        isBookmarked={bookmarks.some(b => b.url === activeTab?.url)}
        desktopMode={settings.desktopMode}
        onToggleDesktopMode={() => setSettings(s => ({ ...s, desktopMode: !s.desktopMode }))}
      />

      <Toast toast={toast} />
    </div>
  );
}

// UI Components

function SidebarBtn({ icon, label, active, onClick, badge }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; badge?: number }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-4 p-4 rounded-2xl transition-all group",
        active ? "bg-accent text-white shadow-xl shadow-accent/20" : "text-text3 hover:bg-surface hover:text-white"
      )}
    >
      <div className="shrink-0">{icon}</div>
      <span className="hidden lg:block text-sm font-bold flex-1 text-left">{label}</span>
      {badge !== undefined && (
        <span className={cn(
          "px-2 py-0.5 rounded-full text-[10px] font-black",
          active ? "bg-white text-accent" : "bg-surface3 text-text2"
        )}>
          {badge}
        </span>
      )}
    </button>
  );
}

function NavButton({ icon, label, active, onClick, badge, disabled }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; badge?: number; disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-2xl transition-all relative",
        active ? "text-accent2" : "text-text3",
        disabled && "opacity-30 cursor-not-allowed"
      )}
    >
      {icon}
      <span className="text-[9px] font-semibold">{label}</span>
      {badge !== undefined && (
        <span className="absolute top-2 right-3 min-w-[16px] h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-lg shadow-accent/40">
          {badge}
        </span>
      )}
    </button>
  );
}

function HomePage({ counters, bookmarks, history, navigateTo, openInternal, onToast }: { counters: PrivacyCounters; bookmarks: Bookmark[]; history: HistoryItem[]; navigateTo: (url: string) => void; openInternal: (view: BrowserView) => void; onToast: (icon: string, msg: string) => void }) {
  const [homeSearch, setHomeSearch] = useState('');
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearch.trim()) navigateTo(homeSearch);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full overflow-y-auto px-6 py-10 lg:px-12 no-scrollbar"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div onClick={() => openInternal('privacy')} className="cursor-pointer group">
            <h2 className="text-4xl font-black tracking-tight group-hover:text-accent transition-colors">{greeting}</h2>
            <p className="text-text3 mt-1 font-medium">Safe and private browsing by Groove</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => openInternal('privacy')} className="px-4 py-2 bg-surface border border-border rounded-xl flex items-center gap-2 hover:bg-surface2 transition-colors">
              <Shield size={14} className="text-green-custom" />
              <span className="text-xs font-bold text-green-custom">{counters.ads + counters.trackers} blocked</span>
            </button>
            <button onClick={() => onToast('🚀', 'RAM optimized by Groove AI')} className="px-4 py-2 bg-surface border border-border rounded-xl flex items-center gap-2 hover:bg-surface2 transition-colors">
              <Cpu size={14} className="text-accent2" />
              <span className="text-xs font-bold text-accent2">{counters.ramOptimized > 1024 ? (counters.ramOptimized / 1024).toFixed(1) + 'GB' : counters.ramOptimized + 'MB'} Optimized</span>
            </button>
            <button onClick={() => navigateTo('https://www.bing.com')} className="px-4 py-2 bg-accent text-white rounded-xl flex items-center gap-2 hover:opacity-90 transition-all active:scale-95 shadow-lg shadow-accent/20">
              <Plus size={14} />
              <span className="text-xs font-bold">New Search</span>
            </button>
          </div>
        </header>

        {/* Main Search */}
        <section>
          <form onSubmit={handleSearch} className="relative group">
            <div className={cn(
              "flex items-center gap-4 bg-surface2 border-2 border-border rounded-[32px] px-8 h-20 transition-all duration-500 shadow-2xl",
              "focus-within:border-accent focus-within:bg-surface3 focus-within:scale-[1.02]"
            )}>
              <Search size={24} className="text-text3 group-focus-within:text-accent transition-colors" />
              <input 
                type="text" 
                className="flex-1 bg-transparent text-xl font-bold focus:outline-none placeholder:text-text3"
                placeholder="Search or enter URL..."
                value={homeSearch}
                onChange={(e) => setHomeSearch(e.target.value)}
              />
              <button 
                type="submit"
                className="w-12 h-12 flex items-center justify-center bg-accent text-white rounded-full shadow-lg shadow-accent/20 active:scale-90 transition-transform"
              >
                <ArrowRight size={24} />
              </button>
            </div>
          </form>
        </section>

        {/* Grid: Quick Links & History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-10">
            {/* Quick Links */}
            <section>
              <SectionTitle title="Favorites" />
              <div className="grid grid-cols-4 md:grid-cols-5 gap-6">
                <QuickLink icon="B" name="Bing" color="#0078d4" onClick={() => navigateTo('https://www.bing.com')} />
                <QuickLink icon="W" name="Wikipedia" color="#ccc" onClick={() => navigateTo('https://wikipedia.org')} />
                <QuickLink icon="G" name="GitHub" color="#f0f0f5" onClick={() => navigateTo('https://github.com')} />
                <QuickLink icon="Y" name="YouTube" color="#ff0000" onClick={() => navigateTo('https://youtube.com')} />
                <QuickLink icon={<Plus size={24}/>} name="Add" color="#6c5ce7" onClick={() => onToast('➕', 'Custom links coming soon')} />
              </div>
            </section>

            {/* News Feed */}
            <section>
              <SectionTitle title="Top Stories" icon={<Flame size={14} className="text-orange-custom" />} />
              <div className="space-y-4">
                {MOCK_NEWS.map(news => (
                  <div key={news.id} className="group flex gap-4 p-4 bg-surface border border-border rounded-3xl hover:bg-surface2 transition-all cursor-pointer">
                    <img src={news.image} alt={news.title} className="w-24 h-24 rounded-2xl object-cover shrink-0" />
                    <div className="flex flex-col justify-between py-1">
                      <div>
                        <span className="text-[10px] font-black uppercase text-accent tracking-widest">{news.category}</span>
                        <h4 className="text-base font-bold line-clamp-2 mt-1 group-hover:text-accent transition-colors">{news.title}</h4>
                      </div>
                      <div className="flex items-center gap-3 text-[10px] font-bold text-text3">
                        <span>{news.source}</span>
                        <span>•</span>
                        <span>{news.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-10">
            {/* Recent History */}
            <section>
              <SectionTitle title="Recently Visited" icon={<Clock size={14}/>} />
              <div className="space-y-2">
                {history.length === 0 ? (
                  <div className="text-xs text-text3 py-4">Your history will appear here</div>
                ) : (
                  history.slice(0, 5).map((h, i) => (
                    <div 
                      key={i} 
                      onClick={() => navigateTo(h.url)}
                      className="flex items-center gap-3 p-3 bg-surface border border-border rounded-2xl hover:bg-surface2 transition-all cursor-pointer group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-surface3 flex items-center justify-center text-xs font-bold text-text2">{h.title.charAt(0)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold truncate">{h.title}</div>
                        <div className="text-[9px] text-text3 truncate">{h.url}</div>
                      </div>
                      <ExternalLink size={12} className="text-text3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Bookmarks Side */}
            <section>
              <SectionTitle title="Bookmarks" icon={<Star size={14}/>} />
              <div className="space-y-2">
                {bookmarks.length === 0 ? (
                  <div className="text-xs text-text3 py-4">No bookmarks yet</div>
                ) : (
                  bookmarks.slice(0, 4).map((b, i) => (
                    <div key={i} onClick={() => navigateTo(b.url)} className="p-3 bg-surface border border-border rounded-2xl hover:bg-surface2 transition-all cursor-pointer text-xs font-bold truncate">
                      {b.title}
                    </div>
                  ))
                )}
                {bookmarks.length > 0 && <button onClick={() => openInternal('bookmarks')} className="w-full p-2 text-[10px] font-bold text-accent uppercase tracking-widest text-center hover:underline">View All</button>}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </motion.div>
  );
}

function WebPage({ url, jsEnabled, desktopMode }: { url: string; jsEnabled: boolean; desktopMode: boolean }) {
  return (
    <div className="h-full w-full bg-white relative overflow-hidden flex items-center justify-center">
      <div className={cn(
        "bg-white transition-all duration-700 h-full",
        desktopMode ? "w-full max-w-[1440px] shadow-2xl" : "w-full"
      )}>
        <iframe 
          src={url}
          className="w-full h-full border-none"
          sandbox={cn(
            "allow-same-origin allow-forms allow-popups",
            jsEnabled && "allow-scripts"
          )}
          title="Web Browser"
        />
      </div>
    </div>
  );
}

function SettingsPage({ settings, setSettings, onBack }: { settings: BrowserSettings; setSettings: React.Dispatch<React.SetStateAction<BrowserSettings>>; onBack: () => void }) {
  const toggle = (key: keyof BrowserSettings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-bg p-6 lg:p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-black">Settings</h2>
        </header>

        <div className="space-y-10 pb-10">
          <section>
            <SectionTitle title="Appearance" />
            <div className="bg-surface border border-border rounded-3xl overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center shrink-0 text-accent"><Palette size={20} /></div>
                  <div className="flex-1">
                    <div className="text-sm font-bold">Browser Theme</div>
                    <div className="text-xs text-text3 mt-0.5">Customize the interface colors.</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {(Object.keys(THEMES) as ThemeType[]).map(t => (
                    <button 
                      key={t}
                      onClick={() => setSettings(s => ({ ...s, theme: t }))}
                      className={cn(
                        "p-3 rounded-2xl border-2 transition-all flex flex-col gap-2",
                        settings.theme === t ? "border-accent bg-accent/10" : "border-border hover:border-text3"
                      )}
                    >
                      <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEMES[t].colors['--color-bg'] }} />
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: THEMES[t].colors['--color-accent'] }} />
                      </div>
                      <span className="text-[10px] font-black uppercase">{THEMES[t].name}</span>
                    </button>
                  ))}
                </div>
              </div>
              <SettingItem 
                noBorder
                icon={<Monitor size={20} className="text-accent2" />}
                title="Desktop Mode"
                desc="Force websites to use their desktop layout."
                checked={settings.desktopMode}
                onToggle={() => toggle('desktopMode')}
              />
            </div>
          </section>

          <section>
            <SectionTitle title="Privacy & History" />
            <div className="bg-surface border border-border rounded-3xl overflow-hidden">
              <SettingItem 
                noBorder
                icon={<Eye size={20} className="text-accent" />}
                title="Ephemeral Mode"
                desc="Browsing data is wiped when you close the browser."
                checked={settings.ephemeral}
                onToggle={() => toggle('ephemeral')}
              />
              <SettingItem 
                icon={<ShieldCheck size={20} className="text-green-custom" />}
                title="HTTPS Enforcement"
                desc="Upgrade all connections to secure HTTPS."
                checked={settings.httpsEnforce}
                onToggle={() => toggle('httpsEnforce')}
              />
            </div>
          </section>

          <section className="pt-6">
            <button 
              className="w-full py-5 bg-red-glow border border-red-custom/20 rounded-3xl text-red-custom font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-[0.98] transition-all hover:bg-red-custom/10"
              onClick={() => { localStorage.clear(); window.location.reload(); }}
            >
              <Trash2 size={18} /> Wipe All Data
            </button>
          </section>
        </div>
      </div>
    </motion.div>
  );
}

function PrivacyPage({ settings, setSettings, counters, onBack }: { settings: BrowserSettings; setSettings: React.Dispatch<React.SetStateAction<BrowserSettings>>; counters: PrivacyCounters; onBack: () => void }) {
  const toggle = (key: keyof BrowserSettings) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-bg p-6 lg:p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-black">Privacy Shields</h2>
        </header>

        {/* Status Card */}
        <div className="bg-gradient-to-br from-accent to-accent2 rounded-[40px] p-8 mb-10 shadow-2xl shadow-accent/20 relative overflow-hidden">
          <Shield size={200} className="absolute -bottom-10 -right-10 opacity-10 rotate-12" />
          <div className="relative z-10">
            <h3 className="text-xl font-black mb-6 flex items-center gap-2"><ShieldCheck /> Active Protection</h3>
            <div className="grid grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-black">{counters.ads}</div>
                <div className="text-[10px] font-bold uppercase opacity-60">Ads Blocked</div>
              </div>
              <div>
                <div className="text-3xl font-black">{counters.trackers}</div>
                <div className="text-[10px] font-bold uppercase opacity-60">Trackers</div>
              </div>
              <div>
                <div className="text-3xl font-black">{counters.scripts}</div>
                <div className="text-[10px] font-bold uppercase opacity-60">Scripts</div>
              </div>
            </div>
          </div>
        </div>

        <SectionTitle title="Shield Settings" />
        <div className="bg-surface border border-border rounded-3xl overflow-hidden">
          <SettingItem noBorder icon={<Zap className="text-accent2" />} title="Ad Blocking" desc="Remove ads from all websites." checked={settings.adBlock} onToggle={() => toggle('adBlock')} />
          <SettingItem icon={<Eye className="text-accent" />} title="Anti-Tracker" desc="Prevent cross-site tracking." checked={settings.antiTracker} onToggle={() => toggle('antiTracker')} />
          <SettingItem icon={<Globe className="text-green-custom" />} title="JavaScript" desc="Enable/Disable web scripting." checked={settings.jsEnabled} onToggle={() => toggle('jsEnabled')} />
          <SettingItem icon={<Monitor className="text-orange-custom" />} title="Autoplay Block" desc="Stop media from auto-playing." checked={settings.blockAutoplay} onToggle={() => toggle('blockAutoplay')} />
        </div>
      </div>
    </motion.div>
  );
}

function InspectPage({ tab, settings, counters, onBack }: { tab: Tab; settings: BrowserSettings; counters: PrivacyCounters; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-bg p-6 lg:p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-black">Inspect Page</h2>
        </header>

        <div className="space-y-4">
          <InspectItem 
            icon={<Lock className="text-green-custom" />}
            title="Connection"
            value={tab.url.startsWith('https') ? "Secure TLS 1.3" : "Insecure Connection"}
            status={tab.url.startsWith('https') ? "Safe" : "Warning"}
            statusColor={tab.url.startsWith('https') ? "text-green-custom bg-green-glow" : "text-orange-custom bg-orange-glow"}
          />
          <InspectItem icon={<Monitor className="text-accent2" />} title="Mode" value={settings.desktopMode ? "Desktop Layout" : "Mobile Layout"} />
          <InspectItem icon={<Zap className="text-accent" />} title="Privacy" value={`${counters.ads + counters.trackers} Threats Neutralized`} />
        </div>
      </div>
    </motion.div>
  );
}

// Helper components
function InspectItem({ icon, title, value, status, statusColor }: { icon: React.ReactNode; title: string; value: string; status?: string; statusColor?: string }) {
  return (
    <div className="flex items-center gap-4 p-5 bg-surface border border-border rounded-3xl">
      <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center">{icon}</div>
      <div className="flex-1">
        <div className="text-[10px] font-black uppercase text-text3 tracking-wider">{title}</div>
        <div className="text-sm font-bold">{value}</div>
      </div>
      {status && <div className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase", statusColor)}>{status}</div>}
    </div>
  );
}

function QuickLink({ icon, name, color, onClick }: { icon: React.ReactNode; name: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-3 active:scale-90 transition-all group">
      <div 
        className="w-16 h-16 md:w-20 md:h-20 rounded-[24px] flex items-center justify-center text-2xl font-black shadow-xl group-hover:scale-110 transition-transform"
        style={{ backgroundColor: `${color}15`, color: color }}
      >
        {icon}
      </div>
      <span className="text-xs font-bold text-text3 group-hover:text-white transition-colors">{name}</span>
    </button>
  );
}

function SectionTitle({ title, icon }: { title: string, icon?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      {icon}
      <h3 className="text-[11px] font-black uppercase text-text3 tracking-[0.2em]">{title}</h3>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function SettingItem({ icon, title, desc, checked, onToggle, noBorder }: { icon: React.ReactNode; title: string; desc: string; checked: boolean; onToggle: () => void; noBorder?: boolean }) {
  return (
    <div className={cn("flex items-center gap-4 p-6 bg-surface transition-all hover:bg-surface2", !noBorder && "border-t border-border")}>
      <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1">
        <div className="text-sm font-bold">{title}</div>
        <div className="text-xs text-text3 mt-0.5">{desc}</div>
      </div>
      <button onClick={onToggle} className={cn("w-14 h-8 rounded-full relative transition-all border border-border", checked ? "bg-accent border-transparent" : "bg-surface3")}>
        <motion.div animate={{ x: checked ? 26 : 4 }} className="absolute top-1 left-0 w-6 h-6 bg-white rounded-full shadow-lg" />
      </button>
    </div>
  );
}

function TabSwitcher({ isOpen, onClose, tabs, activeTabId, onSelectTab, onCloseTab, onNewTab }: { isOpen: boolean; onClose: () => void; tabs: Tab[]; activeTabId: string | null; onSelectTab: (id: string) => void; onCloseTab: (id: string, e?: React.MouseEvent) => void; onNewTab: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[2000] bg-bg flex flex-col">
          <header className="p-6 bg-glass2 backdrop-blur-3xl border-b border-border flex items-center justify-between">
            <h2 className="text-2xl font-black flex items-center gap-3">Open Tabs <span className="bg-accent px-3 py-1 rounded-full text-xs">{tabs.length}</span></h2>
            <div className="flex items-center gap-3">
              <button onClick={onNewTab} className="p-3 bg-accent text-white rounded-2xl shadow-xl shadow-accent/20 flex items-center gap-2">
                <Plus size={24} />
                <span className="text-sm font-bold hidden sm:inline">New Tab</span>
              </button>
              <button onClick={onClose} className="p-3 bg-surface border border-border rounded-2xl text-text2"><X size={24} /></button>
            </div>
          </header>
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 no-scrollbar">
            {tabs.map((tab, i) => (
              <motion.div 
                key={tab.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                className={cn("relative aspect-video sm:aspect-[4/5] bg-surface rounded-[32px] border-2 overflow-hidden flex flex-col group", tab.id === activeTabId ? "border-accent shadow-2xl" : "border-border hover:border-text3")}
                onClick={() => onSelectTab(tab.id)}
              >
                {/* Close button - more visible on mobile, hover effect on desktop */}
                <button 
                  onClick={(e) => onCloseTab(tab.id, e)} 
                  className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white md:opacity-0 md:group-hover:opacity-100 transition-opacity active:scale-90"
                  aria-label="Close tab"
                >
                  <X size={20} />
                </button>
                <div className="flex-1 bg-bg2 flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 rounded-3xl bg-surface3 flex items-center justify-center text-3xl font-black text-accent">{tab.title?.charAt(0) || 'N'}</div>
                </div>
                <div className="p-5 bg-surface border-t border-border flex items-center gap-3">
                  <div className="text-sm font-bold truncate flex-1">{tab.title || 'New Tab'}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MenuOverlay({ isOpen, onClose, onToggleBookmark, onReload, onAddToReadingList, onOpenInternal, isBookmarked, desktopMode, onToggleDesktopMode, onCloseActiveTab }: { isOpen: boolean; onClose: () => void; onToggleBookmark: () => void; onReload: () => void; onAddToReadingList: () => void; onOpenInternal: (v: BrowserView) => void; isBookmarked: boolean; desktopMode: boolean; onToggleDesktopMode: () => void; onCloseActiveTab: () => void }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-sm" onClick={onClose} />
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30 }} className="fixed bottom-0 left-0 right-0 z-[1001] bg-bg2 border-t border-border rounded-t-[48px] p-8 pb-12 shadow-2xl max-w-lg mx-auto">
            <div className="w-12 h-1.5 bg-surface3 rounded-full mx-auto mb-10" />
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <MenuAction icon={<Star className={cn(isBookmarked && "fill-orange-custom text-orange-custom")} />} label="Bookmark" onClick={onToggleBookmark} />
                <MenuAction icon={<RefreshCw />} label="Reload" onClick={onReload} />
                <MenuAction icon={<Monitor className={cn(desktopMode && "text-accent")} />} label="Desktop Mode" onClick={onToggleDesktopMode} />
                <MenuAction icon={<BookOpen />} label="Reading List" onClick={onAddToReadingList} />
              </div>
              <div className="h-px bg-border my-4" />
              <MenuItem icon={<Trash2 className="text-red-custom" />} title="Close Current Tab" desc="Exit the active browsing session" onClick={onCloseActiveTab} />
              <MenuItem icon={<Settings />} title="Browser Settings" desc="History, cookies and UI" onClick={() => onOpenInternal('settings')} />
              <MenuItem icon={<Shield className="text-green-custom" />} title="Privacy Shield" desc="Security and blocking" onClick={() => onOpenInternal('privacy')} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function MenuAction({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-2 p-4 bg-surface border border-border rounded-3xl active:scale-95 transition-all">
      <div className="text-text2">{icon}</div>
      <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function MenuItem({ icon, title, desc, onClick }: { icon: React.ReactNode; title: string; desc: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-4 p-5 bg-surface border border-border rounded-[32px] active:scale-[0.98] transition-all text-left group">
      <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center text-text2 group-hover:bg-accent group-hover:text-white transition-all">{icon}</div>
      <div>
        <div className="text-sm font-black">{title}</div>
        <div className="text-[11px] text-text3 font-medium">{desc}</div>
      </div>
    </button>
  );
}

function Toast({ toast }: { toast: { icon: string; msg: string } | null }) {
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ y: -100, x: '-50%' }} animate={{ y: 80, x: '-50%' }} exit={{ y: -100, x: '-50%' }} className="fixed top-0 left-1/2 z-[3000] px-6 py-4 bg-white text-black rounded-[32px] flex items-center gap-3 shadow-2xl shadow-black/40 min-w-[240px]">
          <span className="text-xl">{toast.icon}</span>
          <span className="text-sm font-black uppercase tracking-tight">{toast.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DownloadsPage({ downloads, onBack }: { downloads: DownloadItem[]; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-bg p-6 lg:p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-black">Downloads</h2>
        </header>

        {downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text3 gap-4">
            <Download size={48} className="opacity-20" />
            <p className="font-bold">No recent downloads</p>
          </div>
        ) : (
          <div className="space-y-3">
            {downloads.map(item => (
              <div key={item.id} className="p-5 bg-surface border border-border rounded-3xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center text-accent"><FileText size={20} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{item.name}</div>
                  <div className="text-[10px] text-text3 font-medium">{item.size} • {new Date(item.timestamp).toLocaleDateString()}</div>
                </div>
                <button className="text-xs font-black uppercase text-accent tracking-widest px-4 py-2 hover:bg-accent/10 rounded-xl transition-colors">Open</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ReadingListPage({ readingList, navigateTo, onBack }: { readingList: ReadingListItem[]; navigateTo: (url: string) => void; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-bg p-6 lg:p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-black">Reading List</h2>
        </header>

        {readingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text3 gap-4">
            <BookOpen size={48} className="opacity-20" />
            <p className="font-bold">Your reading list is empty</p>
          </div>
        ) : (
          <div className="space-y-3">
            {readingList.map(item => (
              <div key={item.id} className="p-5 bg-surface border border-border rounded-3xl flex items-center gap-4 group cursor-pointer hover:bg-surface2 transition-all" onClick={() => navigateTo(item.url)}>
                <div className="w-12 h-12 rounded-2xl bg-surface2 group-hover:bg-accent group-hover:text-white flex items-center justify-center text-text2 transition-all"><BookOpen size={20} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{item.title}</div>
                  <div className="text-[10px] text-text3 font-medium truncate">{item.url}</div>
                </div>
                <ChevronRight size={16} className="text-text3" />
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function HistoryPage({ history, navigateTo, onClear, onBack }: { history: HistoryItem[]; navigateTo: (url: string) => void; onClear: () => void; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-bg p-6 lg:p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
              <ArrowLeft size={20} />
            </button>
            <h2 className="text-3xl font-black">History</h2>
          </div>
          <button onClick={onClear} className="text-xs font-bold text-red-custom uppercase tracking-widest hover:underline">Clear All</button>
        </header>

        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text3 gap-4">
            <Clock size={48} className="opacity-20" />
            <p className="font-bold">Your history is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {history.map((item, i) => (
              <div key={i} onClick={() => navigateTo(item.url)} className="p-4 bg-surface border border-border rounded-2xl flex items-center gap-4 cursor-pointer hover:bg-surface2 transition-all">
                <div className="w-10 h-10 rounded-xl bg-surface2 flex items-center justify-center text-text3"><Clock size={16} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{item.title}</div>
                  <div className="text-[10px] text-text3 font-medium truncate">{item.url}</div>
                </div>
                <div className="text-[9px] font-bold text-text3 uppercase">{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function BookmarksPage({ bookmarks, navigateTo, onRemove, onBack }: { bookmarks: Bookmark[]; navigateTo: (url: string) => void; onRemove: (url: string) => void; onBack: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="h-full bg-bg p-6 lg:p-12 overflow-y-auto no-scrollbar">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-10">
          <button onClick={onBack} className="md:hidden w-10 h-10 rounded-xl bg-surface border border-border flex items-center justify-center">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-black">Bookmarks</h2>
        </header>

        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-text3 gap-4">
            <Star size={48} className="opacity-20" />
            <p className="font-bold">No bookmarks saved yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bookmarks.map((item, i) => (
              <div key={i} className="p-5 bg-surface border border-border rounded-3xl flex items-center gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-surface2 flex items-center justify-center text-orange-custom cursor-pointer" onClick={() => navigateTo(item.url)}><Star size={20} className="fill-orange-custom" /></div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigateTo(item.url)}>
                  <div className="text-sm font-bold truncate">{item.title}</div>
                  <div className="text-[10px] text-text3 font-medium truncate">{item.url}</div>
                </div>
                <button onClick={() => onRemove(item.url)} className="w-10 h-10 rounded-xl hover:bg-red-custom/10 text-text3 hover:text-red-custom transition-all flex items-center justify-center">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
