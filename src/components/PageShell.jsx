function PageShell({ children, className = "" }) {
  return <section className={`page-shell ${className}`.trim()}>{children}</section>;
}

export default PageShell;
