
const UserAvatar = ({ foto, nome = '', size = 40, radius = '50%', className = '' }) => {
  const initial = nome.trim().charAt(0).toUpperCase() || '?';
  const px = typeof size === 'number' ? `${size}px` : size;

  const base = {
    width: px,
    height: px,
    borderRadius: radius,
    flexShrink: 0,
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (foto) {
    return (
      <span style={base} className={className}>
        <img
          src={foto}
          alt={nome}
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          onError={e => { e.currentTarget.style.display = 'none'; e.currentTarget.nextSibling.style.display = 'flex'; }}
        />

        <span style={{ display: 'none', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', fontSize: `calc(${px} * 0.4)`, fontWeight: 700, background: 'rgba(255,215,0,0.12)', color: '#ffd700' }}>
          {initial}
        </span>
      </span>
    );
  }

  return (
    <span
      style={{ ...base, background: 'rgba(255,215,0,0.12)', color: '#ffd700', fontSize: `calc(${px} * 0.4)`, fontWeight: 700 }}
      className={className}
      aria-label={nome}
    >
      {initial}
    </span>
  );
};

export default UserAvatar;
