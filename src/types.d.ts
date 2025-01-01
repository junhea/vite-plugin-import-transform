import type { ImportDeclaration } from "estree"

export type UnpackArray<T> = T extends Array<infer U> ? U : never

export type ImportSpecifier = UnpackArray<ImportDeclaration["specifiers"]>

export type ImportSource = ImportDeclaration["source"]

export interface ImportDescriptor {
  source?: ImportSource["value"]
  type?: ImportSpecifier["type"]
}

export interface ImportTransform {
  find: ImportDescriptor | ImportDescriptor[]
  replace: ImportDescriptor
}

export interface ImportTransformPluginOptions {
  include?: string | string[]
  exclude?: string | string[]
  transforms?: ImportTransform[]
}
