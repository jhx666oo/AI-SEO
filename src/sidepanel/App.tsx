import React, { useState, useEffect, useRef } from "react";
import {
  Zap,
  Search,
  FileText,
  Sparkles,
  BarChart3,
  Languages,
  Layout,
  Settings as SettingsIcon,
  User as UserIcon,
  Copy,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  History,
  LogOut,
  Mail,
  Server,
  Key as KeyIcon,
  Package,
  X,
  Type,
  ChevronDown,
  ChevronUp,
  Activity,
  DownloadCloud,
  Film,
  Clock,
  Maximize
} from "lucide-react";

// --- 导入真实项目逻辑 ---
import { useSettings } from "@/hooks/useSettings";
import { useAI } from "@/hooks/useAI";
import { useSession } from "@/hooks/useSession";
import { useXoobay } from "@/hooks/useXoobay";
import {
  PageContent,
  ImageInfo,
  AIConfig,
  DEFAULT_AI_CONFIG,
  PROVIDER_MODELS,
  XoobayLanguage,
  VideoConfig,
  DEFAULT_VIDEO_CONFIG,
  VIDEO_MODELS
} from "@/types";
import {
  OUTPUT_LANGUAGES,
  OUTPUT_FORMATS,
  buildSystemPrompt,
  VIDEO_STYLES,
  VIDEO_OUTPUT_LANGUAGES,
  buildVideoSystemPrompt
} from "@/utils/templates";
import { sendToAI } from "@/services/ai";

/**
 * 国际化词典 - UI 静态文本
 */
const locales = {
  zh: {
    title: "AI SEO 平台",
    enterprise: "企业增强版",
    quota: "账户余额",
    upgrade: "充值/升级",
    steps: ["智能选品", "内容校对", "策略配置", "生成结果"],
    generating: "AI 引擎正在深度创作...",
    engine_status: "企业智选引擎 (SaaS 托管)",
    diy_status: "自定义 DIY 模式 (私有密钥)",
    btn_next: "下一步",
    btn_prev: "上一步",
    btn_generate: "开始生成",
    btn_restart: "重新开始",
    system_config: "系统配置",
    pricing_plans: "选择升级方案",
    page_jump: "跳转",
    status_active: "在线",
    status_offline: "离线",
    searchPlaceholder: "输入产品名称或关键词...",
    loadProduct: "读取产品详情",
    noProducts: "暂无产品，请尝试搜索",
    editTitle: "原始数据校对",
    editTabContent: "文本内容",
    editTabImages: "媒体资源",
    confirmContent: "确认进入下一步",
    configTitle: "生成策略配置",
    targetLanguage: "目标语言",
    outputFormat: "输出格式",
    advancedMode: "高级创作参数",
    webSearch: "联网实时增强 (RAG)",
    reasoningEffort: "逻辑推理强度",
    low: "标准 (快)",
    medium: "增强 (准)",
    high: "深度 (极)",
    copy: "复制内容",
    download: "导出文档",
    modelTesting: "模型连通性测试",
    runTest: "立即扫描",
    testSuccess: "测试成功",
    testError: "测试失败",
    testTesting: "正在扫描...",
    activeStatus: "可用",
    offlineStatus: "不可用",
    testingStatus: "检测中",
    saveSettings: "保存配置并返回",
    enterpriseMode: "企业托管",
    diyMode: "自定义 DIY"
  },
  en: {
    title: "AI SEO Platform",
    enterprise: "Enterprise",
    quota: "Credits",
    upgrade: "Upgrade",
    steps: ["Product", "Review", "Config", "Result"],
    generating: "AI is writing...",
    engine_status: "Smart Engine (SaaS)",
    diy_status: "DIY Mode (Private Key)",
    btn_next: "Next",
    btn_prev: "Back",
    btn_generate: "Generate Now",
    btn_restart: "Restart",
    system_config: "System Config",
    pricing_plans: "Upgrade Plans",
    page_jump: "Go",
    status_active: "Active",
    status_offline: "Offline",
    searchPlaceholder: "Search products...",
    loadProduct: "Load Details",
    noProducts: "No products found",
    editTitle: "Data Verification",
    editTabContent: "Content",
    editTabImages: "Images",
    confirmContent: "Confirm & Next",
    configTitle: "Generation Strategy",
    targetLanguage: "Output Language",
    outputFormat: "Output Format",
    advancedMode: "Advanced Params",
    webSearch: "Web Search (RAG)",
    reasoningEffort: "Reasoning Effort",
    low: "Standard",
    medium: "Medium",
    high: "Deep",
    copy: "Copy",
    download: "Export",
    modelTesting: "Model Connectivity",
    runTest: "Scan Now",
    testSuccess: "Success",
    testError: "Error",
    testTesting: "Scanning...",
    activeStatus: "Active",
    offlineStatus: "Offline",
    testingStatus: "Testing",
    saveSettings: "Save & Close",
    enterpriseMode: "Enterprise",
    diyMode: "DIY Mode"
  }
};

const PROVIDERS_LIST = [
  { id: "doubao", name: "Doubao", icon: "💎", color: "bg-blue-500" },
  { id: "gpt", name: "ChatGPT", icon: "⭐", color: "bg-emerald-500" },
  { id: "anthropic", name: "Claude", icon: "🎨", color: "bg-orange-500" },
  { id: "gemini", name: "Gemini", icon: "✨", color: "bg-blue-400" },
  { id: "qwen", name: "Qwen", icon: "⛩️", color: "bg-purple-500" },
  { id: "perplexity", name: "Perplexity", icon: "🔮", color: "bg-teal-500" }
];

const DAILY_LIMITS = {
  normalText: 5,
  proText: 2,
  video: 1
};

const getModelTier = (model: string): 'normalText' | 'proText' => {
  const modelLower = model.toLowerCase();
  if (modelLower.includes('flash') || modelLower.includes('mini') || modelLower.includes('lite') || modelLower.includes('3.5')) {
    return 'normalText';
  }
  return 'proText';
};

