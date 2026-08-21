import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';
import { FormField } from '../FormField';
import { Modal } from '../Modal';
import { Tooltip } from '../Tooltip';
import { Tree } from '../Tree';
import { PropertyPanel } from '../PropertyPanel';
import { cn } from '../../lib/cn';

describe('cn', () => {
  it('merges conflicting classes (tailwind-merge)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4');
    expect(cn('text-sm', false && 'hidden')).toBe('text-sm');
  });
});

describe('Button', () => {
  it('renders children and applies variant classes', () => {
    render(<Button variant="destructive">Delete</Button>);
    const btn = screen.getByRole('button', { name: /delete/i });
    expect(btn).toHaveClass('bg-red-600');
  });

  it('shows spinner when loading and disables', () => {
    render(<Button loading>Save</Button>);
    const btn = screen.getByRole('button', { name: /save/i });
    expect(btn).toBeDisabled();
    expect(btn.querySelector('.animate-spin')).toBeTruthy();
  });

  it('merges className', () => {
    render(<Button className="mt-4">Go</Button>);
    expect(screen.getByRole('button')).toHaveClass('mt-4');
  });
});

describe('Input', () => {
  it('renders with invalid state', () => {
    render(<Input invalid aria-label="name" />);
    const input = screen.getByLabelText('name');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveClass('border-red-500');
  });

  it('forwards value/onChange', () => {
    render(<Input aria-label="q" defaultValue="abc" />);
    expect(screen.getByLabelText('q')).toHaveValue('abc');
  });
});

describe('Select', () => {
  it('renders options and fires onChange', () => {
    render(
      <Select
        aria-label="mode"
        options={[
          { value: 'a', label: 'Option A' },
          { value: 'b', label: 'Option B' },
        ]}
      />
    );
    const sel = screen.getByLabelText('mode');
    expect(sel).toHaveDisplayValue('Option A');
    fireEvent.change(sel, { target: { value: 'b' } });
    expect(sel).toHaveValue('b');
  });

  it('shows placeholder when provided', () => {
    render(
      <Select aria-label="pick" placeholder="Choose..." options={[{ value: 'x', label: 'X' }]} />
    );
    const placeholderOpt = screen.getByRole('option', { name: 'Choose...' });
    expect(placeholderOpt).toHaveAttribute('value', '');
    expect(placeholderOpt).toBeDisabled();
  });
});

describe('FormField', () => {
  it('renders label, required marker and error', () => {
    render(
      <FormField label="Username" required error="Required field">
        <Input aria-label="username" invalid />
      </FormField>
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Required field');
  });

  it('shows hint when no error', () => {
    render(
      <FormField label="Email" hint="Will not be shared">
        <Input aria-label="email" />
      </FormField>
    );
    expect(screen.getByText('Will not be shared')).toBeInTheDocument();
  });
});

describe('Modal', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}}>
        <div>body</div>
      </Modal>
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders title/body and closes on overlay click', () => {
    const onClose = vi.fn();
    render(
      <Modal open title="Confirm" onClose={onClose}>
        <div>Are you sure?</div>
      </Modal>
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Confirm')).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('dialog').querySelector('.absolute.inset-0')!);
    expect(onClose).toHaveBeenCalled();
  });

  it('closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose}>
        <div>body</div>
      </Modal>
    );
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('Tooltip', () => {
  it('shows content on hover after delay', async () => {
    render(
      <Tooltip content="Help text" delay={0}>
        <button>Hover me</button>
      </Tooltip>
    );
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
    fireEvent.mouseOver(screen.getByText('Hover me'));
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent('Help text'));
  });
});

describe('Tree', () => {
  const nodes = [
    {
      id: 'a',
      label: 'Root',
      defaultExpanded: true,
      children: [{ id: 'a1', label: 'Child' }],
    },
  ];

  it('renders nested nodes and selects', () => {
    const onSelect = vi.fn();
    render(<Tree nodes={nodes} selectedId="a1" onSelect={onSelect} />);
    expect(screen.getByText('Root')).toBeInTheDocument();
    expect(screen.getByText('Child')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Child'));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: 'a1' }));
  });
});

describe('PropertyPanel', () => {
  it('renders title and items with highlight', () => {
    render(
      <PropertyPanel
        title="Info"
        items={[
          { key: 'k1', label: 'Name', value: 'yuleASR' },
          { key: 'k2', label: 'Status', value: 'OK', highlight: true },
        ]}
      />
    );
    expect(screen.getByText('Info')).toBeInTheDocument();
    expect(screen.getByText('yuleASR')).toBeInTheDocument();
    expect(screen.getByText('OK')).toBeInTheDocument();
  });
});
