<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Server data lives in `src/lib/data.server.ts`: Postgres via `DATABASE_URL` on the cluster, built-in demo data when unset, so the Lovable preview works without a database.
- The Docker image builds with `NITRO_PRESET=node-server`, so the cluster runs a Node server rather than the default Cloudflare target.
- Deployment: Jenkinsfile (CI and image push to Nexus) bumps `k8s/app.yaml`, and Argo CD syncs `k8s/` (see DEPLOY.md).
