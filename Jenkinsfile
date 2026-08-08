pipeline {
    agent any

    stages {

        stage('Checkout Source') {
            steps {
                checkout scm
            }
        }

        stage('Verify Environment') {
            steps {
                bat 'node -v'
                bat 'npm -v'
            }
        }

        stage('Install Dependencies') {
            steps {
                bat 'npm install --include=dev'
            }
        }

        stage('Check Angular CLI') {
            steps {
                bat 'dir node_modules\\.bin'
                bat 'dir node_modules\\@angular\\cli'
                bat 'npm ls @angular/cli'
                bat 'npm run ng version'
            }
        }

        stage('Build Angular Application') {
            steps {
                bat 'npm run build'
            }
        }

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }

        stage('Deploy to IIS') {
            steps {
                bat '''
                if exist "D:\\Sites\\JiraDashboard" (
                    rmdir /S /Q "D:\\Sites\\JiraDashboard"
                )

                mkdir "D:\\Sites\\JiraDashboard"

                xcopy /E /I /Y "dist\\Jira-Enterprise-Dashboard\\browser\\*" "D:\\Sites\\JiraDashboard\\"
                '''
            }
        }
    }

    post {
        success {
            echo 'Build and Deployment Completed Successfully'
        }

        failure {
            echo 'Build or Deployment Failed'
        }
    }
}