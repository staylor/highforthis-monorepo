# Architecture

The iPhone, iPad, Mac and Apple TV app shares one target. Apollo's generated selection sets are the read-only models; shared fragments let the same show and video rows serve different queries. Hand-written logic lives in `HighForThis/Models/`, networking in `API/`, and SwiftUI screens in `Views/`.

## Requests and lists

- `QueryState` owns a detail request's data, loading state and error. A generation counter and cancellation checks prevent an older request from replacing newer data. `QueryView` supplies progress, retry, pull to refresh, and a Mac Refresh command (⌘R). A failed refresh preserves the current data and displays its error.
- `ApolloClient.highForThis` has an in-memory normalized cache, keyed by entity ID. The client rejects GraphQL errors before caching results, so a failed nullable field cannot become a successful empty cache hit. Views hold snapshots, not cache subscriptions; refresh updates the visible snapshot.
- `CursorFeed` handles pagination for all four lists. `API/Feeds.swift` maps each connection to items, an end cursor and optional years. Shows request 50 items; videos, posts and podcasts request 20. Load More is explicit, preventing invisible lists from fetching the whole archive. History loads one year at a time, up to 100 shows a page, starting with the most recent: GraphQL picks that year (`mostRecentYear`), so the first request needn't wait for the list of years, and the year menu has no All Years. The years come with the first page shown without a chosen year, and the menu keeps them for the others. IDs are deduplicated within and between pages, repeated cursors are rejected, and Retry repeats the failed request—including a first-page refresh. Changing filters clears mismatched rows without losing the year menu.
- Artist and venue details request five shows per section and the attended total. View All opens a paginated list with the same artist or venue filter.
- Empty states remain inside a list, so they can refresh. The filter and navigation title remain available when no rows match.

## Navigation and presentation

Each tab has a `NavigationStack` with typed `Route` values. Tabs adapt to a sidebar on iPad and Mac. Controls use the system's Liquid Glass treatment; the content itself stays on readable, standard backgrounds.

A playing or paused episode has a persistent player accessory. iOS 26.1+ uses `tabViewBottomAccessory(isEnabled:)`; iOS 26.0 and Mac use a glass inset, since 26.0 reserves space even for an empty tab accessory. Opening it presents Now Playing with seeking, 15-second skips and Stop. Mac windows have a minimum size.

On Apple TV, the tabs run across the top and the remote moves focus. tvOS has no web browser, Maps app or YouTube, so it leaves out the Videos tab, website links and opening a venue in Maps (`WebLink`, `VenueMap`). While an episode is loaded, Now Playing is a tab of its own; it comes last, because a tab inserted before the others resets their navigation. The remote's Play/Pause button toggles playback from any screen. History's year filter is the list's first row, because a tvOS toolbar button shows neither the selected year nor the filter's accessibility label.

Shows are dated where they are, in New York, as the website dates them, wherever the device is: the show lists and CarPlay's sections group them by New York's calendar (`Calendar.newYork`), and a show's page gives its time on New York's clocks, naming the time zone on a device that keeps another time.

Video and post rows stack vertically at accessibility text sizes. Maps are real buttons, usable with VoiceOver and the keyboard, and external URLs must be HTTP or HTTPS. Accent colors have dark and increased-contrast variants.

## Posts and images

`PostBlock` converts Lexical headings, paragraphs, quotes, code, images and videos to display values. Text formats become `AttributedString` runs, preserving combined formatting. The reader computes these blocks when the editor state changes and uses a `LazyVStack`, rather than constructing and downloading every image immediately. Text is selectable, headings have accessibility traits, and image descriptions use the CMS's alt text. Album titles, the posts' third-level headings, are drawn as the website draws its `h3`: bold, over a dashed rule in the accent color as wide as the title and its padding, with the site's extra room above. The Siri Remote scrolls only by moving focus, so on tvOS each block takes focus (`focusableForReading()`), code wraps rather than scrolling sideways, and columns widen by the ratio of tvOS to iOS body text (`CGFloat.readable(_:)`). Episode pages put Play before the description there, so it takes focus.

Post rows show the album covers in each post, as the website's post cards do: each cover once, or the featured images when a post has none, up to five tiled in the site's collage layouts. A seed made once per list shuffles them with the website's hash, so the list shows a different few each time it opens and keeps them while it's open.

