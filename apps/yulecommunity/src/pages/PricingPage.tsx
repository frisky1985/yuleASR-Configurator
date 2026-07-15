import { Helmet } from 'react-helmet-async';

export function PricingPage() {
  return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <Helmet><title>定价 - YuleTech</title></Helmet>
      <div className="text-center max-w-lg">
        <h1 className="text-3xl font-bold mb-4">💰 选择适合你的方案</h1>
        <p className="text-muted-foreground mb-6">社区版免费 · 团队版即将推出 · 企业版定制报价</p>
        <p className="text-sm text-muted-foreground">即将推出，敬请期待</p>
      </div>
    </div>
  );
}
