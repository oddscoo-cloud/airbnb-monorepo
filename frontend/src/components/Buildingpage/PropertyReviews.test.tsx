import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { LanguageProvider } from '../../i18n'
import { PropertyReviews } from './PropertyReviews'

describe('PropertyReviews avatars', () => {
  it('uses the email initial instead of the display name and preserves uploaded photos', () => {
    const markup = renderToStaticMarkup(
      <LanguageProvider>
        <PropertyReviews
          listingId="1"
          onReviewAdded={() => {}}
          initialReviews={[
            { id: 1, rating: 5, comment: 'First', createdAt: '', authorName: 'Alice', authorInitial: 'Z' },
            { id: 2, rating: 5, comment: 'Second', createdAt: '', authorName: 'Bob', authorInitial: 'X', avatarUrl: '/avatar.png' },
            { id: 3, rating: 5, comment: 'Third', createdAt: '', authorName: 'Carol' },
          ]}
        />
      </LanguageProvider>,
    )

    expect(markup).toContain('class="property__review-avatar">Z</div>')
    expect(markup).toContain('src="/avatar.png"')
    expect(markup).toContain('class="property__review-avatar">C</div>')
  })
})
