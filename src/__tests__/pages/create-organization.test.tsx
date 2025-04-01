import { render, screen } from '../test-utils';
import CreateOrganizationPage from '@/pages/create-organization/[[...index]]';

describe('CreateOrganizationPage', () => {
  it('renders the create organization component', () => {
    render(<CreateOrganizationPage />);
    
    expect(screen.getByTestId('mock-create-org')).toBeInTheDocument();
  });

  it('renders with correct layout styles', () => {
    render(<CreateOrganizationPage />);
    
    const container = screen.getByTestId('mock-create-org').parentElement;
    expect(container).toHaveStyle({
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      padding: '20px',
    });
  });
}); 