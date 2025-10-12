/**
 * Desk Structure - Mintlify Style Navigation
 * Navegación profesional organizada por secciones
 */

import type {StructureResolver} from 'sanity/structure'
import {
  DocumentIcon,
  SearchIcon,
  CogIcon,
  TagIcon,
  ChartUpwardIcon,
  BookIcon,
  ImagesIcon,
  CodeBlockIcon,
  FolderIcon,
  StarIcon,
  EyeOpenIcon,
  RocketIcon,
  ComponentIcon,
  ClipboardIcon,
} from '@sanity/icons'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('📚 APIDevs CMS')
    .items([
      // ===================================
      // 📚 DOCUMENTACIÓN SECTION
      // ===================================
      S.listItem()
        .title('📚 Documentación')
        .icon(BookIcon)
        .child(
          S.list()
            .title('Sistema de Documentación')
            .items([
              // Quick Actions
              S.listItem()
                .title('✨ Quick Actions')
                .child(
                  S.list()
                    .title('Acciones Rápidas')
                    .items([
                      S.listItem()
                        .title('➕ Nueva Página')
                        .icon(DocumentIcon)
                        .child(
                          S.documentTypeList('documentation')
                            .title('Todas las Páginas')
                            .filter('_type == "documentation"')
                            .canHandleIntent(
                              (intentName) => intentName === 'create'
                            )
                        ),
                      
                      S.listItem()
                        .title('⭐ Páginas Destacadas')
                        .icon(StarIcon)
                        .child(
                          S.documentTypeList('documentation')
                            .title('Destacadas')
                            .filter(
                              '_type == "documentation" && featured == true'
                            )
                            .defaultOrdering([{field: 'order', direction: 'asc'}])
                        ),
                      
                      S.listItem()
                        .title('🚧 En Progreso')
                        .child(
                          S.documentTypeList('documentation')
                            .title('En Progreso')
                            .filter(
                              '_type == "documentation" && status == "draft"'
                            )
                            .defaultOrdering([
                              {field: 'updatedAt', direction: 'desc'},
                            ])
                        ),
                      
                      S.listItem()
                        .title('👀 En Revisión')
                        .child(
                          S.documentTypeList('documentation')
                            .title('En Revisión')
                            .filter(
                              '_type == "documentation" && status == "review"'
                            )
                            .defaultOrdering([
                              {field: 'updatedAt', direction: 'desc'},
                            ])
                        ),
                    ])
                ),
              
              S.divider(),
              
              // Todas las páginas
              S.listItem()
                .title('📄 Todas las Páginas')
                .icon(DocumentIcon)
                .child(
                  S.documentTypeList('documentation')
                    .title('Todas las Páginas')
                    .filter('_type == "documentation"')
                    .defaultOrdering([
                      {field: 'category._ref', direction: 'asc'},
                      {field: 'order', direction: 'asc'},
                    ])
                ),
              
              S.divider(),
              
              // Por Estado
              S.listItem()
                .title('📊 Por Estado')
                .child(
                  S.list()
                    .title('Filtrar por Estado')
                    .items([
                      S.listItem()
                        .title('✅ Publicadas')
                        .child(
                          S.documentTypeList('documentation')
                            .title('Publicadas')
                            .filter(
                              '_type == "documentation" && status == "published"'
                            )
                            .defaultOrdering([
                              {field: 'publishedAt', direction: 'desc'},
                            ])
                        ),
                      
                      S.listItem()
                        .title('🚧 Borradores')
                        .child(
                          S.documentTypeList('documentation')
                            .title('Borradores')
                            .filter(
                              '_type == "documentation" && status == "draft"'
                            )
                            .defaultOrdering([
                              {field: 'updatedAt', direction: 'desc'},
                            ])
                        ),
                      
                      S.listItem()
                        .title('👀 En Revisión')
                        .child(
                          S.documentTypeList('documentation')
                            .title('En Revisión')
                            .filter(
                              '_type == "documentation" && status == "review"'
                            )
                            .defaultOrdering([
                              {field: 'updatedAt', direction: 'desc'},
                            ])
                        ),
                      
                      S.listItem()
                        .title('🗄️ Archivadas')
                        .child(
                          S.documentTypeList('documentation')
                            .title('Archivadas')
                            .filter(
                              '_type == "documentation" && status == "archived"'
                            )
                            .defaultOrdering([
                              {field: 'updatedAt', direction: 'desc'},
                            ])
                        ),
                    ])
                ),
              
              S.divider(),
              
              // Categorías
              S.listItem()
                .title('📂 Categorías')
                .icon(FolderIcon)
                .child(
                  S.documentTypeList('docCategory')
                    .title('Todas las Categorías')
                    .filter('_type == "docCategory"')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
            ])
        ),
      
      S.divider(),
      
      // ===================================
      // 📊 INDICADORES SECTION (NO TOCAR)
      // ===================================
      S.listItem()
        .title('📊 Indicadores TradingView')
        .icon(ChartUpwardIcon)
        .child(
          S.list()
            .title('Indicadores TradingView')
            .items([
              // Todos los indicadores
              S.listItem()
                .title('📑 Todos los Indicadores')
                .icon(DocumentIcon)
                .child(
                  S.documentTypeList('indicator')
                    .title('Todos los Indicadores')
                    .filter('_type == "indicator"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.divider(),
              
              // Por categoría
              S.listItem()
                .title('📈 Indicadores')
                .icon(ChartUpwardIcon)
                .child(
                  S.documentTypeList('indicator')
                    .title('Indicadores')
                    .filter('_type == "indicator" && category == "indicador"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.listItem()
                .title('🔍 Scanners')
                .icon(SearchIcon)
                .child(
                  S.documentTypeList('indicator')
                    .title('Scanners')
                    .filter('_type == "indicator" && category == "scanner"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.listItem()
                .title('🛠️ Tools')
                .icon(CogIcon)
                .child(
                  S.documentTypeList('indicator')
                    .title('Tools')
                    .filter('_type == "indicator" && category == "tool"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.divider(),
              
              // Por tier
              S.listItem()
                .title('🎁 Free')
                .child(
                  S.documentTypeList('indicator')
                    .title('Indicadores Free')
                    .filter('_type == "indicator" && access_tier == "free"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.listItem()
                .title('💎 Premium')
                .child(
                  S.documentTypeList('indicator')
                    .title('Indicadores Premium')
                    .filter('_type == "indicator" && access_tier == "premium"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.divider(),
              
              // Por estado
              S.listItem()
                .title('✅ Activos')
                .child(
                  S.documentTypeList('indicator')
                    .title('Indicadores Activos')
                    .filter('_type == "indicator" && status == "activo"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.listItem()
                .title('⚠️ En Desarrollo')
                .child(
                  S.documentTypeList('indicator')
                    .title('En Desarrollo')
                    .filter('_type == "indicator" && status == "desarrollo"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
              
              S.listItem()
                .title('❌ Inactivos')
                .child(
                  S.documentTypeList('indicator')
                    .title('Indicadores Inactivos')
                    .filter('_type == "indicator" && status == "inactivo"')
                    .defaultOrdering([
                      {field: 'publishedAt', direction: 'desc'},
                    ])
                ),
            ])
        ),
      
      S.divider(),
      
      // ===================================
      // 🖼️ MEDIA LIBRARY
      // ===================================
      S.listItem()
        .title('🖼️ Media Library')
        .icon(ImagesIcon)
        .child(
          S.list()
            .title('Media & Assets')
            .items([
              S.listItem()
                .title('📷 Todas las Imágenes')
                .icon(ImagesIcon)
                .child(
                  S.documentTypeList('sanity.imageAsset')
                    .title('Todas las Imágenes')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                ),
              
              S.listItem()
                .title('📄 Todos los Archivos')
                .child(
                  S.documentTypeList('sanity.fileAsset')
                    .title('Todos los Archivos')
                    .defaultOrdering([{field: '_createdAt', direction: 'desc'}])
                ),
            ])
        ),
      
      S.divider(),
      
      // ===================================
      // ⚙️ CONFIGURACIÓN
      // ===================================
      S.listItem()
        .title('⚙️ Configuración')
        .icon(CogIcon)
        .child(
          S.list()
            .title('Configuración del Sistema')
            .items([
              S.listItem()
                .title('📂 Gestionar Categorías')
                .icon(FolderIcon)
                .child(
                  S.documentTypeList('docCategory')
                    .title('Categorías de Documentación')
                    .defaultOrdering([{field: 'order', direction: 'asc'}])
                ),
              
              S.divider(),
              
              S.listItem()
                .title('📊 Estadísticas')
                .icon(ChartUpwardIcon)
                .child(
                  S.list()
                    .title('Estadísticas del Contenido')
                    .items([
                      S.listItem()
                        .title('📚 Total Docs')
                        .child(
                          S.documentTypeList('documentation')
                            .title('Todas las Páginas')
                            .filter('_type == "documentation"')
                        ),
                      
                      S.listItem()
                        .title('📊 Total Indicadores')
                        .child(
                          S.documentTypeList('indicator')
                            .title('Todos los Indicadores')
                            .filter('_type == "indicator"')
                        ),
                      
                      S.listItem()
                        .title('📂 Total Categorías')
                        .child(
                          S.documentTypeList('docCategory')
                            .title('Todas las Categorías')
                            .filter('_type == "docCategory"')
                        ),
                    ])
                ),
            ])
        ),
    ])
