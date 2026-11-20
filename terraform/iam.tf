# The identity the GraphQL server on Railway uses to upload media.
# Its key is created with gcloud, not Terraform, so the private key never
# lands in Terraform state. See README.md.
resource "google_service_account" "highforthis_storage" {
  account_id   = "highforthis-storage"
  display_name = "highforthis-storage"
  description  = "GraphQL server on Railway: uploads media to the wonderboymusic bucket"
}

# Every binding on the bucket, managed as one policy, so anything added by
# hand shows up as a change in `terraform plan`. Project owners keep full
# access through their project role either way.
data "google_iam_policy" "wonderboymusic" {
  # Google's defaults for a new bucket
  binding {
    role    = "roles/storage.legacyBucketOwner"
    members = ["projectEditor:${var.project}", "projectOwner:${var.project}"]
  }
  binding {
    role    = "roles/storage.legacyBucketReader"
    members = ["projectViewer:${var.project}"]
  }

  # Anyone can read media: the site links straight to storage.googleapis.com
  binding {
    role    = "roles/storage.objectViewer"
    members = ["allUsers"]
  }

  # The GraphQL server writes uploads, and overwrites a file uploaded twice
  binding {
    role    = "roles/storage.objectUser"
    members = [google_service_account.highforthis_storage.member]
  }
}

resource "google_storage_bucket_iam_policy" "wonderboymusic" {
  bucket      = google_storage_bucket.wonderboymusic.name
  policy_data = data.google_iam_policy.wonderboymusic.policy_data
}
