import { Helmet } from 'react-helmet-async';

export function EnterprisePage() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Helmet><title>企业版 - YuleTech</title></Helmet>
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-4">🏢 YuleTech 企业版</h1>
        <p className="text-muted-foreground mb-6">私有化部署 · SSO 集成 · 团队协作 · 专属支持</p>
        <p className="text-sm text-muted-foreground">即将推出，敬请期待</p>
      </div>
    </div>
  );
}
