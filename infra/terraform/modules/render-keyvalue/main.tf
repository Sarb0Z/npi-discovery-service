resource "render_keyvalue" "this" {
  name              = var.name
  plan              = var.plan
  region            = var.region
  max_memory_policy = var.max_memory_policy
}