# High For This

The iPhone, iPad, Mac and Apple TV app for [highforthis.com](https://highforthis.com). Everything in it comes from the site's GraphQL API.

| Tab     | What it shows                                                                                                                         |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Shows   | Upcoming shows we recommend, by month. A show opens to its artists, its venue and where it's sold, and they open to their other shows |
| Podcast | Episodes, which keep playing in the background and from the Lock Screen                                                               |
| Videos  | Live videos, newest first or by year, which play on YouTube                                                                           |
| Posts   | Posts, laid out like the website                                                                                                      |
| History | The shows we've been to, a year at a time, starting with the most recent                                                              |
| Stats   | Who and where we've seen most, and how often, as on the website. On iPhone and narrow iPads, History links to them                    |

Apple TV has no web browser and can't open YouTube, so it leaves out the Videos tab and links to websites. While an episode is loaded, a Now Playing tab holds the player, and the remote's Play/Pause button controls it.

In CarPlay, the app lists the recommended shows, by day, which open directions to their venues in Maps, and the podcast episodes, which play in Now Playing. CarPlay needs the CarPlay audio entitlement (`com.apple.developer.carplay-audio`) on the app ID.

## Building

Requirements: Xcode 26 or later. Releases build with Xcode 27.2.

The app deploys to iOS 26.0, macOS 26.0 and tvOS 26.0, so it runs on the 26 and 27 releases.

1. Open `HighForThis.xcodeproj`. The `HighForThis` scheme builds the iPhone, iPad, Mac and Apple TV app.
2. Choose a run destination and run. Signing uses team `LQR2VDPY65`.

The app finds its servers in two build settings, which reach the code through Info.plist:

| Setting            | Value                                                                                             |
| ------------------ | ------------------------------------------------------------------------------------------------- |
| `GRAPHQL_ENDPOINT` | `https://graphql.highforthis.com/graphql`                                                         |
| `UPLOADS_URL`      | `https://storage.googleapis.com/wonderboymusic`, the bucket where the CMS stores images and audio |

To run the app against another server, override them, for example `xcodebuild … GRAPHQL_ENDPOINT=https://staging.example.com/graphql`.

## The GraphQL API

`graphql/` holds the app's operations. `HighForThisAPI` is the Swift package Apollo iOS generates from them and `../graphql/schema.graphql`, with the queries, the schema's types and test mocks. From the repository root:

```sh
pnpm codegen:ios   # regenerate HighForThisAPI from the committed schema
pnpm codegen       # fetch the schema from the local GraphQL server first, and regenerate the web types too
```

`scripts/generate-api.sh` downloads a pinned, checksum-verified Apollo iOS CLI into `.cache/` and installs it atomically. To upgrade Apollo, update `APOLLO_IOS_VERSION`, the archive's SHA-256, and the exact package version in `HighForThis.xcodeproj`, then regenerate. The generated `Package.swift` also pins that exact runtime version. Don't edit `HighForThisAPI` by hand; CI regenerates it and fails on any difference. The exception is `SchemaConfiguration.swift`, which codegen writes once and leaves alone: it gives every object its `id` as a cache key.

ESLint checks the operations against the schema, with `pnpm lint` from the repository root.

## Testing

```sh
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis \
  -destination 'platform=macOS' -only-testing:HighForThisTests              # unit tests, without a simulator
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis \
  -destination 'platform=iOS Simulator,name=iPhone 18 Pro'                  # unit and UI tests
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis \
  -destination 'platform=tvOS Simulator,name=Apple TV 4K (3rd generation)'  # unit and Apple TV UI tests
swift format lint --recursive --strict HighForThis HighForThisTests HighForThisUITests   # formatting
```

Unit tests use Swift Testing and generated Apollo mocks. UI tests use a debug-only GraphQL transport and locally generated audio, not production content. They cover navigation, paging, empty states, retry, playback failures, the persistent player, dark appearance and accessibility text on iPhone and iPad, and drive the Apple TV app with the Siri Remote. The fixture transport still exercises Apollo's real response parser, and playback uses AVPlayer. Release builds contain no test fixtures. Map tiles may download, but tests do not depend on their availability.

Layouts can differ on 26 and 27, so run the UI tests on both:

```sh
xcodebuild -downloadPlatform iOS -buildVersion 23F77    # the iOS 26.5 simulator, once
xcodebuild -downloadPlatform tvOS -buildVersion 23L470  # and tvOS 26.5's
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5'
```

CI (`.github/workflows/apple.yml`) archives the iOS, Mac and Apple TV apps with Xcode 27.2, and the iOS and Apple TV apps with Xcode 26, unsigned, in one job for each Xcode, and fails on any warning. On pull requests and manual runs, it runs unit and UI tests on iPhone, iPhone Duo, iPad and Apple TV, plus unit tests on the Mac. The iPhone, iPhone Duo and iPad jobs test one build for the simulator, which a job makes and uploads for them. GitHub runs only five Mac jobs at once, so the workflow keeps its jobs few. GitHub's `xcode-27` runner image `20261119.0378` breaks simulators of downloaded runtimes, so until GitHub ships a fixed image, the tests on iOS and tvOS 26.5 run only on manual runs, and a failure there shows on the run without failing CI or holding up TestFlight. Manual runs also run a player regression test on the minimum iOS 26.0 runtime, whose simulator often hangs while booting; a failure there doesn't hold up TestFlight. On simulators, the tests run on the simulator the job booted, with parallel testing off, since xcodebuild would otherwise run them on a clone that boots cold. A failed test is retried up to twice, because CI simulators sometimes time out reading the UI or fail to quit the app; a test that hangs is killed after 5 minutes and retried the same way. When xcodebuild fails for any reason other than a failed build or test, the simulator is erased and the tests run once more. It also checks that `HighForThisAPI` matches the operations and schema and that hand-written Swift is formatted. A push to `main` is a merged pull request, whose run tested its changes, so it skips the tests: once the builds and checks pass, it uploads signed iOS, macOS and tvOS builds to TestFlight.

## Releasing

Every push to `main` that changes the app or its GraphQL operations uploads iOS, macOS and tvOS builds after CI succeeds. To upload without such a change, run the Apple workflow manually on `main`.

- The `testflight` environment deploys only from `main`. It stores `ASC_KEY`, `ASC_KEY_ID` and `ASC_ISSUER_ID` for an App Store Connect team API key, plus `DEVELOPMENT_CERTIFICATE` (a base64 `.p12`) and `DEVELOPMENT_CERTIFICATE_PASSWORD`.
- The development certificate expires on 2027-10-26. To renew it, export a new Apple Development identity as a password-protected `.p12` and replace both certificate secrets.
- Archives are signed for development and exported with cloud-managed distribution certificates. Xcode assigns the next build number, so a release bumps only the app target's `MARKETING_VERSION`.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how the code fits together.
