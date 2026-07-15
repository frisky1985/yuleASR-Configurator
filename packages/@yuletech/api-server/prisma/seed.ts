import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123456', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@yule.dev' },
    update: {},
    create: {
      email: 'admin@yule.dev',
      username: '管理员',
      password: adminPassword,
      role: 'admin',
    },
  })
  console.log(`✅ Admin user: ${admin.email}`)

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123456', 10)
  const demo = await prisma.user.upsert({
    where: { email: 'demo@yule.dev' },
    update: {},
    create: {
      email: 'demo@yule.dev',
      username: 'Demo用户',
      password: demoPassword,
      role: 'user',
    },
  })
  console.log(`✅ Demo user: ${demo.email}`)

  // Create sample blog posts
  const posts = [
    {
      title: 'AUTOSAR MCAL Can模块配置指南',
      slug: 'autosar-mcal-can-config-guide',
      description: '从零开始配置AUTOSAR CAN驱动模块，涵盖波特率、控制器模式和中断配置。',
      content: '# AUTOSAR MCAL Can模块配置指南\n\n## 1. 概述\n\nCAN (Controller Area Network) 是汽车电子中最常用的通信协议之一。本文将介绍如何在 yuleASR-Configurator 中配置 Can 模块。\n\n## 2. 关键参数\n\n- **CanBaudrate**: 波特率配置，常见值 500Kbps\n- **CanControllerId**: 控制器 ID\n- **CanWakeup**: 唤醒功能使能\n\n## 3. 配置步骤\n\n...\n',
      category: 'MCAL',
      tags: ['Can', 'MCAL', '入门'],
      authorId: admin.id,
    },
    {
      title: 'yuleASR-Configurator 架构解析',
      slug: 'yuleasr-configurator-architecture',
      description: '深入理解 yuleASR-Configurator 的架构设计，包括代码生成器、条件引擎和约束传播系统。',
      content: '# yuleASR-Configurator 架构解析\n\n## 分层架构\n\n- **Core**: 核心代码生成引擎\n- **Web**: React 配置界面\n- **Desktop**: Electron 桌面应用\n- **Community**: 社区平台\n\n## 条件引擎\n\nSOP/XOP 模式切换，递归依赖求值...\n',
      category: '架构设计',
      tags: ['架构', 'yuleASR', '设计模式'],
      authorId: admin.id,
    },
    {
      title: 'AUTOSAR 功能安全基础',
      slug: 'autosar-functional-safety-basics',
      description: 'AUTOSAR 中的功能安全概念，ISO 26262 标准与 MCAL 配置的关系。',
      content: '# AUTOSAR 功能安全基础\n\n## ISO 26262\n\n功能安全标准，定义 ASIL 等级...\n',
      category: '功能安全',
      tags: ['功能安全', 'ISO26262', 'ASIL'],
      authorId: admin.id,
    },
  ]

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        tags: JSON.stringify(post.tags),
        publishedAt: new Date(),
        isHot: post.category === 'MCAL',
      },
    })
  }
  console.log(`✅ ${posts.length} blog posts created`)

  // Create sample forum posts
  const forumPosts = [
    {
      title: 'Can模块配置问题：波特率设置无效',
      content: '我设置了CanBaudrate=500000，但生成的代码中这个值没有生效，有人遇到过吗？',
      tags: ['Can', '求助'],
      userId: demo.id,
    },
    {
      title: '分享：我的 Port 模块配置经验',
      content: '经过几次调试，总结了一些 Port 模块的配置技巧...',
      tags: ['Port', '经验分享'],
      userId: admin.id,
      configId: 1,
    },
  ]

  for (const fp of forumPosts) {
    await prisma.forumPost.create({
      data: {
        ...fp,
        tags: JSON.stringify(fp.tags),
        status: 'published',
      },
    })
  }
  console.log(`✅ ${forumPosts.length} forum posts created`)

  // Create tags
  const tagNames = ['Can', 'MCAL', 'Port', 'Dio', '入门', '求助', '经验分享', '架构', 'yuleASR']
  for (const name of tagNames) {
    await prisma.tag.upsert({
      where: { name },
      update: {},
      create: { name, postCount: 1 },
    })
  }
  console.log(`✅ ${tagNames.length} tags created`)

  console.log('\n🎉 Seeding complete!')
  console.log('   Admin: admin@yule.dev / admin123456')
  console.log('   Demo:  demo@yule.dev / demo123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
