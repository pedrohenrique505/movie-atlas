import { CollectionFeedback } from './CollectionFeedback'

export function CategoryListSection({
  categories,
  isLoading,
  errorMessage,
  emptyMessage,
}) {
  if (isLoading || errorMessage || !categories.length) {
    return (
      <CollectionFeedback
        isLoading={isLoading}
        errorMessage={errorMessage}
        emptyMessage={!categories.length ? emptyMessage : ''}
        loadingMessage="Carregando categorias..."
      />
    )
  }

  return (
    <section className="category-grid" aria-label="Lista de categorias">
      {categories.map((category) => (
        <div key={category.id} className="genre-chip">
          {category.name}
        </div>
      ))}
    </section>
  )
}
