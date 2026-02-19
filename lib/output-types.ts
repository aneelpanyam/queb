// Backward-compatibility layer — reads from the dynamic output type library.
// Existing consumers (product pages) import from this file unchanged.
export type { OutputTypeField, OutputTypeDefinition } from './output-type-library'
export { getPrimaryField, outputTypeStorage } from './output-type-library'

import { outputTypeStorage } from './output-type-library'

export function getOutputType(id: string) {
  return outputTypeStorage.getById(id)
}

export function getOutputTypes() {
  return outputTypeStorage.getAll()
}
