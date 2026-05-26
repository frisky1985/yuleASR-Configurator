import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, 
  FolderOpen, 
  Clock, 
  Users, 
  MoreVertical,
  Search,
  Filter,
  Grid3X3,
  List,
  Trash2,
  Copy,
  Share2,
  CheckCircle,
  AlertCircle,
  Cloud,
  CloudOff
} from 'lucide-react';
import { AnimatedPage } from '../components/AnimatedPage';
import { useAuth } from '../hooks/useAuth';

interface ConfigItem {
  id: string;
  name: string;
  description: string;
  platform: string;
  version: string;
  updatedAt: string;
  isShared: boolean;
  teamId?: string;
  teamName?: string;
  ownerId: string;
  collaborators: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
  moduleCount: number;
}

export function YuleASRPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      // 模拟 API 调用
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockConfigs: ConfigItem[] = [
        {
          id: '1',
          name: 'STM32H743 项目配置',
          description: '用于STM32H743芯片的完整ASR配置',
          platform: 'stm32',
          version: '1.2.0',
          updatedAt: '2024-05-10T14:30:00Z',
          isShared: true,
          teamId: 'team1',
          teamName: '嵌入式团队',
          ownerId: 'user1',
          collaborators: 3,
          syncStatus: 'synced',
          moduleCount: 12
        },
        {
          id: '2',
          name: 'ESP32-S3 语音识别',
          description: 'ESP32-S3 语音唤醒配置',
          platform: 'esp32',
          version: '2.0.1',
          updatedAt: '2024-05-08T09:15:00Z',
          isShared: false,
          ownerId: 'user1',
          collaborators: 0,
          syncStatus: 'pending',
          moduleCount: 8
        },
        {
          id: '3',
          name: 'RK3588 AI加速',
          description: 'RK3588 NPU加速配置',
          platform: 'linux',
          version: '1.0.0',
          updatedAt: '2024-05-05T16:45:00Z',
          isShared: true,
          teamId: 'team2',
          teamName: 'AI团队',
          ownerId: 'user2',
          collaborators: 5,
          syncStatus: 'synced',
          moduleCount: 15
        }
      ];
      
      setConfigs(mockConfigs);
    } catch (error) {
      console.error('Failed to fetch configs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateConfig = async (data: { name: string; description: string; platform: string }) => {
    try {
      // 模拟创建 API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newConfig: ConfigItem = {
        id: Date.now().toString(),
        name: data.name,
        description: data.description,
        platform: data.platform,
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        isShared: false,
        ownerId: user?.id || 'user1',
        collaborators: 0,
        syncStatus: 'synced',
        moduleCount: 0
      };
      
      setConfigs(prev => [newConfig, ...prev]);
      setShowCreateModal(false);
      
      // 跳转到编辑器
      navigate(`/yuleasr/editor/${newConfig.id}`);
    } catch (error) {
      console.error('Failed to create config:', error);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('确定要删除此配置吗？')) return;
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setConfigs(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error('Failed to delete config:', error);
    }
  };

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlatform = filterPlatform === 'all' || config.platform === filterPlatform;
    return matchesSearch && matchesPlatform;
  });

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      stm32: '🔵',
      esp32: '🟢',
      linux: '🟡',
      windows: '🔴'
    };
    return icons[platform] || '⚙️';
  };

  const getSyncStatusIcon = (status: string) => {
    switch (status) {
      case 'synced':
        return <Cloud className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <CloudOff className="w-4 h-4 text-yellow-500" />;
      case 'conflict':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <AnimatedPage>
      <div className="min-h-screen bg-background pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">yuleASR 配置中心</h1>
              <p className="text-muted-foreground mt-1">
                管理和配置您的嵌入式ASR项目
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
              新建配置
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索配置..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">所有平台</option>
                <option value="stm32">STM32</option>
                <option value="esp32">ESP32</option>
                <option value="linux">Linux</option>
                <option value="windows">Windows</option>
              </select>
              <div className="flex border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 ${viewMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background hover:bg-accent'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
            </div>
          ) : filteredConfigs.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground">没有找到配置</h3>
              <p className="text-muted-foreground mt-1">创建一个新配置开始使用</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredConfigs.map(config => (
                <div
                  key={config.id}
                  className="group bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() => navigate(`/yuleasr/editor/${config.id}`)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getPlatformIcon(config.platform)}</span>
                      <div>
                        <h3 className="font-semibold text-foreground">{config.name}</h3>
                        <p className="text-sm text-muted-foreground">{config.platform}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConfig(config.id);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {config.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-muted-foreground">v{config.version}</span>
                      {config.isShared && (
                        <span className="inline-flex items-center gap-1 text-primary">
                          <Users className="w-3 h-3" />
                          {config.collaborators}
                        </span>
                      )}
                    </div>
                    {getSyncStatusIcon(config.syncStatus)}
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(config.updatedAt).toLocaleDateString('zh-CN')}
                      </span>
                      <span>{config.moduleCount} 模块</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">配置名称</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">平台</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">版本</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">更新时间</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredConfigs.map(config => (
                    <tr
                      key={config.id}
                      className="hover:bg-accent/50 cursor-pointer"
                      onClick={() => navigate(`/yuleasr/editor/${config.id}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{getPlatformIcon(config.platform)}</span>
                          <div>
                            <div className="font-medium text-foreground">{config.name}</div>
                            <div className="text-sm text-muted-foreground">{config.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground capitalize">{config.platform}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">v{config.version}</td>
                      <td className="px-6 py-4">{getSyncStatusIcon(config.syncStatus)}</td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {new Date(config.updatedAt).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConfig(config.id);
                          }}
                          className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Create Modal */}
          {showCreateModal && (
            <CreateConfigModal
              onClose={() => setShowCreateModal(false)}
              onCreate={handleCreateConfig}
            />
          )}
        </div>
      </div>
    </AnimatedPage>
  );
}

// 创建配置模态框组件
function CreateConfigModal({ onClose, onCreate }: { onClose: () => void; onCreate: (data: any) => void }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    platform: 'stm32'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSubmitting(true);
    await onCreate(formData);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-xl border border-border p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-foreground mb-4">新建配置</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">配置名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="输入配置名称"
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="输入配置描述（可选）"
              rows={3}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">目标平台</label>
            <select
              value={formData.platform}
              onChange={(e) => setFormData(prev => ({ ...prev, platform: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="stm32">STM32</option>
              <option value="esp32">ESP32</option>
              <option value="linux">Linux</option>
              <option value="windows">Windows</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-border rounded-lg hover:bg-accent transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '创建中...' : '创建'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
