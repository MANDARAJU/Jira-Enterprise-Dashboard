pipeline {
    agent any

    environment {
        NODE_ENV = 'production'
    }

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
                bat 'npm install'
            }
        }

        stage('Check Angular CLI') {
            steps {
                bat 'npx ng version'
            }
        }

        stage('Build Angular Application') {
            steps {
                bat 'npx ng build'
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
                if not exist "D:\\Sites\\JiraDashboard" mkdir "D:\\Sites\\JiraDashboard"

                robocopy "dist\\Jira-Enterprise-Dashboard\\browser" "D:\\Sites\\JiraDashboard" /MIR

                if %ERRORLEVEL% LEQ 7 exit /B 0
                exit /B %ERRORLEVEL%
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

        always {
            cleanWs()
        }
    }
}