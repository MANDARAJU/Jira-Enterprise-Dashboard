import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { App } from './app';
import { Jira } from './services/jira';

const dashboardResponse = {
  period: '01-Jan-2026 to Today',
  projectCount: 2,
  total: 10,
  completed: 3,
  inProgress: 2,
  todo: 4,
  projects: [],
  monthly: [],
  stakeholders: [],
  statusBreakdown: []
};

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        {
          provide: Jira,
          useValue: {
            getDashboard: () => of(dashboardResponse)
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the dashboard title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Jira Enterprise Dashboard');
  });

  it('should calculate the backlog from the dashboard totals', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    expect(fixture.componentInstance.backlogIssues).toBe(1);
    expect(fixture.componentInstance.getMonthLabel('2026-08')).toBe('Aug 2026');
  });
});
