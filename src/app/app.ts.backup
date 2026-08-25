import { Component, OnInit } from '@angular/core';
import { Jira } from './services/jira';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {

  activeSprints = 0;
  totalIssues = 0;
  openIssues = 0;
  inProgressIssues = 0;
  todoIssues = 0;
  completedIssues = 0;

  issues: any[] = [];

  constructor(private jira: Jira) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    console.log('Loading Jira issues...');

    this.jira.getIssues().subscribe({
      next: (response: any) => {

        console.log('FULL JIRA RESPONSE:', response);

        const issues = response?.issues ?? [];

        console.log('ISSUES FROM JIRA:', issues);
        console.log('APP ISSUES LENGTH:', issues.length);

        this.issues = issues;

        this.totalIssues = issues.length;

        this.openIssues = issues.filter(
          (issue: any) =>
            issue.fields?.status?.statusCategory?.key !== 'done'
        ).length;

        this.completedIssues = issues.filter(
          (issue: any) =>
            issue.fields?.status?.statusCategory?.key === 'done'
        ).length;

        this.inProgressIssues = issues.filter(
          (issue: any) =>
            issue.fields?.status?.statusCategory?.key === 'indeterminate'
        ).length;

        this.todoIssues = issues.filter(
          (issue: any) =>
            issue.fields?.status?.statusCategory?.key === 'new'
        ).length;

        console.log('FINAL DASHBOARD DATA:', {
          total: this.totalIssues,
          open: this.openIssues,
          inProgress: this.inProgressIssues,
          todo: this.todoIssues,
          completed: this.completedIssues,
          issueArrayLength: this.issues.length
        });
      },

      error: (error: any) => {
        console.error('Jira API Error:', error);
        console.error('Status:', error.status);
        console.error('URL:', error.url);
        console.error('Message:', error.message);
        console.error('Error body:', error.error);
      }
    });
  }
}