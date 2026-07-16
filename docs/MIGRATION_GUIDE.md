# Stripe / LemonSqueezy 迁移指南

当前支付系统使用模拟模式。切换到真实支付网关只需修改少量代码。

## 切换 Stripe

### 1. 安装依赖

```bash
cd packages/@yuletech/api-server
pnpm add stripe
```

### 2. 配置环境变量

在 `packages/@yuletech/api-server/.env` 中添加：

```env
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxx
STRIPE_PRICE_MONTHLY=price_xxxxxxx_monthly
STRIPE_PRICE_YEARLY=price_xxxxxxx_yearly
FRONTEND_URL=https://yuleasr.com
```

### 3. 修改 payment.ts

在 `packages/@yuletech/api-server/src/routes/payment.ts` 中：

```typescript
// 替换模拟 Stripe 创建
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// POST /api/payment/create-checkout
async (request, reply) => {
  const { tier = 'pro' } = request.body as any
  const priceId = tier === 'pro_yearly' 
    ? process.env.STRIPE_PRICE_YEARLY 
    : process.env.STRIPE_PRICE_MONTHLY

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/settings/license?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/settings/license?canceled=true`,
    customer_email: request.user?.email,
    metadata: { userId: request.user?.id },
  })

  return { url: session.url }
}
```

### 4. Webhook 端点

保留 webhook 端点结构，切换为真实验证：

```typescript
// POST /api/payment/webhook
const sig = request.headers['stripe-signature']
const event = stripe.webhooks.constructEvent(
  request.body as any,
  sig as string,
  process.env.STRIPE_WEBHOOK_SECRET!
)

if (event.type === 'checkout.session.completed') {
  const session = event.data.object
  await createLicenseForUser(session.metadata.userId, 'pro')
}
```

### 5. 测试

```bash
stripe listen --forward-to localhost:3002/api/payment/webhook
stripe trigger checkout.session.completed
```

## 切换 LemonSqueezy（推荐国内）

### 1. 安装

```bash
cd packages/@yuletech/api-server
pnpm add @lemonsqueezy/lemonsqueezy.js
```

### 2. 配置

```env
LEMONSQUEEZY_API_KEY=ls_xxxxxxxxx
LEMONSQUEEZY_STORE_ID=xxxxx
LEMONSQUEEZY_WEBHOOK_SECRET=xxxxx
```

### 3. 创建结账

```typescript
import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js'

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! })

// POST /api/payment/create-checkout
const { data } = await createCheckout(
  process.env.LEMONSQUEEZY_STORE_ID!,
  variantId, // 从 Price ID 映射
  {
    checkoutData: {
      email: request.user?.email,
      custom: { userId: request.user?.id },
    },
    productOptions: {
      redirectUrl: `${process.env.FRONTEND_URL}/settings/license?success=true`,
    },
  }
)
```

### 4. Webhook 验证

LemonSqueezy 支持 webhook 签名验证，参考 [文档](https://docs.lemonsqueezy.com/api/webhooks)。

## 建议

- 开发阶段先用模拟模式
- 上线第一步用 LemonSqueezy（支持支付宝/微信，国内用户友好）
- 后续再加 Stripe 支持国际用户
- 两个网关可以并存，用户在结账时选择
