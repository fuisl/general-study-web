export type CitationItem = {
  id: string;
  index: number;
  authors: string;
  title: string;
  detail: string;
  year: string;
  note?: string;
  href?: string;
  linkLabel?: string;
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
        [{item.index}]
      </a>
      <span className="citation__popover" role="note">
        <strong>[{item.index}] {item.title}</strong>
        <span className="citation__meta">{item.detail}</span>
        {item.note ? <span>{item.note}</span> : null}
      </span>
    </span>
  );
}

export function InlineFootnote({ item }: { item: FootnoteItem }) {
  return (
    <span className="footnote">
      <a
        aria-label={`Footnote ${item.index}: ${item.text}`}
        className="footnote__marker"
        href={`#note-${item.id}`}
      >
        <sup>{item.index}</sup>
      </a>
      <span className="footnote__popover" role="note">
        <strong>Note {item.index}</strong>
        <span>{item.text}</span>
      </span>
    </span>
  );
}

export function ReferenceList({ items }: { items: CitationItem[] }) {
  return (
    <ol className="reference-list">
      {items.map((item) => (
        <li className="reference-list__item" id={`ref-${item.id}`} key={item.id}>
          <div className="reference-list__label">{item.index}.</div>
          <div className="reference-list__body">
            <div className="reference-list__title">
              <strong>{item.title}</strong>
              {item.href ? (
                <a href={item.href} rel="noreferrer" target="_blank">
                  [{item.linkLabel ?? "link"}]
                </a>
              ) : null}
            </div>
            <p>{item.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export function FootnoteList({ items }: { items: FootnoteItem[] }) {
  return (
    <ol className="footnote-list">
      {items.map((item) => (
        <li className="footnote-list__item" id={`note-${item.id}`} key={item.id}>
          <span className="footnote-list__label">{item.index}.</span>
          <span>{item.text}</span>
        </li>
      ))}
    </ol>
  );
}
