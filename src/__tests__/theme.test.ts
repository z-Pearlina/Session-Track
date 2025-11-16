import { theme } from '../theme/theme';

describe('Theme', () => {
  it('should have primary colors defined', () => {
    expect(theme.colors.primary).toBeDefined();
    expect(theme.colors.primary.aqua).toBe('#38BDF8');
    expect(theme.colors.primary.cyan).toBe('#67E8F9');
  });

  it('should have correct color palette', () => {
    expect(theme.colors.primary.aqua).toBe('#38BDF8');
    expect(theme.colors.success).toBe('#34D399');
    expect(theme.colors.danger).toBe('#F87171');
  });

  it('should have font sizes', () => {
    expect(theme.fontSize.xs).toBe(11);
    expect(theme.fontSize.base).toBe(15);
    expect(theme.fontSize.xl).toBe(20);
  });

  it('should have spacing system', () => {
    expect(theme.spacing[0]).toBe(0);
    expect(theme.spacing[1]).toBe(4);
    expect(theme.spacing[4]).toBe(16);
    expect(theme.spacing[8]).toBe(32);
  });

  it('should have border radius values', () => {
    expect(theme.borderRadius.sm).toBe(8);
    expect(theme.borderRadius.md).toBe(12);
    expect(theme.borderRadius.full).toBe(9999);
  });

  it('should have animation durations', () => {
    expect(theme.animation.fast).toBe(150);
    expect(theme.animation.normal).toBe(250);
  });
});