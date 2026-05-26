/**
 * MarkdownRenderer 组件测试
 * @description MarkdownRenderer 组件的单元测试
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MarkdownRenderer } from '../MarkdownRenderer';

const markdownWithLinks = `
## 链接示例

[访问百度](https://www.baidu.com)
`;

const markdownWithTable = `
## 表格示例

| 表头1 | 表头2 |
|-------|-------|
| 单元1 | 单元2 |
| 单元3 | 单元4 |
`;

const markdownWithToc = `
# 第一章

内容...

## 1.1 小节

内容...

### 1.1.1 详细内容

内容...

## 1.2 另一小节

内容...
`;

describe('MarkdownRenderer', () => {
  it('应该正确渲染标题', () => {
    render(<MarkdownRenderer content="# 测试标题" />);
    
    const heading = screen.getByText('测试标题');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName.toLowerCase()).toBe('h1');
  });

  it('应该正确渲染段落', () => {
    render(<MarkdownRenderer content="这是一段测试文字。" />);
    
    expect(screen.getByText('这是一段测试文字。')).toBeInTheDocument();
  });

  it('应该正确渲染无序列表', () => {
    const { container } = render(<MarkdownRenderer content="- 项1" />);
    
    const li = container.querySelector('li');
    expect(li).toBeInTheDocument();
    expect(li?.textContent).toContain('项1');
  });

  it('应该正确渲染有序列表', () => {
    const { container } = render(<MarkdownRenderer content="1. 第一项" />);
    
    const li = container.querySelector('li');
    expect(li).toBeInTheDocument();
    expect(li?.textContent).toContain('第一项');
  });

  it('应该正确渲染引用', () => {
    render(<MarkdownRenderer content="> 这是引用" />);
    
    expect(screen.getByText('这是引用')).toBeInTheDocument();
  });

  it('应该正确渲染链接', () => {
    render(<MarkdownRenderer content={markdownWithLinks} />);
    
    const link = screen.getByText('访问百度');
    expect(link).toBeInTheDocument();
    expect(link.tagName.toLowerCase()).toBe('a');
    expect(link).toHaveAttribute('href', 'https://www.baidu.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('应该正确渲染表格', () => {
    render(<MarkdownRenderer content={markdownWithTable} />);
    
    expect(screen.getByText('表头1')).toBeInTheDocument();
    expect(screen.getByText('表头2')).toBeInTheDocument();
    expect(screen.getByText('单元1')).toBeInTheDocument();
    expect(screen.getByText('单元2')).toBeInTheDocument();
  });

  it('应该正确渲染行内代码', () => {
    render(<MarkdownRenderer content="这是行内代码: `const x = 1`" />);
    
    expect(screen.getByText('const x = 1')).toBeInTheDocument();
  });

  it('应该正确渲染水平线', () => {
    const { container } = render(<MarkdownRenderer content="---" />);
    
    const hr = container.querySelector('hr');
    expect(hr).toBeInTheDocument();
  });

  it('应该支持 enableToc 并触发 onTocGenerated 回调', async () => {
    const handleTocGenerated = vi.fn();
    
    render(
      <MarkdownRenderer 
        content={markdownWithToc}
        enableToc
        onTocGenerated={handleTocGenerated}
      />
    );
    
    await waitFor(() => {
      expect(handleTocGenerated).toHaveBeenCalled();
    });
    
    const toc = handleTocGenerated.mock.calls[0][0];
    expect(toc).toBeInstanceOf(Array);
    expect(toc.length).toBeGreaterThan(0);
    expect(toc[0]).toHaveProperty('id');
    expect(toc[0]).toHaveProperty('text');
    expect(toc[0]).toHaveProperty('level');
  });

  it('应该正确处理重复的标题 ID', async () => {
    const markdownWithDuplicateTitles = `
# 相同标题

内容

# 相同标题

内容
`;
    const handleTocGenerated = vi.fn();
    
    render(
      <MarkdownRenderer 
        content={markdownWithDuplicateTitles}
        enableToc
        onTocGenerated={handleTocGenerated}
      />
    );
    
    await waitFor(() => {
      expect(handleTocGenerated).toHaveBeenCalled();
    });
    
    const toc = handleTocGenerated.mock.calls[0][0];
    expect(toc.length).toBe(2);
    // 检查 ID 是否唯一
    expect(toc[0].id).not.toBe(toc[1].id);
  });

  it('应该渲染不同级别的标题', () => {
    const markdownWithAllHeadings = `
# H1
## H2
### H3
#### H4
`;
    render(<MarkdownRenderer content={markdownWithAllHeadings} />);
    
    expect(screen.getByText('H1').tagName.toLowerCase()).toBe('h1');
    expect(screen.getByText('H2').tagName.toLowerCase()).toBe('h2');
    expect(screen.getByText('H3').tagName.toLowerCase()).toBe('h3');
    expect(screen.getByText('H4').tagName.toLowerCase()).toBe('h4');
  });

  it('应该支持自定义类名', () => {
    const { container } = render(
      <MarkdownRenderer 
        content="# 测试"
        className="custom-class"
      />
    );
    
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('custom-class');
  });

  it('不启用目录时不应调用 onTocGenerated', () => {
    const handleTocGenerated = vi.fn();
    
    render(
      <MarkdownRenderer 
        content={markdownWithToc}
        enableToc={false}
        onTocGenerated={handleTocGenerated}
      />
    );
    
    expect(handleTocGenerated).not.toHaveBeenCalled();
  });
});
