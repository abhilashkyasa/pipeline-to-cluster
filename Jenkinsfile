pipeline {
    agent any

    environment {
        IMAGE_NAME = 'pipeline-to-cluster'
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker Image') {
            steps {
                sh '''
                    docker build \
                      -t $IMAGE_NAME:$IMAGE_TAG \
                      -t $IMAGE_NAME:latest .
                '''
            }
        }

        stage('Verify Docker Image') {
            steps {
                sh '''
                    docker images $IMAGE_NAME
                '''
            }
        }

        stage('Update Kubernetes Manifest') {
            steps {
                sh '''
                    sed -i "s|image: pipeline-to-cluster:.*|image: pipeline-to-cluster:$IMAGE_TAG|" k8s/app.yaml

                    echo "Updated Kubernetes manifest:"
                    grep "image:" k8s/app.yaml
                '''
            }
        }

        stage('Verify Kubernetes') {
            steps {
                sh '''
                    kubectl get nodes
                    kubectl get pods -n superintelligence
                '''
            }
        }
    }

    post {
        success {
            echo 'CI pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed. Check the logs for details.'
        }
    }
}