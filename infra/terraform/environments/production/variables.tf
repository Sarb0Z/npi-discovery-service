variable "branch" {
  type    = string
  default = "main"
}

variable "project_slug" {
  type    = string
  default = "npi-discovery"
}

variable "region" {
  type    = string
  default = "singapore"
}

variable "render_api_custom_domains" {
  type    = list(string)
  default = []
}

variable "render_api_disk_size_gb" {
  type    = number
  default = 5
}

variable "render_api_output_mount_path" {
  type    = string
  default = "/var/data/providers"
}

variable "render_api_plan" {
  type    = string
  default = "starter"
}

variable "render_keyvalue_max_memory_policy" {
  type    = string
  default = "allkeys_lru"
}

variable "render_keyvalue_plan" {
  type    = string
  default = "starter"
}

variable "repo_url" {
  type    = string
  default = "https://github.com/Sarb0Z/npi-discovery-service"
}

variable "vercel_project_name" {
  type    = string
  default = "npi-discovery-service"
}

variable "vercel_team_id" {
  type      = string
  default   = null
  nullable  = true
  sensitive = true
}