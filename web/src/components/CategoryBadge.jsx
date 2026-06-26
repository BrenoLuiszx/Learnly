
const CategoryBadge = ({ categoria, size }) => {
  if (!categoria) return null;
  const cls = ['cat-badge', size === 'sm' ? 'cat-badge--sm' : size === 'lg' ? 'cat-badge--lg' : '']
    .filter(Boolean).join(' ');
  return <span className={cls} data-cat={categoria}>{categoria}</span>;
};

export default CategoryBadge;
