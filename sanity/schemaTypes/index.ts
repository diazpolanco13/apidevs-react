import { type SchemaTypeDefinition } from 'sanity'
import indicator from '../schemas/indicator'
import documentation from '../schemas/documentation'
import docCategory from '../schemas/docCategory'
// Blog schemas
import post from '../schemas/post'
import blogCategory from '../schemas/blogCategory'
import author from '../schemas/author'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    indicator,
    documentation,
    docCategory,
    // Blog
    post,
    blogCategory,
    author,
  ],
}
