import type { ReactNode } from "react";

export type TocItem = {
  id: string;
  label: string;
};

export type ReportAuthor = {
  name: string;
  studentId: string;
};

export type ReportMeta = {
  university: string;
  department: string;
  reportLabel: string;
  title: string;
  dek: string;
  authors: ReportAuthor[];
  affiliation: string;
  supervisor: string;
  published: string;
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
      <div className="report-frame">
        <header className="distill-header">
          <div className="distill-header__spacer" aria-hidden="true" />
          <div className="distill-header__main">
            <p className="distill-kicker">{meta.university}</p>
            <p className="distill-subkicker">{meta.department}</p>
            <p className="distill-report-label">{meta.reportLabel}</p>
            <h1>{meta.title}</h1>
            <p className="distill-dek">{meta.dek}</p>
          </div>
        </header>

        <section className="distill-meta">
          <div className="distill-meta__spacer" aria-hidden="true" />
          <div className="distill-meta__grid">
            <div className="distill-meta__column">
              <span className="distill-byline__label">Authors</span>
              {meta.authors.map((author) => (
                <p key={author.studentId}>
                  <strong>{author.name}</strong>
                  <span>{author.studentId}</span>
                </p>
              ))}
            </div>
            <div className="distill-meta__column">
              <span className="distill-byline__label">Affiliation</span>
              <p>{meta.affiliation}</p>
            </div>
            <div className="distill-meta__column">
              <span className="distill-byline__label">Supervisor</span>
              <p>{meta.supervisor}</p>
            </div>
            <div className="distill-meta__column">
              <span className="distill-byline__label">Published</span>
              <p>{meta.published}</p>
            </div>
          </div>
        </section>

        <div className="report-layout">
          <aside className="report-toc" aria-label="Table of contents">
            <h2>Contents</h2>
            <nav className="report-toc__links">
              {meta.toc.map((item) => (
                <a href={`#${item.id}`} key={item.id}>
                  {item.label}
                </a>
              ))}
            </nav>
          </aside>
          <main className="report-main">
            <p className="distill-abstract l-body">{meta.abstract}</p>
            {children}
          </main>
        </div>
      </div>
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
