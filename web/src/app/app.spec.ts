import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the navbar brand', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const brand = (fixture.nativeElement as HTMLElement).querySelector('.navbar-brand');

    expect(brand?.textContent).toContain('Genyo');
  });
});
