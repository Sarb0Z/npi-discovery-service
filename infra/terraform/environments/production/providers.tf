provider "render" {
  wait_for_deploy_completion = true
}

provider "vercel" {
  team = var.vercel_team_id
}