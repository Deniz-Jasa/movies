import * as React from 'react';
import { cn, debounce } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Input, type InputProps } from '@/components/ui/input';
import { useOnClickOutside } from '@/hooks/use-on-click-outside';

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

  // close search input on clicking outside,
  useOnClickOutside(inputRef, () => {
    if (!value) onChangeStatusOpen(false);
  });

  // configure keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // close search input on pressing escape
      if (e.key === 'Escape') {
        void onChange('');
      }
      // open search input on pressing ctrl + k or cmd + k
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        if (!inputRef.current) return;
        e.preventDefault();
        onChangeStatusOpen(true);
        inputRef.current.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const debounceInput = React.useCallback(
    debounce((value) => {
      const strValue = value as string;
      void onChange(strValue);
    }, debounceTimeout),
    [],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    debounceInput(event.target.value);
  };

  return (
    <div className={cn('relative', containerClassName)}>
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder="Search..."
        className={cn(
          'h-auto py-2 pl-10 pr-4 text-sm transition-all duration-300 ease-in-out', // Added more padding to left (pl-10) and right (pr-4)
          open
            ? 'w-50 border md:w-52 lg:w-80' // Increased width for larger screens
            : 'w-0 border-none bg-transparent',
          className,
        )}
        defaultValue={value}
        maxLength={maxLength}
        onChange={handleChange}
        {...props}
      />
      {/* Button when input is not open */}
      {!open && (
        <Button
          id="search-btn"
          aria-label="Search"
          variant="outline" // Regular outline when input is closed
          className={cn(
            'absolute top-1/2 -translate-y-1/2 p-2 pl-2.5 pr-2.5',
            open ? 'left-2 bg-transparent' : 'left-[13px]',
          )}
          onClick={() => {
            if (!inputRef.current) {
              return;
            }
            inputRef.current.focus();
            onChangeStatusOpen(!open);
          }}
        >
          <Icons.search
            className={cn(
              'transition-opacity hover:opacity-75 active:scale-95',
              open ? 'h-4 w-4' : 'h-5 w-5',
            )}
            aria-hidden="true"
          />
        </Button>
      )}

      {/* Button when input is open (ghost variant) */}
      {open && (
        <Button
          id="search-btn-ghost"
          aria-label="Search"
          variant="ghost" // Ghost variant when input is open
          className={cn(
            'absolute top-1/2 -translate-y-1/2 p-2 left-1', // Adjust left to position the icon correctly
          )}
          onClick={() => {
            if (!inputRef.current) {
              return;
            }
            inputRef.current.focus();
            onChangeStatusOpen(!open);
          }}
        >
          <Icons.search
            className={cn(
              'transition-opacity hover:opacity-75 active:scale-95',
              open ? 'h-4 w-4' : 'h-5 w-5',
            )}
            aria-hidden="true"
          />
        </Button>
      )}
    </div>
  );
}
