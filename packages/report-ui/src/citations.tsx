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

export type FootnoteItem = {
  id: string;
  index: number;
  text: string;
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

export function InlineFootnote({ item }: { item: FootnoteItem }) {
  const label = footnoteLabel(item.index);

  return (
    <span className="footnote">
      <a
        aria-label={`Footnote ${label}: ${item.text}`}
        className="footnote__marker"
        href={`#note-${item.id}`}
      >
        <sup>{label}</sup>
      </a>
      <span className="footnote__popover" role="note">
        <strong>Note {label}</strong>
        <span>{item.text}</span>
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
          <details className="reference-card__details">
            <summary>BibTeX</summary>
            <pre>
              <code>{item.bibtex}</code>
            </pre>
          </details>
        </article>
      ))}
    </div>
  );
}

export function FootnoteList({ items }: { items: FootnoteItem[] }) {
  return (
    <ol className="footnote-list">
      {items.map((item) => (
        <li className="footnote-list__item" id={`note-${item.id}`} key={item.id}>
          <span className="footnote-list__label">{footnoteLabel(item.index)}.</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ol>
  );
}

function footnoteLabel(index: number) {
  return String.fromCharCode(96 + index);
}
