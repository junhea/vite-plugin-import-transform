import type {
  ImportSource,
  ImportSpecifier,
  ImportTransform,
} from "./types.d.ts"
import type { ResolvedId } from "rollup"

export const filterNotNull = <T>(val: T | undefined | null): val is T =>
  val !== undefined && val !== null

export const filterString = (val: any): val is string => typeof val === "string"

export const selectProperty =
  <T, K extends keyof T>(property: K) =>
  (val: T): T[K] =>
    val[property]

export const filterByType =
  (specifier: ImportSpecifier) => (transform: ImportTransform) => {
    if (Array.isArray(transform.find)) {
      return transform.find.some(({ type }) => type === specifier.type)
    }
    return transform.find.type === specifier.type
  }

export const filterBySource = (
  source: ImportSource,
  resolvedId: ResolvedId | null,
) => {
  return ({ find: target }: ImportTransform) => {
    if (target === undefined) return true
    if (Array.isArray(target))
      return target.some(
        ({ source: targetSource }) =>
          targetSource === undefined ||
          targetSource === source.value ||
          targetSource === resolvedId?.id,
      )
    return target.source === source.value || target.source === resolvedId?.id
  }
}
