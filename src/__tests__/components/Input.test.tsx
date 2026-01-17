import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../../components/ui/input';

describe('Input Component', () => {
    it('renders input element', () => {
        render(<Input placeholder="Enter text" />);
        expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    it('accepts user input', async () => {
        render(<Input placeholder="Type here" />);
        const input = screen.getByPlaceholderText('Type here');

        await userEvent.type(input, 'Hello World');
        expect(input).toHaveValue('Hello World');
    });

    it('can be disabled', () => {
        render(<Input disabled placeholder="Disabled input" />);
        expect(screen.getByPlaceholderText('Disabled input')).toBeDisabled();
    });

    it('supports different types', () => {
        const { rerender } = render(<Input type="text" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'text');

        rerender(<Input type="password" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'password');

        rerender(<Input type="email" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'email');

        rerender(<Input type="number" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('type', 'number');
    });

    it('applies custom className', () => {
        render(<Input className="custom-class" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveClass('custom-class');
    });

    it('handles onChange events', async () => {
        const handleChange = vi.fn();
        render(<Input onChange={handleChange} placeholder="Input" />);

        const input = screen.getByPlaceholderText('Input');
        await userEvent.type(input, 'a');

        expect(handleChange).toHaveBeenCalled();
    });

    it('handles onFocus and onBlur events', async () => {
        const handleFocus = vi.fn();
        const handleBlur = vi.fn();

        render(
            <Input
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Focus test"
            />
        );

        const input = screen.getByPlaceholderText('Focus test');

        await userEvent.click(input);
        expect(handleFocus).toHaveBeenCalled();

        await userEvent.tab();
        expect(handleBlur).toHaveBeenCalled();
    });

    it('supports readonly attribute', () => {
        render(<Input readOnly value="Read only" data-testid="input" />);
        expect(screen.getByTestId('input')).toHaveAttribute('readonly');
    });

    it('supports required attribute', () => {
        render(<Input required data-testid="input" />);
        expect(screen.getByTestId('input')).toBeRequired();
    });
});
