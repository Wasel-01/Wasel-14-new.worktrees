import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { vi } from 'vitest';

// Mock user type based on Supabase User
interface MockUser {
    id: string;
    email: string;
    created_at: string;
    app_metadata: Record<string, any>;
    user_metadata: Record<string, any>;
    aud: string;
    role?: string;
}

// Create mock user helper
export function createMockUser(overrides: Partial<MockUser> = {}): MockUser {
    return {
        id: 'test-user-id',
        email: 'test@wassel.com',
        created_at: new Date().toISOString(),
        app_metadata: {},
        user_metadata: { name: 'Test User' },
        aud: 'authenticated',
        ...overrides,
    };
}

// Mock AuthContext
const MockAuthContext = React.createContext<{
    user: MockUser | null;
    loading: boolean;
    signIn: () => Promise<void>;
    signUp: () => Promise<void>;
    signOut: () => Promise<void>;
}>({
    user: null,
    loading: false,
    signIn: async () => { },
    signUp: async () => { },
    signOut: async () => { },
});

// Mock LanguageContext
const MockLanguageContext = React.createContext<{
    language: 'en' | 'ar';
    setLanguage: (lang: 'en' | 'ar') => void;
    t: (key: string) => string;
    dir: 'ltr' | 'rtl';
}>({
    language: 'en',
    setLanguage: () => { },
    t: (key: string) => key,
    dir: 'ltr',
});

// Mock AIContext
const MockAIContext = React.createContext<{
    isAIEnabled: boolean;
    toggleAI: () => void;
}>({
    isAIEnabled: false,
    toggleAI: () => { },
});

interface MockProviderProps {
    children: React.ReactNode;
    user?: MockUser | null;
    loading?: boolean;
    language?: 'en' | 'ar';
}

// Providers wrapper for testing
export function MockProviders({
    children,
    user = null,
    loading = false,
    language = 'en',
}: MockProviderProps) {
    return (
        <MockLanguageContext.Provider
            value={{
                language,
                setLanguage: vi.fn(),
                t: (key: string) => key,
                dir: language === 'ar' ? 'rtl' : 'ltr',
            }}
        >
            <MockAuthContext.Provider
                value={{
                    user,
                    loading,
                    signIn: vi.fn(),
                    signUp: vi.fn(),
                    signOut: vi.fn(),
                }}
            >
                <MockAIContext.Provider
                    value={{
                        isAIEnabled: false,
                        toggleAI: vi.fn(),
                    }}
                >
                    {children}
                </MockAIContext.Provider>
            </MockAuthContext.Provider>
        </MockLanguageContext.Provider>
    );
}

// Custom render function with providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    user?: MockUser | null;
    loading?: boolean;
    language?: 'en' | 'ar';
}

export function renderWithProviders(
    ui: ReactElement,
    {
        user = null,
        loading = false,
        language = 'en',
        ...renderOptions
    }: CustomRenderOptions = {}
) {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <MockProviders user={user} loading={loading} language={language}>
                {children}
            </MockProviders>
        );
    }
    return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
