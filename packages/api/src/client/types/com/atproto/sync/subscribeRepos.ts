/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { Headers, XRPCError } from '@atproto/xrpc'
import { ValidationResult } from '@atproto/lexicon'
import { isObj, hasProp } from '../../../../util'
import { lexicons } from '../../../../lexicons'

export interface Commit {
  seq: number
  rebase: boolean
  tooBig: boolean
  repo: string
  commit: string
  prev: string | null
  /** CAR file containing relevant blocks */
  blocks: {}
  ops: RepoOp[]
  blobs: string[]
  time: string
  [k: string]: unknown
}

export function isCommit(v: unknown): v is Commit {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.atproto.sync.subscribeRepos#commit'
  )
}

export function validateCommit(v: unknown): ValidationResult {
  return lexicons.validate('com.atproto.sync.subscribeRepos#commit', v)
}

export interface Handle {
  seq: number
  did: string
  handle: string
  [k: string]: unknown
}

export function isHandle(v: unknown): v is Handle {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.atproto.sync.subscribeRepos#handle'
  )
}

export function validateHandle(v: unknown): ValidationResult {
  return lexicons.validate('com.atproto.sync.subscribeRepos#handle', v)
}

export interface Migrate {
  seq: number
  did: string
  migrateTo: string | null
  [k: string]: unknown
}

export function isMigrate(v: unknown): v is Migrate {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.atproto.sync.subscribeRepos#migrate'
  )
}

export function validateMigrate(v: unknown): ValidationResult {
  return lexicons.validate('com.atproto.sync.subscribeRepos#migrate', v)
}

export interface Tombstone {
  seq: number
  did: string
  [k: string]: unknown
}

export function isTombstone(v: unknown): v is Tombstone {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.atproto.sync.subscribeRepos#tombstone'
  )
}

export function validateTombstone(v: unknown): ValidationResult {
  return lexicons.validate('com.atproto.sync.subscribeRepos#tombstone', v)
}

export interface Info {
  name: 'OutdatedCursor' | (string & {})
  message?: string
  [k: string]: unknown
}

export function isInfo(v: unknown): v is Info {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.atproto.sync.subscribeRepos#info'
  )
}

export function validateInfo(v: unknown): ValidationResult {
  return lexicons.validate('com.atproto.sync.subscribeRepos#info', v)
}

export interface RepoOp {
  action: 'create' | 'update' | 'delete' | (string & {})
  path: string
  cid: string | null
  [k: string]: unknown
}

export function isRepoOp(v: unknown): v is RepoOp {
  return (
    isObj(v) &&
    hasProp(v, '$type') &&
    v.$type === 'com.atproto.sync.subscribeRepos#repoOp'
  )
}

export function validateRepoOp(v: unknown): ValidationResult {
  return lexicons.validate('com.atproto.sync.subscribeRepos#repoOp', v)
}