#!/usr/bin/env bash
set -euo pipefail

REPO_URL="${REPO_URL:?Set REPO_URL, for example https://github.com/<user>/kube-hello-kiali.git}"

kubectl apply -f argocd/project.yaml
sed "s#https://github.com/CHANGE_ME/kube-hello-kiali.git#$REPO_URL#g" \
  argocd/applications/kube-hello-kiali.yaml | kubectl apply -f -

