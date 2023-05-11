import events from 'events'
import http from 'http'
import express from 'express'
import getPort from 'get-port'
import { Handler as SkeletonHandler } from '../src/lexicon/types/app/bsky/feed/getFeedSkeleton'
import { runTestServer, TestServerInfo } from './_util'
import { createServer } from '../src/lexicon'
import { AtpAgent } from '@atproto/api'
import { SeedClient } from './seeds/client'
import basicSeed from './seeds/basic'
import { Secp256k1Keypair } from '@atproto/crypto'
import * as plc from '@did-plc/lib'

describe('feed generation', () => {
  let server: TestServerInfo
  let agent: AtpAgent
  let sc: SeedClient

  let alice: string

  beforeAll(async () => {
    server = await runTestServer({
      dbPostgresSchema: 'feed_generation',
    })
    agent = new AtpAgent({ service: server.url })
    sc = new SeedClient(agent)
    await basicSeed(sc)
    await server.ctx.backgroundQueue.processAll()
    alice = sc.dids.alice
  })

  afterAll(async () => {
    await server.close()
  })

  it('works', async () => {
    const gen = await SimpleFeedGenerator.create(
      server.ctx.cfg.didPlcUrl,
      async () => {
        const feed = [
          {
            post: sc.posts[sc.dids.alice][0].ref.uriStr,
          },
          {
            post: sc.posts[sc.dids.bob][0].ref.uriStr,
          },
        ]
        return {
          encoding: 'application/json',
          body: {
            feed,
          },
        }
      },
    )
    const res = await agent.api.app.bsky.feed.generator.create(
      { repo: alice },
      {
        did: gen.did,
        createdAt: new Date().toISOString(),
      },
      sc.getHeaders(alice),
    )

    const feed = await agent.api.app.bsky.feed.getFeed(
      { feed: res.uri },
      { headers: sc.getHeaders(alice) },
    )

    expect(feed.data.feed[0].post.uri).toEqual(
      sc.posts[sc.dids.alice][0].ref.uriStr,
    )
    expect(feed.data.feed[1].post.uri).toEqual(
      sc.posts[sc.dids.bob][0].ref.uriStr,
    )

    await gen.destroy()
  })
})

class SimpleFeedGenerator {
  constructor(public server: http.Server, public did: string) {}

  static async create(plcUrl: string, fn: SkeletonHandler) {
    const port = await getPort()
    const did = await createFgDid(plcUrl, port)
    const app = express()
    const lexServer = createServer()
    lexServer.app.bsky.feed.getFeedSkeleton(fn)
    app.use(lexServer.xrpc.router)
    const server = app.listen(port)
    await events.once(server, 'listening')
    return new SimpleFeedGenerator(server, did)
  }

  destroy(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) return reject(err)
        resolve()
      })
    })
  }
}

const createFgDid = async (plcUrl: string, port: number): Promise<string> => {
  const keypair = await Secp256k1Keypair.create()
  const plcClient = new plc.Client(plcUrl)
  const op = await plc.signOperation(
    {
      type: 'plc_operation',
      verificationMethods: {
        atproto: keypair.did(),
      },
      rotationKeys: [keypair.did()],
      alsoKnownAs: [],
      services: {
        bsky_fg: {
          type: 'BskyFeedGenerator',
          endpoint: `http://localhost:${port}`,
        },
      },
      prev: null,
    },
    keypair,
  )
  const did = await plc.didForCreateOp(op)
  await plcClient.sendOperation(did, op)
  return did
}
