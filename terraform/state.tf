# Holds this config's state (see the backend block in main.tf). The state
# includes the API key values, so the bucket can never be made public.
resource "google_storage_bucket" "tfstate" {
  name                        = "wonderboymusic-tfstate"
  location                    = "US"
  storage_class               = "STANDARD"
  uniform_bucket_level_access = true
  public_access_prevention    = "enforced"

  # Every apply writes a new version of the state; keep the last 10 so a bad
  # apply or a corrupted state can be rolled back.
  versioning {
    enabled = true
  }

  lifecycle_rule {
    condition {
      num_newer_versions = 10
      with_state         = "ARCHIVED"
    }
    action {
      type = "Delete"
    }
  }

  lifecycle {
    prevent_destroy = true
  }
}

# Google's defaults let project editors (including the default Compute Engine
# and App Engine service accounts) and viewers read objects too. Only owners
# need the state.
data "google_iam_policy" "tfstate" {
  binding {
    role    = "roles/storage.legacyBucketOwner"
    members = ["projectOwner:${var.project}"]
  }
  binding {
    role    = "roles/storage.legacyObjectOwner"
    members = ["projectOwner:${var.project}"]
  }
}

resource "google_storage_bucket_iam_policy" "tfstate" {
  bucket      = google_storage_bucket.tfstate.name
  policy_data = data.google_iam_policy.tfstate.policy_data
}
