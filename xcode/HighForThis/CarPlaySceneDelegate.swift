#if os(iOS) && canImport(CarPlay)
import Apollo
import CarPlay
import HighForThisAPI
import Observation
import os
import UIKit

/// CarPlay lists the recommended shows and the podcast episodes, and plays episodes with the app's shared player.
final class CarPlaySceneDelegate: UIResponder, CPTemplateApplicationSceneDelegate {
    private var interfaceController: CPInterfaceController?
    private let showFeed = Feeds.shows()
    private let podcastFeed = Feeds.podcasts()
    private let player = PodcastPlayer.shared
    private let client = ApolloClient.highForThis
    private let shows = CPListTemplate(title: String(localized: .recommendedShows), sections: [])
    private let episodes = CPListTemplate(title: String(localized: .podcastEpisodes), sections: [])

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didConnect interfaceController: CPInterfaceController
    ) {
        self.interfaceController = interfaceController
        shows.tabTitle = String(localized: .shows)
        shows.tabImage = UIImage(systemName: "music.mic")
        episodes.tabTitle = String(localized: .podcast)
        episodes.tabImage = UIImage(systemName: "mic")
        observe()
        let tabs = CPTabBarTemplate(templates: [shows, episodes])
        interfaceController.setRootTemplate(tabs, animated: false) { _, error in
            if let error {
                Logger.carPlay.error("Couldn't show the tabs: \(error.localizedDescription, privacy: .public)")
            }
        }
        Task { await showFeed.load(ShowFilter(kind: .upcoming)) }
        Task { await podcastFeed.load(.all) }
    }

    func templateApplicationScene(
        _ templateApplicationScene: CPTemplateApplicationScene,
        didDisconnectInterfaceController interfaceController: CPInterfaceController
    ) {
        self.interfaceController = nil
    }

    /// Rebuilds the lists whenever a feed or the playing episode changes, while CarPlay is connected.
    private func observe() {
        guard interfaceController != nil else { return }
        withObservationTracking {
            updateShows()
            updateEpisodes()
        } onChange: { [weak self] in
            Task { @MainActor in self?.observe() }
        }
    }

    // MARK: - Shows

    private func updateShows() {
        let days = ShowDay.days(from: showFeed.items)
        var sections: [CPListSection]
        if days.count + 1 <= CPListTemplate.maximumSectionCount {
            sections = days.map { day in
                CPListSection(
                    items: day.shows.map { makeItem(for: $0, dated: false) },
                    header: day.date.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day().year()),
                    sectionIndexTitle: nil
                )
            }
        } else {
            // Too many days for sections: each row carries its date instead.
            sections = [CPListSection(items: days.flatMap(\.shows).map { makeItem(for: $0, dated: true) })]
        }
        if let footer = footer(for: showFeed) {
            sections.append(CPListSection(items: [footer]))
        }
        shows.updateSections(sections)
        shows.emptyViewTitleVariants = [String(localized: showFeed.hasLoaded ? .noRecommendedShows : .loading)]
    }

    private func makeItem(for show: ShowList_show, dated: Bool) -> CPListItem {
        let date = show.startDate.formatted(.dateTime.weekday(.abbreviated).month(.abbreviated).day())
        return CPListItem(text: show.headline, detailText: dated ? "\(date) · \(show.venue.name)" : show.venue.name)
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
        let date = episode.date.map { Date(apiTimestamp: $0).formatted(.dateTime.month(.abbreviated).day().year()) }
        let item = CPListItem(text: episode.title, detailText: date)
        item.isPlaying = player.episode?.id == episode.id && player.isPlaying
        item.playingIndicatorLocation = .trailing
        item.handler = { [weak self] _, completion in
            Task {
                await self?.play(id: episode.id)
                completion()
            }
        }
        return item
    }

    // MARK: - Pagination

    /// A connection is never cut short: a list ends with Load More while there's more, or Try Again after a failure.
    private func footer<Filter, Item>(for feed: CursorFeed<Filter, Item>) -> CPListItem? {
        let item: CPListItem
        if let error = feed.error {
            item = CPListItem(
                text: String(localized: feed.isLoading ? .loading : .tryAgain),
                detailText: error.localizedDescription,
                image: UIImage(systemName: "exclamationmark.triangle")
            )
            item.handler = { _, completion in
                Task {
                    await feed.retry()
                    completion()
                }
            }
        } else if feed.hasNextPage {
            item = CPListItem(text: String(localized: feed.isLoading ? .loading : .loadMore), detailText: nil)
            item.handler = { _, completion in
                Task {
                    await feed.loadMore()
                    completion()
                }
            }
        } else {
            return nil
        }
        item.isEnabled = !feed.isLoading
        return item
    }

    // MARK: - Playback

    private func play(id: String) async {
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
        } catch is CancellationError {
        } catch {
            showAlert(error.localizedDescription)
        }
    }

    private func showNowPlaying() {
        guard let interfaceController, interfaceController.topTemplate !== CPNowPlayingTemplate.shared else { return }
        interfaceController.pushTemplate(CPNowPlayingTemplate.shared, animated: true, completion: nil)
    }

    private func showAlert(_ message: String) {
        let dismiss = CPAlertAction(title: String(localized: .done), style: .cancel) { [weak self] _ in
            self?.interfaceController?.dismissTemplate(animated: true, completion: nil)
        }
        interfaceController?.presentTemplate(
            CPAlertTemplate(titleVariants: [message], actions: [dismiss]),
            animated: true,
            completion: nil
        )
    }
}
#endif
