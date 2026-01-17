/**
 * Performance Utilities for Wassel Application
 * Provides utilities for performance optimization and monitoring
 */

import { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Debounce function for optimizing frequent function calls
 */
export function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: Parameters<T>) {
        const later = () => {
            timeout = null;
            func(...args);
        };

        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for rate-limiting function executions
 */
export function throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
): (...args: Parameters<T>) => void {
    let inThrottle = false;

    return function executedFunction(...args: Parameters<T>) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => {
                inThrottle = false;
            }, limit);
        }
    };
}

/**
 * Custom hook for debounced values
 */
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

/**
 * Custom hook for throttled callbacks
 */
export function useThrottledCallback<T extends (...args: any[]) => any>(
    callback: T,
    delay: number
): T {
    const lastRan = useRef(Date.now());

    const throttledCallback = useCallback(
        (...args: Parameters<T>) => {
            if (Date.now() - lastRan.current >= delay) {
                callback(...args);
                lastRan.current = Date.now();
            }
        },
        [callback, delay]
    ) as T;

    return throttledCallback;
}

/**
 * Lazy load an image with placeholder
 */
export function useLazyImage(src: string, placeholder?: string): {
    imageSrc: string;
    isLoading: boolean;
    error: boolean;
} {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const img = new Image();
        img.src = src;

        img.onload = () => {
            setImageSrc(src);
            setIsLoading(false);
        };

        img.onerror = () => {
            setError(true);
            setIsLoading(false);
        };

        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src]);

    return { imageSrc, isLoading, error };
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
    options?: IntersectionObserverInit
): [React.RefObject<HTMLDivElement>, boolean] {
    const ref = useRef<HTMLDivElement>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(([entry]) => {
            setIsIntersecting(entry.isIntersecting);
        }, options);

        observer.observe(element);

        return () => {
            observer.disconnect();
        };
    }, [options]);

    return [ref, isIntersecting];
}

/**
 * Measure and report component render times
 */
export function useRenderTime(componentName: string): void {
    const renderStart = useRef(performance.now());

    useEffect(() => {
        const renderTime = performance.now() - renderStart.current;

        if (process.env.NODE_ENV === 'development' && renderTime > 16) {
            console.warn(
                `[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`
            );
        }
    });

    renderStart.current = performance.now();
}

/**
 * Track memory usage (development only)
 */
export function useMemoryMonitor(): { usedJSHeapSize: number; jsHeapSizeLimit: number } | null {
    const [memory, setMemory] = useState<{ usedJSHeapSize: number; jsHeapSizeLimit: number } | null>(null);

    useEffect(() => {
        if (process.env.NODE_ENV !== 'development') return;

        const memoryInfo = (performance as any).memory;
        if (!memoryInfo) return;

        const interval = setInterval(() => {
            setMemory({
                usedJSHeapSize: memoryInfo.usedJSHeapSize,
                jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
            });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return memory;
}

/**
 * Preload critical resources
 */
export function preloadResource(href: string, as: 'script' | 'style' | 'image' | 'font'): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;

    if (as === 'font') {
        link.crossOrigin = 'anonymous';
    }

    document.head.appendChild(link);
}

/**
 * Prefetch next page resources
 */
export function prefetchPage(href: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
}

/**
 * Virtual list for large data sets
 */
export function useVirtualList<T>(
    items: T[],
    itemHeight: number,
    containerHeight: number
): {
    visibleItems: T[];
    startIndex: number;
    endIndex: number;
    totalHeight: number;
    offsetY: number;
    onScroll: (scrollTop: number) => void;
} {
    const [scrollTop, setScrollTop] = useState(0);

    const visibleCount = Math.ceil(containerHeight / itemHeight);
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(startIndex + visibleCount + 1, items.length);
    const visibleItems = items.slice(startIndex, endIndex);
    const totalHeight = items.length * itemHeight;
    const offsetY = startIndex * itemHeight;

    const onScroll = useCallback((newScrollTop: number) => {
        setScrollTop(newScrollTop);
    }, []);

    return {
        visibleItems,
        startIndex,
        endIndex,
        totalHeight,
        offsetY,
        onScroll,
    };
}

/**
 * Request idle callback polyfill
 */
export function requestIdleCallbackPolyfill(
    callback: IdleRequestCallback,
    options?: IdleRequestOptions
): number {
    if ('requestIdleCallback' in window) {
        return window.requestIdleCallback(callback, options);
    }

    // Fallback for browsers that don't support requestIdleCallback
    const start = Date.now();
    return window.setTimeout(() => {
        callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        });
    }, 1) as unknown as number;
}

/**
 * Cancel idle callback polyfill
 */
export function cancelIdleCallbackPolyfill(handle: number): void {
    if ('cancelIdleCallback' in window) {
        window.cancelIdleCallback(handle);
    } else {
        window.clearTimeout(handle);
    }
}

/**
 * Batch DOM updates for better performance
 */
export function batchDOMUpdates(updates: (() => void)[]): void {
    requestAnimationFrame(() => {
        updates.forEach(update => update());
    });
}
