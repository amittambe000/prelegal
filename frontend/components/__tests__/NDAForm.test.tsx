import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NDAForm from '../NDAForm';
import { NDAFormData } from '@/types/nda';

describe('NDAForm', () => {
  const mockFormData: NDAFormData = {
    party1Name: '',
    party1Email: '',
    party2Name: '',
    party2Email: '',
    purpose: '',
    effectiveDate: '',
    mndaTerm: '',
    confidentialityTerm: '',
    governingLaw: '',
    jurisdiction: '',
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render all form sections', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByText('Party 1 Information')).toBeInTheDocument();
    expect(screen.getByText('Party 2 Information')).toBeInTheDocument();
    expect(screen.getByText('Agreement Terms')).toBeInTheDocument();
    expect(screen.getByText('Legal Terms')).toBeInTheDocument();
  });

  it('should render all form fields', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Party 1 Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Party 1 Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Party 2 Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Party 2 Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Purpose/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Effective Date/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/MNDA Term/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Term of Confidentiality/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Governing Law/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Jurisdiction/i)).toBeInTheDocument();
  });

  it('should display current form values', () => {
    const filledFormData = {
      ...mockFormData,
      party1Name: 'Acme Corp',
      party1Email: 'contact@acme.com',
    };

    render(<NDAForm formData={filledFormData} onChange={mockOnChange} />);

    expect(screen.getByDisplayValue('Acme Corp')).toBeInTheDocument();
    expect(screen.getByDisplayValue('contact@acme.com')).toBeInTheDocument();
  });

  it('should call onChange when text input changes', async () => {
    const user = userEvent.setup();
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    const party1NameInput = screen.getByLabelText(/Party 1 Name/i);
    await user.type(party1NameInput, 'Test Company');

    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.party1Name).toBe('Test Company');
  });

  it('should call onChange when email input changes', async () => {
    const user = userEvent.setup();
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    const emailInput = screen.getByLabelText(/Party 1 Email/i);
    await user.type(emailInput, 'test@example.com');

    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.party1Email).toBe('test@example.com');
  });

  it('should call onChange when textarea changes', async () => {
    const user = userEvent.setup();
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    const purposeTextarea = screen.getByLabelText(/Purpose/i);
    await user.type(purposeTextarea, 'Business partnership');

    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.purpose).toBe('Business partnership');
  });

  it('should call onChange when select changes', async () => {
    const user = userEvent.setup();
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    const mndaTermSelect = screen.getByLabelText(/MNDA Term/i);
    await user.selectOptions(mndaTermSelect, '2 years from the Effective Date');

    expect(mockOnChange).toHaveBeenCalled();
    const lastCall = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
    expect(lastCall.mndaTerm).toBe('2 years from the Effective Date');
  });

  it('should show all MNDA term options', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    const mndaTermSelect = screen.getByLabelText(/MNDA Term/i);
    expect(mndaTermSelect).toHaveLength(5); // Including "Select term..." option

    expect(screen.getByRole('option', { name: /1 year/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /2 years/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /3 years/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /5 years/i })).toBeInTheDocument();
  });

  it('should show all confidentiality term options', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByRole('option', { name: /2 years/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /3 years/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /5 years/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /7 years/i })).toBeInTheDocument();
  });

  it('should show all governing law state options', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByRole('option', { name: /Delaware/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /California/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /New York/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Texas/i })).toBeInTheDocument();
  });

  it('should have required attribute on all inputs', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Party 1 Name/i)).toBeRequired();
    expect(screen.getByLabelText(/Party 1 Email/i)).toBeRequired();
    expect(screen.getByLabelText(/Party 2 Name/i)).toBeRequired();
    expect(screen.getByLabelText(/Party 2 Email/i)).toBeRequired();
    expect(screen.getByLabelText(/Purpose/i)).toBeRequired();
    expect(screen.getByLabelText(/Effective Date/i)).toBeRequired();
  });

  it('should have email type for email inputs', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Party 1 Email/i)).toHaveAttribute('type', 'email');
    expect(screen.getByLabelText(/Party 2 Email/i)).toHaveAttribute('type', 'email');
  });

  it('should have date type for date input', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Effective Date/i)).toHaveAttribute('type', 'date');
  });

  it('should show placeholder text', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByPlaceholderText(/e.g., Acme Corporation/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., contact@acme.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g., Tech Solutions Inc./i)).toBeInTheDocument();
  });

  it('should show helper text for fields', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByText(/Describe what this NDA is for/i)).toBeInTheDocument();
    expect(screen.getByText(/How long the agreement lasts/i)).toBeInTheDocument();
    expect(screen.getByText(/How long information must remain confidential/i)).toBeInTheDocument();
    expect(screen.getByText(/Where legal disputes will be resolved/i)).toBeInTheDocument();
  });

  it('should indicate all fields are required', () => {
    render(<NDAForm formData={mockFormData} onChange={mockOnChange} />);

    expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
  });
});
