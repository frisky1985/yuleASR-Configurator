import { Helmet } from 'react-helmet-async';
import { ExternalLink } from 'lucide-react';

export function YuleASRPage() {
  const configuratorUrl = `/yuleCommunity/configurator/`;

  return (
    <div className="min-h-screen pt-16 flex flex-col">
      <Helmet>
        <title>ASR 配置器 - YuleTech</title>
      </Helmet>

      {/* Toolbar */}
      <div className="border-b border-border bg-muted/10 px-4 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">yuleASR 配置器</span>
          <span className="text-xs text-muted-foreground">AutoSAR BSW 在线配置工具</span>
        </div>
        <a
          href={configuratorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted/30 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          新窗口打开
        </a>
      </div>

      {/* Iframe */}
      <div className="flex-1 bg-white">
        <iframe
          src={configuratorUrl}
          className="w-full h-full border-0"
          title="yuleASR Configurator"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
