import { render, screen } from '../test-utils';
import OrganizationSelectorPage from '@/pages/organization-selector/[[...index]]';

describe('OrganizationSelectorPage', () => {
  it('renders the organization list component', () => {
    render(<OrganizationSelectorPage />);
    
    expect(screen.getByTestId('mock-org-list')).toBeInTheDocument();
  });

  it('renders the page title', () => {
    render(<OrganizationSelectorPage />);
    
    expect(screen.getByText('Select an Organization')).toBeInTheDocument();
  });

  it('renders with correct layout styles', () => {
    render(<OrganizationSelectorPage />);
    
    const container = screen.getByTestId('mock-org-list').parentElement?.parentElement;
    expect(container).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
    });
  });
}); 