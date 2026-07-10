/* eslint-disable spellcheck/spell-checker */
import React from 'react';
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import { get } from 'lodash';
import './CustomMarkdown.scss'

const getNodeText = children => React.Children.toArray(children).map(child => {
  if(typeof child === 'string')
    return child
  return getNodeText(get(child, 'props.children', ''))
}).join('')

const slugifyHeading = text => text.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')

const normalizeChangelogMarkdown = markdown => {
  const headings = []
  let pendingAnchor = null
  let inContents = false
  const markdownWithInlineAnchors = (markdown || '').replace(
    /<a\s+id=["']([^"']+)["']><\/a>(\[[^\]]+\]\([^)]+\))/gi,
    (_, id, link) => link.replace(/\)$/, ` "anchor:${id}")`)
  )
  const normalizedMarkdown = markdownWithInlineAnchors.split('\n').filter(line => {
    // Drop the inline "## Contents" block (through its closing "---"); it is
    // rendered as a sticky sidebar instead.
    if(inContents) {
      if(line.trim() === '---')
        inContents = false
      return false
    }
    if(/^##\s+Contents\s*$/.test(line.trim())) {
      inContents = true
      return false
    }

    const anchorMatch = line.trim().match(/^<a\s+id=["']([^"']+)["']><\/a>$/i)
    if(anchorMatch) {
      pendingAnchor = anchorMatch[1]
      return false
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if(headingMatch) {
      const text = headingMatch[2].trim()
      headings.push({level: headingMatch[1].length, id: pendingAnchor || slugifyHeading(text), text})
      pendingAnchor = null
    }

    return true
  }).join('\n')

  return {markdown: normalizedMarkdown, headings}
}

const scrollToId = id => {
  const target = document.getElementById(id)
  if(target)
    target.scrollIntoView({behavior: 'smooth', block: 'start'})
}

const ChangelogMarkdown = ({markdown}) => {
  const {markdown: normalizedMarkdown, headings} = React.useMemo(() => normalizeChangelogMarkdown(markdown), [markdown])
  const tocEntries = headings.filter(heading => heading.level === 2 || heading.level === 3)
  let headingIndex = 0
  const renderHeading = level => props => {
    const children = props.children
    const rest = {...props}
    delete rest.node
    delete rest.children
    const heading = headings[headingIndex] || {}
    const Tag = `h${level}`
    const id = heading.id || slugifyHeading(getNodeText(children))
    headingIndex += 1

    return <Tag id={id || undefined} style={id ? {scrollMarginTop: '16px'} : {}} {...rest}>{children}</Tag>
  }
  const renderLink = props => {
    const {href, children, title} = props
    const rest = {...props}
    delete rest.node
    delete rest.href
    delete rest.children
    delete rest.title
    const anchor = title && title.startsWith('anchor:') ? title.replace('anchor:', '') : null
    if(href && href.startsWith('#')) {
      return (
        <a
          href={href}
          {...rest}
          onClick={event => {
            // Always prevent default: with HashRouter, letting the browser
            // follow "#anchor" replaces the route hash and lands on a 404.
            event.preventDefault()
            scrollToId(href.slice(1))
          }}
        >
          {children}
        </a>
      )
    }

    if(href && href.match(/^https?:\/\//i))
      return <a id={anchor || undefined} href={href} target='_blank' rel='noopener noreferrer' {...rest}>{children}</a>

    return <a id={anchor || undefined} href={href} {...rest}>{children}</a>
  }

  return (
    <div className='col-md-12 no-side-padding custom-markdown' style={{display: 'flex', alignItems: 'flex-start'}}>
      {
        tocEntries.length > 0 &&
        <nav
          style={{
            position: 'sticky',
            top: 0,
            flex: '0 0 220px',
            maxHeight: '75vh',
            overflowY: 'auto',
            paddingRight: '16px',
            marginRight: '16px',
            borderRight: '1px solid rgba(0, 0, 0, 0.12)',
            fontSize: '14px',
          }}
        >
          <div style={{fontWeight: 600, marginBottom: '8px'}}>Contents</div>
          {
            tocEntries.map((heading, index) => (
              <div key={index} style={{paddingLeft: heading.level === 3 ? '16px' : 0, margin: '4px 0'}}>
                <a
                  href={`#${heading.id}`}
                  onClick={event => {
                    event.preventDefault()
                    scrollToId(heading.id)
                  }}
                >
                  {heading.text}
                </a>
              </div>
            ))
          }
        </nav>
      }
      <div style={{flex: 1, minWidth: 0}}>
        <ReactMarkdown
          escapeHtml={false}
          remarkPlugins={[gfm]}
          components={{
            a: renderLink,
            h1: renderHeading(1),
            h2: renderHeading(2),
            h3: renderHeading(3),
            h4: renderHeading(4),
            h5: renderHeading(5),
            h6: renderHeading(6)
          }}
        >
          {normalizedMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export default ChangelogMarkdown;
