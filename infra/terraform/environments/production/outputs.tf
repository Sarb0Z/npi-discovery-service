output "render_api_service_id" {
  value = module.render_api.id
}

output "render_api_url" {
  value = module.render_api.url
}

output "render_keyvalue_id" {
  value = module.render_keyvalue.id
}

output "render_keyvalue_internal_connection_string" {
  value     = module.render_keyvalue.internal_connection_string
  sensitive = true
}

output "vercel_project_id" {
  value = module.vercel_web.id
}