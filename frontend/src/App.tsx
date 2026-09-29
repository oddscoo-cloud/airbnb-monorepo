import { useState } from 'react'
import { Menu } from 'lucide-react'
import { SearchForm } from './components/SearchForm/SearchForm'
import { CategoryListings } from './components/CategoryListings/CategoryListings'
import { Footer } from './components/Footer/Footer'
import { RegisterModal } from './components/RegisterModal/RegisterModal'
import { SignInModal } from './components/SignInModal/SignInModal'
import { LocationMap } from './components/Map/LocationMap'
import './App.css'

function App() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false)
  const [isHeaderDark, setIsHeaderDark] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [accountInitial, setAccountInitial] = useState(() => {
    const savedEmail = sessionStorage.getItem('account_email')
    return savedEmail?.charAt(0).toUpperCase() ?? ''
  })

  function handleAuthenticated(email: string) {
    const initial = email.trim().charAt(0).toUpperCase()
    sessionStorage.setItem('account_email', email)
    setAccountInitial(initial)
  }

  return (
    <div className="App">
      <div className="page">
        {isLocationMapOpen ? (
          <LocationMap onBack={() => setIsLocationMapOpen(false)} />
        ) : (
          <>
            <header className={`site-header${isHeaderDark ? ' site-header--dark' : ''}`}>
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
                  <div className="site-header__bar">
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
                        {accountInitial ? (
                          <span className="site-header__avatar" aria-hidden="true">
                            {accountInitial}
                          </span>
                        ) : (
                          <span className="site-header__avatar site-header__avatar--empty" aria-hidden="true" />
                        )}
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
              </div>

              <SearchForm
                selectedRegion={selectedRegion}
                onRegionSelect={(region) => setSelectedRegion(region)}
                onFocusRegion={() => setIsHeaderDark(true)}
                onFocusDates={() => setIsHeaderDark(true)}
                onClosePanels={() => setIsHeaderDark(false)}
                onOpenMap={() => setIsLocationMapOpen(true)}
              />
            </header>

            <main>
              <CategoryListings
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                onClearRegionFilter={() => setSelectedRegion(null)}
              />
              <Footer onOpenMap={() => setIsLocationMapOpen(true)} />
            </main>
          </>
        )}

        {!isLocationMapOpen && isRegisterModalOpen && (
          <RegisterModal
            onClose={() => setIsRegisterModalOpen(false)}
            onAuthenticated={handleAuthenticated}
          />
        )}

        {!isLocationMapOpen && isSignInModalOpen && (
          <SignInModal
            onClose={() => setIsSignInModalOpen(false)}
            onAuthenticated={handleAuthenticated}
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
