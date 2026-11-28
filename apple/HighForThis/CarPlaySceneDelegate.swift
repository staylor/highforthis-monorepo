#if os(iOS) && canImport(CarPlay)
import Apollo
import CarPlay
import HighForThisAPI
import Observation
import os
import UIKit

/// CarPlay lists the recommended shows, which open driving directions to their venues in Maps, and the podcast
/// episodes, which play with the app's shared player.
final class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    private weak var scene: CPTemplateApplicationScene?
    private var interfaceController: CPInterfaceController?
    /// Changes on every connect and disconnect, so observation started for an earlier connection stops.
    private var connection = 0
    private var playback: Task<Void, Never>?
    private var playbackFailed = false
    private let showFeed = Feeds.shows()
    private let podcastFeed = Feeds.podcasts()
    private let player = PodcastPlayer.shared
    private let client = ApolloClient.highForThis
    private let shows = CPListTemplate(title: String(localized: .recommendedShows), sections: [])
    private let episodes = CPListTemplate(title: String(localized: .podcastEpisodes), sections: [])
    /// The shows list's rows, kept from one update of the list to the next while CarPlay is connected, so an update
    /// gives CarPlay the rows it already has, with the pictures they've been given, rather than new ones.
    private var showRows: [ShowRowKey: CPListItem] = [:]
    /// The shows' main artists' pictures, kept while CarPlay is connected.
    private var artwork: ImageCache<UIImage>?
    private var artworkPlaceholder: UIImage?
    /// How many of the car screen's pixels wide a row's picture is.
    private var artworkWidth = 0
    /// The rows in the shows list that are waiting for each picture.
    private var rowsAwaitingArtwork: [URL: [CPListItem]] = [:]
    private var artworkResend: Task<Void, Never>?

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didConnect interfaceController: CPInterfaceController
    ) {
        scene = templateApplicationScene
        self.interfaceController = interfaceController
        connection += 1
        shows.tabTitle = String(localized: .shows)
        shows.tabImage = UIImage(systemName: "calendar")
        episodes.tabTitle = String(localized: .podcast)
        episodes.tabImage = UIImage(systemName: "mic.circle")
        // Only failures from here on are news to the driver.
        playbackFailed = player.error != nil
        // CarPlay asks for list images at its rows' image size and the car screen's scale, not the phone's.
        let imageSize = CPListItem.maximumImageSize
        let traits = interfaceController.carTraitCollection
        let scale = traits.displayScale
        artworkWidth = Int((max(imageSize.width, imageSize.height) * scale).rounded(.up))
        artwork = ImageCache { url in await CarPlayArtwork.circle(from: url, size: imageSize, scale: scale) }
        artworkPlaceholder = CarPlayArtwork.placeholder(size: imageSize, traits: traits)
        observe { $0.updateShows() }
        observe { $0.updateEpisodes() }
        observe { $0.alertPlaybackFailure() }
        let tabs = CPTabBarTemplate(templates: [shows, episodes])
        Task {
            do {
                _ = try await interfaceController.setRootTemplate(tabs, animated: false)
            } catch {
                Logger.carPlay.error("Couldn't show the tabs: \(error.localizedDescription, privacy: .public)")
            }
        }
        // From the server: the app may not have been in use since the last drive, or for days
        Task { await showFeed.load(ShowFilter(kind: .upcoming), refresh: true) }
        Task { await podcastFeed.load(.all, refresh: true) }
    }

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didDisconnectInterfaceController interfaceController: CPInterfaceController
    ) {
        scene = nil
        self.interfaceController = nil
        connection += 1
        playback?.cancel()
        playback = nil
        artwork?.removeAll()
        artwork = nil
        rowsAwaitingArtwork = [:]
        artworkResend?.cancel()
        artworkResend = nil
        // The next car's screen may have another scale, so its rows start again with pictures drawn for it.
        showRows = [:]
    }

    /// Runs `update` now and again whenever what it read changes, until this connection ends. Each list has its own
    /// observation, so a change to one doesn't rebuild the other.
    private func observe(_ update: @escaping @MainActor (CarPlaySceneDelegate) -> Void) {
        observe(update, connection: connection)
    }

    private func observe(_ update: @escaping @MainActor (CarPlaySceneDelegate) -> Void, connection: Int) {
        guard connection == self.connection else { return }
        withObservationTracking {
            update(self)
        } onChange: { [weak self] in
            Task { @MainActor in self?.observe(update, connection: connection) }
        }
    }

    // MARK: - Shows

    private func updateShows() {
        rowsAwaitingArtwork = [:]
        let previousRows = showRows
        showRows = [:]
        let days = ShowDay.days(from: showFeed.items)
        let footer = footer(for: showFeed).map { [CPListSection(items: [$0])] } ?? []
        let sections: [CPListSection]
        if days.count + footer.count <= CPListTemplate.maximumSectionCount {
            sections = days.map { day in
                CPListSection(
                    items: day.shows.map { row(for: $0, dated: false, reusing: previousRows) },
                    header: day.date.formatted(.showDay),
                    sectionIndexTitle: nil
                )
            }
        } else {
            // Too many days for sections: each row carries its date instead.
            sections = [CPListSection(items: days.flatMap(\.shows).map { row(for: $0, dated: true, reusing: previousRows) })]
        }
        shows.updateSections(sections + footer)
        shows.emptyViewTitleVariants = [String(localized: showFeed.hasLoaded ? .noRecommendedShows : .loading)]
        fetchArtwork()
    }

    /// The show's row: the one the list already had for it, brought up to date, or a new one.
    private func row(for show: ShowList_show, dated: Bool, reusing previousRows: [ShowRowKey: CPListItem]) -> CPListItem {
        let key = ShowRowKey(id: show.id, dated: dated)
        let venue = show.venue.name
        let detail = dated ? String(localized: .dateAndVenue(show.displayDate.formatted(.showDay), venue)) : venue
        let item: CPListItem
        if let previous = previousRows[key] {
            item = previous
            if item.text != show.headline {
                item.setText(show.headline)
            }
            if item.detailText != detail {
                item.setDetailText(detail)
            }
        } else {
            item = CPListItem(text: show.headline, detailText: detail)
        }
        showRows[key] = item
        setArtwork(for: show, on: item)
        if let directions = show.venue.address.flatMap(URL.directions) {
            item.handler = { [weak self] _, completion in
                guard let self else { return completion() }
                open(directions, completion: completion)
            }
        } else {
            item.handler = nil
        }
        return item
    }

    /// Gives a row its main artist's picture if it has loaded, or the placeholder while it loads or when there's
    /// none. A row that already has the right image is left alone, so CarPlay doesn't reload it.
    private func setArtwork(for show: ShowList_show, on item: CPListItem) {
        let url = show.headlinerArtwork(maximumWidth: artworkWidth)?.url
        let picture = url.flatMap { artwork?[$0] }
        let image = picture ?? artworkPlaceholder
        if item.image !== image {
            item.setImage(image)
        }
        if let url, picture == nil {
            rowsAwaitingArtwork[url, default: []].append(item)
        }
    }

    /// Fetches the pictures the rows are waiting for. Each goes to the rows waiting for it when it arrives; one that
    /// fails is fetched again the next time the list changes.
    private func fetchArtwork() {
        guard let artwork else { return }
        let connection = connection
        for url in rowsAwaitingArtwork.keys {
            Task { [weak self] in
                guard let image = await artwork.image(for: url), let self, connection == self.connection else { return }
                for item in rowsAwaitingArtwork.removeValue(forKey: url) ?? [] {
                    item.setImage(image)
                }
                resendShowsWhenArtworkSettles()
            }
        }
    }

    /// Gives the list its rows again once pictures stop arriving. When pictures arrive while CarPlay is still setting
    /// the list up, it can miss `setImage(_:)` on rows it hasn't drawn yet, which keep the placeholder until the list
    /// is given its rows again.
    private func resendShowsWhenArtworkSettles() {
        artworkResend?.cancel()
        let connection = connection
        artworkResend = Task { [weak self] in
            try? await Task.sleep(for: .milliseconds(500))
            guard let self, !Task.isCancelled, connection == self.connection else { return }
            shows.updateSections(shows.sections)
        }
    }

    /// Opens Maps on the car's screen, as CarPlay shows apps that the scene opens there.
    private func open(_ directions: URL, completion: @escaping () -> Void) {
        guard let scene else { return completion() }
        Task {
            defer { completion() }
            if await !scene.open(directions, options: nil) {
                showAlert(String(localized: .directionsUnavailable))
            }
        }
    }

    // MARK: - Episodes

    private func updateEpisodes() {
        var items: [CPListItem] = podcastFeed.items.map(makeItem)
        if let footer = footer(for: podcastFeed) {
            items.append(footer)
        }
        episodes.updateSections(items.isEmpty ? [] : [CPListSection(items: items)])
        episodes.emptyViewTitleVariants = [String(localized: podcastFeed.hasLoaded ? .noPodcastEpisodes : .loading)]
    }

    private func makeItem(for episode: PodcastsQuery.Data.Podcasts.Edge.Node) -> CPListItem {
        let date = episode.date.map { Date(apiTimestamp: $0).formatted(.postedDate) }
        let item = CPListItem(text: episode.title, detailText: date)
        item.isPlaying = player.isPlaying(id: episode.id)
        item.playingIndicatorLocation = .trailing
        item.handler = { [weak self] _, completion in
            guard let self else { return completion() }
            play(id: episode.id, completion: completion)
        }
        return item
    }

    // MARK: - Pagination

    /// A connection is never cut short: a list ends with Load More while there's more, or Try Again after a failure.
    private func footer<Filter, Item>(for feed: CursorFeed<Filter, Item>) -> CPListItem? {
        if let error = feed.error {
            // Retrying clears the error, so this row is replaced by Load More, or by nothing, while it runs.
            let item = CPListItem(
                text: String(localized: .tryAgain),
                detailText: error.localizedDescription,
                image: UIImage(systemName: "exclamationmark.triangle")
            )
            item.handler = { _, completion in
                Task {
                    await feed.retry()
                    completion()
                }
            }
            return item
        }
        guard feed.hasNextPage else { return nil }
        let item = CPListItem(text: String(localized: feed.isLoading ? .loading : .loadMore), detailText: nil)
        item.isEnabled = !feed.isLoading
        item.handler = { _, completion in
            Task {
                await feed.loadMore()
                completion()
            }
        }
        return item
    }

    // MARK: - Playback

    /// Plays the chosen episode. Choosing another before this one loads cancels it, so a slow response can't
    /// replace the episode chosen last.
    private func play(id: String, completion: @escaping () -> Void) {
        playback?.cancel()
        playback = Task {
            defer { completion() }
            do {
                guard let podcast = try await client.data(for: PodcastQuery(id: id)).podcast else {
                    showAlert(String(localized: .notFound))
                    return
                }
                guard let episode = PodcastPlayer.Episode(podcast) else {
                    showAlert(String(localized: .audioUnavailable))
                    return
                }
                player.play(episode)
                showNowPlaying()
            } catch {
                guard !Task.isCancelled, !(error is CancellationError) else { return }
                showAlert(error.localizedDescription)
            }
        }
    }

    /// Playback fails after Now Playing is showing, when the audio session or the episode's audio fails to load.
    private func alertPlaybackFailure() {
        let failed = player.error != nil
        if failed, !playbackFailed {
            showAlert(String(localized: .playbackUnavailable))
        }
        playbackFailed = failed
    }

    private func showNowPlaying() {
        guard let interfaceController, interfaceController.topTemplate !== CPNowPlayingTemplate.shared else { return }
        interfaceController.pushTemplate(CPNowPlayingTemplate.shared, animated: true, completion: nil)
    }

    private func showAlert(_ message: String) {
        guard let interfaceController else { return }
        let dismiss = CPAlertAction(title: String(localized: .done), style: .cancel) { [weak self] _ in
            self?.interfaceController?.dismissTemplate(animated: true, completion: nil)
        }
        // CarPlay presents one template at a time.
        if interfaceController.presentedTemplate != nil {
            interfaceController.dismissTemplate(animated: false, completion: nil)
        }
        interfaceController.presentTemplate(
            CPAlertTemplate(titleVariants: [message], actions: [dismiss]),
            animated: true,
            completion: nil
        )
    }
}

/// Which of a show's rows: one under its day, or one with the date in it, for a list with too many days for sections.
private nonisolated struct ShowRowKey: Hashable {
    let id: String
    let dated: Bool
}
#endif
