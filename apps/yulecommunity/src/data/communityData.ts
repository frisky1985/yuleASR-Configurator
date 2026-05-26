export interface ForumReply {
  id: string;
  content: string;
  author: string;
  avatar: string;
  role: string;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  role: string;
  tags: string[];
  likes: number;
  likedBy: string[];
  replies: ForumReply[];
  views: number;
  createdAt: string;
  hot: boolean;
  isPinned?: boolean;
}

export interface Answer {
  id: string;
  content: string;
  author: string;
  avatar: string;
  role: string;
  isAccepted: boolean;
  likes: number;
  likedBy: string[];
  createdAt: string;
}

export interface Question {
  id: string;
  title: string;
  content: string;
  author: string;
  avatar: string;
  role: string;
  tags: string[];
  status: 'open' | 'resolved';
  bounty: number;
  views: number;
  answers: Answer[];
  createdAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  type: 'online' | 'offline';
  date: string;
  time: string;
  location?: string;
  description: string;
  speaker: string;
  speakerRole: string;
  maxAttendees: number;
  attendees: string[];
  tags: string[];
  status: 'upcoming' | 'ongoing' | 'ended';
}

export const initialForumPosts: ForumPost[] = [
  {
    id: 'fp-1',
    title: 'CAN FD 的波特率配置问题',
    content: '最近在配置 CAN FD 的时候遇到了一些问题，数据段的波特率无法达到预期值。已经尝试了多种配置组合，但总是报 BOff 错误。有没有大佬遇到过类似的问题？\n\n当前配置：\n- 仲裁段 500Kbps\n- 数据段 2Mbps\n- 采样点 80%\n\n寄存器配置如下...',
    author: '张明',
    avatar: 'ZM',
    role: '嵌入式工程师',
    tags: ['MCAL', 'CAN', 'i.MX8M'],
    likes: 18,
    likedBy: [],
    replies: [
      {
        id: 'fr-1-1',
        content: '这个问题通常是时钟源配置不对导致的。FlexCAN 模块需要 40MHz 的时钟源，如果用的是 24MHz 晶振，需要先配置 PLL。建议检查一下 CCM 的 CAN_CLK_ROOT 配置。',
        author: '李架构',
        avatar: '李架',
        role: '首席架构师',
        likes: 12,
        likedBy: [],
        createdAt: '2026-04-22T10:30:00',
      },
      {
        id: 'fr-1-2',
        content: '补充一下，除了时钟源，还要确认 TDC (Transceiver Delay Compensation) 是否开启，这在 CAN FD 高速模式下是必须的。',
        author: '王强',
        avatar: 'WQ',
        role: '通信工程师',
        likes: 8,
        likedBy: [],
        createdAt: '2026-04-22T11:15:00',
      },
    ],
    views: 342,
    createdAt: '2026-04-22T09:00:00',
    hot: true,
    isPinned: false,
  },
  {
    id: 'fp-2',
    title: 'AutoSAR Com 模块的信号路由配置最佳实践',
    content: '我们团队最近在做一个网关项目，需要在 Com 模块中配置大量信号路由。想请教一下大家在实际项目中的最佳实践。\n\n具体想问：\n1. Signal Group 和 Individual Signal 的选择标准\n2. Update Bit 的使用策略\n3. 大端小端混合配置时的注意事项',
    author: '李华',
    avatar: 'LH',
    role: '软件架构师',
    tags: ['Service', 'Com', '配置'],
    likes: 42,
    likedBy: [],
    replies: [
      {
        id: 'fr-2-1',
        content: '对于网关项目，建议优先使用 Signal Group，这样可以减少 PDU 之间的映射复杂度。我们上一个项目用了 200+ 个 Signal Group，维护起来比单个 Signal 方便很多。',
        author: '陈工',
        avatar: 'CG',
        role: '技术负责人',
        likes: 15,
        likedBy: [],
        createdAt: '2026-04-21T16:00:00',
      },
    ],
    views: 856,
    createdAt: '2026-04-21T14:00:00',
    hot: true,
    isPinned: false,
  },
  {
    id: 'fp-3',
    title: '求助：Pwm 模块在 i.MX8M 上的占空比精度问题',
    content: '使用 YuleTech 的 Pwm 驱动时，发现占空比精度只能达到 1%，但项目要求 0.1%。想知道这是硬件限制还是软件配置问题？',
    author: '王强',
    avatar: 'WQ',
    role: '初级工程师',
    tags: ['MCAL', 'Pwm'],
    likes: 8,
    likedBy: [],
    replies: [],
    views: 156,
    createdAt: '2026-04-20T10:00:00',
    hot: false,
    isPinned: false,
  },
  {
    id: 'fp-4',
    title: '分享：我们团队基于 YuleTech BSW 的量产经验',
    content: '经过 18 个月的开发和验证，我们基于 YuleTech AutoSAR BSW 的座舱域控制器终于量产了！\n\n项目概况：\n- 平台：ARM Cortex-A53\n- BSW 版本：YuleTech OpenSpec v2.1\n- 应用：数字仪表 + 中控娱乐\n- 产量：10K/月\n\n踩过的坑和解决方案分享给大家...',
    author: '陈工',
    avatar: 'CG',
    role: '技术负责人',
    tags: ['经验分享', '量产'],
    likes: 89,
    likedBy: [],
    replies: [
      {
        id: 'fr-4-1',
        content: '恭喜量产！想请问一下在功能安全方面做了哪些工作？是否达到了 ASIL-B？',
        author: '刘洋',
        avatar: 'LY',
        role: 'DevOps工程师',
        likes: 6,
        likedBy: [],
        createdAt: '2026-04-19T09:30:00',
      },
      {
        id: 'fr-4-2',
        content: '同问功能安全。另外 Wdg 模块在量产中的表现如何？有没有遇到过看门狗复位的问题？',
        author: '赵敏',
        avatar: 'ZM',
        role: '测试工程师',
        likes: 4,
        likedBy: [],
        createdAt: '2026-04-19T10:00:00',
      },
      {
        id: 'fr-4-3',
        content: '回复楼上两位：功能安全方面我们做了 E2E 保护和 SafeBswWrapper，达到了 ASIL-B。Wdg 方面配置的是 100ms 窗口看门狗，运行稳定。详细文档我整理后发出来。',
        author: '陈工',
        avatar: 'CG',
        role: '技术负责人',
        likes: 20,
        likedBy: [],
        createdAt: '2026-04-19T11:00:00',
      },
    ],
    views: 2340,
    createdAt: '2026-04-19T08:00:00',
    hot: true,
    isPinned: false,
  },
  {
    id: 'fp-5',
    title: 'YuleConfig 工具链的 Docker 环境搭建踩坑记录',
    content: '为了方便团队统一开发环境，我把 YuleConfig 工具链打包成了 Docker 镜像。记录一下踩过的坑，供大家参考。\n\n基础镜像：ubuntu:22.04\n工具链版本：v1.3.0\n\n坑1：Python 依赖版本冲突...',
    author: '刘洋',
    avatar: 'LY',
    role: 'DevOps工程师',
    tags: ['工具链', 'Docker'],
    likes: 22,
    likedBy: [],
    replies: [],
    views: 445,
    createdAt: '2026-04-18T15:00:00',
    hot: false,
    isPinned: false,
  },
];

