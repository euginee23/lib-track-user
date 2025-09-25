export default function Footer() {
  return (
    <footer
      className="text-center py-2 border-top text-white"
      style={{
        backgroundColor: '#031716',
        position: 'fixed',
        left: 0,
        bottom: 0,
        width: '100%',
        zIndex: 999,
      }}
    >
      <p className="mb-0 small">
        Lib-Track © {new Date().getFullYear()} | CodeHub.Site
      </p>
    </footer>
  );
}