export const App: React.FC = () => {
  // --- 1. 核心业务 Hooks ---
  const { settings, updateSettings, loading: settingsLoading } = useSettings();
  const { sendPrompt, sendVideoRequest, loading: aiLoading, error: aiError, result: aiResult, videoResult, videoPolling, clearResult } = useAI();
  const {
    loading: xoobayLoading,
    products: xoobayProducts,
    currentPage: xoobayPage,
    totalPages: xoobayTotalPages,
    searchProducts,
    loadProductAsPageContent,
  } = useXoobay();
  const { updatePageContent: updateSessionPageContent } = useSession();

  // --- 2. UI 状态管理 ---
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [step, setStep] = useState(1);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [modal, setModal] = useState<"upgrade" | "settings" | "account" | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [editTab, setEditTab] = useState<"text" | "images">("text");
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [jumpInputValue, setJumpInputValue] = useState("");

  // --- 视频生成状态 ---
  const [generationMode, setGenerationMode] = useState<"text" | "video">("text");
  const [videoConfig, setVideoConfig] = useState<VideoConfig>(DEFAULT_VIDEO_CONFIG);

  const [aiConfig, setAiConfig] = useState<AIConfig>(DEFAULT_AI_CONFIG);
  const [testingModels, setTestingModels] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, { status: string; message?: string }>>({});

  const t = locales[lang];

  // 自动触发视频生成 (改为仅作为防重复触发锁，不自动执行)
  const triggerGuard = useRef<string | null>(null);
  useEffect(() => {
    // 仅用于清理或状态追踪，不再自动调用 handleGenerate
    const currentTriggerKey = `${step}-${generationMode}`;

    // 如果不在第 3 步，或者切换了模式，或者当前没有正在进行的任务且已失败，则重置锁
    const isInactive = !videoPolling && !aiLoading;
    const isFailed = videoResult?.status === 'failed' || !!aiError;

    if (step !== 3 || generationMode !== 'video' || (isInactive && isFailed)) {
      if (triggerGuard.current === currentTriggerKey) {
        console.log('[App] Resetting trigger guard for retry or step change');
        triggerGuard.current = null;
      }
    }
  }, [step, generationMode, videoPolling, aiLoading, videoResult?.status, !!aiError]);

  // 计算当前选中的视频模型配置
  const currentVideoModelConfig = VIDEO_MODELS.find(m => m.name === videoConfig.model) || VIDEO_MODELS[0];

  // --- 3. Content Renderers (Professional) ---
  const renderInlineMarkdown = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      const boldMatch = remaining.match(/^(.*?)(\*\*|__)(.+?)\2(.*)$/s);
      if (boldMatch) {
        if (boldMatch[1]) parts.push(<span key={key++}>{boldMatch[1]}</span>);
        parts.push(<strong key={key++} className="font-bold text-slate-900">{boldMatch[3]}</strong>);
        remaining = boldMatch[4];
        continue;
      }
      const codeMatch = remaining.match(/^(.*?)`([^`]+)`(.*)$/s);
      if (codeMatch) {
        if (codeMatch[1]) parts.push(<span key={key++}>{codeMatch[1]}</span>);
        parts.push(<code key={key++} className="px-1.5 py-0.5 bg-slate-100 text-blue-700 rounded text-sm font-mono">{codeMatch[2]}</code>);
        remaining = codeMatch[3];
        continue;
      }
      parts.push(<span key={key++}>{remaining}</span>);
      break;
    }
    return parts.length === 1 ? parts[0] : <>{parts}</>;
  };

  const renderMarkdown = (markdown: string) => {
    const lines = markdown.split("\n");
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={"ul-" + elements.length} className="list-disc list-inside space-y-1 my-3 text-slate-600 pl-2">
            {listItems.map((item, i) => <li key={i}>{renderInlineMarkdown(item)}</li>)}
          </ul>
        );
        listItems = [];
      }
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("# ")) {
        flushList();
        elements.push(<h1 key={index} className="text-2xl font-bold text-slate-900 mt-6 mb-3">{renderInlineMarkdown(trimmed.slice(2))}</h1>);
      } else if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(<h2 key={index} className="text-xl font-bold text-slate-900 mt-5 mb-2 border-b border-slate-100 pb-2">{renderInlineMarkdown(trimmed.slice(3))}</h2>);
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        listItems.push(trimmed.slice(2));
      } else if (trimmed) {
        flushList();
        elements.push(<p key={index} className="text-slate-600 my-2 leading-relaxed">{renderInlineMarkdown(trimmed)}</p>);
      } else {
        flushList();
        elements.push(<div key={index} className="h-2" />);
      }
    });

    flushList();
    return elements;
  };

  const renderResult = (content: string, format: string) => {
    if (format === "html") {
      return <div className="prose prose-slate max-w-none text-sm" dangerouslySetInnerHTML={{ __html: content }} />;
    }
    if (format === "json") {
      try {
        const data = JSON.parse(content.replace(/```json\s*|```/g, ""));
        return <pre className="text-xs p-4 bg-slate-100 rounded-xl overflow-x-auto font-mono">{JSON.stringify(data, null, 2)}</pre>;
      } catch {
        return <pre className="text-xs p-4 bg-slate-100 rounded-xl whitespace-pre-wrap font-mono">{content}</pre>;
      }
    }
    return <div className="text-sm">{renderMarkdown(content)}</div>;
  };

  // --- 4. Logic Handlers ---
  const handleXoobaySearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    const xoobayLang: XoobayLanguage = lang === "zh" ? "zh_cn" : "en";
    searchProducts({ pageNo: 1, name: searchTerm }, { lang: xoobayLang });
    setJumpInputValue("");
  };

  const handlePageJump = () => {
    const page = parseInt(jumpInputValue);
    if (!isNaN(page) && page > 0 && page <= xoobayTotalPages) {
      const xoobayLang: XoobayLanguage = lang === "zh" ? "zh_cn" : "en";
      searchProducts({ pageNo: page, name: searchTerm }, { lang: xoobayLang });
    }
  };

  const handleSelectProduct = async (productId: number) => {
    const xoobayLang: XoobayLanguage = lang === "zh" ? "zh_cn" : "en";
    const content = await loadProductAsPageContent(productId, { lang: xoobayLang });
    if (content) {
      setPageContent(content);
      setEditedContent(content.text);
      setSelectedImages(content.images || []);
      setSelectedProductId(productId);
    }
  };

  const handleNext = () => {
    if (step === 1 && pageContent) {
      setStep(2);
    } else if (step === 2) {
      updateSessionPageContent({ ...pageContent!, text: editedContent });
      setStep(3);
    } else if (step === 3) {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    // 针对视频生成的防重复触发保护
    if (generationMode === 'video') {
      const currentTriggerKey = `${step}-${generationMode}`;
      if (triggerGuard.current === currentTriggerKey) {
        console.warn('[App] Video generation already in progress for this step. Ignoring duplicate request.');
        return;
      }
      triggerGuard.current = currentTriggerKey;
    }

    // 检查每日限制 (仅在内部 API 模式下)
    if (settings.apiMode === 'internal') {
      const usage = settings.dailyUsage || { normalText: 0, proText: 0, video: 0 };
      if (generationMode === 'text') {
        const tier = getModelTier(settings.model);
        if (usage[tier] >= DAILY_LIMITS[tier]) {
          window.alert(`今日${tier === 'normalText' ? '轻量级' : '专业级'}试用额度已用完，请购买点数或明日再试。`);
          return;
        }
      } else {
        if (usage.video >= DAILY_LIMITS.video) {
          window.alert('今日视频生成试用额度已用完，请购买点数或明日再试。');
          return;
        }
      }
    }

    setStep(4);

    try {
      if (generationMode === "text") {
        // 文本生成逻辑
        let userPrompt = editedContent;
        if (selectedImages.length > 0) {
          userPrompt += "\n\n---\n\n## References Images:\n";
          selectedImages.forEach((img, i) => {
            userPrompt += `${i + 1}. ![${img.alt || "IMG"}](${img.src})\n`;
          });
        }

        const systemPrompt = buildSystemPrompt(
          aiConfig.outputLanguage,
          aiConfig.outputFormat,
          aiConfig.reasoningEffort,
          aiConfig.enableWebSearch,
          settings.brandName,
          settings.companyName
        );

        const res = await sendPrompt(userPrompt, settings, { ...aiConfig, systemPrompt });

        // 生成成功，增加消耗计次 (仅在内部模式)
        if (res && settings.apiMode === 'internal') {
          const tier = getModelTier(settings.model);
          const newUsage = { ...settings.dailyUsage, [tier]: (settings.dailyUsage?.[tier] || 0) + 1 };
          updateSettings({ dailyUsage: newUsage as any });
        }
      } else {
        // 视频生成逻辑
        const videoSystemPrompt = buildVideoSystemPrompt({
          modelName: videoConfig.model,
          minDuration: videoConfig.duration,
          maxDuration: videoConfig.duration,
          aspectRatio: `${videoConfig.width}:${videoConfig.height}`,
          brandName: settings.brandName || videoConfig.brandName,
          brandUrl: videoConfig.brandUrl,
          targetLanguage: videoConfig.targetLanguage,
          videoStyle: videoConfig.videoStyle,
          enableSound: videoConfig.enableSound,
          useImageReference: videoConfig.useImageReference,
          referenceImageUrl: videoConfig.referenceImageUrl || undefined,
        });

        const res = await sendVideoRequest(editedContent, videoSystemPrompt, videoConfig, settings);

        // 视频请求发出成功 (只有未报错时才计次)
        if (res && res.status !== 'failed' && settings.apiMode === 'internal') {
          const newUsage = { ...settings.dailyUsage, video: (settings.dailyUsage?.video || 0) + 1 };
          updateSettings({ dailyUsage: newUsage as any });
        }
      }
    } catch (err) {
      console.error("Generation failed:", err);
    }
  };

  const handleRestart = () => {
    setStep(1);
    clearResult();
    triggerGuard.current = null;
    setSelectedProductId(null);
    setPageContent(null);
    setEditedContent("");
    setSearchTerm("");
  };

  const resetUsage = () => {
    const today = new Date().toISOString().split('T')[0];
    const emptyUsage = {
      date: today,
      normalText: 0,
      proText: 0,
      video: 0
    };
    updateSettings({ dailyUsage: emptyUsage as any });
    window.alert('试用额度已重置！您可以继续测试。');
  };

  const handleTestAllModels = async () => {
    if (testingModels) return;
    setTestingModels(true);
    setTestResults({});

    for (const provider of PROVIDERS_LIST) {
      setTestResults(prev => ({ ...prev, [provider.id]: { status: "testing" } }));
      try {
        const models = PROVIDER_MODELS[provider.id as keyof typeof PROVIDER_MODELS];
        if (!models?.length) {
          setTestResults(prev => ({ ...prev, [provider.id]: { status: "error" } }));
          continue;
        }
        const testSettings = { ...settings, provider: provider.id as any, model: models[0], apiMode: "internal" as const };
        const res = await sendToAI("hi", testSettings, DEFAULT_AI_CONFIG);
        setTestResults(prev => ({ ...prev, [provider.id]: { status: res.error ? "error" : "success" } }));
      } catch {
        setTestResults(prev => ({ ...prev, [provider.id]: { status: "error" } }));
      }
      await new Promise(r => setTimeout(r, 200));
    }
    setTestingModels(false);
  };

  // Initial Sync
  useEffect(() => {
    handleXoobaySearch();
  }, [lang]);

  if (settingsLoading) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col antialiased">
      {/* --- Header --- */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-6 h-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
            <Zap className="text-white w-8 h-8 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight uppercase leading-none">{t.title}</h1>
            <p className="text-xs text-blue-600 font-bold mt-1.5 tracking-widest uppercase">{t.enterprise}</p>
          </div>
        </div>

        <div className="flex items-center gap-5">
          <div onClick={() => setModal("account")} className="hidden md:flex items-center gap-4 bg-slate-100 px-5 py-3 rounded-full border border-slate-200 cursor-pointer hover:bg-slate-200 transition-all">
            <div className="flex flex-col items-end leading-none">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{t.quota}</span>
              <span className="text-sm font-bold text-slate-700 mt-1">
                {(settings?.usageLimit || 0) - (settings?.usageCount || 0)} <span className="text-slate-400 font-medium">PTS</span>
              </span>
            </div>
            <div className="w-px h-6 bg-slate-300"></div>
            <button onClick={(e) => { e.stopPropagation(); setModal("upgrade"); }} className="text-sm font-black text-blue-600 uppercase hover:text-blue-700">{t.upgrade}</button>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button onClick={() => setLang("zh")} className={`px-3 py-2 text-xs font-black rounded-lg transition-all ${lang === "zh" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>中</button>
            <button onClick={() => setLang("en")} className={`px-3 py-2 text-xs font-black rounded-lg transition-all ${lang === "en" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400"}`}>EN</button>
          </div>

          <button onClick={() => setModal("settings")} className="p-3 text-slate-400 hover:bg-slate-100 rounded-xl transition-all">
            <SettingsIcon className="w-6 h-6" />
          </button>
          <div onClick={() => setModal("account")} className="w-11 h-11 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center cursor-pointer hover:scale-105 transition-all">
            <UserIcon className="w-5 h-5 text-slate-500" />
          </div>
        </div>
      </nav>

      {/* --- Main Workflow --- */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col">
        <div className="w-full max-w-2xl mx-auto mb-10">
          <div className="flex items-center justify-between px-2">
            {t.steps.map((s, idx) => (
              <React.Fragment key={idx}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${step === idx + 1 ? "bg-blue-600 text-white shadow-xl shadow-blue-100 ring-4 ring-blue-50" :
                    step > idx + 1 ? "bg-emerald-500 text-white shadow-lg" : "bg-white text-slate-300 border border-slate-200"
                    }`}>
                    {step > idx + 1 ? <CheckCircle2 className="w-5 h-5" /> : (
                      idx === 0 ? <Search className="w-4 h-4" /> :
                        idx === 1 ? <FileText className="w-4 h-4" /> :
                          idx === 2 ? <Sparkles className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />
                    )}
                  </div>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${step === idx + 1 ? "text-blue-600" : "text-slate-400"}`}>{s}</span>
                </div>
                {idx < 3 && <div className={`flex-1 h-0.5 mx-4 transition-colors duration-700 ${step > idx + 1 ? "bg-emerald-500" : "bg-slate-200"}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/40 flex flex-col animate-fadeIn relative overflow-hidden">
          {/* Step 1: Product Selection */}
          {step === 1 && (
            <div className="p-8 lg:p-12 flex-1 flex flex-col animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.noProducts === "No products found" ? "Select Data Source" : "选择产品数据源"}</h2>
              </div>
              <p className="text-slate-400 text-base font-medium mb-10 pl-14 leading-relaxed">通过名称搜索或在列表中直接选择产品进行 AI SEO 优化</p>

              <form onSubmit={handleXoobaySearch} className="relative flex gap-3 mb-8">
                <div className="relative flex-1 group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-14 pr-6 py-6 bg-slate-50 border border-slate-100 rounded-3xl text-base font-bold outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-200 transition-all shadow-inner"
                    placeholder={t.searchPlaceholder}
                  />
                </div>
                <button type="submit" className="px-10 py-6 bg-slate-900 text-white rounded-3xl text-sm font-black shadow-xl hover:bg-blue-600 transition-all active:scale-95">
                  {lang === "zh" ? "立即搜索" : "Search"}
                </button>
              </form>

              <div className="flex-1 overflow-y-auto max-h-[700px] pr-2 scrollbar-thin">
                <div className="grid grid-cols-2 gap-4">
                  {xoobayLoading ? (
                    <div className="col-span-2 flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                      <RefreshCw className="w-10 h-10 animate-spin text-blue-600" />
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600">{t.loadProduct}...</span>
                    </div>
                  ) : xoobayProducts.length === 0 ? (
                    <div className="col-span-2 text-center py-20 bg-slate-50/50 rounded-[2rem] border border-dashed border-slate-200">
                      <Package className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                      <p className="text-sm font-bold text-slate-400">{t.noProducts}</p>
                    </div>
                  ) : (
                    xoobayProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => handleSelectProduct(p.id)}
                        className={`group p-4 border-2 rounded-3xl cursor-pointer transition-all flex items-center gap-5 ${selectedProductId === p.id
                          ? "border-blue-600 bg-blue-50/30 shadow-lg shadow-blue-50"
                          : "border-slate-50 hover:border-slate-200 bg-white"
                          }`}
                      >
                        <div className="relative">
                          <img src={p.img_logo} className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm transition-transform group-hover:scale-105" alt={p.name} />
                          {selectedProductId === p.id && (
                            <div className="absolute -top-2 -right-2 bg-blue-600 text-white p-1 rounded-full shadow-lg border-2 border-white ring-4 ring-blue-50">
                              <CheckCircle2 className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-700 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.name}</p>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-[10px] text-blue-600 font-extrabold bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">${p.money}</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Product ID: {p.id}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-5 h-5 transition-all ${selectedProductId === p.id ? "text-blue-600 translate-x-1" : "text-slate-200 group-hover:text-slate-400"}`} />
                      </div>
                    ))
                  )}
                </div>
              </div>

              {xoobayTotalPages > 1 && (
                <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-2xl border border-slate-100 shadow-sm">
                    <button
                      onClick={() => handleXoobaySearch()}
                      disabled={xoobayPage === 1}
                      className="p-2 hover:bg-white hover:text-blue-600 rounded-xl disabled:opacity-30 transition-all hover:shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-slate-500 min-w-[3rem] text-center uppercase tracking-widest leading-none">
                      {xoobayPage} <span className="text-slate-300">/</span> {xoobayTotalPages}
                    </span>
                    <button
                      onClick={() => searchProducts({ pageNo: xoobayPage + 1, name: searchTerm }, { lang: lang === "zh" ? "zh_cn" : "en" })}
                      disabled={xoobayPage === xoobayTotalPages}
                      className="p-2 hover:bg-white hover:text-blue-600 rounded-xl disabled:opacity-30 transition-all hover:shadow-sm"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={jumpInputValue}
                      onChange={(e) => setJumpInputValue(e.target.value)}
                      className="w-16 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-center outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/10 transition-all shadow-inner"
                      placeholder="GO"
                    />
                    <button onClick={handlePageJump} className="px-5 py-2.5 bg-slate-900 text-white text-[10px] font-black rounded-xl uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                      {t.page_jump}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Content Review */}
          {step === 2 && (
            <div className="p-8 lg:p-12 flex-1 flex flex-col animate-in slide-in-from-right-10 duration-500">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.editTitle}</h2>
                </div>
                <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => setEditTab("text")}
                    className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-2 ${editTab === "text" ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200" : "text-slate-400"
                      }`}
                  >
                    <Type className="w-3.5 h-3.5" /> {t.editTabContent}
                  </button>
                  <button
                    onClick={() => setEditTab("images")}
                    className={`px-5 py-2 text-[10px] font-black uppercase rounded-xl transition-all flex items-center gap-2 ${editTab === "images" ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200" : "text-slate-400"
                      }`}
                  >
                    <Layout className="w-3.5 h-3.5" /> {t.editTabImages}
                  </button>
                </div>
              </div>

              <div className="flex-1 min-h-[400px] flex flex-col">
                {editTab === "text" ? (
                  <div className="relative flex-1 group">
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full h-full min-h-[700px] p-10 bg-slate-50 border border-slate-100 rounded-[2.5rem] text-base font-medium leading-loose outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner scrollbar-thin"
                    />
                    <div className="absolute top-6 right-6 p-2 bg-white/80 backdrop-blur-md rounded-xl border border-slate-100 shadow-sm pointer-events-none text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                      Rich Editor
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {pageContent?.images?.map((img, idx) => {
                      const isSelected = selectedImages.some(i => i.src === img.src);
                      return (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedImages(prev => isSelected ? prev.filter(i => i.src !== img.src) : [...prev, img]);
                          }}
                          className={`group relative aspect-square rounded-[2rem] overflow-hidden border-4 transition-all cursor-pointer ${isSelected ? "border-blue-600 shadow-xl shadow-blue-100 scale-[0.98]" : "border-slate-50 hover:border-slate-200"
                            }`}
                        >
                          <img src={img.src} alt={img.alt} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" title={img.alt} />
                          <div className={`absolute inset-0 bg-blue-600/10 transition-opacity ${isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`} />
                          {isSelected && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white p-2 rounded-2xl shadow-xl ring-4 ring-blue-50">
                              <CheckCircle2 className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Strategy Config */}
          {step === 3 && (
            <div className="p-8 lg:p-12 flex-1 animate-in slide-in-from-right-10 duration-500 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tight">{t.configTitle}</h2>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50/50 rounded-2xl border border-blue-100 shadow-sm animate-pulse">
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                    {settings.apiMode === "internal" ? t.enterpriseMode : t.diyMode}
                  </span>
                </div>
              </div>

              {/* 文本/视频模式切换 */}
              <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200 mb-8">
                <button
                  onClick={() => setGenerationMode("text")}
                  className={`flex-1 px-6 py-3 text-sm font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${generationMode === "text" ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200" : "text-slate-400"
                    }`}
                >
                  <Type className="w-4 h-4" /> 文本生成
                </button>
                <button
                  onClick={() => setGenerationMode("video")}
                  className={`flex-1 px-6 py-3 text-sm font-black uppercase rounded-xl transition-all flex items-center justify-center gap-2 ${generationMode === "video" ? "bg-white text-blue-600 shadow-md ring-1 ring-slate-200" : "text-slate-400"
                    }`}
                >
                  <Film className="w-4 h-4" /> 视频生成
                </button>
              </div>

              {/* 文本生成配置 */}
              {generationMode === "text" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Languages className="w-3.5 h-3.5" /> {t.targetLanguage}
                      </label>
                      <div className="relative group">
                        <select
                          value={aiConfig.outputLanguage}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, outputLanguage: e.target.value }))}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-base font-bold shadow-inner outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                        >
                          {OUTPUT_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-blue-500 transition-colors w-4 h-4" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Layout className="w-3.5 h-3.5" /> {t.outputFormat}
                      </label>
                      <div className="relative group">
                        <select
                          value={aiConfig.outputFormat}
                          onChange={(e) => setAiConfig(prev => ({ ...prev, outputFormat: e.target.value }))}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-base font-bold shadow-inner outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                        >
                          {OUTPUT_FORMATS.map(f => <option key={f.code} value={f.code}>{f.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-blue-500 transition-colors w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-3 text-[11px] font-black text-slate-900 bg-slate-100 px-6 py-3 rounded-2xl hover:bg-slate-200 transition-all active:scale-95 border border-slate-200 uppercase tracking-widest"
                  >
                    {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    {t.advancedMode}
                  </button>

                  {showAdvanced && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 shadow-inner animate-in slide-in-from-top-4 duration-500">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{t.webSearch}</span>
                            <span className="text-[10px] text-slate-400 font-medium">通过互联网实时增强内容深度</span>
                          </div>
                          <button
                            onClick={() => setAiConfig(prev => ({ ...prev, enableWebSearch: !prev.enableWebSearch }))}
                            className={`w-14 h-8 rounded-full relative transition-all shadow-sm ${aiConfig.enableWebSearch ? "bg-emerald-500 shadow-emerald-200" : "bg-slate-300"}`}
                          >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all ${aiConfig.enableWebSearch ? "left-7 shadow-emerald-600/20" : "left-1"}`} />
                          </button>
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">{t.reasoningEffort}</label>
                          <div className="flex bg-slate-200/50 p-1.5 rounded-[1.5rem] border border-slate-200">
                            {["low", "medium", "high"].map(v => (
                              <button
                                key={v}
                                onClick={() => setAiConfig(prev => ({ ...prev, reasoningEffort: v as "low" | "medium" | "high" }))}
                                className={`flex-1 py-3 text-[10px] font-black uppercase rounded-2xl transition-all ${aiConfig.reasoningEffort === v ? "bg-white text-blue-600 shadow-xl ring-1 ring-slate-200" : "text-slate-400 hover:text-slate-600"
                                  }`}
                              >
                                {(t as any)[v]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/60 p-6 rounded-3xl border border-slate-100 flex flex-col items-center justify-center text-center">
                        <ShieldCheck className="w-10 h-10 text-blue-100 mb-3" />
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                          Powered by <span className="text-blue-600">XOOER AI SEO Engine</span><br />
                          SLA Guaranteed
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* 视频生成配置 */}
              {generationMode === "video" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 视频模型选择 */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Film className="w-3.5 h-3.5" /> 视频模型
                      </label>
                      <div className="relative group">
                        <select
                          value={videoConfig.model}
                          onChange={(e) => {
                            const newModel = e.target.value as any;
                            const modelDef = VIDEO_MODELS.find(m => m.name === newModel);
                            setVideoConfig(prev => ({
                              ...prev,
                              model: newModel,
                              duration: modelDef?.maxDuration ? Math.min(prev.duration, modelDef.maxDuration) : prev.duration,
                              width: modelDef?.defaultWidth || prev.width,
                              height: modelDef?.defaultHeight || prev.height
                            }));
                          }}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-base font-bold shadow-inner outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                        >
                          {VIDEO_MODELS.map(m => <option key={m.name} value={m.name}>{m.displayName}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-blue-500 transition-colors w-4 h-4" />
                      </div>
                    </div>

                    {/* 目标语言 */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Languages className="w-3.5 h-3.5" /> 目标语言
                      </label>
                      <div className="relative group">
                        <select
                          value={videoConfig.targetLanguage}
                          onChange={(e) => setVideoConfig(prev => ({ ...prev, targetLanguage: e.target.value as any }))}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-base font-bold shadow-inner outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                        >
                          {VIDEO_OUTPUT_LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.flag} {l.label}</option>)}
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-blue-500 transition-colors w-4 h-4" />
                      </div>
                    </div>

                    {/* 视频时长 */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5" /> 视频时长
                        </label>
                        <span className="text-sm font-black text-blue-600">{videoConfig.duration}s</span>
                      </div>
                      <div className="px-2">
                        <input
                          type="range"
                          min={currentVideoModelConfig.minDuration}
                          max={currentVideoModelConfig.maxDuration}
                          step={currentVideoModelConfig.durationStep}
                          value={videoConfig.duration}
                          onChange={(e) => setVideoConfig(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                        />
                        <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-bold">
                          <span>{currentVideoModelConfig.minDuration}s</span>
                          <span>{currentVideoModelConfig.maxDuration}s</span>
                        </div>
                      </div>
                    </div>

                    {/* 分辨率 */}
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                        <Maximize className="w-3.5 h-3.5" /> 分辨率 / 画幅
                      </label>
                      <div className="relative group">
                        <select
                          value={`${videoConfig.width}x${videoConfig.height}`}
                          onChange={(e) => {
                            const [w, h] = e.target.value.split('x').map(Number);
                            setVideoConfig(prev => ({ ...prev, width: w, height: h }));
                          }}
                          className="w-full p-6 bg-slate-50 border border-slate-100 rounded-3xl text-base font-bold shadow-inner outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all appearance-none cursor-pointer"
                        >
                          <option value="1920x1080">16:9 电影广角 (1920x1080)</option>
                          <option value="1280x720">16:9 标准高清 (1280x720)</option>
                          <option value="1080x1920">9:16 竖屏短视频 (1080x1920)</option>
                          <option value="720x1280">9:16 竖屏流畅 (720x1280)</option>
                          <option value="1024x1024">1:1 正方形 (1024x1024)</option>
                        </select>
                        <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none group-hover:text-blue-500 transition-colors w-4 h-4" />
                      </div>
                    </div>
                  </div>

                  {/* 视频风格选择 */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">视频风格</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {VIDEO_STYLES.map(style => (
                        <button
                          key={style.code}
                          onClick={() => setVideoConfig(prev => ({ ...prev, videoStyle: style.code as any }))}
                          className={`p-6 rounded-3xl border-2 transition-all text-left ${videoConfig.videoStyle === style.code
                            ? "border-blue-600 bg-blue-50/30 shadow-lg shadow-blue-50"
                            : "border-slate-100 bg-white hover:border-slate-200"
                            }`}
                        >
                          <div className="text-3xl mb-3">{style.icon}</div>
                          <div className="text-sm font-black text-slate-800 mb-1">{style.label}</div>
                          <div className="text-[10px] text-slate-400 font-medium leading-relaxed">{style.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Gen Result */}
          {step === 4 && (
            <div className="p-8 lg:p-12 flex-1 flex flex-col animate-in scale-in-95 duration-500">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all ${(aiLoading || videoPolling) ? "bg-blue-600 animate-pulse text-white" :
                    (aiResult || (videoResult && videoResult.status === 'completed')) ? "bg-emerald-500 text-white" :
                      "bg-red-500 text-white"
                    }`}>
                    {(aiLoading || videoPolling) ? <RefreshCw className="w-5 h-5 animate-spin" /> :
                      (aiResult || (videoResult && videoResult.status === 'completed')) ? <CheckCircle2 className="w-5 h-5" /> :
                        <AlertCircle className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                      {generationMode === "text" ? (
                        aiLoading ? t.generating : "Content Optimized"
                      ) : (
                        videoPolling ? "视频生成中..." :
                          videoResult?.status === 'completed' ? "视频生成完成" :
                            videoResult?.status === 'failed' ? "视频生成失败" :
                              aiLoading ? "准备生成视频..." : "视频生成"
                      )}
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">
                      {generationMode === "text" ? (
                        aiLoading ? "Deep Neural processing..." : "Ready for deployment"
                      ) : (
                        videoPolling ? `Processing... ${videoResult?.progress || 0}%` :
                          videoResult?.status === 'completed' ? "Ready to download" :
                            videoResult?.status === 'failed' ? "Please try again" :
                              "Preparing video generation"
                      )}
                    </p>
                  </div>
                </div>

                {/* 文本结果操作按钮 */}
                {generationMode === "text" && !aiLoading && !aiError && aiResult && (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        const blob = new Blob([aiResult], { type: "text/markdown" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = `SEO_Content_${Date.now()}.md`;
                        a.click();
                      }}
                      className="px-6 py-3 bg-slate-900 font-black text-white rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    >
                      <DownloadCloud className="w-4 h-4" /> {t.download}
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(aiResult);
                        window.alert("Copied!");
                      }}
                      className="p-3 bg-slate-100 text-slate-500 rounded-2xl border border-slate-200 hover:text-blue-600 hover:bg-white transition-all shadow-sm"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* 视频结果操作按钮 */}
                {generationMode === "video" && videoResult?.status === 'completed' && videoResult.videoUrl && (
                  <div className="flex gap-3">
                    <a
                      href={videoResult.videoUrl}
                      download={`Video_${Date.now()}.mp4`}
                      className="px-6 py-3 bg-slate-900 font-black text-white rounded-2xl text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-xl active:scale-95"
                    >
                      <DownloadCloud className="w-4 h-4" /> 下载视频
                    </a>
                    <button
                      onClick={() => {
                        if (videoResult.prompt) {
                          navigator.clipboard.writeText(videoResult.prompt);
                          window.alert("视频提示词已复制!");
                        }
                      }}
                      className="p-3 bg-slate-100 text-slate-500 rounded-2xl border border-slate-200 hover:text-blue-600 hover:bg-white transition-all shadow-sm"
                      title="复制视频提示词"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1 min-h-[400px] flex flex-col">
                {/* 文本生成结果 */}
                {generationMode === "text" && (
                  <>
                    {aiError ? (
                      <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 flex flex-col items-center justify-center text-center animate-in shake duration-500">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-black text-red-700 uppercase">{t.testError}</h3>
                        <p className="text-sm text-red-600/80 font-medium mt-2 max-w-sm">{aiError}</p>
                        <button onClick={handleGenerate} className="mt-8 px-8 py-4 bg-red-600 text-white rounded-3xl text-xs font-black shadow-lg shadow-red-200 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" /> 重新生成
                        </button>
                      </div>
                    ) : (
                      <div className="relative flex-1 group">
                        <div className="absolute inset-0 p-1 bg-gradient-to-br from-blue-500/10 to-emerald-500/10 rounded-[3rem] -z-10 blur-2xl opacity-50" />
                        <div className="w-full h-full p-10 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl overflow-y-auto scrollbar-thin">
                          {aiLoading && !aiResult ? (
                            <div className="space-y-6 opacity-30 animate-pulse">
                              {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className={`h-4 bg-slate-300 rounded-full ${i % 2 === 0 ? "w-3/4" : "w-full"}`} />
                              ))}
                            </div>
                          ) : (
                            renderResult(aiResult || "", aiConfig.outputFormat)
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 视频生成结果 */}
                {generationMode === "video" && (
                  <>
                    {videoResult?.status === 'failed' || (aiError && !videoResult) ? (
                      <div className="p-8 bg-red-50 rounded-[2.5rem] border border-red-100 flex flex-col items-center justify-center text-center animate-in shake duration-500">
                        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-black text-red-700 uppercase">视频生成失败</h3>
                        <p className="text-sm text-red-600/80 font-medium mt-2 max-w-sm">
                          {typeof videoResult?.error === 'object' ? JSON.stringify(videoResult.error) : (videoResult?.error || aiError || "视频生成过程中出现错误")}
                        </p>
                        {videoResult?.prompt && (
                          <div className="mt-4 p-4 bg-white rounded-2xl border border-red-200 max-w-lg">
                            <p className="text-xs text-slate-600 font-medium">生成的提示词：</p>
                            <p className="text-sm text-slate-800 mt-2 leading-relaxed">{videoResult.prompt}</p>
                          </div>
                        )}
                        <button onClick={handleGenerate} className="mt-8 px-8 py-4 bg-red-600 text-white rounded-3xl text-xs font-black shadow-lg shadow-red-200 flex items-center gap-2">
                          <RefreshCw className="w-4 h-4" /> 重新生成
                        </button>
                      </div>
                    ) : videoResult?.status === 'completed' && videoResult.videoUrl ? (
                      <div className="relative flex-1 group">
                        <div className="absolute inset-0 p-1 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-[3rem] -z-10 blur-2xl opacity-50" />
                        <div className="w-full h-full p-10 bg-white/60 backdrop-blur-xl border border-white/40 rounded-[2.5rem] shadow-2xl flex flex-col gap-6">
                          {/* 视频播放器 */}
                          <div className="relative rounded-3xl overflow-hidden bg-black shadow-2xl">
                            <video
                              src={videoResult.videoUrl}
                              controls
                              className="w-full h-auto"
                              style={{ maxHeight: '600px' }}
                            >
                              您的浏览器不支持视频播放
                            </video>
                          </div>

                          {/* 视频信息 */}
                          {videoResult.prompt && (
                            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                              <div className="flex items-center gap-2 mb-3">
                                <Film className="w-4 h-4 text-purple-600" />
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">视频提示词</h4>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{videoResult.prompt}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="relative flex-1 flex items-center justify-center">
                        <div className="text-center space-y-6">
                          {/* 轮询进度 */}
                          {videoPolling && (
                            <>
                              <div className="relative w-32 h-32 mx-auto">
                                <svg className="w-32 h-32 transform -rotate-90">
                                  <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    className="text-slate-200"
                                  />
                                  <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    stroke="currentColor"
                                    strokeWidth="8"
                                    fill="none"
                                    strokeDasharray={`${2 * Math.PI * 56}`}
                                    strokeDashoffset={`${2 * Math.PI * 56 * (1 - (videoResult?.progress || 0) / 100)}`}
                                    className="text-blue-600 transition-all duration-500"
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <span className="text-2xl font-black text-slate-800">{videoResult?.progress || 0}%</span>
                                </div>
                              </div>
                              <p className="text-base font-bold text-slate-600">视频生成中，请稍候...</p>
                              <p className="text-sm text-slate-400">这可能需要几分钟时间</p>
                            </>
                          )}

                          {/* 初始加载 */}
                          {aiLoading && !videoPolling && !videoResult && (
                            <>
                              <RefreshCw className="w-16 h-16 text-blue-600 animate-spin mx-auto" />
                              <p className="text-base font-bold text-slate-600">正在准备视频生成...</p>
                            </>
                          )}

                          {/* 显示生成的提示词（pending状态） */}
                          {videoResult?.prompt && (videoResult.status === 'pending' || videoResult.status === 'processing') && (
                            <div className="mt-6 p-6 bg-blue-50 rounded-3xl border border-blue-100 max-w-2xl mx-auto">
                              <div className="flex items-center gap-2 mb-3">
                                <Film className="w-4 h-4 text-blue-600" />
                                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">生成的视频提示词</h4>
                              </div>
                              <p className="text-sm text-slate-600 leading-relaxed">{videoResult.prompt}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {!aiLoading && (
                <div className="mt-10 flex justify-center">
                  <button onClick={handleRestart} className="flex items-center gap-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors">
                    <RefreshCw className="w-4 h-4" /> {t.btn_restart}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Controls */}
          {step < 4 && (
            <div className="sticky bottom-0 z-20 p-6 bg-white/95 backdrop-blur-sm border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setStep(prev => prev - 1)}
                disabled={step === 1 || aiLoading}
                className={`text-xs font-black uppercase px-8 py-3 rounded-2xl transition-all ${step === 1 ? "opacity-0 pointer-events-none" : "text-slate-400 hover:bg-slate-50 border border-transparent hover:border-slate-100"
                  }`}
              >
                {t.btn_prev}
              </button>
              <button
                onClick={handleNext}
                disabled={aiLoading || (step === 1 && !selectedProductId)}
                className="bg-slate-900 text-white px-12 py-5 rounded-3xl text-xs font-black shadow-2xl shadow-slate-200 hover:bg-blue-600 hover:shadow-blue-200 flex items-center gap-3 transition-all active:scale-95 disabled:opacity-30 disabled:shadow-none"
              >
                {step === 3 ? (
                  <>{t.btn_generate} <Zap className="w-4 h-4 fill-current animate-bounce" /></>
                ) : (
                  <>{t.btn_next} <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </div>
          )}
        </div>
      </main>

      {/* --- MODALS --- */}

      {/* Account Modal */}
      {modal === "account" && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[3rem] shadow-2xl p-10 relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setModal(null)} className="absolute top-8 right-8 p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-all"><X className="w-6 h-6" /></button>
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border-8 border-white shadow-2xl shadow-slate-100 flex items-center justify-center mb-6 relative">
                <UserIcon className="w-10 h-10 text-slate-300" />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-2xl border-4 border-white shadow-lg" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">DEMO USER</h3>
              <p className="text-[10px] text-slate-400 mt-2 font-black uppercase tracking-widest flex items-center gap-2">
                <Mail className="w-3.5 h-3.5" /> support@example.com
              </p>
            </div>
            <div className="bg-slate-50/80 rounded-[2rem] p-8 border border-slate-100 mb-8 shadow-inner">
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest underline decoration-blue-500 decoration-2 underline-offset-4">Today's Usage</span>
                <span className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg shadow-blue-200">FREE TRIAL</span>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Normal Text</span>
                  <span className="text-xs font-bold text-slate-800">{settings.dailyUsage?.normalText || 0} / {DAILY_LIMITS.normalText}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Pro Text</span>
                  <span className="text-xs font-bold text-slate-800">{settings.dailyUsage?.proText || 0} / {DAILY_LIMITS.proText}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-200 pt-3">
                  <span className="text-[10px] font-black text-slate-500 uppercase">Video</span>
                  <span className="text-xs font-bold text-slate-800">{settings.dailyUsage?.video || 0} / {DAILY_LIMITS.video}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900 rounded-[2rem] p-8 border border-slate-800 mb-8 shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Credit Balance</span>
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white">{(settings?.usageLimit || 0) - (settings?.usageCount || 0)}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">PTS</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-slate-500 hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-95 uppercase tracking-widest shadow-sm"><History className="w-4 h-4" /> Records</button>
              <button className="flex items-center justify-center gap-2 py-4 border-2 border-slate-100 rounded-2xl text-[10px] font-black text-red-500 hover:bg-red-50 hover:border-red-100 transition-all active:scale-95 uppercase tracking-widest shadow-sm"><LogOut className="w-4 h-4" /> Log out</button>
            </div>
            <button
              onClick={resetUsage}
              className="w-full py-4 mb-8 border-2 border-blue-100 rounded-[2rem] text-[10px] font-black text-blue-600 hover:bg-blue-50 transition-all active:scale-95 uppercase tracking-[0.2em]"
            >
              Reset Daily Usage (Testing)
            </button>
            <button onClick={() => setModal("upgrade")} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] text-xs font-black shadow-2xl hover:bg-blue-600 transition-all active:scale-95 uppercase tracking-[0.2em]">Buy More Power</button>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {modal === "upgrade" && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl p-12 relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setModal(null)} className="absolute top-10 right-10 p-3 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all text-2xl font-light">&times;</button>
            <div className="text-center mb-12">
              <h3 className="text-3xl font-black text-slate-800 tracking-tight uppercase">Elevate your SEO power</h3>
              <p className="text-slate-400 text-sm font-medium mt-2">Unlock unlimited generations and priority processing</p>
            </div>
            <div className="space-y-8 max-h-[600px] overflow-y-auto pr-4 scrollbar-thin">
              {/* Refill Section */}
              <div className="p-10 border-4 border-blue-600 bg-blue-50/30 rounded-[3.5rem] relative shadow-2xl shadow-blue-100">
                <div className="absolute top-0 right-10 bg-blue-600 text-white text-[10px] font-black px-6 py-2 rounded-b-[1rem] uppercase tracking-[0.2em] shadow-lg">推荐方案</div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                  <div>
                    <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">PTS 点数包</div>
                    <div className="text-5xl font-black text-slate-900">$9<span className="text-sm font-medium text-slate-400"> / 50 PTS</span></div>
                  </div>
                  <button className="px-10 py-5 bg-blue-600 text-white rounded-2xl text-[10px] font-black shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all uppercase tracking-widest active:scale-95">立即充值</button>
                </div>

                <div className="h-px bg-blue-100 mb-8" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" /> 专业级生成 (Pro)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold ml-6 uppercase">消耗 5 PTS / 篇</p>
                    <p className="text-[10px] text-slate-400 ml-6">可生成 10 篇高品质博文<br />(约合 $0.9 / 篇)</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" /> 轻量级生成 (Normal)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold ml-6 uppercase">消耗 2 PTS / 篇</p>
                    <p className="text-[10px] text-slate-400 ml-6">可生成 25 篇博文<br />(约合 $0.36 / 篇)</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-500" /> 智能视频 (Video)
                    </h4>
                    <p className="text-[11px] text-slate-500 font-bold ml-6 uppercase">消耗 15 PTS / 次</p>
                    <p className="text-[10px] text-slate-400 ml-6">可生成 3 次短视频<br />(覆盖高昂渲染成本)</p>
                  </div>
                  <div className="flex flex-col justify-end">
                    <div className="bg-white/60 p-4 rounded-2xl border border-blue-50 flex items-center gap-3">
                      <Zap className="w-5 h-5 text-amber-500 fill-current" />
                      <span className="text-[10px] font-black text-slate-600 uppercase leading-tight">永久有效，无使用期限限制，全模型解锁</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Monthly Section (Simplified) */}
              <div className="p-10 border-2 border-slate-100 rounded-[3rem] bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-6 group hover:border-slate-200 transition-all">
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">企业无限订阅 (Monthly)</div>
                  <div className="text-2xl font-black text-slate-900">$29<span className="text-xs font-medium text-slate-400"> / 月</span></div>
                </div>
                <button className="px-8 py-4 bg-white border border-slate-200 rounded-2xl text-[10px] font-black text-slate-400 group-hover:bg-slate-900 group-hover:text-white transition-all uppercase tracking-widest active:scale-95 shadow-sm">联系销售咨询</button>
              </div>
            </div>
            <p className="text-center mt-10 text-[10px] font-medium text-slate-400 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" /> Secure Checkout by Stripe &bull; 7-day money back guarantee
            </p>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {modal === "settings" && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center">
                  <SettingsIcon className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">{t.system_config}</h3>
              </div>
              <button onClick={() => setModal(null)} className="p-2 text-slate-300 hover:text-slate-900 hover:bg-slate-100 rounded-2xl">&times;</button>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Engine Mode Selection</label>
                <div className="flex p-2 bg-slate-100 rounded-[1.5rem] border border-slate-200 shadow-inner">
                  <button
                    onClick={() => updateSettings({ apiMode: "internal" })}
                    className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${settings.apiMode === "internal" ? "bg-white text-blue-600 shadow-xl ring-1 ring-slate-200" : "text-slate-400"
                      }`}
                  >
                    {t.enterpriseMode}
                  </button>
                  <button
                    onClick={() => updateSettings({ apiMode: "custom" })}
                    className={`flex-1 py-4 text-[10px] font-black uppercase rounded-2xl transition-all ${settings.apiMode === "custom" ? "bg-white text-blue-600 shadow-xl ring-1 ring-slate-200" : "text-slate-400"
                      }`}
                  >
                    {t.diyMode}
                  </button>
                </div>
              </div>

              {settings.apiMode === "custom" ? (
                <div className="space-y-5 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest ml-2">
                      <Server className="w-3.5 h-3.5" /> API Base URL
                    </label>
                    <input
                      value={settings.baseUrl}
                      onChange={(e) => updateSettings({ baseUrl: e.target.value })}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                      placeholder="https://api.openai.com/v1"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-2 tracking-widest ml-2">
                      <KeyIcon className="w-3.5 h-3.5" /> Secret API Key
                    </label>
                    <div className="relative group">
                      <input
                        type="password"
                        value={settings.apiKey}
                        onChange={(e) => updateSettings({ apiKey: e.target.value })}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:ring-8 focus:ring-blue-500/5 transition-all shadow-inner"
                        placeholder="sk-..."
                      />
                      <ShieldCheck className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-200 group-focus-within:text-blue-500 transition-colors w-5 h-5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <span className="text-xs font-black text-slate-800 uppercase tracking-widest">{t.modelTesting}</span>
                    </div>
                    <button
                      onClick={handleTestAllModels}
                      disabled={testingModels}
                      className="text-[10px] font-black text-blue-600 hover:text-blue-700 underline decoration-2 underline-offset-4 disabled:opacity-30 uppercase tracking-widest"
                    >
                      {testingModels ? t.testTesting : t.runTest}
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {PROVIDERS_LIST.map((provider) => {
                      const res = testResults[provider.id];
                      const isTesting = res?.status === "testing";
                      const isSuccess = res?.status === "success";
                      const isError = res?.status === "error";

                      return (
                        <div
                          key={provider.id}
                          className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${isTesting ? "bg-slate-100 animate-pulse border-transparent" :
                            isSuccess ? "bg-emerald-50 border-emerald-100 shadow-lg shadow-emerald-500/20" :
                              isError ? "bg-red-50 border-red-100" : "bg-white border-slate-100"
                            }`}
                        >
                          <span className="text-lg grayscale-0 filter brightness-110">{provider.icon}</span>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-900 truncate w-full text-center">{provider.name}</span>
                          <div className="flex items-center gap-1.5 mt-1">
                            <div className={`w-2 h-2 rounded-full ${isSuccess ? "bg-emerald-500" : isError ? "bg-red-500" : "bg-slate-300"}`} />
                            <span className={`text-[8px] font-black uppercase ${isSuccess ? "text-emerald-600" : isError ? "text-red-600" : "text-slate-400"}`}>
                              {isSuccess ? t.activeStatus : isError ? t.offlineStatus : isTesting ? t.testingStatus : "Wait"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setModal(null)}
              className="w-full mt-12 py-5 bg-slate-900 text-white rounded-[2rem] text-[10px] font-black shadow-2xl hover:bg-blue-600 transition-all active:scale-95 uppercase tracking-[0.2em]"
            >
              {t.saveSettings}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;