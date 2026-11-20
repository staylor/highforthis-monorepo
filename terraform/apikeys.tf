# API keys used by the GraphQL server on Railway. Each one can call only the
# API it's for. Terraform keeps each key's value in state (key_string), so
# keep the state file private.

# YOUTUBE_API_KEY: the job that imports videos from the YouTube channel.
resource "google_apikeys_key" "youtube_import" {
  name         = "94"
  display_name = "YouTube video import (graphql)"

  restrictions {
    api_targets {
      service = "youtube.googleapis.com"
    }
  }
}

# GOOGLE_MAPS_GEOLOCATION_API_KEY: geocodes venue addresses on the server.
# Railway's outbound IPs aren't static, so it can't be locked to an IP.
resource "google_apikeys_key" "geocoding" {
  name         = "a872db13-9410-472e-98cb-f55d50bc3a4d"
  display_name = "Venue geocoding (graphql)"

  restrictions {
    api_targets {
      service = "geocoding-backend.googleapis.com"
    }
  }
}

# GOOGLE_MAPS_BROWSER_API_KEY: public, in every venue page's map image, so it
# only works for the Maps Static API from this site's pages.
resource "google_apikeys_key" "maps_static_browser" {
  name         = "3324e802-94dd-4c1b-ab4f-cfa2eb449b0a"
  display_name = "Venue maps (browser)"

  restrictions {
    api_targets {
      service = "static-maps-backend.googleapis.com"
    }
    browser_key_restrictions {
      allowed_referrers = [
        "https://highforthis.com/*",
        "https://www.highforthis.com/*",
      ]
    }
  }
}
