// @vitest-environment jsdom
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LanguageProvider } from '../../i18n'
import { SearchForm } from './SearchForm'

describe('SearchForm', () => {
  it('submits searches and enforces the guest-count upper limit', () => {
    const onSearch = vi.fn()
    const onGuestsChange = vi.fn()
    render(
      <LanguageProvider>
        <SearchForm
          regions={[]}
          guests={16}
          onGuestsChange={onGuestsChange}
          stayDates={{ start: null, end: null }}
          onStayDatesChange={vi.fn()}
          onSearch={onSearch}
        />
      </LanguageProvider>,
    )

    fireEvent.submit(screen.getByRole('search', { name: 'Пошук помешкань' }))
    expect(onSearch).toHaveBeenCalledOnce()

    fireEvent.click(screen.getByRole('button', { name: 'Вибрати гостей' }))
    expect(screen.getByRole('button', { name: 'Збільшити кількість гостей' }).hasAttribute('disabled')).toBe(true)
    fireEvent.click(screen.getByRole('button', { name: 'Зменшити кількість гостей' }))
    expect(onGuestsChange).toHaveBeenCalledWith(15)
  })
})
