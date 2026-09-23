import { dump } from 'js-yaml'
import { readTaxonomy } from './taxonomy.mjs'
import { ARTICLES_PATH, MEDIA_PATH, PUBLIC_MEDIA_PATH } from './articles-index.mjs'

const HEADER = `# GENERATED FILE — do not edit.
# Built by scripts/admin-config.mjs; categories and topics come from
# src/services/articleTaxonomy.json, the same file the site reads.
`

/**
 * Decap compares the sign-in popup's `event.origin` against `base_url` as a plain string
 * — see the Authenticator in decap-cms-lib-auth. Anything that is not a bare origin (a
 * trailing slash, a path, the wrong port) therefore breaks the handshake *silently*: the
 * popup sits on "Completing sign-in…" forever with nothing logged. The build is the only
 * place that can catch it, so it fails here instead.
 */
function asOrigin(value) {
  let url
  try {
    url = new URL(value)
  } catch {
    throw new Error(`CMS_BASE_URL must be an absolute URL, e.g. https://cyberisrael.net; got "${value}".`)
  }

  if (value !== url.origin) {
    throw new Error(
      `CMS_BASE_URL must be a bare origin with no path and no trailing slash; ` +
      `got "${value}", expected "${url.origin}".`
    )
  }

  return url.origin
}

/**
 * The origin the CMS is served from, which is also the origin its Worker answers on.
 * Override it to a `wrangler dev` origin (CMS_BASE_URL=http://127.0.0.1:8788) to exercise
 * the real sign-in flow locally.
 */
const BASE_URL = asOrigin(process.env.CMS_BASE_URL || 'https://cyberisrael.net')

