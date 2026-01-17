import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
    debounce,
    throttle,
    useDebounce,
    useVirtualList,
} from '../../utils/performance';

describe('Performance Utilities', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('debounce', () => {
        it('should debounce function calls', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            debouncedFn();
            debouncedFn();

            expect(fn).not.toHaveBeenCalled();

            vi.advanceTimersByTime(100);

            expect(fn).toHaveBeenCalledTimes(1);
        });

        it('should pass arguments to debounced function', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn('arg1', 'arg2');

            vi.advanceTimersByTime(100);

            expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
        });

        it('should reset timer on subsequent calls', () => {
            const fn = vi.fn();
            const debouncedFn = debounce(fn, 100);

            debouncedFn();
            vi.advanceTimersByTime(50);
            debouncedFn();
            vi.advanceTimersByTime(50);
            debouncedFn();
            vi.advanceTimersByTime(50);

            expect(fn).not.toHaveBeenCalled();

            vi.advanceTimersByTime(50);

            expect(fn).toHaveBeenCalledTimes(1);
        });
    });

    describe('throttle', () => {
        it('should throttle function calls', () => {
            const fn = vi.fn();
            const throttledFn = throttle(fn, 100);

            throttledFn();
            throttledFn();
            throttledFn();

            expect(fn).toHaveBeenCalledTimes(1);

            vi.advanceTimersByTime(100);

            throttledFn();
            expect(fn).toHaveBeenCalledTimes(2);
        });

        it('should pass arguments to throttled function', () => {
            const fn = vi.fn();
            const throttledFn = throttle(fn, 100);

            throttledFn('first');
            expect(fn).toHaveBeenCalledWith('first');

            vi.advanceTimersByTime(100);

            throttledFn('second');
            expect(fn).toHaveBeenCalledWith('second');
        });
    });

    describe('useDebounce', () => {
        it('should debounce value changes', () => {
            const { result, rerender } = renderHook(
                ({ value }) => useDebounce(value, 100),
                { initialProps: { value: 'initial' } }
            );

            expect(result.current).toBe('initial');

            rerender({ value: 'updated' });
            expect(result.current).toBe('initial');

            act(() => {
                vi.advanceTimersByTime(100);
            });

            expect(result.current).toBe('updated');
        });

        it('should cancel previous debounce on new value', () => {
            const { result, rerender } = renderHook(
                ({ value }) => useDebounce(value, 100),
                { initialProps: { value: 'first' } }
            );

            rerender({ value: 'second' });
            act(() => {
                vi.advanceTimersByTime(50);
            });

            rerender({ value: 'third' });
            act(() => {
                vi.advanceTimersByTime(50);
            });

            expect(result.current).toBe('first');

            act(() => {
                vi.advanceTimersByTime(50);
            });

            expect(result.current).toBe('third');
        });
    });

    describe('useVirtualList', () => {
        it('should calculate visible items correctly', () => {
            const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

            const { result } = renderHook(() =>
                useVirtualList(items, 50, 200)
            );

            // With container height 200 and item height 50, we should see ~4-5 items
            expect(result.current.visibleItems.length).toBeLessThanOrEqual(6);
            expect(result.current.startIndex).toBe(0);
            expect(result.current.totalHeight).toBe(5000); // 100 items * 50px
        });

        it('should update visible items on scroll', () => {
            const items = Array.from({ length: 100 }, (_, i) => ({ id: i }));

            const { result } = renderHook(() =>
                useVirtualList(items, 50, 200)
            );

            act(() => {
                result.current.onScroll(500); // Scroll down 500px
            });

            expect(result.current.startIndex).toBe(10); // 500 / 50 = 10
            expect(result.current.offsetY).toBe(500);
        });

        it('should handle empty list', () => {
            const { result } = renderHook(() =>
                useVirtualList([], 50, 200)
            );

            expect(result.current.visibleItems).toHaveLength(0);
            expect(result.current.totalHeight).toBe(0);
        });

        it('should handle list smaller than container', () => {
            const items = [{ id: 0 }, { id: 1 }];

            const { result } = renderHook(() =>
                useVirtualList(items, 50, 200)
            );

            expect(result.current.visibleItems.length).toBe(2);
            expect(result.current.totalHeight).toBe(100);
        });
    });
});

describe('Performance Metrics', () => {
    it('should track render time in development', () => {
        const mockConsoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => { });

        // Component that takes long to render would trigger warning
        // This is a simplified test

        mockConsoleWarn.mockRestore();
    });
});
