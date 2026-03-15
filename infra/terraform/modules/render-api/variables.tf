variable "name" {
  type = string
}

variable "branch" {
  type = string
}

variable "custom_domains" {
  type    = list(string)
  default = []
}

variable "disk_size_gb" {
  type = number
}

variable "output_mount_path" {
  type = string
}

variable "plan" {
  type = string
}

variable "redis_url" {
  type      = string
  default   = null
  nullable  = true
  sensitive = true
}

variable "region" {
  type = string
}

variable "repo_url" {
  type = string
}