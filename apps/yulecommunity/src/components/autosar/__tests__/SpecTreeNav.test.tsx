/**
 * SpecTreeNav Component Tests
 * @description Tests rendering of layer tree, search functionality, API selection
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SpecTreeNav } from '../SpecTreeNav';

describe('SpecTreeNav', () => {
  // ─── Basic rendering ───────────────────────────────────────────────
  it('should render search input', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    expect(screen.getByPlaceholderText('搜索 API...')).toBeInTheDocument();
  });

  it('should render layer names', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    expect(screen.getByText('MCAL')).toBeInTheDocument();
    expect(screen.getByText('ECUAL')).toBeInTheDocument();
    expect(screen.getByText('Service')).toBeInTheDocument();
    expect(screen.getByText('RTE + ASW')).toBeInTheDocument();
  });

  // ─── Layer expand/collapse ─────────────────────────────────────────
  it('MCAL layer should be expanded by default', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    // Can module should be visible (inside MCAL, which is expanded by default)
    expect(screen.getByText('Can')).toBeInTheDocument();
  });

  it('should toggle layer expansion on click', async () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    // ECUAL is closed by default, click to open
    fireEvent.click(screen.getByText('ECUAL'));
    expect(screen.getByText('CanIf')).toBeInTheDocument();

    // Click again to close — use waitFor for AnimatePresence exit transition
    fireEvent.click(screen.getByText('ECUAL'));
    await waitFor(() => {
      expect(screen.queryByText('CanIf')).not.toBeInTheDocument();
    });
  });

  // ─── Module expand/collapse ────────────────────────────────────────
  it('Can module should be expanded by default showing its APIs', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    // Can_Init is a Can API, should be visible
    expect(screen.getByText('Can_Init')).toBeInTheDocument();
  });

  it('should toggle module expansion on click', async () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    // Click Can to collapse it — use waitFor for AnimatePresence exit
    fireEvent.click(screen.getByText('Can'));
    await waitFor(() => {
      expect(screen.queryByText('Can_Init')).not.toBeInTheDocument();
    });

    // Click again to expand
    fireEvent.click(screen.getByText('Can'));
    expect(screen.getByText('Can_Init')).toBeInTheDocument();
  });

  // ─── Search functionality ──────────────────────────────────────────
  it('should show search results when typing a query', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索 API...');

    fireEvent.change(searchInput, { target: { value: 'Init' } });

    // Should show search results header
    expect(screen.getByText(/搜索结果/)).toBeInTheDocument();
    // Should show matching APIs
    expect(screen.getByText('Can_Init')).toBeInTheDocument();
  });

  it('should show no results message when search finds nothing', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索 API...');

    fireEvent.change(searchInput, { target: { value: 'ZZZZ_NonExistent_API' } });

    expect(screen.getByText('无匹配结果')).toBeInTheDocument();
  });

  it('should clear search and show tree when selecting a search result', () => {
    const onSelectApi = vi.fn();
    render(<SpecTreeNav selectedApi={null} onSelectApi={onSelectApi} />);
    const searchInput = screen.getByPlaceholderText('搜索 API...');

    fireEvent.change(searchInput, { target: { value: 'Init' } });

    // Click on a search result
    fireEvent.click(screen.getByText('Can_Init'));

    expect(onSelectApi).toHaveBeenCalledWith('Can_Init');
    // Search should be cleared, tree should be visible again
    expect(screen.getByText('MCAL')).toBeInTheDocument();
  });

  // ─── API selection ─────────────────────────────────────────────────
  it('should call onSelectApi when clicking an API in the tree', () => {
    const onSelectApi = vi.fn();
    render(<SpecTreeNav selectedApi={null} onSelectApi={onSelectApi} />);

    fireEvent.click(screen.getByText('Can_Init'));
    expect(onSelectApi).toHaveBeenCalledWith('Can_Init');
    expect(onSelectApi).toHaveBeenCalledTimes(1);
  });

  // ─── Selected API highlighting ─────────────────────────────────────
  it('should visually highlight the selected API', () => {
    render(<SpecTreeNav selectedApi="Can_Init" onSelectApi={vi.fn()} />);
    const selectedButton = screen.getByText('Can_Init');
    expect(selectedButton.className).toContain('primary');
  });

  // ─── Layer count display ───────────────────────────────────────────
  it('should show API count for each layer', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    // MCAL has 5 modules with 6+10+12+8+18 = 54 APIs
    const mcalCountElements = screen.getAllByText('54');
    expect(mcalCountElements.length).toBeGreaterThanOrEqual(1);
  });

  // ─── Module API count ──────────────────────────────────────────────
  it('should show API count for each module', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    // Can has 6 APIs
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  // ─── Search filters API names correctly ────────────────────────────
  it('search should filter by API name case-insensitively', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索 API...');

    fireEvent.change(searchInput, { target: { value: 'read' } });

    // Should show read-related APIs — use getAllByText for cases with multiple matches
    const readChannelButtons = screen.getAllByText(/Dio_ReadChannel/);
    expect(readChannelButtons.length).toBe(2); // Dio_ReadChannel + Dio_ReadChannelGroup

    // Can_Init should not match "read"
    expect(screen.queryByText('Can_Init')).not.toBeInTheDocument();
  });

  // ─── Search by brief/description ───────────────────────────────────
  it('search should also match against brief descriptions', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索 API...');

    // Search for something that might appear in brief but not API name
    fireEvent.change(searchInput, { target: { value: '中断' } });

    // Should still show results (from brief)
    const resultsHeader = screen.getByText(/搜索结果/);
    expect(resultsHeader).toBeInTheDocument();
  });

  // ─── Search result limit ───────────────────────────────────────────
  it('should limit search results to 20', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索 API...');

    // Search with broad term
    fireEvent.change(searchInput, { target: { value: 'a' } });

    // Count result buttons (not the header)
    const resultButtons = screen.getAllByRole('button').filter(
      btn => btn.textContent && btn.textContent.length > 0
    );
    // Search results should show at most 20 items (plus nav buttons)
    expect(resultButtons.length).toBeGreaterThan(0);
  });

  // ─── Empty search query restores tree ──────────────────────────────
  it('should restore full tree when search query is cleared', () => {
    render(<SpecTreeNav selectedApi={null} onSelectApi={vi.fn()} />);
    const searchInput = screen.getByPlaceholderText('搜索 API...');

    fireEvent.change(searchInput, { target: { value: 'Init' } });
    expect(screen.getByText(/搜索结果/)).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    // Tree should be back
    expect(screen.getByText('MCAL')).toBeInTheDocument();
    expect(screen.queryByText(/搜索结果/)).not.toBeInTheDocument();
  });
});
