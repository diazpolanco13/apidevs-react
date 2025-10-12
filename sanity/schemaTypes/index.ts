import { type SchemaTypeDefinition } from 'sanity'
import indicator from '../schemas/indicator'
import documentation from '../schemas/documentation'
import docCategory from '../schemas/docCategory'
import docsWelcomePage from '../schemas/docsWelcomePage'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [indicator, documentation, docCategory, docsWelcomePage],
}
