export interface Project {
  id: string;
  name: string;
  description: string;
  organizationId: string;
  teamId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  status: 'active' | 'archived' | 'planning';
  files: ProjectFile[];
  collaborators: string[]; // user ids
  activity: ActivityItem[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: 'folder' | 'c' | 'h' | 'md' | 'json' | 'other';
  content?: string;
  size: number;
  lastModified: string;
  modifiedBy: string;
  children?: ProjectFile[];
}

export interface ActivityItem {
  id: string;
  type: 'edit' | 'comment' | 'share' | 'create' | 'delete';
  userId: string;
  userName: string;
  target: string;
  timestamp: string;
  details?: string;
}

export interface Comment {
  id: string;
  projectId: string;
  fileId?: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  replies: Comment[];
  mentions: string[];
}

export const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'AutoSAR MCAL 移植项目',
    description: '基于 AutoSAR 4.4 标准的 MCAL 层移植，支持多种 MCU 芯片',
    organizationId: 'org-1',
    teamId: 't1',
    createdBy: 'u1',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20',
    status: 'active',
    collaborators: ['u1', 'u2', 'u3'],
    files: [
      {
        id: 'f1',
        name: 'src',
        type: 'folder',
        size: 0,
        lastModified: '2024-01-20',
        modifiedBy: 'u2',
        children: [
          {
            id: 'f1-1',
            name: 'Adc.c',
            type: 'c',
            content: '/* ADC Driver Implementation */\n#include "Adc.h"\n\nvoid Adc_Init(void) {\n  // Initialize ADC module\n}',
            size: 2450,
            lastModified: '2024-01-18',
            modifiedBy: 'u2',
          },
          {
            id: 'f1-2',
            name: 'Adc.h',
            type: 'h',
            content: '#ifndef ADC_H\n#define ADC_H\n\nvoid Adc_Init(void);\n\n#endif',
            size: 120,
            lastModified: '2024-01-18',
            modifiedBy: 'u2',
          },
          {
            id: 'f1-3',
            name: 'Port.c',
            type: 'c',
            content: '/* Port Driver */\n#include "Port.h"\n\nvoid Port_Init(const Port_ConfigType* ConfigPtr) {\n  // Port initialization\n}',
            size: 1800,
            lastModified: '2024-01-19',
            modifiedBy: 'u3',
          },
        ],
      },
      {
        id: 'f2',
        name: 'docs',
        type: 'folder',
        size: 0,
        lastModified: '2024-01-15',
        modifiedBy: 'u1',
        children: [
          {
            id: 'f2-1',
            name: 'API.md',
            type: 'md',
            content: '# ADC Driver API\n\n## Functions\n- `Adc_Init()` - Initialize ADC module\n- `Adc_StartConversion()` - Start ADC conversion',
            size: 3200,
            lastModified: '2024-01-15',
            modifiedBy: 'u1',
          },
        ],
      },
      {
        id: 'f3',
        name: 'README.md',
        type: 'md',
        content: '# MCAL Port Project\n\nThis project contains the MCAL layer implementation.',
        size: 500,
        lastModified: '2024-01-10',
        modifiedBy: 'u1',
      },
    ],
    activity: [
      { id: 'a1', type: 'edit', userId: 'u2', userName: '李研发', target: 'Adc.c', timestamp: '2024-01-20T10:30:00' },
      { id: 'a2', type: 'comment', userId: 'u1', userName: '张工', target: 'Port.c', timestamp: '2024-01-20T09:15:00', details: '这里需要添加错误检查' },
      { id: 'a3', type: 'create', userId: 'u3', userName: '王工程师', target: 'Port.c', timestamp: '2024-01-19T16:00:00' },
      { id: 'a4', type: 'share', userId: 'u1', userName: '张工', target: '项目', timestamp: '2024-01-15T11:00:00', details: '分享给赵测试' },
    ],
  },
  {
    id: 'proj-2',
    name: 'CAN 通信协议实现',
    description: '实现 ISO 11898 标准的 CAN 通信层，支持 CAN FD',
    organizationId: 'org-1',
    teamId: 't2',
    createdBy: 'u2',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-18',
    status: 'active',
    collaborators: ['u2', 'u4'],
    files: [
      {
        id: 'f4',
        name: 'Can.c',
        type: 'c',
        content: '/* CAN Driver */\n#include "Can.h"\n\nCan_ReturnType Can_Write(Can_HwHandleType Hth, const Can_PduType* PduInfo) {\n  // Transmit CAN frame\n  return CAN_OK;\n}',
        size: 4500,
        lastModified: '2024-01-18',
        modifiedBy: 'u2',
      },
    ],
    activity: [
      { id: 'a5', type: 'edit', userId: 'u2', userName: '李研发', target: 'Can.c', timestamp: '2024-01-18T14:20:00' },
    ],
  },
];

export const mockComments: Comment[] = [
  {
    id: 'c1',
    projectId: 'proj-1',
    fileId: 'f1-1',
    userId: 'u1',
    userName: '张工',
    userAvatar: 'Z',
    content: '建议在 Adc_Init 中添加对时钟使能的检查，确保时钟已经使能后再初始化 ADC 模块。@u2',
    timestamp: '2024-01-19T10:00:00',
    replies: [
      {
        id: 'c1-1',
        projectId: 'proj-1',
        fileId: 'f1-1',
        userId: 'u2',
        userName: '李研发',
        userAvatar: 'L',
        content: '好的，我会在下一个版本中添加这个检查。',
        timestamp: '2024-01-19T11:30:00',
        replies: [],
        mentions: [],
      },
    ],
    mentions: ['u2'],
  },
];

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find(p => p.id === id);
}

export function getFileIcon(type: string): string {
  const icons: Record<string, string> = {
    folder: '📁',
    c: '📄',
    h: '📓',
    md: '📝',
    json: '📂',
    other: '📄',
  };
  return icons[type] || icons.other;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function getActivityIcon(type: string): string {
  const icons: Record<string, string> = {
    edit: '✏️',
    comment: '💬',
    share: '🔗',
    create: '➕',
    delete: '🗑️',
  };
  return icons[type] || '🔄';
}
