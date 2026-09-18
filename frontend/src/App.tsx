import { useState } from 'react'
import { Menu, User } from 'lucide-react'
import { SearchForm } from './components/SearchForm/SearchForm'
import { CategoryListings } from './components/CategoryListings/CategoryListings'
import { Footer } from './components/Footer/Footer'
import { RegisterModal } from './components/RegisterModal/RegisterModal'
import { SignInModal } from './components/SignInModal/SignInModal'
import './App.css'

function App() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)

  return (
    <div className="App">
      <div className="page">
        <header className="site-header">
          <div className="site-header__top">
            <a className="site-header__logo" href="/">
              HomeFU
            </a>

            <nav className="site-header__nav" aria-label="Основна навігація">
              <a href="#stays">Варіанти помешкань</a>
              <a href="#experiences">Враження</a>
              <a href="#online">Онлайн-враження</a>
            </nav>

            <div className="site-header__actions">
              <a className="site-header__host" href="#host">
                Запропонувати помешкання на HomeFU
              </a>
              <div className="site-header__account">
                <button
                  className="site-header__menu"
                  type="button"
                  aria-label="Меню користувача"
                  aria-expanded={isUserMenuOpen}
                  aria-controls="user-menu"
                  onClick={() => setIsUserMenuOpen((isOpen) => !isOpen)}
                >
                  <Menu size={16} aria-hidden="true" />
                  <User size={22} aria-hidden="true" />
                </button>

                {isUserMenuOpen && (
                  <div className="site-header__account-menu" id="user-menu" role="menu">
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        setIsSignInModalOpen(true)
                      }}
                    >
                      Войти
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        setIsRegisterModalOpen(true)
                      }}
                    >
                      Регистрация
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <SearchForm />
        </header>

        <main>
          <CategoryListings />
          <Footer />
        </main>

        {isRegisterModalOpen && (
          <RegisterModal onClose={() => setIsRegisterModalOpen(false)} />
        )}

        {isSignInModalOpen && (
          <SignInModal
            onClose={() => setIsSignInModalOpen(false)}
            onSwitchToRegister={() => {
              setIsSignInModalOpen(false)
              setIsRegisterModalOpen(true)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default App
