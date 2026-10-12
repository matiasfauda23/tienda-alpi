import ReactMarkdown, { type Components } from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import { esEnlaceExterno } from '@/lib/contenido';

/** Cómo se dibuja cada etiqueta del Markdown con los estilos del sitio. */
const COMPONENTES: Components = {
  h1: ({ children }) => <h2 className="mt-8 font-titulos text-2xl text-texto">{children}</h2>,
  h2: ({ children }) => <h2 className="mt-8 font-titulos text-2xl text-texto">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-6 font-titulos text-xl text-texto">{children}</h3>,
  p: ({ children }) => <p className="mt-4 leading-relaxed text-texto-suave">{children}</p>,
  ul: ({ children }) => <ul className="mt-4 list-disc space-y-1 pl-6 text-texto-suave">{children}</ul>,
  ol: ({ children }) => <ol className="mt-4 list-decimal space-y-1 pl-6 text-texto-suave">{children}</ol>,
  strong: ({ children }) => <strong className="font-semibold text-texto">{children}</strong>,
  a: ({ href, children }) =>
    esEnlaceExterno(href) ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-semibold text-acento-oscuro underline"
      >
        {children}
      </a>
    ) : (
      <a href={href} className="font-semibold text-acento-oscuro underline">
        {children}
      </a>
    ),
};

/** Muestra texto en Markdown con los estilos del sitio; el HTML crudo nunca se interpreta. */
export function TextoMarkdown({ texto }: { texto: string }) {
  return (
    <div className="[&>*:first-child]:mt-0">
      <ReactMarkdown rehypePlugins={[rehypeSanitize]} components={COMPONENTES}>
        {texto}
      </ReactMarkdown>
    </div>
  );
}
