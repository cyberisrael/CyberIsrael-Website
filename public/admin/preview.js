/**
 * Makes the CMS preview pane look like the real article page, and gives authors a
 * way to insert coloured text without hand-writing HTML.
 *
 * The `.hl-*` and `.callout*` rules are not repeated here: /admin/article-styles.css
 * is generated from src/index.css at build time, so the preview always shows the
 * colours the site actually renders.
 */

const HIGHLIGHT_LABELS = {
  red: 'אדום',
  orange: 'כתום',
  yellow: 'צהוב',
  green: 'ירוק',
  blue: 'כחול',
  purple: 'סגול',
}

/** Layout and typography only — the article page builds these from Tailwind classes. */
const layoutStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Rubik:wght@400;600;700&display=swap');

  body {
    margin: 0;
    padding: 2rem 1.5rem;
    background: #0d0618;
    color: #cbd5e1;
    font-family: Rubik, system-ui, sans-serif;
    line-height: 1.8;
  }
  .preview { max-width: 46rem; margin: 0 auto; }
  .cover { width: 100%; border-radius: 1rem; margin-bottom: 1.5rem; }
  h1 { color: #fff; font-size: 1.9rem; line-height: 1.3; margin: 0 0 .75rem; }
  .excerpt { color: #94a3b8; margin: 0 0 2rem; }
  h2, h3, h4 { color: #fff; margin-top: 2rem; }
  a { color: #00d4ff; }
  code { background: rgba(0,255,136,.08); color: #00ff88; padding: .15em .45em; border-radius: .3em; }
  pre { background: rgba(10,22,40,.9); padding: 1rem; border-radius: .75rem; overflow-x: auto; }
  img { max-width: 100%; border-radius: .75rem; }
  table { width: 100%; border-collapse: collapse; }
  th, td { border: 1px solid rgba(0,212,255,.15); padding: .6rem 1rem; }
  th { background: rgba(0,212,255,.1); color: #00d4ff; }
  blockquote {
    margin: 1.5rem 0;
    padding: 1rem 1.25rem;
    border-inline-start: 3px solid #00d4ff;
    background: rgba(0,212,255,.05);
    border-radius: .75rem;
  }
  .callout { border-inline-start-width: 6px; }
`

/** The CMS renders Markdown with its own parser, so `> [!TIP]` arrives as a plain quote. */
const decorateCallouts = node => {
  if (!node) return

  node.querySelectorAll('blockquote').forEach(quote => {
    const paragraph = quote.querySelector('p')
    if (!paragraph) return

    const firstText = document.createTreeWalker(paragraph, NodeFilter.SHOW_TEXT).nextNode()
    const match = firstText && firstText.nodeValue.match(/^\s*\\?\[!(TIP|NOTE|WARNING|IMPORTANT)\]\s*/i)
    if (!match) return

    firstText.nodeValue = firstText.nodeValue.slice(match[0].length)
    quote.className = `callout callout-${match[1].toLowerCase()}`
  })
}

CMS.registerPreviewStyle(layoutStyles, { raw: true })
CMS.registerPreviewStyle('/admin/article-styles.css')

CMS.registerPreviewTemplate('articles', ({ entry, widgetFor, getAsset }) => {
  const data = entry.get('data')
  const image = data.get('image')

  return h(
    'article',
    { className: 'preview', dir: data.get('language') === 'English' ? 'ltr' : 'rtl' },
    image ? h('img', { className: 'cover', src: getAsset(image).toString(), alt: '' }) : null,
    h('h1', null, data.get('title') || ''),
    h('p', { className: 'excerpt' }, data.get('excerpt') || ''),
    h('div', { ref: decorateCallouts }, widgetFor('body'))
  )
})

/**
 * Adds "טקסט צבעוני" to the editor's + menu, and turns existing coloured paragraphs
 * into an editable card with a colour dropdown instead of raw HTML.
 */
const highlightSpan = (color, text) => `<span class="hl-${color || 'orange'}">${text || ''}</span>`

/** The widget hands the toggle back as a string, so an unchecked box must not read as true. */
const isBold = value => value === true || value === 'true'

CMS.registerEditorComponent({
  id: 'highlight',
  label: 'טקסט צבעוני',
  fields: [
    {
      name: 'color',
      label: 'צבע',
      widget: 'select',
      default: 'orange',
      options: Object.entries(HIGHLIGHT_LABELS).map(([value, label]) => ({ label, value })),
    },
    { name: 'text', label: 'טקסט', widget: 'string' },
    { name: 'bold', label: 'מודגש', widget: 'boolean', default: false, required: false },
  ],
  // Decap matches this against a single block, so no multiline flag (it rejects one).
  pattern: /^(\*\*)?<span class="hl-([a-z]+)">([\s\S]*?)<\/span>(\*\*)?$/,
  fromBlock: match => ({ color: match[2], text: match[3], bold: Boolean(match[1] && match[4]) }),
  toBlock: ({ color, text, bold }) => {
    const span = highlightSpan(color, text)
    return isBold(bold) ? `**${span}**` : span
  },
  toPreview: ({ color, text, bold }) => {
    const span = highlightSpan(color, text)
    return isBold(bold) ? `<strong>${span}</strong>` : span
  },
})
