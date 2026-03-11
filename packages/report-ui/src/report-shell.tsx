import type { ReactNode } from "react";

export type TocItem = {
  id: string;
  label: string;
};

export type ReportMeta = {
  kicker: string;
  title: string;
  dek: string;
  authors: string;
  date: string;
  abstract: string;
  toc: TocItem[];
};

export type SourceItem = {
  title: string;
  detail: string;
  href?: string;
};

type ReportShellProps = {
  meta: ReportMeta;
  children: ReactNode;
};

type ArticleSectionProps = {
  id: string;
  title: string;
  kicker?: string;
  lede?: string;
  children: ReactNode;
};

type FigureFrameProps = {
  id?: string;
  label?: string;
  title: string;
  caption: string;
  lane?: "body" | "page" | "screen";
  children: ReactNode;
};

export function ReportShell({ meta, children }: ReportShellProps) {
  return (
    <article className="distill-shell">
      <header className="distill-header l-page">
        <p className="distill-kicker">{meta.kicker}</p>
        <h1>{meta.title}</h1>
        <p className="distill-dek">{meta.dek}</p>
        <div className="distill-byline">
          <div>
            <span className="distill-byline__label">By</span>
            <p>{meta.authors}</p>
          </div>
          <div>
            <span className="distill-byline__label">Published</span>
            <p>{meta.date}</p>
          </div>
        </div>
        <p className="distill-abstract">{meta.abstract}</p>
        <nav aria-label="Section links" className="distill-nav">
          {meta.toc.map((item) => (
            <a href={`#${item.id}`} key={item.id}>
              {item.label}
            </a>
          ))}
        </nav>
      </header>
      <main>{children}</main>
    </article>
  );
}

export function ArticleSection({
  id,
  kicker,
  title,
  lede,
  children,
}: ArticleSectionProps) {
  return (
    <section className="article-section l-body" id={id}>
      <header className="article-section__header">
        {kicker ? <p className="distill-kicker">{kicker}</p> : null}
        <h2>{title}</h2>
        {lede ? <p className="article-section__lede">{lede}</p> : null}
      </header>
      <div>{children}</div>
    </section>
  );
}

export function FigureFrame({
  id,
  label,
  title,
  caption,
  lane = "page",
  children,
}: FigureFrameProps) {
  return (
    <figure className={`figure-frame l-${lane}`} id={id}>
      <div className="figure-frame__meta">
        {label ? <p className="distill-kicker">{label}</p> : null}
        <h3>{title}</h3>
        <p>{caption}</p>
      </div>
      <div>{children}</div>
    </figure>
  );
}

export function SourceList({ items }: { items: SourceItem[] }) {
  return (
    <div className="source-list">
      {items.map((item) => {
        if (item.href) {
          return (
            <a
              className="source-card"
              href={item.href}
              key={item.title}
              rel="noreferrer"
              target="_blank"
            >
              <strong>{item.title}</strong>
              <span>{item.detail}</span>
            </a>
          );
        }

        return (
          <div className="source-card" key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.detail}</span>
          </div>
        );
      })}
    </div>
  );
}
