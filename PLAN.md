# kube-hello-kiali Plan

This project was created with Codex.

## Goal

Build a small GitOps-based k3s demo for observing Istio east-west traffic in Kiali.

## Architecture

```text
browser -> Traefik -> frontend -> challenge-api -> judge-api
```

## Components

- React + MUI frontend
- `challenge-api` backend that receives client challenges
- `judge-api` backend that answers rock-paper-scissors rounds
- Docker Compose for local testing
- Kubernetes manifests for k3s
- Istio sidecar-based east-west traffic
- Argo CD Application bootstrap
- GHCR image publishing

## Initial Deployment

1. Build and push images to GHCR.
2. Create the GHCR pull secret with `scripts/create-ghcr-secret.sh`.
3. Apply Argo CD Project/Application manifests with `scripts/bootstrap-argocd-apps.sh`.
4. Let Argo CD sync `deploy/`.
5. Open the frontend through Traefik.
6. Observe `frontend -> challenge-api -> judge-api` in Kiali.

## CI/CD

- GitHub Actions builds images.
- GHCR stores images.
- CI updates image tags in `deploy/`.
- Argo CD syncs from Git.
- Path filters prevent deploy-only commits from retriggering image builds.

