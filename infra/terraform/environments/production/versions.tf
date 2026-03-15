terraform {
  required_version = ">= 1.8.0"

  required_providers {
    render = {
      source  = "render-oss/render"
      version = "~> 1.8"
    }

    vercel = {
      source  = "vercel/vercel"
      version = "~> 4.6"
    }
  }
}