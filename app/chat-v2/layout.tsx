export default function ChatV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden" style={{ paddingTop: 'var(--navbar-height, 64px)' }}>
      {children}
    </div>
  );
}

