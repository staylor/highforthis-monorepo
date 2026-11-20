# Google Cloud (wonderboymusic-sites)

Terraform for what the site uses in Google Cloud:

| File | What's in it |
|---|---|
| `storage.tf` | The `wonderboymusic` media bucket |
| `iam.tf` | The `highforthis-storage` service account and every binding on the bucket |
| `apikeys.tf` | The YouTube, geocoding and Maps Static API keys |
| `services.tf` | The APIs those need |

Everything here was created by hand first and adopted with `import` blocks.
To adopt something else, write its resource block, add an `import` block
next to it, run `terraform plan` until it shows only the import, apply, then
delete the `import` block.

## Running it

The provider reads your gcloud login, so you don't need a key file:

```bash
export GOOGLE_OAUTH_ACCESS_TOKEN=$(gcloud auth print-access-token)
terraform plan
```

Or run `gcloud auth application-default login` once and skip the export.

State is local (`terraform.tfstate`, gitignored). It holds the API key
values, so if you move it to a GCS backend, make that bucket private.

## Railway variables (highforthis-graphql)

| Variable | Comes from |
|---|---|
| `GCS_BUCKET` | `wonderboymusic` |
| `GCS_CLIENT_EMAIL` | `highforthis-storage@wonderboymusic-sites.iam.gserviceaccount.com` |
| `GCS_PRIVATE_KEY` | A key for that service account (see below) |
| `YOUTUBE_API_KEY` | `google_apikeys_key.youtube_import` |
| `GOOGLE_MAPS_GEOLOCATION_API_KEY` | `google_apikeys_key.geocoding` |
| `GOOGLE_MAPS_BROWSER_API_KEY` | `google_apikeys_key.maps_static_browser` |

To read an API key's value, use
`gcloud services api-keys get-key-string KEY_ID`.

## Service account key

Railway can't give a service an identity token that Google trusts
(Workload Identity Federation), so the server signs in with a service
account key. Terraform manages the account and its access, but not the key:
a `google_service_account_key` would keep the private key in plain text in
state.

The account can only read and write objects in `wonderboymusic`. To rotate
its key:

```bash
SA=highforthis-storage@wonderboymusic-sites.iam.gserviceaccount.com
gcloud iam service-accounts keys create key.json --iam-account=$SA
jq -r .private_key key.json | pbcopy
```

Paste that into `GCS_PRIVATE_KEY` on Railway, redeploy, check that an upload
works, then delete `key.json` and disable the old key. Delete it once you're
sure nothing broke:

```bash
gcloud iam service-accounts keys list --iam-account=$SA --managed-by=user
gcloud iam service-accounts keys disable OLD_KEY_ID --iam-account=$SA
gcloud iam service-accounts keys delete OLD_KEY_ID --iam-account=$SA
```
