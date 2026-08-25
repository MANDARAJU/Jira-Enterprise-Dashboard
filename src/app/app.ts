import {
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { Jira } from './services/jira';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  totalIssues = 0;
  openIssues = 0;
  inProgressIssues = 0;
  todoIssues = 0;
  completedIssues = 0;

  stakeholders: any[] = [];
  issues: any[] = [];

  constructor(
    private jira: Jira,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    console.log('APP INITIALIZED');

    this.loadDashboard();
    this.loadIssues();

  }


  loadDashboard(): void {

    console.log('Loading Jira dashboard...');

    this.jira.getDashboard().subscribe({

      next: (response: any) => {

        console.log(
          'JIRA DASHBOARD RESPONSE:',
          response
        );


        this.totalIssues =
          Number(response?.total ?? 0);


        this.openIssues =
          Number(response?.open ?? 0);


        this.inProgressIssues =
          Number(response?.inProgress ?? 0);


        this.todoIssues =
          Number(response?.todo ?? 0);


        this.completedIssues =
          Number(response?.completed ?? 0);


        this.stakeholders =
          Array.isArray(response?.stakeholders)
            ? [...response.stakeholders]
            : [];


        console.log(
          'DASHBOARD TOTAL:',
          this.totalIssues
        );


        console.log(
          'COMPLETED:',
          this.completedIssues
        );


        console.log(
          'OPEN:',
          this.openIssues
        );


        console.log(
          'IN PROGRESS:',
          this.inProgressIssues
        );


        console.log(
          'TO DO:',
          this.todoIssues
        );


        console.log(
          'STAKEHOLDERS:',
          this.stakeholders.length
        );


        this.cdr.detectChanges();

      },


      error: (error: any) => {

        console.error(
          'Dashboard API Error:',
          error
        );

        this.totalIssues = 0;
        this.openIssues = 0;
        this.inProgressIssues = 0;
        this.todoIssues = 0;
        this.completedIssues = 0;
        this.stakeholders = [];

        this.cdr.detectChanges();

      }

    });

  }


  loadIssues(): void {

    console.log(
      'Loading Jira issues...'
    );


    this.jira.getIssues().subscribe({

      next: (response: any) => {

        console.log(
          'JIRA ISSUES RESPONSE:',
          response
        );


        const loadedIssues =
          Array.isArray(response?.issues)
            ? response.issues
            : [];


        this.issues = [
          ...loadedIssues
        ];


        console.log(
          'ISSUES LOADED:',
          this.issues.length
        );


        this.cdr.detectChanges();

      },


      error: (error: any) => {

        console.error(
          'Jira Issues API Error:',
          error
        );

        this.issues = [];

        this.cdr.detectChanges();

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


  getProjectName(issue: any): string {

    return issue?.fields?.project?.name
      || issue?.fields?.project?.key
      || '-';

  }


  getIssueType(issue: any): string {

    return issue?.fields?.issuetype?.name
      || '-';

  }


  getPriority(issue: any): string {

    return issue?.fields?.priority?.name
      || '-';

  }


  getStatus(issue: any): string {

    return issue?.fields?.status?.name
      || '-';

  }


  getAssignee(issue: any): string {

    return issue?.fields?.assignee?.displayName
      || issue?.fields?.assignee?.emailAddress
      || 'Unassigned';

  }

}