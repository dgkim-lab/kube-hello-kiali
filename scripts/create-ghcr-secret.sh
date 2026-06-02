#!/usr/bin/env bash
set -euo pipefail

NAMESPACE="${NAMESPACE:-kube-hello-kiali}"
SECRET_NAME="${SECRET_NAME:-ghcr-pull-secret}"
GHCR_USER="${GHCR_USER:?Set GHCR_USER}"
GHCR_TOKEN="${GHCR_TOKEN:?Set GHCR_TOKEN}"

kubectl create namespace "$NAMESPACE" --dry-run=client -o yaml | kubectl apply -f -

kubectl create secret docker-registry "$SECRET_NAME" \
  --namespace "$NAMESPACE" \
  --docker-server=ghcr.io \
  --docker-username="$GHCR_USER" \
  --docker-password="$GHCR_TOKEN" \
  --dry-run=client \
  -o yaml | kubectl apply -f -

