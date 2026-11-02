import { calculateDailyHours, calculateWorkedDays } from './calculations';

describe('calculateWorkedDays', () => {
  it('counts both the hire and the termination day', () => {
    expect(calculateWorkedDays('2026-01-10', '2026-01-12')).toBe(3);
  });

  it('counts a single day when both dates are the same', () => {
    expect(calculateWorkedDays('2026-01-10', '2026-01-10')).toBe(1);
  });

  it('counts calendar days across months and leap years', () => {
    expect(calculateWorkedDays('2024-02-28', '2024-03-01')).toBe(3);
  });

  it.each([[''], [null], [undefined]])('returns null without a termination date (%s)', (value) => {
    expect(calculateWorkedDays('2026-01-10', value)).toBeNull();
  });

  it('returns null when the termination is before the hire date', () => {
    expect(calculateWorkedDays('2026-01-10', '2026-01-09')).toBeNull();
  });

  it('returns null for invalid dates', () => {
    expect(calculateWorkedDays('2026-02-30', '2026-03-05')).toBeNull();
  });
});

describe('calculateDailyHours', () => {
  it('formats whole hours with zero minutes', () => {
    expect(calculateDailyHours('08:00', '17:00')).toBe('9h 0min');
  });

  it('formats hours and minutes', () => {
    expect(calculateDailyHours('08:15', '17:45')).toBe('9h 30min');
  });

  it('returns zero when start and end are equal', () => {
    expect(calculateDailyHours('08:00', '08:00')).toBe('0h 0min');
  });

  it('returns null when the end is before the start', () => {
    expect(calculateDailyHours('17:00', '08:00')).toBeNull();
  });

  it('returns null when a time is missing or invalid', () => {
    expect(calculateDailyHours('08:00', '')).toBeNull();
    expect(calculateDailyHours('8h', '17:00')).toBeNull();
  });
});
