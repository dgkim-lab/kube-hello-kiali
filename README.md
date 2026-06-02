# kube-hello-kiali

Small k3s + Argo CD + Istio/Kiali demo for observing east-west traffic.

This repository contains a rock-paper-scissors application with one React frontend and two backend services:

```text
browser -> Traefik -> frontend -> challenge-api -> judge-api
```

Istio is intended to handle only in-cluster east-west traffic. Traefik remains the north-south ingress controller.

## Sequence

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant ChallengeAPI
    participant JudgeAPI

    User->>Frontend: Click Rock / Paper / Scissors
    Frontend->>ChallengeAPI: POST /api/challenges
    ChallengeAPI->>JudgeAPI: POST /api/judge
    JudgeAPI-->>ChallengeAPI: Server move + result
    ChallengeAPI-->>Frontend: Game result
    Frontend-->>User: Render outcome
```

## Local Test

```bash
docker compose up --build
```

Open locally:

```text
http://localhost:5173
```

## HTTPS Ingress

The Kubernetes manifests expose:

```text
https://rps.k3s.dgkim.net
https://rps-api.k3s.dgkim.net
```

Both ingresses use Traefik `websecure` and cert-manager `ClusterIssuer` named `letsencrypt-prod`.
The frontend still calls the BFF through its in-cluster nginx `/api` proxy, preserving this Kiali path:

```text
frontend -> challenge-api -> judge-api
```

## Kubernetes Bootstrap

Create the GHCR pull secret:

```bash
cp env.example.sh env.sh
# edit env.sh
scripts/create-ghcr-secret.sh
```

Apply the Argo CD project and application:

```bash
scripts/bootstrap-argocd-apps.sh
```

Argo CD watches `deploy/` and syncs the Kubernetes resources.

## Images

Default manifests use placeholder images:

```text
ghcr.io/dgkim-lab/kube-hello-kiali-frontend:latest
ghcr.io/dgkim-lab/kube-hello-kiali-challenge-api:latest
ghcr.io/dgkim-lab/kube-hello-kiali-judge-api:latest
```

GitHub Actions updates these tags to the pushed commit SHA after images are built.
