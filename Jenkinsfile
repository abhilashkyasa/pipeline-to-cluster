// CI: test + build + push image to Nexus. CD: bump image tag in k8s/ and let Argo CD sync.
// Required Jenkins credentials:
//   nexus-docker  (username/password) - Nexus docker registry user
//   github-push   (username/password or token) - to commit the new tag back to the repo
//   argocd-token  (secret text) - Argo CD API token
pipeline {
  agent any

  environment {
    NEXUS_REGISTRY = 'nexus.example.com:8082'          // <-- your Nexus docker hosted repo
    IMAGE_NAME     = "${NEXUS_REGISTRY}/superintelligence/si-app"
    IMAGE_TAG      = "${env.BUILD_NUMBER}-${env.GIT_COMMIT?.take(7) ?: 'local'}"
    ARGOCD_SERVER  = 'argocd.example.com'              // <-- your Argo CD server
    ARGOCD_APP     = 'superintelligence'
    GIT_REPO       = 'github.com/YOUR_ORG/YOUR_REPO.git' // <-- your GitHub repo
  }

  options { timestamps(); disableConcurrentBuilds() }

  stages {
    stage('Checkout') { steps { checkout scm } }

    stage('Install & Test') {
      agent { docker { image 'oven/bun:1'; reuseNode true } }
      steps {
        sh 'bun install --frozen-lockfile'
        sh 'bunx vitest run'
      }
    }

    stage('Build Image') {
      steps { sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:latest .' }
    }

    stage('Push to Nexus') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'nexus-docker', usernameVariable: 'NU', passwordVariable: 'NP')]) {
          sh '''
            echo "$NP" | docker login $NEXUS_REGISTRY -u "$NU" --password-stdin
            docker push $IMAGE_NAME:$IMAGE_TAG
            docker push $IMAGE_NAME:latest
          '''
        }
      }
    }

    stage('Update Manifests') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'github-push', usernameVariable: 'GU', passwordVariable: 'GT')]) {
          sh '''
            sed -i "s#image: .*si-app:.*#image: $IMAGE_NAME:$IMAGE_TAG#" k8s/app.yaml
            git config user.email "jenkins@superintelligence.local"
            git config user.name "jenkins"
            git add k8s/app.yaml
            git commit -m "ci: deploy si-app $IMAGE_TAG [skip ci]" || echo "no changes"
            git push https://$GU:$GT@$GIT_REPO HEAD:main
          '''
        }
      }
    }

    stage('Argo CD Sync') {
      agent { docker { image 'quay.io/argoproj/argocd:v2.12.3'; reuseNode true; args '--entrypoint=' } }
      steps {
        withCredentials([string(credentialsId: 'argocd-token', variable: 'ARGOCD_AUTH_TOKEN')]) {
          sh '''
            argocd app sync $ARGOCD_APP --server $ARGOCD_SERVER --auth-token $ARGOCD_AUTH_TOKEN --grpc-web
            argocd app wait $ARGOCD_APP --server $ARGOCD_SERVER --auth-token $ARGOCD_AUTH_TOKEN --grpc-web --health --timeout 300
          '''
        }
      }
    }
  }

  post {
    always { sh 'docker logout $NEXUS_REGISTRY || true' }
  }
}
