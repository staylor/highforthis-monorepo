# Architecture

The iPhone, iPad, Mac and Apple TV app shares one target. Apollo's generated selection sets are the read-only models; shared fragments let the same show and video rows serve different queries. Hand-written logic lives in `HighForThis/Models/`, networking in `API/`, and SwiftUI screens in `Views/`.

## Requests and lists

- `QueryState` owns a detail request's data, loading state and error. A generation counter and cancellation checks prevent an older request from replacing newer data. `QueryView` supplies progress, retry, pull to refresh, and a Mac Refresh command (⌘R). A failed refresh preserves the current data and displays its error.
- `ApolloClient.highForThis` has an in-memory normalized cache, keyed by entity ID. The client rejects GraphQL errors before caching results, so a failed nullable field cannot become a successful empty cache hit. Views hold snapshots, not cache subscriptions; refresh updates the visible snapshot.
- `CursorFeed` handles pagination for all four lists. `API/Feeds.swift` maps each connection to items, an end cursor and optional years. Shows request 50 items; videos, posts and podcasts request 20. Load More is explicit, preventing invisible lists from fetching the whole archive. IDs are deduplicated within and between pages, repeated cursors are rejected, and Retry repeats the failed request—including a first-page refresh. Changing filters clears mismatched rows without losing the year menu.
- Artist and venue details request five shows per section and the attended total. View All opens a paginated list with the same artist or venue filter.
- Empty states remain inside a list, so they can refresh. The filter and navigation title remain available when no rows match.

## Navigation and presentation

Each tab has a `NavigationStack` with typed `Route` values. Tabs adapt to a sidebar on iPad and Mac. Controls use the system's Liquid Glass treatment; the content itself stays on readable, standard backgrounds.

A playing or paused episode has a persistent player accessory. iOS 26.1+ uses `tabViewBottomAccessory(isEnabled:)`; iOS 26.0 and Mac use a glass inset, since 26.0 reserves space even for an empty tab accessory. Opening it presents Now Playing with seeking, 15-second skips and Stop. Mac windows have a minimum size.

On Apple TV, the tabs run across the top and the remote moves focus. tvOS has no web browser, Maps app or YouTube, so it leaves out the Videos tab, website links and opening a venue in Maps (`WebLink`, `VenueMap`). While an episode is loaded, Now Playing is a tab of its own; it comes last, because a tab inserted before the others resets their navigation. The remote's Play/Pause button toggles playback from any screen. History's year filter is the list's first row, because a tvOS toolbar button shows neither the selected year nor the filter's accessibility label.

Video and post rows stack vertically at accessibility text sizes. Maps are real buttons, usable with VoiceOver and the keyboard, and external URLs must be HTTP or HTTPS. Accent colors have dark and increased-contrast variants.

## Posts and images

`PostBlock` converts Lexical headings, paragraphs, quotes, code, images and videos to display values. Text formats become `AttributedString` runs, preserving combined formatting. The reader computes these blocks when the editor state changes and uses a `LazyVStack`, rather than constructing and downloading every image immediately. Text is selectable, headings have accessibility traits, and image descriptions use the CMS's alt text. The Siri Remote scrolls only by moving focus, so on tvOS each block takes focus (`focusableForReading()`), code wraps rather than scrolling sideways, and columns widen by the ratio of tvOS to iOS body text (`CGFloat.readable(_:)`). Episode pages put Play before the description there, so it takes focus.

Uploads use the CMS's Cloud Storage bucket (`UPLOADS_URL`) at `destination/fileName`. Apple Music artwork replaces `{w}` and `{h}` in its URL template, bounding both dimensions to 1500 pixels. Images use `AsyncImage`; the shared URL cache has a 32 MB memory and 256 MB disk budget. Frames retain their aspect ratio while loading or showing a failure placeholder.

## Playback

`PodcastPlayer` is shared by the app's windows. It enables AVPlayer Observation before creating any player and derives playback status from the player, with an explicit preparing state during audio-session activation.

- Activation is cancellable. Pause, Stop and replacing an episode invalidate pending activation; a late completion cannot restart playback.
- `PlaybackAudioSession` serializes activation and deactivation away from the main actor. Revisions prevent an older activation from undoing a newer deactivation.
- On iOS and tvOS, `MPNowPlayingSession` supplies Lock Screen and Control Center metadata, play/pause, seeking and skips. Interruption handling resumes only when playback was requested and the system permits it; unplugging headphones pauses. Pausing, ending or failing releases the audio session.
- Item failures are observed with KVO and notifications, displayed in the player, and retryable. Observers and remote-command handlers are removed when the player is released.
- A one-second time observer updates only the controls that read elapsed time, not the browsing screens.

## Tests and generation

`HighForThisTests` uses Swift Testing for loading races, cancellation, pagination, cache errors, media URLs, rendering and playback activation. Generated Apollo mocks build typed fixtures. `HighForThisUITests` covers navigation, pagination, empty filters, retries, playback, dark mode and accessibility text on iPhone and iPad. `TVNavigationTests` drives the same flows on Apple TV with `XCUIRemote`, waiting for focus rather than tapping.

The test scheme enables `HIGHFORTHIS_TESTING` for the unit-test host; UI tests launch with `-ui-testing`. Debug-only `PreviewSupport/UITestFixtures.swift` intercepts the GraphQL transport and supplies local audio. Tests still exercise Apollo's response parser and the real AVPlayer. Fixture code and media are absent from Release builds. Map tiles are optional system downloads; test assertions do not depend on them.

`AppIcon.icon` is the Icon Composer icon for iOS and macOS. tvOS can't use it, so the asset catalog's `Brand Assets` hold its layered icon and Top Shelf image.

`graphql/` holds operations, and `HighForThisAPI/` is generated by `pnpm codegen:ios`. CI checks the generated output and formats only hand-written Swift. Runtime and CLI versions are exact pins; the CLI download is checksum-verified and installed atomically.

Swift 6 uses main-actor default isolation. Pure value types and extensions of generated types are explicitly `nonisolated` for both Swift 6.2 and 6.4. Localized strings live in `Localizable.xcstrings`, with generated symbols; nonisolated errors use literal keys because Xcode 26 isolates those symbols to the main actor.
