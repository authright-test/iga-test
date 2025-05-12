import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../Layout';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock auth context
jest.mock('../../contexts/AuthContext', () => {
  const originalModule = jest.requireActual('../../contexts/AuthContext');
  return {
    ...originalModule,
    useAuth: () => ({
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        avatarUrl: 'https://example.com/avatar.png'
      },
      logout: jest.fn(),
      isAuthenticated: true
    })
  };
});

describe('Layout Component', () => {
  const renderLayout = (props = {}) => {
    return render(
      <MemoryRouter>
        <AuthProvider>
          <Layout {...props}>
            <div data-testid="test-content">Test Content</div>
          </Layout>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    // Reset window size to desktop
    global.innerWidth = 1200;
    global.dispatchEvent(new Event('resize'));
  });

  it('should render sidebar and content', () => {
    renderLayout();
    
    // Check for sidebar items
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Roles')).toBeInTheDocument();
    expect(screen.getByText('Policies')).toBeInTheDocument();
    
    // Check for content
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render user information', () => {
    renderLayout();
    
    // Check for user info in header
    expect(screen.getByText('testuser')).toBeInTheDocument();
  });

  it('should handle mobile view and sidebar toggle', () => {
    // Mock mobile screen size
    global.innerWidth = 500;
    global.dispatchEvent(new Event('resize'));
    
    const { container } = renderLayout();
    
    // Check that sidebar is hidden on mobile
    const sidebar = container.querySelector('[display="none"]');
    expect(sidebar).toBeTruthy();
    
    // Find hamburger menu
    const menuButton = screen.getByLabelText('open menu');
    expect(menuButton).toBeInTheDocument();
    
    // Open sidebar
    act(() => {
      userEvent.click(menuButton);
    });
    
    // Check that drawer content is shown
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    
    // Find close button
    const closeButton = screen.getByLabelText('close');
    
    // Close sidebar
    act(() => {
      userEvent.click(closeButton);
    });
  });

  it('should pass drawerDisclosure if provided', () => {
    const mockDisclosure = {
      isOpen: true,
      onOpen: jest.fn(),
      onClose: jest.fn()
    };
    
    renderLayout({ drawerDisclosure: mockDisclosure });
    
    // Sidebar should be visible because isOpen is true
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThan(0);
    
    // Find close button
    const closeButton = screen.getByLabelText('close');
    
    // Close sidebar
    act(() => {
      userEvent.click(closeButton);
    });
    
    expect(mockDisclosure.onClose).toHaveBeenCalled();
  });
}); 