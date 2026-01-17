import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';

describe('Card Components', () => {
    describe('Card', () => {
        it('renders card with content', () => {
            render(
                <Card data-testid="card">
                    <CardContent>Card content</CardContent>
                </Card>
            );
            expect(screen.getByTestId('card')).toBeInTheDocument();
            expect(screen.getByText('Card content')).toBeInTheDocument();
        });

        it('applies custom className', () => {
            render(
                <Card className="custom-class" data-testid="card">
                    Content
                </Card>
            );
            expect(screen.getByTestId('card')).toHaveClass('custom-class');
        });
    });

    describe('CardHeader', () => {
        it('renders card header', () => {
            render(
                <Card>
                    <CardHeader data-testid="header">
                        <CardTitle>Title</CardTitle>
                    </CardHeader>
                </Card>
            );
            expect(screen.getByTestId('header')).toBeInTheDocument();
        });
    });

    describe('CardTitle', () => {
        it('renders card title', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Test Title</CardTitle>
                    </CardHeader>
                </Card>
            );
            expect(screen.getByText('Test Title')).toBeInTheDocument();
        });
    });

    describe('CardDescription', () => {
        it('renders card description', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardDescription>Test Description</CardDescription>
                    </CardHeader>
                </Card>
            );
            expect(screen.getByText('Test Description')).toBeInTheDocument();
        });
    });

    describe('CardContent', () => {
        it('renders card content', () => {
            render(
                <Card>
                    <CardContent data-testid="content">
                        Main content here
                    </CardContent>
                </Card>
            );
            expect(screen.getByTestId('content')).toBeInTheDocument();
            expect(screen.getByText('Main content here')).toBeInTheDocument();
        });
    });

    describe('CardFooter', () => {
        it('renders card footer', () => {
            render(
                <Card>
                    <CardFooter data-testid="footer">
                        Footer content
                    </CardFooter>
                </Card>
            );
            expect(screen.getByTestId('footer')).toBeInTheDocument();
            expect(screen.getByText('Footer content')).toBeInTheDocument();
        });
    });

    describe('Full Card', () => {
        it('renders complete card with all parts', () => {
            render(
                <Card>
                    <CardHeader>
                        <CardTitle>Complete Card</CardTitle>
                        <CardDescription>With all components</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p>Main content goes here</p>
                    </CardContent>
                    <CardFooter>
                        <button>Action</button>
                    </CardFooter>
                </Card>
            );

            expect(screen.getByText('Complete Card')).toBeInTheDocument();
            expect(screen.getByText('With all components')).toBeInTheDocument();
            expect(screen.getByText('Main content goes here')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
        });
    });
});
