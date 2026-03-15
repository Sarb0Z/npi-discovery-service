locals {
  api_service_name = "${var.project_slug}-api-production"
  cache_name       = "${var.project_slug}-cache-production"
}

module "render_keyvalue" {
  source = "../../modules/render-keyvalue"

  name              = local.cache_name
  plan              = var.render_keyvalue_plan
  region            = var.region
  max_memory_policy = var.render_keyvalue_max_memory_policy
}

module "render_api" {
  source = "../../modules/render-api"

  name              = local.api_service_name
  branch            = var.branch
  custom_domains    = var.render_api_custom_domains
  disk_size_gb      = var.render_api_disk_size_gb
  output_mount_path = var.render_api_output_mount_path
  plan              = var.render_api_plan
  redis_url         = module.render_keyvalue.internal_connection_string
  region            = var.region
  repo_url          = var.repo_url
}

module "vercel_web" {
  source = "../../modules/vercel"

  name    = var.vercel_project_name
  api_url = module.render_api.url
}