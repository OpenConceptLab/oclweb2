/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import createDOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'div',
  'dl', 'dt', 'em', 'figcaption', 'figure', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins',
  'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
]

const ALLOWED_ATTR = [
  'align', 'alt', 'border', 'cellpadding', 'cellspacing', 'class', 'color', 'colspan', 'dir', 'face', 'height',
  'href', 'id', 'lang', 'rel', 'rowspan', 'size', 'src', 'style', 'target', 'title', 'valign', 'width',
]

const FORBID_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'base', 'svg', 'math']

// http, https and mailto, plus relative URLs. Any other scheme is dropped.
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i

const purifier = createDOMPurify(window)

// Strict set for notification text (rendered by alertifyjs): basic inline formatting and links only.
const NOTIFIER_TAGS = ['b', 'strong', 'i', 'em', 'u', 'br', 'p', 'a', 'code', 'ul', 'ol', 'li']
const NOTIFIER_ATTR = ['href', 'rel']

// Formatting-only classes written by the rich text editor (alignment, indent, direction, size, font).
const QUILL_FORMAT_CLASS = /^ql-(align|indent|direction|size|font)-[a-z0-9-]+$/

// Inline styles keep only presentational properties; anything that can position, layer or load is dropped.
const ALLOWED_CSS_PROPERTY = /^(?:color|background-color|font-weight|font-style|font-size|font-family|text-align|text-decoration(?:-[a-z]+)*|line-height|vertical-align|white-space|margin(?:-[a-z]+)*|padding(?:-[a-z]+)*|border(?:-[a-z]+)*|width|max-width|height|max-height|list-style(?:-[a-z]+)*)$/
const FORBIDDEN_CSS_VALUE = /url\(|expression\(|@import|image-set\(|\\|<|>|behavior|binding|var\(/i
// Sizes and spacing may not be viewport-relative, computed or negative, so they cannot outgrow the content box.
const SIZING_CSS_PROPERTY = /^(?:margin|padding|width|max-width|height|max-height)(?:-[a-z]+)?$/
const FORBIDDEN_SIZING_VALUE = /v(?:w|h|min|max|i|b)\b|calc\(|min\(|max\(|clamp\(|(?:^|[\s(])-/i

const filterStyle = style => String(style || '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split(';')
  .map(declaration => {
    const index = declaration.indexOf(':')
    if(index < 1)
      return null
    const property = declaration.slice(0, index).trim().toLowerCase()
    const value = declaration.slice(index + 1).trim()
    if(!value || !ALLOWED_CSS_PROPERTY.test(property) || FORBIDDEN_CSS_VALUE.test(value))
      return null
    if(SIZING_CSS_PROPERTY.test(property) && FORBIDDEN_SIZING_VALUE.test(value))
      return null
    return `${property}: ${value}`
  })
  .filter(Boolean)
  .join('; ')

purifier.addHook('uponSanitizeAttribute', (node, data) => {
  if(data.attrName === 'style') {
    const filtered = filterStyle(data.attrValue)
    if(filtered)
      data.attrValue = filtered
    else
      data.keepAttr = false
  }
  if(data.attrName === 'class') {
    // Only the editor's formatting classes are kept (all modes but the notifier, which allows no class attribute).
    const classes = data.attrValue.split(/\s+/).filter(name => QUILL_FORMAT_CLASS.test(name))
    if(classes.length)
      data.attrValue = classes.join(' ')
    else
      data.keepAttr = false
  }
})

purifier.addHook('afterSanitizeAttributes', node => {
  // DOMPurify permits data: URLs on images by default; only http, https and relative are allowed here.
  if(node.hasAttribute('src') && /^data:/i.test(Array.from(node.getAttribute('src')).filter(c => c.charCodeAt(0) > 32).join('')))
    node.removeAttribute('src')
  if(node.tagName === 'A') {
    if(node.hasAttribute('target') && node.getAttribute('target') !== '_blank')
      node.removeAttribute('target')
    node.setAttribute('rel', 'noopener noreferrer')
  }
})

const run = (html, config) => purifier.sanitize(html ? String(html) : '', {
  FORBID_TAGS,
  FORBID_ATTR: ['srcset', 'formaction', 'action'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOWED_URI_REGEXP,
  SANITIZE_NAMED_PROPS: true,
  ...config,
})

// Owner-supplied content: only the editor's formatting classes, restricted inline styles.
export const sanitizeHTML = html => run(html, {ALLOWED_TAGS, ALLOWED_ATTR})

// Notification text: a handful of inline tags, no class, style or id.
export const sanitizeNotifierHTML = html => run(html, {ALLOWED_TAGS: NOTIFIER_TAGS, ALLOWED_ATTR: NOTIFIER_ATTR})

// Paint containment keeps owner content inside its box; overflow-x lets wide tables and images scroll.
const WRAPPER_STYLE = {contain: 'paint', isolation: 'isolate', overflowX: 'auto'}

const SafeHTML = ({html, hashLinks, as: Component = 'div', style, ...rest}) => {
  // Root-relative links are prefixed for the hash router before sanitizing.
  const source = hashLinks && html ? String(html).replaceAll('href="/', 'href="/#/') : html
  return <Component {...rest} style={{...style, ...WRAPPER_STYLE}} dangerouslySetInnerHTML={{__html: sanitizeHTML(source)}} />
}

export default SafeHTML;
