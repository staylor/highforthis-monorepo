terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # State is local for now (gitignored). To share it, create a versioned
  # bucket and switch to:
  # backend "gcs" {
  #   bucket = "wonderboymusic-tfstate"
  #   prefix = "highforthis"
  # }
}

variable "project" {
  type    = string
  default = "wonderboymusic-sites"
}

provider "google" {
  project = var.project
}
