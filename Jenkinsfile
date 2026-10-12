
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

        stage('Deploy ShopSphere') {
            steps {
                sh '''
                    set -e

                    install -m 600 /etc/shopsphere/backend.env "$WORKSPACE/backend/.env"

                    docker compose \
                      -p shopsphere-devops \
                      -f "$WORKSPACE/docker-compose.yml" \
                      up -d --build --force-recreate
                '''
            }
        }

        stage('Verify Deployment') {
            steps {
                sh 'curl --fail --retry 5 --retry-delay 2 http://localhost:8081/api/health'
            }
        }
    }

    post {
        always {
            sh 'rm -f "$WORKSPACE/backend/.env"'
        }

        success {
            echo 'ShopSphere CI/CD pipeline completed successfully!'
        }

        failure {
            echo 'Pipeline failed. Check Console Output.'
        }
    }
}
