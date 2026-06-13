/**
 * CategoryBadge — uses the global .cat-badge system defined in global.css
 * size: 'sm' | 'md' (default) | 'lg'
 */
const CategoryBadge = ({ categoria, size }) => {
  if (!categoria) return null;
  const cls = ['cat-badge', size === 'sm' ? 'cat-badge--sm' : size === 'lg' ? 'cat-badge--lg' : '']
    .filter(Boolean).join(' ');
  return <span className={cls} data-cat={categoria}>{categoria}</span>;
};

export default CategoryBadge;
