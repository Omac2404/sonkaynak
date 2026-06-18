import React from "react";
import { mediaUrl } from "./cms";

/**
 * Minimal Lexical (Payload richText) → JSX dönüştürücü.
 * Yaygın düğümleri kapsar: paragraf, başlık, liste, alıntı, link, görsel, metin biçimleri.
 */

const FORMAT = { bold: 1, italic: 2, strikethrough: 4, underline: 8, code: 16 };

function renderText(node: any, key: React.Key): React.ReactNode {
  let el: React.ReactNode = node.text;
  const f = node.format ?? 0;
  if (f & FORMAT.code) el = <code key={key}>{el}</code>;
  if (f & FORMAT.bold) el = <strong>{el}</strong>;
  if (f & FORMAT.italic) el = <em>{el}</em>;
  if (f & FORMAT.underline) el = <u>{el}</u>;
  if (f & FORMAT.strikethrough) el = <s>{el}</s>;
  return <React.Fragment key={key}>{el}</React.Fragment>;
}

function renderChildren(node: any): React.ReactNode[] {
  return (node.children ?? []).map((child: any, i: number) => renderNode(child, i));
}

function renderNode(node: any, key: React.Key): React.ReactNode {
  if (!node) return null;

  switch (node.type) {
    case "text":
      return renderText(node, key);

    case "linebreak":
      return <br key={key} />;

    case "paragraph": {
      const kids = renderChildren(node);
      if (!kids.length) return null;
      return <p key={key}>{kids}</p>;
    }

    case "heading": {
      const Tag = (node.tag ?? "h2") as keyof React.JSX.IntrinsicElements;
      return <Tag key={key}>{renderChildren(node)}</Tag>;
    }

    case "quote":
      return <blockquote key={key}>{renderChildren(node)}</blockquote>;

    case "list": {
      const Tag = node.listType === "number" ? "ol" : "ul";
      return <Tag key={key}>{renderChildren(node)}</Tag>;
    }

    case "listitem":
      return <li key={key}>{renderChildren(node)}</li>;

    case "horizontalrule":
      return <hr key={key} />;

    case "link": {
      const url = node.fields?.url ?? "#";
      const newTab = node.fields?.newTab;
      return (
        <a
          key={key}
          href={url}
          {...(newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {renderChildren(node)}
        </a>
      );
    }

    case "upload": {
      const src = mediaUrl(node.value, "feature");
      if (!src) return null;
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img key={key} src={src} alt={node.value?.alt ?? ""} loading="lazy" />
      );
    }

    default:
      // Bilinmeyen kapsayıcı düğüm — çocuklarını render et
      if (node.children) return <React.Fragment key={key}>{renderChildren(node)}</React.Fragment>;
      return null;
  }
}

export function RichText({ data }: { data: any }) {
  const root = data?.root;
  if (!root?.children) return null;
  return <>{root.children.map((n: any, i: number) => renderNode(n, i))}</>;
}
