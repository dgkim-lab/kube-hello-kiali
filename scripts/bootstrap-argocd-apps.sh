#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/dgkim-lab/kube-hello-kiali.git}"

kubectl apply -f argocd/project.yaml
sed "s#https://github.com/dgkim-lab/kube-hello-kiali.git#$REPO_URL#g" \
  argocd/applications/kube-hello-kiali.yaml | kubectl apply -f -
