/**
 * GENERATED CODE - DO NOT MODIFY
 */
import { ValidationResult } from '@atproto/lexicon'
import { lexicons } from '../../../../lexicons'
import { isObj, hasProp } from '../../../../util'

export type ReasonType =
  | 'com.atproto.moderation.defs#reasonSpam'
  | 'com.atproto.moderation.defs#reasonOther'
  | (string & {})

/** Moderation report reason: Spam. */
export const REASONSPAM = 'com.atproto.moderation.defs#reasonSpam'
/** Moderation report reason: Other. */
export const REASONOTHER = 'com.atproto.moderation.defs#reasonOther'