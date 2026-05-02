import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChangePasswordPage from '../page';
import { AuthService } from '@/shared/services/auth-service';
import { useRouter } from 'next/navigation';

vi.mock('@mui/icons-material', () => ({
  Lock: () => <div data-testid="LockIcon" />,
  Visibility: () => <div data-testid="VisibilityIcon" />,
  VisibilityOff: () => <div data-testid="VisibilityOffIcon" />,
  Security: () => <div data-testid="SecurityIcon" />,
}));

vi.mock('@/shared/services/auth-service', () => ({
  AuthService: {
    updatePassword: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

describe('ChangePasswordPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ push: mockPush } as any);
  });

  it('ChangePasswordPage_PasswordMismatch_ShowsError', async () => {
    render(<ChangePasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText(/ระบุรหัสผ่านอย่างน้อย 8 ตัวอักษร/i);
    const confirmInput = screen.getByPlaceholderText(/ระบุรหัสผ่านเดิมอีกครั้ง/i);
    const submitButton = screen.getByRole('button', { name: /บันทึกรหัสผ่าน/i });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน/i)).toBeDefined();
    expect(AuthService.updatePassword).not.toHaveBeenCalled();
  });

  it('ChangePasswordPage_ShortPassword_ShowsError', async () => {
    render(<ChangePasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText(/ระบุรหัสผ่านอย่างน้อย 8 ตัวอักษร/i);
    const confirmInput = screen.getByPlaceholderText(/ระบุรหัสผ่านเดิมอีกครั้ง/i);
    const submitButton = screen.getByRole('button', { name: /บันทึกรหัสผ่าน/i });

    fireEvent.change(passwordInput, { target: { value: 'short' } });
    fireEvent.change(confirmInput, { target: { value: 'short' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร/i)).toBeDefined();
  });

  it('ChangePasswordPage_SuccessfulSubmission_RedirectsToDashboard', async () => {
    vi.mocked(AuthService.updatePassword).mockResolvedValue({ success: true, data: undefined, error: null });
    
    render(<ChangePasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText(/ระบุรหัสผ่านอย่างน้อย 8 ตัวอักษร/i);
    const confirmInput = screen.getByPlaceholderText(/ระบุรหัสผ่านเดิมอีกครั้ง/i);
    const submitButton = screen.getByRole('button', { name: /บันทึกรหัสผ่าน/i });

    fireEvent.change(passwordInput, { target: { value: 'securePassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'securePassword123' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/เปลี่ยนรหัสผ่านสำเร็จ/i)).toBeDefined();
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 2000 });
  });

  it('ChangePasswordPage_ApiError_ShowsErrorMessage', async () => {
    vi.mocked(AuthService.updatePassword).mockResolvedValue({ 
      success: false, 
      data: null, 
      error: { code: 'ERROR', message: 'API Error Message' } 
    });
    
    render(<ChangePasswordPage />);
    
    const passwordInput = screen.getByPlaceholderText(/ระบุรหัสผ่านอย่างน้อย 8 ตัวอักษร/i);
    const confirmInput = screen.getByPlaceholderText(/ระบุรหัสผ่านเดิมอีกครั้ง/i);
    const submitButton = screen.getByRole('button', { name: /บันทึกรหัสผ่าน/i });

    fireEvent.change(passwordInput, { target: { value: 'securePassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'securePassword123' } });
    fireEvent.click(submitButton);

    expect(await screen.findByText(/API Error Message/i)).toBeDefined();
  });
});
