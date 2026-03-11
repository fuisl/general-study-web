export type CitationItem = {
  id: string;
  index: number;
  authors: string;
  title: string;
  venue: string;
  year: string;
  note: string;
  bibtex: string;
  href?: string;
};

export function InlineCitation({ item }: { item: CitationItem }) {
  return (
    <span className="citation">
      <a
        aria-label={`Reference ${item.index}: ${item.title}`}
        className="citation__marker"
        href={`#ref-${item.id}`}
      >
        <sup>{item.index}</sup>
      </a>
      <span className="citation__popover" role="note">
        <strong>
          [{item.index}] {item.authors} ({item.year})
        </strong>
        <span className="citation__title">{item.title}</span>
        <span className="citation__meta">{item.venue}</span>
        <span>{item.note}</span>
      </span>
    </span>
  );
}

export function ReferenceList({ items }: { items: CitationItem[] }) {
  return (
    <div className="reference-list">
      {items.map((item) => (
        <article className="reference-card" id={`ref-${item.id}`} key={item.id}>
          <div className="reference-card__header">
            <span className="reference-card__index">[{item.index}]</span>
            <div>
              <strong>{item.title}</strong>
              <span className="reference-card__meta">
                {item.authors}. {item.venue}. {item.year}.
              </span>
              {item.href ? (
                <a href={item.href} rel="noreferrer" target="_blank">
                  Open link
                </a>
              ) : null}
            </div>
          </div>
          <p>{item.note}</p>
          <pre>
            <code>{item.bibtex}</code>
          </pre>
        </article>
      ))}
    </div>
  );
}