export const initialQuestions: Question[] = [
  {
    id: 'qa-1',
    title: '如何实现 AutoSAR OS 基于 FreeRTOS 的 Alarm 功能？',
    content: '我正在将 FreeRTOS 的软件定时器映射到 AutoSAR OS 的 Alarm 机制，但遇到了回调函数上下文的问题。FreeRTOS 的定时器回调是在定时器任务中执行的，而 AutoSAR 的 Alarm Callback 应该在调用 SetRelAlarm 的任务上下文中执行。请问如何正确实现这个映射？',
    author: '王强',
    avatar: 'WQ',
    role: '初级工程师',
    tags: ['OS', 'FreeRTOS', 'Alarm'],
    status: 'resolved',
    bounty: 50,
    views: 520,
    answers: [
      {
        id: 'ans-1-1',
        content: '你的理解有一个小偏差。AutoSAR OS 的 Alarm Callback 实际上不是在调用 SetRelAlarm 的任务上下文中执行的，而是在一个专门的 Alarm 任务（或者由 OS 调度）中执行的。\n\n在 FreeRTOS 映射中，通常有两种方案：\n1. 在定时器回调中直接调用 Alarm Callback（最简单，但上下文是定时器任务）\n2. 在定时器回调中设置一个 Event，让关联的 Task 去执行 Alarm Callback（更符合 AutoSAR 语义）\n\nYuleTech 的 OS 实现用的是方案1，因为 AutoSAR 规范允许 Alarm Callback 在 OS 上下文执行。',
        author: '李架构',
        avatar: '李架',
        role: '首席架构师',
        isAccepted: true,
        likes: 24,
        likedBy: [],
        createdAt: '2026-04-21T10:00:00',
      },
      {
        id: 'ans-1-2',
        content: '补充一点，如果你确实需要方案2的效果，可以在 Os_Cfg.h 中为每个 Alarm 配置一个关联 Task，然后在定时器回调中使用 xEventGroupSetBits 来触发该 Task。我们在一个对时序要求很严格的项目中就是这么做的。',
        author: '陈工',
        avatar: 'CG',
        role: '技术负责人',
        isAccepted: false,
        likes: 12,
        likedBy: [],
        createdAt: '2026-04-21T11:30:00',
      },
    ],
    createdAt: '2026-04-20T09:00:00',
  },
  {
    id: 'qa-2',
    title: 'PduR 模块如何实现多路 CAN 通道的网关路由？',
    content: '项目需要把 CAN1 接收到的特定 PDU 路由到 CAN2 发送出去。已经配置了 PduRRoutingTables，但似乎只有单一路径能工作。请问多路网关路由的配置要点是什么？',
    author: '张明',
    avatar: 'ZM',
    role: '嵌入式工程师',
    tags: ['PduR', 'CAN', '网关'],
    status: 'open',
    bounty: 30,
    views: 310,
    answers: [
      {
        id: 'ans-2-1',
        content: 'PduR 的网关路由需要在 PduRRoutingPath 中配置多个 PduRRoutingDestination。关键是每个 Destination 的 DestPduRef 要指向不同的 LowerLayer（比如 CanIf2）。\n\n另外要确保 PduR 模块的网关功能宏 PduR_GATEWAY_OPERATION 已经开启。',
        author: '李华',
        avatar: 'LH',
        role: '软件架构师',
        isAccepted: false,
        likes: 8,
        likedBy: [],
        createdAt: '2026-04-22T08:00:00',
      },
    ],
    createdAt: '2026-04-21T14:00:00',
  },
  {
    id: 'qa-3',
    title: 'NvM 模块的 Redundant Block 配置有什么注意事项？',
    content: '想使用 NvM 的 Redundant Block 功能来提高数据可靠性，但不确定在 Fee/Ea 层需要配合做什么配置。求指导。',
    author: '赵敏',
    avatar: 'ZM',
    role: '测试工程师',
    tags: ['NvM', 'Fee', '存储'],
    status: 'open',
    bounty: 20,
    views: 180,
    answers: [],
    createdAt: '2026-04-22T10:00:00',
  },
];

