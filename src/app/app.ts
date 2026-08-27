import { Component, OnInit } from '@angular/core';
import { Jira } from './services/jira';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  totalIssues = 0;
  backlogIssues = 0;
  todoIssues = 0;
  inProgressIssues = 0;
  completedIssues = 0;

  onHoldIssues = 0;
  readyForProdIssues = 0;
  uatVerifiedIssues = 0;
  readyForQAIssues = 0;
  readyForUATIssues = 0;

  stakeholders: any[] = [];
  projects: any[] = [];
  monthly: any[] = [];
  statusBreakdown: any[] = [];

  period = '';
  projectCount = 0;
  loading = false;
  errorMessage = '';

  constructor(private jira: Jira) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {

    console.log('Loading Jira Dashboard...');
    this.loading = true;
    this.errorMessage = '';

    this.jira.getDashboard().subscribe({

      next: (response: any) => {

        console.log('JIRA DASHBOARD RESPONSE:', response);

        this.period = response?.period ?? '';
        this.projectCount = Number(response?.projectCount ?? 0);

        this.totalIssues = Number(response?.total ?? 0);

        /*
         * Main Dashboard Order
         *
         * 1. Total Issues
         * 2. Backlog
         * 3. To Do
         * 4. In Progress
         * 5. Completed
         */

        this.completedIssues =
          Number(response?.completed ?? 0);

        this.inProgressIssues =
          Number(response?.inProgress ?? 0);

        this.todoIssues =
          Number(response?.todo ?? 0);

        this.onHoldIssues =
          Number(response?.onHold ?? 0);

        this.readyForProdIssues =
          Number(response?.readyForProd ?? 0);

        this.uatVerifiedIssues =
          Number(response?.uatVerified ?? 0);

        this.readyForQAIssues =
          Number(response?.readyForQA ?? 0);

        this.readyForUATIssues =
          Number(response?.readyForUAT ?? 0);

        /*
         * Backlog
         *
         * Everything which is not completed,
         * excluding the active workflow statuses
         * already shown separately.
         */

        this.backlogIssues = Math.max(
          0,
          this.totalIssues -
          this.completedIssues -
          this.todoIssues -
          this.inProgressIssues
        );

        this.stakeholders =
          response?.stakeholders ?? [];

        this.projects =
          response?.projects ?? [];

        this.monthly =
          response?.monthly ?? [];

        this.statusBreakdown =
          response?.statusBreakdown ?? [];

        console.log('DASHBOARD TOTAL:', this.totalIssues);
        console.log('BACKLOG:', this.backlogIssues);
        console.log('TODO:', this.todoIssues);
        console.log('IN PROGRESS:', this.inProgressIssues);
        console.log('COMPLETED:', this.completedIssues);
        console.log('STAKEHOLDERS:', this.stakeholders.length);
        console.log('PROJECTS:', this.projects.length);
        console.log('STATUS BREAKDOWN:', this.statusBreakdown.length);
        this.loading = false;

      },

      error: (error: any) => {

        console.error(
          'Jira Dashboard API Error:',
          error
        );

        this.totalIssues = 0;
        this.backlogIssues = 0;
        this.todoIssues = 0;
        this.inProgressIssues = 0;
        this.completedIssues = 0;

        this.stakeholders = [];
        this.projects = [];
        this.monthly = [];
        this.statusBreakdown = [];
        this.errorMessage =
          'Jira dashboard data could not be loaded. Please try again.';
        this.loading = false;
      }

    });

  }

  getPercentage(value: number): number {

    if (!this.totalIssues) {
      return 0;
    }

    return Math.round(
      (value / this.totalIssues) * 100
    );

  }

  getStatusPercentage(value: number): number {
    return this.getPercentage(value);
  }

  getProjectPercentage(value: number): number {
    return this.getPercentage(value);
  }

  getMonthLabel(month: string): string {
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return month;
    }

    const date = new Date(`${month}-01T00:00:00`);

    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      year: 'numeric'
    }).format(date);
  }

}
