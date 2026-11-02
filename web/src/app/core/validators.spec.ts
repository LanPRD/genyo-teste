import { FormControl, FormGroup } from '@angular/forms';
import { employeeRules, noDigits, trimmedRequired } from './validators';

function makeGroup(values: Partial<Record<string, string>> = {}) {
  return new FormGroup({
    hireDate: new FormControl(values['hireDate'] ?? ''),
    terminationDate: new FormControl(values['terminationDate'] ?? ''),
    workdayStartTime: new FormControl(values['workdayStartTime'] ?? ''),
    workdayEndTime: new FormControl(values['workdayEndTime'] ?? ''),
  });
}

describe('trimmedRequired', () => {
  it.each([[''], ['   '], [null]])('rejects an empty name (%s)', (value) => {
    expect(trimmedRequired(new FormControl(value))).toEqual({ required: true });
  });

  it('accepts a name with text', () => {
    expect(trimmedRequired(new FormControl('Maria'))).toBeNull();
  });
});

describe('noDigits', () => {
  it('rejects names with numbers', () => {
    expect(noDigits(new FormControl('Maria 2'))).toEqual({ hasDigits: true });
  });

  it('accepts names with accents, hyphens and apostrophes', () => {
    expect(noDigits(new FormControl("José d'Ávila-Silva"))).toBeNull();
  });
});

describe('employeeRules', () => {
  it('accepts a valid active employee', () => {
    const group = makeGroup({
      hireDate: '2026-01-10',
      workdayStartTime: '08:00',
      workdayEndTime: '17:00',
    });

    expect(employeeRules(group)).toBeNull();
  });

  it('accepts a termination date equal to the hire date and equal times', () => {
    const group = makeGroup({
      hireDate: '2026-01-10',
      terminationDate: '2026-01-10',
      workdayStartTime: '08:00',
      workdayEndTime: '08:00',
    });

    expect(employeeRules(group)).toBeNull();
  });

  it('flags a termination date before the hire date', () => {
    const group = makeGroup({ hireDate: '2026-01-10', terminationDate: '2026-01-09' });

    expect(employeeRules(group)).toEqual({ terminationBeforeHire: true });
  });

  it('flags an end time before the start time', () => {
    const group = makeGroup({ workdayStartTime: '17:00', workdayEndTime: '08:00' });

    expect(employeeRules(group)).toEqual({ endBeforeStart: true });
  });

  it('flags both rules at once', () => {
    const group = makeGroup({
      hireDate: '2026-01-10',
      terminationDate: '2026-01-09',
      workdayStartTime: '17:00',
      workdayEndTime: '08:00',
    });

    expect(employeeRules(group)).toEqual({ terminationBeforeHire: true, endBeforeStart: true });
  });
});
