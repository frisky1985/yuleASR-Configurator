import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { Send, ArrowLeft, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react';
import { LAYER_OPTIONS, MCU_OPTIONS, OS_OPTIONS, COMPILER_OPTIONS } from '../../data/autosar/registry-types';
import type { RegistryModuleDependency } from '../../data/autosar/registry-types';

interface PublishForm {
  name: string;
  version: string;
  layer: string;
  description: string;
  tags: string;
  author: string;
  mcus: string[];
  oses: string[];
  compilers: string[];
  configData: string;
  dependencies: RegistryModuleDependency[];
}

const initialForm: PublishForm = {
  name: '',
  version: '1.0.0',
  layer: '',
  description: '',
  tags: '',
  author: '',
  mcus: [],
  oses: [],
  compilers: [],
  configData: JSON.stringify({
    "$schema": "./yuleasr.schema.json",
    "name": "",
    "description": "",
    "version": "1.0.0",
    "vendor": "",
    "mcu": "",
    "module": {},
  }, null, 2),
  dependencies: [],
};

const defaultConfigTemplate = `{
  "$schema": "./yuleasr.schema.json",
  "name": "yuleasr-module-name",
  "description": "模块描述",
  "version": "1.0.0",
  "vendor": "YuleTech",
  "mcu": "S32K144",
  "module": {
    "YourModule": {
      "YourModuleGeneral": {
        "DevErrorDetect": false,
        "VersionCheckApi": true
      }
    }
  }
}`;

export function RegistryPublishPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<PublishForm>(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [jsonError, setJsonError] = useState('');

  const validateJson = (value: string) => {
    try {
      JSON.parse(value);
      setJsonError('');
      return true;
    } catch (e) {
      setJsonError(`JSON 格式错误: ${(e as Error).message}`);
      return false;
    }
  };

  const toggleMcu = (mcu: string) => {
    setForm(prev => ({
      ...prev,
      mcus: prev.mcus.includes(mcu) ? prev.mcus.filter(m => m !== mcu) : [...prev.mcus, mcu],
    }));
  };

  const toggleOs = (os: string) => {
    setForm(prev => ({
      ...prev,
      oses: prev.oses.includes(os) ? prev.oses.filter(o => o !== os) : [...prev.oses, os],
    }));
  };

  const toggleCompiler = (compiler: string) => {
    setForm(prev => ({
      ...prev,
      compilers: prev.compilers.includes(compiler)
        ? prev.compilers.filter(x => x !== compiler)
        : [...prev.compilers, compiler],
    }));
  };

  const addDependency = () => {
    setForm(prev => ({
      ...prev,
      dependencies: [...prev.dependencies, { name: '', version: '>=1.0.0', optional: false }],
    }));
  };

  const updateDependency = (index: number, field: keyof RegistryModuleDependency, value: string | boolean) => {
    setForm(prev => {
      const deps = [...prev.dependencies];
      deps[index] = { ...deps[index], [field]: value };
      return { ...prev, dependencies: deps };
    });
  };

  const removeDependency = (index: number) => {
    setForm(prev => ({
      ...prev,
      dependencies: prev.dependencies.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = () => {
    setError('');

    // Validation
    if (!form.name.trim()) {
      setError('请输入模块名称');
      return;
    }
    if (!form.layer) {
      setError('请选择层级');
      return;
    }
    if (!form.description.trim()) {
      setError('请输入模块描述');
      return;
    }
    if (!form.configData.trim()) {
      setError('请输入 .yuleasr.json 配置数据');
      return;
    }
    if (!validateJson(form.configData)) {
      return;
    }

    // Store to localStorage
    const newModule = {
      id: `module-${Date.now()}`,
      name: form.name.trim(),
      version: form.version.trim(),
      layer: form.layer,
      description: form.description.trim(),
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      author: form.author.trim() || '社区贡献者',
      configData: form.configData,
      compatibility: {
        mcu: form.mcus,
        os: form.oses,
        compiler: form.compilers,
      },
      dependencies: form.dependencies.filter(d => d.name.trim()),
      stats: {
        downloads: 0,
        rating: 0,
        reviewCount: 0,
      },
      status: 'draft' as const,
      timestamps: {
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      },
    };

    const existing = JSON.parse(localStorage.getItem('yule_registry_modules') || '[]');
    existing.push(newModule);
    localStorage.setItem('yule_registry_modules', JSON.stringify(existing));

    setSuccess(true);
    setTimeout(() => {
      navigate('/autosar/registry');
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">发布成功!</h2>
          <p className="text-muted-foreground">正在跳转到模块仓库...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <Helmet>
        <title>发布 BSW 模块 - AutoSAR 开发者中心 - YuleTech</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/autosar/registry')}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            返回模块仓库
          </button>
          <div className="flex items-center gap-3 mb-2">
            <Send className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">发布 BSW 模块</h1>
          </div>
          <p className="text-muted-foreground">
            提交你的 AutoSAR BSW 模块模板到社区仓库，分享给更多开发者
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-6"
        >
          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Name + Version */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">
                模块名称 <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="例如: CAN Stack"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">版本</label>
              <input
                type="text"
                value={form.version}
                onChange={e => setForm(prev => ({ ...prev, version: e.target.value }))}
                placeholder="1.0.0"
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {/* Layer */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              层级 <span className="text-destructive">*</span>
            </label>
            <select
              value={form.layer}
              onChange={e => setForm(prev => ({ ...prev, layer: e.target.value }))}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">选择层级...</option>
              {LAYER_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label} - {opt.description}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              模块描述 <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
              placeholder="描述模块的功能、适用范围和特性..."
              rows={3}
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-y"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-1.5">标签 (逗号分隔)</label>
            <input
              type="text"
              value={form.tags}
              onChange={e => setForm(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="例如: CAN, 通信, MCAL, 协议栈"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium mb-1.5">作者</label>
            <input
              type="text"
              value={form.author}
              onChange={e => setForm(prev => ({ ...prev, author: e.target.value }))}
              placeholder="你的名字或团队名"
              className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          {/* MCU Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-1.5">MCU 兼容性</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-card border border-border">
              {MCU_OPTIONS.map(mcu => (
                <button
                  key={mcu}
                  onClick={() => toggleMcu(mcu)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                    form.mcus.includes(mcu)
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {mcu}
                </button>
              ))}
              {form.mcus.length === 0 && (
                <span className="text-xs text-muted-foreground px-2 py-1">点击选择兼容 MCU</span>
              )}
            </div>
          </div>

          {/* OS Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-1.5">操作系统兼容性</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-card border border-border">
              {OS_OPTIONS.map(os => (
                <button
                  key={os}
                  onClick={() => toggleOs(os)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                    form.oses.includes(os)
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {os}
                </button>
              ))}
              {form.oses.length === 0 && (
                <span className="text-xs text-muted-foreground px-2 py-1">点击选择兼容 OS</span>
              )}
            </div>
          </div>

          {/* Compiler Multi-select */}
          <div>
            <label className="block text-sm font-medium mb-1.5">编译器兼容性</label>
            <div className="flex flex-wrap gap-1.5 p-3 rounded-lg bg-card border border-border">
              {COMPILER_OPTIONS.map(c => (
                <button
                  key={c}
                  onClick={() => toggleCompiler(c)}
                  className={`px-2 py-1 text-xs rounded-lg border transition-colors ${
                    form.compilers.includes(c)
                      ? 'bg-primary/10 text-primary border-primary/30'
                      : 'bg-muted/30 text-muted-foreground border-border hover:border-primary/30'
                  }`}
                >
                  {c}
                </button>
              ))}
              {form.compilers.length === 0 && (
                <span className="text-xs text-muted-foreground px-2 py-1">点击选择兼容编译器</span>
              )}
            </div>
          </div>

          {/* Config Data JSON Editor */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              .yuleasr.json 配置数据 <span className="text-destructive">*</span>
            </label>
            <textarea
              value={form.configData}
              onChange={e => {
                setForm(prev => ({ ...prev, configData: e.target.value }));
                if (jsonError) validateJson(e.target.value);
              }}
              rows={16}
              className={`w-full px-3 py-2.5 text-sm font-mono bg-background border rounded-lg focus:outline-none focus:ring-2 resize-y ${
                jsonError ? 'border-red-500/50 focus:ring-red-500/30' : 'border-border focus:ring-primary/30'
              }`}
            />
            {jsonError && (
              <p className="mt-1 text-xs text-red-500">{jsonError}</p>
            )}
            <button
              type="button"
              onClick={() => {
                setForm(prev => ({ ...prev, configData: defaultConfigTemplate }));
                setJsonError('');
              }}
              className="mt-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              插入模板
            </button>
          </div>

          {/* Dependencies */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium">依赖模块</label>
              <button
                onClick={addDependency}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                <Plus className="w-3 h-3" />
                添加依赖
              </button>
            </div>
            <div className="space-y-2">
              {form.dependencies.map((dep, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border">
                  <input
                    type="text"
                    value={dep.name}
                    onChange={e => updateDependency(i, 'name', e.target.value)}
                    placeholder="模块名称"
                    className="flex-1 px-2 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <input
                    type="text"
                    value={dep.version}
                    onChange={e => updateDependency(i, 'version', e.target.value)}
                    placeholder=">=1.0.0"
                    className="w-24 px-2 py-1.5 text-xs bg-background border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary/30"
                  />
                  <label className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={dep.optional}
                      onChange={e => updateDependency(i, 'optional', e.target.checked)}
                      className="w-3 h-3"
                    />
                    可选
                  </label>
                  <button
                    onClick={() => removeDependency(i)}
                    className="p-1 text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {form.dependencies.length === 0 && (
                <p className="text-xs text-muted-foreground px-2">暂无依赖，点击"添加依赖"</p>
              )}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-border">
            <button
              onClick={handleSubmit}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 active:scale-[0.98] transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
              发布模块 (保存为草稿)
            </button>
            <p className="text-xs text-muted-foreground mt-2">
              提交后将以"草稿"状态保存到本地，管理员审核后可见
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
