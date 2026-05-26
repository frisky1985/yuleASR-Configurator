import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Folder,
  FolderOpen,
  MessageSquare,
  Clock,
  Plus,
  Edit3,
  Share2,
  History,
  ChevronRight,
  ChevronDown,
  FolderGit2,
} from 'lucide-react';
import Editor from '@monaco-editor/react';
import {
  mockProjects,
  mockComments,
  getFileIcon,
  getActivityIcon,
  type Project,
  type ProjectFile,
  type Comment,
} from '../data/workspace';
import { mockOrganizations } from '../data/organization';

function FileTree({
  files,
  selectedFile,
  onSelect,
  level = 0,
}: {
  files: ProjectFile[];
  selectedFile: string | null;
  onSelect: (file: ProjectFile) => void;
  level?: number;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['f1', 'f2']));

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpanded(newExpanded);
  };

  return (
    <div className="space-y-1">
      {files.map((file) => (
        <div key={file.id}>
          <button
            onClick={() => {
              if (file.type === 'folder') {
                toggleFolder(file.id);
              } else {
                onSelect(file);
              }
            }}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
              selectedFile === file.id
                ? 'bg-primary/10 text-primary'
                : 'hover:bg-muted'
            }`}
            style={{ paddingLeft: `${12 + level * 16}px` }}
          >
            {file.type === 'folder' ? (
              expanded.has(file.id) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )
            ) : (
              <span className="w-4" />
            )}
            <span className="text-lg">{getFileIcon(file.type)}</span>
            <span className="truncate">{file.name}</span>
          </button>
          {file.type === 'folder' && expanded.has(file.id) && file.children && (
            <FileTree
              files={file.children}
              selectedFile={selectedFile}
              onSelect={onSelect}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function CommentThread({ comment, depth = 0 }: { comment: Comment; depth?: number }) {
  return (
    <div className={`${depth > 0 ? 'ml-8 mt-3 border-l-2 border-border pl-4' : ''}`}>
      <div className="flex gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center text-xs font-bold text-white">
          {comment.userAvatar}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.timestamp).toLocaleString('zh-CN')}
            </span>
          </div>
          <p className="text-sm mt-1">{comment.content}</p>
          <button className="text-xs text-primary mt-2 hover:underline">回复</button>
        </div>
      </div>
      {comment.replies.map((reply) => (
        <CommentThread key={reply.id} comment={reply} depth={depth + 1} />
      ))}
    </div>
  );
}

function ActivityItem({ activity }: { activity: Project['activity'][0] }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <div className="text-lg">{getActivityIcon(activity.type)}</div>
      <div className="flex-1">
        <p className="text-sm">
          <span className="font-medium">{activity.userName}</span>
          {' '}
          {activity.type === 'edit' && '编辑了'}
          {activity.type === 'comment' && '评论了'}
          {activity.type === 'create' && '创建了'}
          {activity.type === 'share' && '分享了'}
          {' '}
          <span className="font-medium">{activity.target}</span>
        </p>
        {activity.details && (
          <p className="text-xs text-muted-foreground mt-1">{activity.details}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {new Date(activity.timestamp).toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  );
}

export function WorkspacePage() {
  const [selectedProject, setSelectedProject] = useState<Project>(mockProjects[0]);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'comments' | 'activity'>('files');

  const org = mockOrganizations[0];
  const projectComments = mockComments.filter(c => c.projectId === selectedProject.id);

  return (
    <div className="min-h-screen pt-16">
      <Helmet>
        <title>工作区 - {selectedProject.name} | YuleTech</title>
      </Helmet>

      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <FolderGit2 className="w-5 h-5 text-primary" />
              <select
                value={selectedProject.id}
                onChange={(e) => {
                  const project = mockProjects.find(p => p.id === e.target.value);
                  if (project) {
                    setSelectedProject(project);
                    setSelectedFile(null);
                  }
                }}
                className="bg-transparent font-medium focus:outline-none"
              >
                {mockProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm text-muted-foreground">{org.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {selectedProject.collaborators.map((userId, i) => {
                const member = org.members.find(m => m.id === userId);
                return member ? (
                  <div
                    key={userId}
                    className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary flex items-center justify-center text-xs font-bold text-white border-2 border-card"
                    style={{ zIndex: selectedProject.collaborators.length - i }}
                    title={member.name}
                  >
                    {member.avatar}
                  </div>
                ) : null;
              })}
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
              <Share2 className="w-4 h-4" />
              分享
            </button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-8rem)]">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card flex flex-col">
          <div className="flex items-center gap-1 p-2 border-b border-border">
            {[
              { id: 'files', icon: Folder, label: '文件' },
              { id: 'comments', icon: MessageSquare, label: '讨论' },
              { id: 'activity', icon: Clock, label: '活动' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-3">
            {activeTab === 'files' && (
              <FileTree
                files={selectedProject.files}
                selectedFile={selectedFile?.id || null}
                onSelect={setSelectedFile}
              />
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <button className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                  <Plus className="w-4 h-4" />
                  新评论
                </button>
                {projectComments.map(comment => (
                  <CommentThread key={comment.id} comment={comment} />
                ))}
                {projectComments.length === 0 && (
                  <p className="text-center text-muted-foreground text-sm py-8">
                    暂无评论
                  </p>
                )}
              </div>
            )}

            {activeTab === 'activity' && (
              <div>
                {selectedProject.activity.map(activity => (
                  <ActivityItem key={activity.id} activity={activity} />
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-background">
          {selectedFile ? (
            <>
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{getFileIcon(selectedFile.type)}</span>
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="text-sm text-muted-foreground">
                    最后编辑: {selectedFile.modifiedBy} 于 {selectedFile.lastModified}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-muted rounded-lg">
                    <History className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90">
                    <Edit3 className="w-4 h-4" />
                    编辑
                  </button>
                </div>
              </div>
              <div className="flex-1">
                {selectedFile.type === 'md' ? (
                  <div className="h-full p-6 overflow-auto">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-mono text-sm">{selectedFile.content}</pre>
                    </div>
                  </div>
                ) : (
                  <Editor
                    height="100%"
                    defaultLanguage={selectedFile.type === 'c' ? 'c' : selectedFile.type === 'h' ? 'c' : 'text'}
                    value={selectedFile.content || ''}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                    }}
                    theme="vs-dark"
                  />
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">选择一个文件</h3>
                <p className="text-muted-foreground">从左侧文件树中选择要查看的文件</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
