import { theme } from '../theme/theme';

describe('Theme Configuration', () => {
  it('has correct primary color', () => {
    expect(theme.colors.primary).toBe('#6366F1');
  });

  it('has correct accent color', () => {
    expect(theme.colors.accent).toBe('#22D3EE');
  });

  it('has dark background colors', () => {
    expect(theme.colors.background.primary).toBe('#0F172A');
    expect(theme.colors.background.secondary).toBe('#1E293B');
  });

  it('has spacing scale', () => {
    expect(theme.spacing.xs).toBe(4);
    expect(theme.spacing.md).toBe(16);
    expect(theme.spacing.lg).toBe(24);
  });
});