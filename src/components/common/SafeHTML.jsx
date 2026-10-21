/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import createDOMPurify from 'dompurify';

export const ALLOWED_TAGS = [
  'a', 'abbr', 'b', 'blockquote', 'br', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'dd', 'del', 'div',
  'dl', 'dt', 'em', 'figcaption', 'figure', 'font', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'i', 'img', 'ins',
  'kbd', 'li', 'mark', 'ol', 'p', 'pre', 'q', 's', 'samp', 'small', 'span', 'strike', 'strong', 'sub', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul',
]

export const ALLOWED_ATTR = [
  'align', 'alt', 'border', 'cellpadding', 'cellspacing', 'class', 'color', 'colspan', 'dir', 'face', 'height',
  'href', 'id', 'lang', 'rel', 'rowspan', 'size', 'src', 'style', 'target', 'title', 'valign', 'width',
]

export const FORBID_TAGS = ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button', 'textarea', 'select', 'link', 'meta', 'base', 'svg', 'math']

// http, https and mailto, plus relative URLs. Any other scheme is dropped.
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i

const purifier = createDOMPurify(window)

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

export const sanitizeHTML = html => purifier.sanitize((html ? String(html) : ''), {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  FORBID_TAGS,
  FORBID_ATTR: ['srcset', 'formaction', 'action'],
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOWED_URI_REGEXP,
})

// Prefix root-relative links with the hash router. Applied before sanitizing.
export const withHashLinks = html => (html ? String(html) : '').replaceAll('href="/', 'href="/#/')

const SafeHTML = ({html, hashLinks, as: Component = 'div', ...rest}) => {
  const source = hashLinks ? withHashLinks(html) : html
  return <Component {...rest} dangerouslySetInnerHTML={{__html: sanitizeHTML(source)}} />
}

export default SafeHTML;
