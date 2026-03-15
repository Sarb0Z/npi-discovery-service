locals {
  env_vars = merge(
    {
      NODE_ENV             = { value = "production" }
      PROVIDERS_OUTPUT_DIR = { value = var.output_mount_path }
    },
    var.redis_url == null ? {} : {
      REDIS_URL = { value = var.redis_url }
    },
  )
}

resource "render_web_service" "this" {
  name              = var.name
  plan              = var.plan
  region            = var.region
  health_check_path = "/api/health"
  env_vars          = local.env_vars

  disk = {
    name       = "provider-output"
    mount_path = var.output_mount_path
    size_gb    = var.disk_size_gb
  }

  previews = {
    generation = "off"
  }

  custom_domains = [for domain in var.custom_domains : {
    name = domain
  }]

  runtime_source = {
    docker = {
      auto_deploy     = false
      branch          = var.branch
      context         = "."
      dockerfile_path = "docker/api.Dockerfile"
      repo_url        = var.repo_url

      build_filter = {
        paths = [
          "apps/api/**",
          "packages/contracts/**",
          "docker/api.Dockerfile",
          "bun.lock",
          "package.json",
          "tsconfig.base.json",
        ]
      }
    }
  }
}