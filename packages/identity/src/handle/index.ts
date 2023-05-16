import { isErrnoException } from '@atproto/common-web'
import dns from 'dns/promises'
import { HandleResolverOpts } from '../types'

const SUBDOMAIN = '_atproto'
const PREFIX = 'did='

export class HandleResolver {
  public timeout: number

  constructor(opts: HandleResolverOpts = {}) {
    this.timeout = opts.timeout ?? 3000
  }

  async resolve(handle: string): Promise<string | undefined> {
    const dnsPromise = this.resolveDns(handle)
    const httpAbort = new AbortController()
    const httpPromise = this.resolveHttp(handle, httpAbort.signal).catch(
      () => undefined,
    )
    const dnsRes = await dnsPromise
    if (dnsRes) {
      httpAbort.abort()
      return dnsRes
    }
    return httpPromise
  }

  async resolveDns(handle: string): Promise<string | undefined> {
    let chunkedResults: string[][]
    try {
      chunkedResults = await dns.resolveTxt(`${SUBDOMAIN}.${handle}`)
    } catch (err) {
      if (isErrnoException(err) && err.code === 'ENOTFOUND') {
        return undefined
      }
      throw err
    }
    const results = chunkedResults.map((chunks) => chunks.join(''))
    const found = results.filter((i) => i.startsWith(PREFIX))
    if (found.length !== 1) {
      return undefined
    }
    return found[0].slice(PREFIX.length)
  }

  async resolveHttp(
    handle: string,
    signal?: AbortSignal,
  ): Promise<string | undefined> {
    const url = `http://${handle}/.well-known/atproto-did/${handle}`
    try {
      const res = await fetch(url, { signal })
      return await res.text()
    } catch (err) {
      return undefined
    }
  }
}
