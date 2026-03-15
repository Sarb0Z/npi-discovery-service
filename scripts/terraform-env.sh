#!/usr/bin/env bash

set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <fmt|plan|apply|output|destroy> <environment> [terraform args...]" >&2
  exit 1
fi

command_name="$1"
environment_name="$2"
shift 2

terraform_dir="infra/terraform/environments/${environment_name}"

if [[ ! -d "$terraform_dir" ]]; then
  echo "Unknown Terraform environment: ${environment_name}" >&2
  exit 1
fi

terraform -chdir="$terraform_dir" init -input=false

case "$command_name" in
  fmt)
    terraform -chdir="$terraform_dir" fmt -recursive
    ;;
  plan)
    terraform -chdir="$terraform_dir" plan -input=false "$@"
    ;;
  apply)
    terraform -chdir="$terraform_dir" apply -input=false -auto-approve "$@"
    ;;
  output)
    terraform -chdir="$terraform_dir" output "$@"
    ;;
  destroy)
    terraform -chdir="$terraform_dir" destroy -input=false -auto-approve "$@"
    ;;
  *)
    echo "Unsupported command: ${command_name}" >&2
    exit 1
    ;;
esac