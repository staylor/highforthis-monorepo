# High For This

The iPhone, iPad and Mac app for [highforthis.com](https://highforthis.com). Everything in it comes from the site's GraphQL API.

| Tab     | What it shows                                                                                                  |
| ------- | -------------------------------------------------------------------------------------------------------------- |
| Shows   | Upcoming shows we recommend, by day. A show opens to its artists and venue, and they open to their other shows |
| Podcast | Episodes, which keep playing in the background and from the Lock Screen                                        |
| Videos  | Live videos, newest first or by year, which play on YouTube                                                    |
| Posts   | Posts, laid out like the website                                                                               |
| History | The shows we've been to, newest first or by year                                                               |

## Building

Requirements: Xcode 26 or later. Releases build with Xcode 27.1.

The app deploys to iOS 26.0 and macOS 26.0, so it runs on the 26 and 27 releases.

1. Open `HighForThis.xcodeproj`. The `HighForThis` scheme builds the iPhone, iPad and Mac app.
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
  -destination 'platform=macOS' -only-testing:HighForThisTests            # unit tests, without a simulator
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis \
  -destination 'platform=iOS Simulator,name=iPhone 18 Pro'                # unit and UI tests
swift format lint --recursive --strict HighForThis HighForThisTests HighForThisUITests   # formatting
```

Unit tests use Swift Testing and generated Apollo mocks. UI tests use a debug-only GraphQL transport and locally generated audio, not production content. They cover navigation, paging, empty states, retry, playback failures, the persistent player, dark appearance and accessibility text on iPhone and iPad. The fixture transport still exercises Apollo's real response parser, and playback uses AVPlayer. Release builds contain no test fixtures. Map tiles may download, but tests do not depend on their availability.

Layouts can differ on 26 and 27, so run the UI tests on both:

```sh
xcodebuild -downloadPlatform iOS -buildVersion 23F77   # the iOS 26.5 simulator, once
xcodebuild test -project HighForThis.xcodeproj -scheme HighForThis \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5'
```

CI (`.github/workflows/xcode.yml`) archives the iOS and Mac apps with Xcode 27.1, and the iOS app with Xcode 26, unsigned, and fails on any warning. It runs unit and UI tests on iPhone and iPad with iOS 27 and 26.5, plus unit tests on the Mac and a player regression test on the minimum iOS 26.0 runtime, without retrying failed tests. It also checks that `HighForThisAPI` matches the operations and schema and that hand-written Swift is formatted.

See [`ARCHITECTURE.md`](ARCHITECTURE.md) for how the code fits together.