Uploads use the CMS's Cloud Storage bucket (`UPLOADS_URL`) at `destination/fileName`. Apple Music artwork replaces `{w}` and `{h}` in its URL template, bounding both dimensions to 1500 pixels. Images use `AsyncImage`; the shared URL cache has a 32 MB memory and 256 MB disk budget. Frames hold their aspect ratio, or their collage tile, while loading or showing a failure placeholder.

## Playback

`PodcastPlayer` is shared by the app's windows. It enables AVPlayer Observation before creating any player and derives playback status from the player, with an explicit preparing state during audio-session activation.

- Activation is cancellable. Pause, Stop and replacing an episode invalidate pending activation; a late completion cannot restart playback.
- `PlaybackAudioSession` serializes activation and deactivation away from the main actor. Revisions prevent an older activation from undoing a newer deactivation.
- On iOS and tvOS, `MPNowPlayingSession` supplies Lock Screen and Control Center metadata, play/pause, seeking and skips. Interruption handling resumes only when playback was requested and the system permits it; unplugging headphones pauses. Pausing, ending or failing releases the audio session.
- Item failures are observed with KVO and notifications, displayed in the player, and retryable. Observers and remote-command handlers are removed when the player is released.
- A one-second time observer updates only the controls that read elapsed time, not the browsing screens.

## CarPlay

`CarPlaySceneDelegate` (iOS only) connects through the `AppDelegate`'s scene configuration and the Info.plist scene manifest. Its tab bar holds the recommended shows, in sections by day (or one dated list when there are more days than `CPListTemplate.maximumSectionCount`), and the podcast episodes. Both are `CursorFeed`s, so the lists end with Load More, or Try Again after a failure, rather than being cut short. Observation tracking rebuilds the lists when a feed or the playing episode changes. Each show's row has its main artist's picture, as the app's show lists do: `CarPlayArtwork` draws it as a circle at `CPListItem.maximumImageSize` and the car screen's scale, as CarPlay asks, and an `ImageCache` keeps the pictures while CarPlay is connected. A row shows a microphone, in the car's light and dark styles, until its picture arrives or when there's none, and a picture that fails to load is tried again at the next rebuild. Rebuilds keep each show's `CPListItem`, with the picture it has been given, and once pictures stop arriving the list is given its rows again: when pictures arrive while CarPlay is still setting a list up, it can miss `setImage(_:)` on rows it hasn't drawn yet. A row half on screen when its picture arrives can keep showing the placeholder until it scrolls, which CarPlay draws itself. An audio app's templates can't show a show's details, so choosing one opens driving directions to its venue's address in Maps instead, through the CarPlay scene, which opens Maps on the car's screen. Choosing an episode fetches its audio and plays it with `PodcastPlayer.shared`, the player the app's windows use, then pushes the shared Now Playing template, which `MPNowPlayingSession` already feeds.

## Tests and generation

`HighForThisTests` uses Swift Testing for loading races, cancellation, pagination, cache errors, media URLs, rendering and playback activation. Generated Apollo mocks build typed fixtures. `HighForThisUITests` covers navigation, pagination, empty filters, retries, playback, dark mode and accessibility text on iPhone and iPad. `TVNavigationTests` drives the same flows on Apple TV with `XCUIRemote`, waiting for focus rather than tapping.

The test scheme enables `HIGHFORTHIS_TESTING` for the unit-test host; UI tests launch with `-ui-testing`. Debug-only `PreviewSupport/UITestFixtures.swift` intercepts the GraphQL transport and supplies local audio. Tests still exercise Apollo's response parser and the real AVPlayer. Fixture code and media are absent from Release builds. Map tiles are optional system downloads; test assertions do not depend on them.

`AppIcon.icon` is the Icon Composer icon for iOS and macOS. tvOS can't use it, so the asset catalog's `Brand Assets` hold its layered icon and Top Shelf image.

`graphql/` holds operations, and `HighForThisAPI/` is generated by `pnpm codegen:ios`. CI checks the generated output and formats only hand-written Swift. Runtime and CLI versions are exact pins; the CLI download is checksum-verified and installed atomically.

Swift 6 uses main-actor default isolation. Pure value types and extensions of generated types are explicitly `nonisolated` for both Swift 6.2 and 6.4. Localized strings live in `Localizable.xcstrings`, with generated symbols; nonisolated errors use literal keys because Xcode 26 isolates those symbols to the main actor.
