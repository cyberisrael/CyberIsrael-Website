/**
 * Widgets for the "כספת הידע" collection (see scripts/admin-config.mjs).
 *
 *   vault-id    fills in a unique id for a new note, then shows it read-only.
 *   vault-type  a type dropdown that follows the note's URL until the author picks a
 *               type themselves.
 *
 * Decap never re-renders a widget when a *different* field changes: the parent control is
 * a pure connected component, and the `entry` prop it passes down is documented as stale.
 * So vault-type listens for typing anywhere in the editor and, once it pauses, reads the
 * URL through `getEntry()`, which goes to the store and is always current.
 */

/** `note-` + 12 hex digits: unique in practice, and the build rejects a clash anyway. */
const newNoteId = () => `note-${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`

const VaultIdControl = createClass({
  componentDidMount() {
    // A new entry never has a real id yet. Checking `newRecord` rather than only an empty
    // value also gives a duplicated note its own id instead of its original's.
    if (!this.props.value || this.props.entry.get('newRecord')) this.props.onChange(newNoteId())
  },

  render() {
    return h('input', {
      id: this.props.forID,
      className: this.props.classNameWrapper,
      value: this.props.value || '',
      readOnly: true,
      dir: 'ltr',
      style: { opacity: 0.7, cursor: 'default' },
    })
  },
})

/** Same rules as `typeFromUrl` in src/services/vaultResources.ts; the config passes them in. */
const typeFromUrl = (url, rules) => {
  let parsed
  try {
    parsed = new URL(String(url || '').trim())
  } catch {
    return undefined
  }
  const host = parsed.hostname.replace(/^www\./, '')
  const segment = parsed.pathname.split('/')[1]
  const rule = rules.find(rule => rule.host === host && (rule.path === undefined || rule.path === segment))
  return rule && rule.type
}

const VaultTypeControl = createClass({
  getInitialState() {
    // A note that already has a type was chosen by someone; only an empty one is ours.
    return { auto: !this.props.value }
  },

  componentDidMount() {
    this.followUrl()
    document.addEventListener('input', this.handleEditorInput)
  },

  componentWillUnmount() {
    document.removeEventListener('input', this.handleEditorInput)
    clearTimeout(this.followTimer)
  },

  componentDidUpdate() {
    this.followUrl()
  },

  /** Re-checks the URL once typing pauses, so a half-typed address doesn't flicker the type. */
  handleEditorInput() {
    clearTimeout(this.followTimer)
    this.followTimer = setTimeout(this.followUrl, 400)
  },

  url() {
    const entry = this.props.getEntry ? this.props.getEntry() : this.props.entry
    return (entry && entry.getIn(['data', 'url'])) || ''
  },

  /** While the type is automatic it tracks the URL, including back to empty. */
  followUrl() {
    if (!this.state.auto) return
    const rules = (this.props.field.get('url_rules') || { toJS: () => [] }).toJS()
    const detected = typeFromUrl(this.url(), rules) || ''
    if (detected !== (this.props.value || '')) this.props.onChange(detected)
  },

  handleChange(event) {
    const value = event.target.value
    // Picking the blank entry hands the choice back to the URL.
    this.setState({ auto: value === '' })
    this.props.onChange(value)
  },

  render() {
    const options = this.props.field.get('options').toJS()
    const { value, forID, classNameWrapper, setActiveStyle, setInactiveStyle } = this.props

    return h(
      'div',
      null,
      h(
        'select',
        {
          id: forID,
          className: classNameWrapper,
          value: value || '',
          onChange: this.handleChange,
          onFocus: setActiveStyle,
          onBlur: setInactiveStyle,
        },
        h('option', { value: '' }, '— בחירה —'),
        options.map(option => h('option', { key: option.value, value: option.value }, option.label))
      ),
      this.state.auto && value
        ? h('p', { style: { margin: '6px 0 0', fontSize: '12px', opacity: 0.7 } }, 'זוהה אוטומטית לפי הקישור')
        : null
    )
  },
})

const VaultTypePreview = ({ value, field }) => {
  const option = field.get('options').toJS().find(option => option.value === value)
  return h('p', null, option ? option.label : value || '')
}

CMS.registerWidget('vault-id', VaultIdControl, ({ value }) => h('p', null, value || ''))
CMS.registerWidget('vault-type', VaultTypeControl, VaultTypePreview)
