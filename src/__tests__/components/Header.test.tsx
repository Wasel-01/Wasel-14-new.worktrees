import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Header } from '../../components/Header';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';

// Mock mocks
vi.mock('../../hooks/useNotifications');
vi.mock('../../contexts/AuthContext');
vi.mock('../../contexts/LanguageContext');
vi.mock('../../components/Logo', () => ({
    Logo: () => <div data-testid="logo">Logo</div>
}));
vi.mock('../../components/JourneyProgress', () => ({
    JourneyProgress: () => <div data-testid="journey-progress">JourneyProgress</div>
}));
// Mock motion to avoid animation issues in tests
vi.mock('motion/react', () => ({
    motion: {
        div: ({ children, className }: any) => <div className={className}>{children}</div>
    },
    AnimatePresence: ({ children }: any) => <>{children}</>
}));

describe('Header', () => {
    const mockOnMenuClick = vi.fn();
    const mockOnNavigate = vi.fn();
    const mockUpdateProfile = vi.fn();
    const mockSetLanguage = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementations
        (useNotifications as any).mockReturnValue({
            unreadCount: 0
        });

        (useAuth as any).mockReturnValue({
            profile: {
                onboarding_completed_steps: [1],
                onboarding_current_step: 2
            },
            updateProfile: mockUpdateProfile
        });

        (useLanguage as any).mockReturnValue({
            language: 'en',
            setLanguage: mockSetLanguage,
            t: (key: string) => key
        });
    });

    it('renders correctly', () => {
        render(<Header onMenuClick={mockOnMenuClick} onNavigate={mockOnNavigate} />);

        expect(screen.getByText('Wassel')).toBeInTheDocument();
        expect(screen.getByTestId('logo')).toBeInTheDocument();
        expect(screen.queryByText('9+')).not.toBeInTheDocument();
    });

    it('calls onMenuClick when menu button is clicked', () => {
        render(<Header onMenuClick={mockOnMenuClick} onNavigate={mockOnNavigate} />);
        const menuButton = screen.getByLabelText('Open menu');
        fireEvent.click(menuButton);
        expect(mockOnMenuClick).toHaveBeenCalled();
    });

    it('shows notification badge when there are unread notifications', () => {
        (useNotifications as any).mockReturnValue({
            unreadCount: 5
        });

        render(<Header onMenuClick={mockOnMenuClick} onNavigate={mockOnNavigate} />);

        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('handles navigation to notifications', () => {
        render(<Header onMenuClick={mockOnMenuClick} onNavigate={mockOnNavigate} />);

        const notifButton = screen.getByLabelText('Notifications');
        fireEvent.click(notifButton);
        expect(mockOnNavigate).toHaveBeenCalledWith('notifications');
    });

    it('toggles language menu and switches language', () => {
        render(<Header onMenuClick={mockOnMenuClick} onNavigate={mockOnNavigate} />);

        const langButton = screen.getByLabelText('Change language');
        fireEvent.click(langButton);

        expect(screen.getByText('English')).toBeInTheDocument();
        expect(screen.getByText('العربية')).toBeInTheDocument();

        fireEvent.click(screen.getByText('العربية'));
        expect(mockSetLanguage).toHaveBeenCalledWith('ar');
    });

    it('navigates to profile on avatar click', () => {
        render(<Header onMenuClick={mockOnMenuClick} onNavigate={mockOnNavigate} />);

        const avatarButton = screen.getByLabelText('Profile');
        fireEvent.click(avatarButton);
        expect(mockOnNavigate).toHaveBeenCalledWith('profile');
    });
});
