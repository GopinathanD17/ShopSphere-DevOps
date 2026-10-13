
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

        stage('Deploy to Kubernetes (EKS)') {
            steps {
                sh '''
                    set -e

                    REGION="ap-southeast-1"
                    REGISTRY="189599796959.dkr.ecr.ap-southeast-1.amazonaws.com"

                    aws ecr get-login-password --region "$REGION" \
                      | docker login --username AWS --password-stdin "$REGISTRY"

                    docker tag "shopsphere-devops-backend:${BUILD_NUMBER}" \
                      "$REGISTRY/shopsphere-backend:${BUILD_NUMBER}"

                    docker tag "shopsphere-devops-frontend:${BUILD_NUMBER}" \
                      "$REGISTRY/shopsphere-frontend:${BUILD_NUMBER}"

                    docker push "$REGISTRY/shopsphere-backend:${BUILD_NUMBER}"
                    docker push "$REGISTRY/shopsphere-frontend:${BUILD_NUMBER}"

                    aws eks update-kubeconfig \
                      --region "$REGION" \
                      --name shopsphere-k8s

                    kubectl set image deployment/backend \
                      backend="$REGISTRY/shopsphere-backend:${BUILD_NUMBER}" \
                      -n shopsphere

                    kubectl set image deployment/frontend \
                      frontend="$REGISTRY/shopsphere-frontend:${BUILD_NUMBER}" \
                      -n shopsphere
                '''
            }
        }

        stage('Verify Kubernetes Deployment') {
            steps {
                sh '''
                    set -e

                    kubectl rollout status deployment/backend -n shopsphere --timeout=180s
                    kubectl rollout status deployment/frontend -n shopsphere --timeout=180s

                    kubectl get deployments,pods,services -n shopsphere
                '''
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
