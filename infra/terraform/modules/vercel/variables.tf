variable "api_url" {
  type = string
}

variable "framework" {
  type    = string
  default = "nextjs"
}

variable "name" {
  type = string
}

variable "node_version" {
  type    = string
  default = "20.x"
}

variable "root_directory" {
  type    = string
  default = "apps/frontend"
}