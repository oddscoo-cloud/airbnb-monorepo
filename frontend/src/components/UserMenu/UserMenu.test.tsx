// @vitest-environment jsdom
import { render, cleanup } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { LanguageProvider } from '../../i18n'
import { UserMenu } from './UserMenu'

afterEach(() => {
  cleanup()
  sessionStorage.clear()
})

describe('UserMenu avatar', () => {
  it('uses the email initial when no photo is saved', () => {
    sessionStorage.setItem('account_email', '  test@example.com ')
    const { container } = render(<LanguageProvider><UserMenu /></LanguageProvider>)
    expect(container.querySelector('.user-menu__avatar')?.textContent).toBe('T')
    expect(container.querySelector('.user-menu__avatar img')).toBeNull()
  })

  it('displays the saved photo instead of the initial', () => {
    sessionStorage.setItem('account_email', 'test@example.com')
    sessionStorage.setItem('account_avatar', '/avatar.png')
    const { container } = render(<LanguageProvider><UserMenu /></LanguageProvider>)
    expect(container.querySelector('.user-menu__avatar img')?.getAttribute('src')).toBe('/avatar.png')
  })
})
