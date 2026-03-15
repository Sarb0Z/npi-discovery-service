locals {
  project_env_vars = {
    API_URL             = var.api_url
    NEXT_PUBLIC_API_URL = var.api_url
  }

  env_targets = flatten([
    for key, value in local.project_env_vars : [
      {
        key    = key
        target = "production"
        value  = value
      },
      {
        key    = key
        target = "preview"
        value  = value
      },
    ]
  ])
}

resource "vercel_project" "this" {
  name                                              = var.name
  framework                                         = var.framework
  root_directory                                    = var.root_directory
  node_version                                      = var.node_version
  automatically_expose_system_environment_variables = true
  git_fork_protection                               = true
}

resource "vercel_project_environment_variable" "runtime" {
  for_each = {
    for env_var in local.env_targets : "${env_var.key}-${env_var.target}" => env_var
  }

  project_id = vercel_project.this.id
  key        = each.value.key
  value      = each.value.value
  target     = [each.value.target]
  comment    = "Managed by Terraform for ${each.value.target}"
}