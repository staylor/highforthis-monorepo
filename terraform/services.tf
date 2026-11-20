# APIs the site needs. disable_on_destroy = false: removing one of these from
# the config stops managing it instead of turning the API off.
locals {
  services = [
    "apikeys.googleapis.com",
    "geocoding-backend.googleapis.com",
    "static-maps-backend.googleapis.com",
    "storage-api.googleapis.com",
    "youtube.googleapis.com",
  ]
}

resource "google_project_service" "this" {
  for_each           = toset(local.services)
  service            = each.value
  disable_on_destroy = false
}
