#!/usr/bin/env bash

# Copy this file to env.sh and fill in the values.
# env.sh is ignored by Git because it contains a GitHub token.

export GHCR_USER="your-github-user"
export GHCR_TOKEN="github-token-with-read-packages"

# Optional overrides.
export NAMESPACE="rps"
export SECRET_NAME="ghcr-pull-secret"

