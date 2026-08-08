pipeline {
    agent any

    environment {
    NODE_ENV = 'development'
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
        bat 'echo NODE_ENV=%NODE_ENV%'
        bat 'npm config get production'
        bat 'npm config list'
        bat 'npm install'
        bat 'npm list @angular/cli'
        bat 'dir node_modules\\.bin'
    }
}

        stage('Check Angular CLI') {
    steps {
        bat 'dir node_modules'
        bat 'dir node_modules\\.bin'
        bat 'npm list @angular/cli'
    }
}

        stage('Build Angular Application') {
    steps {
        bat '.\\node_modules\\.bin\\ng.cmd build'
    }
}

        stage('Archive Build') {
            steps {
                archiveArtifacts artifacts: 'dist/**', fingerprint: true
            }
        }
    }
stage('Deploy to IIS') {
    steps {
        bat '''
        if not exist "D:\\Sites\\JiraDashboard" mkdir "D:\\Sites\\JiraDashboard"
        xcopy "dist\\Jira-Enterprise-Dashboard\\browser\\*" "D:\\Sites\\JiraDashboard\\" /E /Y /I
        '''
    }
}
    post {
        success {
            echo 'Build Completed Successfully'
        }

        failure {
            echo 'Build Failed'
        }

        always {
            cleanWs()
        }
    }
}
