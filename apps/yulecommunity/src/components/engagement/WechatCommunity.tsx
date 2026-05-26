/**
 * 微信社群入口组件
 * @description 悬浮微信按钮 + 二维码弹窗
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Users, Copy, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface WechatCommunityProps {
  /** 显示位置 */
  position?: 'bottom-right' | 'bottom-left';
  /** 初始显示延迟 (ms) */
  delay?: number;
  /** 距离底部偏移 (px) */
  bottomOffset?: number;
}

const WECHAT_CLICKS_KEY = 'yuletech:wechat:clicks';
const WECHAT_DISMISSED_KEY = 'yuletech:wechat:dismissed';

/**
 * 微信社群组件
 */
export function WechatCommunity({
  position = 'bottom-right',
  delay = 5000,
  bottomOffset = 100,
}: WechatCommunityProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [clicks, setClicks] = useLocalStorage(WECHAT_CLICKS_KEY, 0);
  const [dismissed, setDismissed] = useLocalStorage(WECHAT_DISMISSED_KEY, false);
  const [copied, setCopied] = useState(false);
  const [qrLoading, setQrLoading] = useState(true);
  const [qrError, setQrError] = useState(false);

  // 延迟显示悬浮按钮
  useEffect(() => {
    if (dismissed) return;
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, dismissed]);

  // 打开弹窗
  const handleOpen = useCallback(() => {
    setIsOpen(true);
    setClicks(prev => prev + 1);
    setIsMinimized(true);
  }, [setClicks]);

  // 关闭弹窗
  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  // 关闭悬浮按钮
  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    setDismissed(true);
  }, [setDismissed]);

  // 复制关键词
  const handleCopyKeyword = useCallback(async () => {
    try {
      await navigator.clipboard.writeText('进群');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  }, []);

  // 位置样式
  const positionClass = position === 'bottom-right' 
    ? 'right-4 sm:right-6' 
    : 'left-4 sm:left-6';

  if (!isVisible) return null;

  return (
    <>
      {/* 悬浮按钮 */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0, y: 20 }}
            animate={{ 
              opacity: 1, 
              scale: isMinimized ? 0.8 : 1, 
              y: 0 
            }}
            exit={{ opacity: 0, scale: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className={`fixed ${positionClass} z-50 flex flex-col items-end gap-2`}
            style={{ bottom: `${bottomOffset}px` }}
          >
            {/* 关闭按钮 */}
            {!isMinimized && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-1 rounded-full bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                onClick={handleDismiss}
                aria-label="关闭微信入口"
              >
                <X className="w-3 h-3" />
              </motion.button>
            )}

            {/* 主按钮 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOpen}
              className={`
                relative flex items-center gap-2 
                px-4 py-3 rounded-full 
                bg-[#07C160] hover:bg-[#06AD56] 
                text-white shadow-lg shadow-[#07C160]/30
                transition-all duration-300
                ${isMinimized ? 'w-12 h-12 p-0 justify-center' : ''}
              `}
              aria-label="加入微信社群"
            >
              <MessageCircle className={`w-5 h-5 ${isMinimized ? '' : 'fill-current'}`} />
              {!isMinimized && (
                <span className="text-sm font-medium whitespace-nowrap">
                  加入社群
                </span>
              )}
              
              {/* 微强动画 */}
              {!isMinimized && clicks === 0 && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 二维码弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* 背景遮罩 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={handleClose}
            />
            
            {/* 弹窗内容 */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-background border rounded-xl shadow-xl p-6"
            >
              {/* 关闭按钮 */}
              <button
                onClick={handleClose}
                className="absolute right-4 top-4 p-1 rounded-full hover:bg-muted transition-colors"
                aria-label="关闭"
              >
                <X className="w-4 h-4" />
              </button>

              {/* 标题 */}
              <h3 className="text-lg font-semibold text-center mb-6 flex items-center justify-center gap-2">
                <MessageCircle className="w-5 h-5 text-[#07C160] fill-[#07C160]" />
                加入 YuleTech 微信社群
              </h3>
              
              <div className="flex flex-col items-center gap-6">
                {/* 社群信息 */}
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>200+ 工程师已入群</span>
                </div>

                {/* 二维码 */}
                <div className="relative w-48 h-48 bg-muted rounded-xl flex items-center justify-center overflow-hidden">
                  {qrLoading && !qrError && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-muted-foreground animate-spin" />
                    </div>
                  )}
                  {qrError ? (
                    <div className="text-center p-4">
                      <MessageCircle className="w-12 h-12 mx-auto text-[#07C160] mb-2" />
                      <p className="text-xs text-muted-foreground">
                        扫描二维码<br/>或复制关键词添加
                      </p>
                    </div>
                  ) : (
                    <img
                      src="/images/wechat-qr.png"
                      alt="微信二维码"
                      className={`w-full h-full object-contain transition-opacity duration-300 ${qrLoading ? 'opacity-0' : 'opacity-100'}`}
                      onLoad={() => setQrLoading(false)}
                      onError={() => {
                        setQrLoading(false);
                        setQrError(true);
                      }}
                    />
                  )}
                </div>

                {/* 关键词提示 */}
                <div className="w-full space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">关键词：</span>
                      <code className="px-2 py-1 bg-background rounded text-sm font-medium">
                        进群
                      </code>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleCopyKeyword}
                      className="h-8 gap-1"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 text-green-500" />
                          <span className="text-green-500">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>复制</span>
                        </>
                      )}
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground text-center">
                    添加小助手微信 <span className="font-medium text-foreground">YuleTech2024</span>，<br/>
                    发送关键词"进群"获取社群邀请链接
                  </p>
                </div>

                {/* 社群价值点 */}
                <div className="w-full grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    技术问题解答
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    最新资讯分享
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                    内部资料获取
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                    线下活动通知
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export default WechatCommunity;
