/** Eski Lexical (Payload richText) içeriğini düzenlenebilir HTML'e çevirir. */
function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderNode(n: any): string {
  if (!n) return "";
  const kids = () => (n.children ?? []).map(renderNode).join("");
  switch (n.type) {
    case "paragraph": {
      const inner = kids();
      return inner ? `<p>${inner}</p>` : "";
    }
    case "heading":
      return `<${n.tag ?? "h2"}>${kids()}</${n.tag ?? "h2"}>`;
    case "quote":
      return `<blockquote>${kids()}</blockquote>`;
    case "list":
      return n.listType === "number" ? `<ol>${kids()}</ol>` : `<ul>${kids()}</ul>`;
    case "listitem":
      return `<li>${kids()}</li>`;
    case "linebreak":
      return "<br>";
    case "link":
      return `<a href="${n.fields?.url ?? "#"}">${kids()}</a>`;
    case "text": {
      let t = esc(n.text ?? "");
      const f = n.format ?? 0;
      if (f & 1) t = `<strong>${t}</strong>`;
      if (f & 2) t = `<em>${t}</em>`;
      if (f & 8) t = `<u>${t}</u>`;
      return t;
    }
    default:
      return kids();
  }
}

export function lexicalToHtml(content: any): string {
  const root = content?.root ?? content;
  if (!root?.children) return "";
  return root.children.map(renderNode).join("");
}
