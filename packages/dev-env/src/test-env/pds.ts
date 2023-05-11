import * as pds from '@atproto/pds'
import { PdsConfig, PdsServerInfo } from './types'
import { Secp256k1Keypair } from '@atproto/crypto'
import { MessageDispatcher } from '@atproto/pds/src/event-stream/message-queue'
import { AddressInfo } from 'net'

export const runPds = async (cfg: PdsConfig): Promise<PdsServerInfo> => {
  const recoveryKey = await Secp256k1Keypair.create()

  const config = new pds.ServerConfig({
    debugMode: true,
    version: '0.0.0',
    scheme: 'http',
    hostname: 'localhost',
    serverDid: 'did:fake:donotuse',
    recoveryKey: recoveryKey.did(),
    adminPassword: 'admin-pass',
    inviteRequired: false,
    userInviteInterval: null,
    didPlcUrl: cfg.plcUrl,
    jwtSecret: 'jwt-secret',
    availableUserDomains: ['.test'],
    appUrlPasswordReset: 'app://forgot-password',
    emailNoReplyAddress: 'noreply@blueskyweb.xyz',
    publicUrl: 'https://pds.public.url',
    imgUriSalt: '9dd04221f5755bce5f55f47464c27e1e',
    imgUriKey:
      'f23ecd142835025f42c3db2cf25dd813956c178392760256211f9d315f8ab4d8',
    dbPostgresUrl: cfg.dbPostgresUrl,
    maxSubscriptionBuffer: 200,
    repoBackfillLimitMs: 1000 * 60 * 60, // 1hr
    labelerDid: 'did:example:labeler',
    labelerKeywords: { label_me: 'test-label', label_me_2: 'test-label-2' },
    ...cfg,
  })

  const blobstore = new pds.MemoryBlobStore()
  const db = config.dbPostgresUrl
    ? pds.Database.postgres({
        url: config.dbPostgresUrl,
        schema: config.dbPostgresSchema,
      })
    : pds.Database.memory()
  await db.migrateToLatestOrThrow()
  const repoSigningKey = await Secp256k1Keypair.create()
  const plcRotationKey = await Secp256k1Keypair.create()

  // Disable communication to app view within pds
  MessageDispatcher.prototype.send = async () => {}

  const server = pds.PDS.create({
    db,
    blobstore,
    repoSigningKey,
    plcRotationKey,
    config,
  })

  const listener = await server.start()
  const port = (listener.address() as AddressInfo).port
  const url = `http://localhost:${port}`
  return {
    port,
    url,
    ctx: server.ctx,
    close: async () => {
      await server.destroy()
    },
  }
}
