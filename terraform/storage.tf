# Media uploads. The GraphQL server writes here (GCS_BUCKET) and the web app
# links to https://storage.googleapis.com/wonderboymusic/...
resource "google_storage_bucket" "wonderboymusic" {
  name                        = "wonderboymusic"
  location                    = "US"
  storage_class               = "MULTI_REGIONAL"
  uniform_bucket_level_access = true
  public_access_prevention    = "inherited"

  # Stated so `terraform plan` flags it if versioning is turned on by hand.
  # Soft delete (7 days, Google's default) already covers deleted files.
  versioning {
    enabled = false
  }

  # Browsers only read from the bucket; uploads go through the GraphQL
  # server's client library, which CORS doesn't apply to.
  cors {
    origin          = ["*"]
    method          = ["GET", "HEAD"]
    response_header = ["Content-Type"]
    max_age_seconds = 3600
  }

  lifecycle {
    prevent_destroy = true
  }
}
