import { Server } from '../../../../lexicon'
import AppContext from '../../../../context'
import { TimeCidKeyset, paginate } from '../../../../db/pagination'
import { ProfileView } from '../../../../lexicon/types/app/bsky/actor/defs'

export default function (server: Server, ctx: AppContext) {
  server.app.bsky.feed.getSavedFeeds({
    auth: ctx.accessVerifier,
    handler: async ({ auth, params }) => {
      const { limit, cursor } = params
      const requester = auth.credentials.did

      const actorService = ctx.services.appView.actor(ctx.db)
      const feedService = ctx.services.appView.feed(ctx.db)

      const { ref } = ctx.db.db.dynamic
      let feedsQb = feedService
        .selectFeedGeneratorQb(requester)
        .innerJoin('saved_feed', 'saved_feed.feedUri', 'feed_generator.uri')
        .where('saved_feed.userDid', '=', requester)
        .select('saved_feed.createdAt as createdAt') // Cursor based on saved time, createdAt not used in view logic

      const keyset = new TimeCidKeyset(
        ref('saved_feed.createdAt'),
        ref('feed_generator.cid'),
      )
      feedsQb = paginate(feedsQb, {
        limit,
        cursor,
        keyset,
      })
      const feedsRes = await feedsQb.execute()

      const profiles = await actorService.views.profile(feedsRes, requester)
      const profilesMap = profiles.reduce(
        (acc, cur) => ({
          ...acc,
          [cur.did]: cur,
        }),
        {} as Record<string, ProfileView>,
      )

      const feeds = feedsRes.map((row) =>
        feedService.views.formatFeedGeneratorView(row, profilesMap),
      )

      return {
        encoding: 'application/json',
        body: {
          feeds,
          cursor: keyset.packFromResult(feedsRes),
        },
      }
    },
  })
}