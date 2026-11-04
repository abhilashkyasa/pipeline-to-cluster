# Deploying SuperIntelligence

Flow: GitHub → Jenkins (test, build, push to Nexus, bump tag) → Argo CD (sync k8s/) → LoadBalancer.

## 1. One-time setup
1. Connect GitHub in Lovable (Project settings → Git → Connect). Replace `YOUR_ORG/YOUR_REPO`
   in `Jenkinsfile` and `argocd/application.yaml`, and `nexus.example.com:8082` in `Jenkinsfile` + `k8s/app.yaml`.
2. Change the passwords/secrets in `k8s/postgres.yaml` (`si-secrets`).
3. Pull secret for Nexus on the cluster:
   ```
   kubectl create ns superintelligence
   kubectl -n superintelligence create secret docker-registry nexus-pull \
     --docker-server=nexus.example.com:8082 --docker-username=USER --docker-password=PASS
   ```
4. Jenkins credentials: `nexus-docker`, `github-push`, `argocd-token`. Agent needs Docker.
   If Nexus uses HTTP, add it to Docker `insecure-registries` on the agent and the cluster nodes.
5. Register the app in Argo CD: `kubectl apply -f argocd/application.yaml`
6. Create a Jenkins Pipeline job from SCM pointing at the repo (Script Path: `Jenkinsfile`).

## 2. Run
Trigger the Jenkins job. All stages should go green; then:
```
kubectl -n superintelligence get svc si-app   # EXTERNAL-IP
```
Open `http://<EXTERNAL-IP>/` and sign in with `admin` / `SuperIntel@123`.

On bare-metal clusters (no cloud LB) install MetalLB, or the EXTERNAL-IP stays `<pending>`.