/** Decap CMS configuration, served at /admin/config.yml. */
export function buildAdminConfig(root = process.cwd()) {
  const taxonomy = readTaxonomy(root)

  const config = {
    backend: {
      name: 'github',
      repo: 'cyberisrael/CyberIsrael-Website',
      branch: 'dev',
      // Sends the sign-in popup to this site's own Worker rather than to Decap's default,
      // which is Netlify's OAuth service. Together these build the popup URL as
      // `<base_url>/<auth_endpoint>`, and both sides of the handshake are pinned to
      // base_url, so it must stay a bare origin — see asOrigin above.
      base_url: BASE_URL,
      auth_endpoint: 'oauth/auth',
      // Without this Decap asks for `repo`, which would put write access to every private
      // repository the editor can see into a browser. It is not the control, though: the
      // Worker ignores the `?scope=` Decap appends and sends its own
      // `public_repo,read:org` — `read:org` being what the membership check needs. This
      // is here so the request Decap builds is honest about what the CMS needs.
      auth_scope: 'public_repo',
      // "Publish" squash-merges the entry's pull request instead of adding a merge commit,
      // so every published edit lands on dev as a single commit. That keeps dev a straight
      // line main can fast-forward to — a merge commit here would put a bump in main.
      squash_merges: true,
    },

    // On localhost `npm run cms` takes over: Decap only honours local_backend when
    // location.hostname is localhost/127.0.0.1, so the proxy writes straight to the
    // working tree and the sign-in above is never exercised. Everywhere else it is.
    local_backend: true,

    // "Save" opens a pull request, "Publish" merges it — the review step the
    // developer-only flow was missing.
    publish_mode: 'editorial_workflow',

    locale: 'he',

    // Removes the "בדיקת תצוגה מקדימה" button: it links to a deploy preview from the
    // backend, which we don't have, so it never did anything. The working preview is
    // the eye toggle above the editor.
    show_preview_links: false,

    media_folder: MEDIA_PATH,
    public_folder: PUBLIC_MEDIA_PATH,

    collections: [
      {
        name: 'settings',
        label: 'הגדרות',
        files: [
          {
            name: 'taxonomy',
            label: 'קטגוריות ונושאים',
            file: 'src/services/articleTaxonomy.json',
            description: 'הרשימות שמהן בוחרים בכל מאמר. שינוי כאן משנה גם את האתר וגם את האפשרויות בטופס המאמר.',
            fields: [
              {
                name: 'categories',
                label: 'קטגוריות',
                label_singular: 'קטגוריה',
                widget: 'list',
                summary: '{{fields.he}} — {{fields.id}}',
                fields: [
                  {
                    name: 'id',
                    label: 'מזהה (באנגלית)',
                    widget: 'string',
                    hint: 'נשמר בקובץ המאמר. אין לשנות אחרי שיש מאמרים בקטגוריה.',
                    pattern: ['^[a-z0-9]+(_[a-z0-9]+)*$', 'אותיות אנגליות קטנות וקו תחתון בלבד'],
                  },
                  { name: 'color', label: 'צבע התווית', widget: 'color', allowInput: true, hint: 'צבע הטקסט של תווית הקטגוריה; הרקע והמסגרת נגזרים ממנו.' },
                  { name: 'he', label: 'שם בעברית', widget: 'string' },
                  { name: 'en', label: 'שם באנגלית', widget: 'string' },
                ],
              },
              {
                name: 'topics',
                label: 'נושאים',
                label_singular: 'נושא',
                widget: 'list',
                hint: 'הנושאים שאפשר לבחור בכל מאמר, ושלפיהם מסננים בעמוד המאמרים.',
              },
            ],
          },
        ],
      },
      {
        name: 'articles',
        label: 'מאמרים',
        label_singular: 'מאמר',
        description: 'כל מאמר נשמר כקובץ Markdown בתיקייה משלו, יחד עם פרטי המאמר.',
        folder: ARTICLES_PATH,
        // Produces <folder>/<slug>/<slug>.md, matching the existing layout.
        path: '{{slug}}/{{slug}}',
        slug: '{{fields.slug}}',
        extension: 'md',
        format: 'yaml-frontmatter',
        create: true,
        summary: '{{fields.order}}. {{fields.title}}',
        sortable_fields: ['order', 'date', 'title'],
        view_groups: [{ label: 'קטגוריה', field: 'category' }],
        fields: [
          { name: 'title', label: 'כותרת', widget: 'string' },
          {
            name: 'slug',
            label: 'מזהה לכתובת (באנגלית)',
            widget: 'string',
            hint: 'קובע את כתובת המאמר: /articles/<מזהה>. אין לשנות אחרי הפרסום — הקישורים הקיימים יישברו.',
            pattern: ['^[a-z0-9]+(-[a-z0-9]+)*$', 'אותיות אנגליות קטנות, ספרות ומקפים בלבד'],
          },
          { name: 'excerpt', label: 'תקציר', widget: 'text', hint: 'מוצג בכרטיס המאמר ברשימת המאמרים.' },
          {
            name: 'language',
            label: 'שפת המאמר',
            widget: 'select',
            default: 'Hebrew/עברית',
            options: [
              { label: 'עברית', value: 'Hebrew/עברית' },
              { label: 'אנגלית', value: 'English' },
            ],
          },
          {
            name: 'category',
            label: 'קטגוריה',
            widget: 'select',
            default: taxonomy.categories[0].id,
            options: taxonomy.categories.map(({ id, he }) => ({ label: he, value: id })),
          },
          {
            name: 'date',
            label: 'תאריך פרסום',
            widget: 'datetime',
            date_format: 'YYYY-MM-DD',
            time_format: false,
            format: 'YYYY-MM-DD',
            picker_utc: true,
          },
          { name: 'readTime', label: 'זמן קריאה (דקות)', widget: 'number', value_type: 'float', min: 0.5, step: 0.5 },
          { name: 'image', label: 'תמונת נושא', widget: 'image', hint: 'מוצגת בכרטיס המאמר ובראש העמוד.' },
          {
            name: 'tags',
            label: 'נושאים',
            widget: 'select',
            multiple: true,
            options: taxonomy.topics,
            hint: 'משמשים לסינון לפי נושא בעמוד המאמרים. להוספת נושא חדש יש לערוך את רשימת הנושאים במסך ההגדרות.',
          },
          { name: 'order', label: 'סדר תצוגה', widget: 'number', value_type: 'int', min: 1, hint: 'מספר נמוך מופיע קודם ברשימת המאמרים.' },
          { name: 'featured', label: 'מאמר מודגש', widget: 'boolean', default: false, required: false, hint: 'מוצג בכרטיס רחב עם תווית "מומלץ".' },
          { name: 'homePreview', label: 'הצגה בדף הבית', widget: 'boolean', default: false, required: false },
          { name: 'body', label: 'תוכן המאמר', widget: 'markdown' },
        ],
      },
    ],
  }

  return HEADER + dump(config, { lineWidth: -1, noRefs: true })
}