export const initialEvents: CommunityEvent[] = [
  {
    id: 'evt-1',
    title: 'AutoSAR BSW 开源社区线上技术沙龙',
    type: 'online',
    date: '2026-04-25',
    time: '20:00 - 21:30',
    location: '腾讯会议',
    description: '本次沙龙将深入讲解 YuleTech AutoSAR BSW 的最新进展，包括 OS 模块的 FreeRTOS 映射实现、Service 层的 Com/PduR/NvM 开发进度，以及 ConfigGenerator 工具链的使用教程。',
    speaker: '李架构',
    speakerRole: 'YuleTech 首席架构师',
    maxAttendees: 200,
    attendees: [],
    tags: ['BSW', '开源', '技术分享'],
    status: 'upcoming',
  },
  {
    id: 'evt-2',
    title: '汽车电子功能安全与网络安全技术研讨会',
    type: 'offline',
    date: '2026-05-10',
    time: '09:00 - 17:00',
    location: '上海浦东软件园',
    description: '聚焦 ISO 26262 功能安全与 ISO/SAE 21434 汽车网络安全，邀请行业专家分享量产项目经验。YuleTech 将分享 BSW 层的安全机制设计。',
    speaker: '陈工',
    speakerRole: 'YuleTech 技术负责人',
    maxAttendees: 80,
    attendees: [],
    tags: ['功能安全', '网络安全', '线下'],
    status: 'upcoming',
  },
  {
    id: 'evt-3',
    title: '驱动开发实战训练营',
    type: 'online',
    date: '2026-05-20',
    time: '19:00 - 21:00',
    location: 'B站直播',
    description: '为期 5 天的在线训练营，手把手教你从零开始开发 MCAL 驱动。涵盖 Mcu、Port、Dio、Can、Spi 五大核心驱动。',
    speaker: '张明',
    speakerRole: 'YuleTech 嵌入式工程师',
    maxAttendees: 500,
    attendees: [],
    tags: ['MCAL', 'i.MX8M', '培训'],
    status: 'upcoming',
  },
  {
    id: 'evt-4',
    title: 'YuleTech 社区成立一周年庆典',
    type: 'online',
    date: '2026-04-15',
    time: '20:00 - 22:00',
    location: 'B站直播',
    description: '回顾社区一年来的成长历程，发布 YuleTech BSW v3.0 里程碑版本，表彰优秀贡献者。',
    speaker: '李架构',
    speakerRole: 'YuleTech 首席架构师',
    maxAttendees: 1000,
    attendees: ['user-1', 'user-2', 'user-3'],
    tags: ['社区', '庆典'],
    status: 'ended',
  },
];

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function migrateForumPosts(posts: ForumPost[]): ForumPost[] {
  return posts.map((post) => ({
    ...post,
    isPinned: post.isPinned ?? false,
  }));
}
