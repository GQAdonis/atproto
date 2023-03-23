import {
  cborDecode,
  cborEncode,
  check,
  cidForCbor,
  dataToCborBlock,
  IpldValue,
  ipldToJson,
  jsonToIpld,
  JsonValue,
  schema,
} from '@atproto/common'
import { BlobRef, jsonBlobRef } from './blob-refs'

export type LexValue =
  | IpldValue
  | BlobRef
  | Array<LexValue>
  | { [key: string]: LexValue }

export type RepoRecord = Record<string, LexValue>

export const lexToIpld = (val: LexValue): IpldValue => {
  // convert blobs, leaving the original encoding so that we don't change CIDs on re-encode
  if (val instanceof BlobRef) {
    return val.original
  }
  // retain cids & bytes
  if (check.is(val, schema.cid) || check.is(val, schema.bytes)) {
    return val
  }
  // walk rest
  if (check.is(val, schema.array)) {
    return val.map((item) => lexToIpld(item))
  }
  if (check.is(val, schema.record)) {
    const toReturn = {}
    for (const key of Object.keys(val)) {
      toReturn[key] = lexToIpld(val[key])
    }
    return toReturn
  } else {
    return val
  }
}

export const ipldToLex = (val: IpldValue): LexValue => {
  // convert blobs
  if (check.is(val, jsonBlobRef)) {
    return BlobRef.fromJsonRef(val)
  }
  // retain cids & bytes
  if (check.is(val, schema.cid) || check.is(val, schema.bytes)) {
    return val
  }
  // walk rest
  if (check.is(val, schema.array)) {
    return val.map((item) => ipldToLex(item))
  }
  if (check.is(val, schema.record)) {
    const toReturn = {}
    for (const key of Object.keys(val)) {
      toReturn[key] = ipldToLex(val[key])
    }
    return toReturn
  }
  {
    return val
  }
}

export const lexToJson = (val: LexValue): JsonValue => {
  return ipldToJson(lexToIpld(val))
}

export const stringifyLex = (val: LexValue): string => {
  return JSON.stringify(lexToJson(val))
}

export const lexToCbor = (val: LexValue): Uint8Array => {
  return cborEncode(lexToIpld(val))
}

export const lexToCborBlock = async (val: LexValue) => {
  return dataToCborBlock(lexToIpld(val))
}

export const cidForRecord = async (val: LexValue) => {
  return cidForCbor(lexToIpld(val))
}

export const jsonToLex = (val: JsonValue): LexValue => {
  return ipldToLex(jsonToIpld(val))
}

export const jsonStringToLex = (val: string): LexValue => {
  return jsonToLex(JSON.parse(val))
}

export const cborToLex = (val: Uint8Array): LexValue => {
  return ipldToLex(cborDecode(val))
}

export const cborToLexRecord = (val: Uint8Array): RepoRecord => {
  const parsed = cborToLex(val)
  if (!check.is(parsed, schema.record)) {
    throw new Error('lexicon records be a json object')
  }
  return parsed
}