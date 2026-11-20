terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  # State lives in the bucket defined in state.tf. The backend locks it while
  # a plan or apply runs, so two runs can't write it at once.
  backend "gcs" {
    bucket = "wonderboymusic-tfstate"
    prefix = "highforthis"
  }
}

variable "project" {
  type    = string
  default = "wonderboymusic-sites"
}

provider "google" {
  project = var.project
}
