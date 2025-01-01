import type { Plugin, PluginContext, ProgramNode } from "rollup"
import type {
  ImportSpecifier,
  ImportTransform,
  ImportTransformPluginOptions,
  UnpackArray,
} from "./types.d.ts"
import type { ImportDeclaration, Program, SimpleLiteral } from "estree"
import {
  filterBySource,
  filterByType,
  filterString,
  selectProperty,
} from "./utils.js"
import { createFilter } from "vite"

class ImportTransformer {
  readonly transforms: ImportTransform[]
  readonly program: ProgramNode
  readonly id: string
  readonly pluginContext: PluginContext

  constructor(
    pluginContext: PluginContext,
    code: string,
    id: string,
    transforms: ImportTransform[],
  ) {
    this.transforms = transforms
    this.program = pluginContext.parse(code)
    this.id = id
    this.pluginContext = pluginContext
  }

  async transform(): Promise<ProgramNode> {
    const body = await Promise.all(this.program.body.map(this.transformNode))
    const newProgram = { ...this.program, body }
    return newProgram
  }

  private resolveId = async (source: ImportDeclaration["source"]) => {
    if (!source.value || typeof source.value !== "string") return null
    return await this.pluginContext.resolve(source.value, this.id)
  }

  private transformNode = async (node: UnpackArray<Program["body"]>) => {
    if (node.type !== "ImportDeclaration") return node

    const resolvedId = await this.resolveId(node.source)

    const transforms = this.transforms.filter(
      filterBySource(node.source, resolvedId),
    )

    if (transforms.length === 0) return node

    // apply specifier transforms
    const specifiers = node.specifiers.map(
      this.transformImportSpecifier(transforms),
    )

    // check if target source can be transformed
    if (typeof node.source.value !== "string") return { ...node, specifiers }

    // apply source transform
    const targetSources = transforms
      .map(selectProperty("replace"))
      .map(selectProperty("source"))
      .filter(filterString)

    // no source transform
    if (targetSources.length === 0) return { ...node, specifiers }

    const initialSourceLiteral: SimpleLiteral = {
      value: node.source.value,
      type: "Literal",
      raw: node.source.raw,
    }

    const source = targetSources.reduce(
      (acc, targetSource) => ({ ...acc, value: targetSource }),
      initialSourceLiteral,
    )

    return { ...node, specifiers, source }
  }

  private transformImportSpecifier =
    (transforms: ImportTransform[]) =>
    (specifier: ImportSpecifier): ImportSpecifier => {
      return transforms
        .filter(filterByType(specifier))
        .reduce((acc, { replace: { type: targetType } }) => {
          // importSpecifier cannot be converted to other types and vice versa
          if (
            !targetType ||
            acc.type === "ImportSpecifier" ||
            targetType === "ImportSpecifier"
          )
            return acc
          return { ...acc, type: targetType }
        }, specifier)
    }
}

export default function importTransformPlugin({
  include,
  exclude,
  transforms,
}: ImportTransformPluginOptions): Plugin {
  const filter = createFilter(include, exclude)
  return {
    name: "import-transform",
    async transform(code: string, id: string) {
      if (
        !transforms ||
        !filter(id) ||
        id.indexOf("/node_modules/.vite/") !== -1
      ) {
        return null
      }

      const transformer = new ImportTransformer(this, code, id, transforms)
      const ast = await transformer.transform()
      return { code, ast }
    },
  }
}
