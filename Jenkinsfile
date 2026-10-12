
pipeline {
    agent any

    options {
        timestamps()
    }

    stages {
        stage('Build Backend Docker Image') {
            steps {
                sh 'docker build -t shopsphere-devops-backend:${BUILD_NUMBER} backend'
                sh 'docker tag shopsphere-devops-backend:${BUILD_NUMBER} shopsphere-devops-backend:latest'
            }
        }

        stage('Build Frontend Docker Image') {
            steps {
                sh 'docker build -t shopsphere-devops-frontend:${BUILD_NUMBER} frontend'
                sh 'docker tag shopsphere-devops-frontend:${BUILD_NUMBER} shopsphere-devops-frontend:latest'
            }
        }

        stage('Verify Docker Images') {
            steps {
                sh 'docker image inspect shopsphere-devops-backend:latest'
                sh 'docker image inspect shopsphere-devops-frontend:latest'
            }
        }
    }

    post {
        success {
            echo 'ShopSphere Docker image builds completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the stage logs.'
        }
    }
}
