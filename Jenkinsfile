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
                bat 'npx ng build'
            }
        }

        stage('Build Angular Application') {
    steps {
        bat 'npx ng version'
        bat 'npx ng build'
    }
}

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
    }
stage('Check Angular CLI') {
    steps {
        bat 'npx ng version'
    }
}
    post {
        success {
            echo 'Build Completed Successfully'
        }

        failure {
            echo 'Build Failed'
        }
    }
}