'use client';

import * as React from 'react';
import { cn, debounce } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';
import { Search as LucideSearch } from 'lucide-react';

interface DebouncedInputProps extends Omit<InputProps, 'onChange'> {
  containerClassName?: string;
  value: string;
  open: boolean;
  onChange: (value: string) => Promise<void>;
  onChangeStatusOpen: (value: boolean) => void;
  debounceTimeout?: number;
  maxLength?: number;
}

export function DebouncedInput({
  id = 'query',
  containerClassName,
  open,
  value,
  onChange,
  maxLength = 80,
  debounceTimeout = 300,
  onChangeStatusOpen,
  className,
  ...props
}: DebouncedInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Close on outside click
  useOnClickOutside(inputRef, () => {
    if (!value) onChangeStatusOpen(false);
  });

  // Escape clears, Ctrl/Cmd+K opens
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') void onChange('');
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onChangeStatusOpen(true);
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange, onChangeStatusOpen]);

  // Debounced onChange wrapper — accepts any args, pulls out first as string
  const debounceInput = React.useCallback(
    debounce((...args: any[]) => {
      const v = args[0] as string;
      void onChange(v);
    }, debounceTimeout),
    [onChange, debounceTimeout]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debounceInput(e.target.value);
  };

  return (
    <div className={cn('relative', containerClassName)}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        className={cn(
          'h-auto py-[8.5px] pl-10 pr-4 text-[10pt] transition-all duration-300 ease-in-out',
          open ? 'w-50 border md:w-52 lg:w-80' : 'w-0 border-none bg-transparent',
          className
        )}
        defaultValue={value}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />

      {/* CLOSED state */}
      {!open ? (
        <Button
          id="search-btn"
          aria-label="Search"
          variant="outline"
          size="icon"
          className={cn(
            'absolute top-1/2 -translate-y-1/2',
            open ? 'left-2' : 'left-[13px]',
            'rounded-full'
          )}
          onClick={() => {
            inputRef.current?.focus();
            onChangeStatusOpen(!open);
          }}
        >
          <LucideSearch size={14} aria-hidden />
        </Button>
      ) : (
        /* OPEN state */
        <Button
          id="close-search-btn"
          aria-label="Close search"
          variant="ghost"
          size="icon"
          className="absolute top-1/2 left-1 -translate-y-1/2 rounded-full"
          onClick={() => {
            inputRef.current?.focus();
            onChangeStatusOpen(!open);
          }}
        >
          <LucideSearch size={14} aria-hidden />
        </Button>
      )}
    </div>
  );
}
