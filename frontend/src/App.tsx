import { useState } from 'react'
import { Menu } from 'lucide-react'
import { SearchForm } from './components/SearchForm/SearchForm'
import { CategoryListings } from './components/CategoryListings/CategoryListings'
import { Footer } from './components/Footer/Footer'
import { RegisterModal } from './components/RegisterModal/RegisterModal'
import { SignInModal } from './components/SignInModal/SignInModal'
import { LocationMap } from './components/Map/LocationMap'
import ZhitloPage from './components/Buildingpage/Buildingpage'
import { BookingRequest } from './components/Bookingrequest/BookingRequest'
import { PaymentConfirmation } from './components/Paymentconfirmation/PaymentConfirmation'
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard'
import { ProfilePage } from './components/ProfilePage/ProfilePage'
import { useListings } from './hooks/useListings'
import { useAccountSession } from './hooks/useAccountSession'
import type { Listing } from './types/listing'
import './App.css'

function App() {
  // Общее состояние экранов приложения.
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false)
  const [isHeaderDark, setIsHeaderDark] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [activePage, setActivePage] = useState<'home' | 'listing' | 'booking' | 'payment' | 'admin' | 'profile'>('home')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [stayDates, setStayDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [paymentOption, setPaymentOption] = useState<'full' | 'split'>('full')
  // Revision для повторной загрузки каталога через useListings.
  const [listingsRevision, setListingsRevision] = useState(0)
  const { listings, isLoading: listingsLoading, error: listingsError } = useListings(listingsRevision)
  const { accountRole, accountInitial, handleAuthenticated, logout } = useAccountSession()

  // Уникальные регионы из списка объявлений.
  const regions = [...new Set(listings.map((listing) => listing.region).filter(Boolean))]
  // Условная длительность по умолчанию: пять ночей.
  const stayNights = stayDates.start && stayDates.end
    ? Math.max(1, Math.round((stayDates.end.getTime() - stayDates.start.getTime()) / 86_400_000))
    : 5

  function handleOpenListing(listing: Listing) {
    // Сброс дат при открытии объявления.
    setSelectedListing(listing)
    setStayDates({ start: null, end: null })
    setActivePage('listing')
  }

  function handleBackHome() {
    // Сброс выбранного объявления и дат при возврате в каталог.
    setActivePage('home')
    setSelectedListing(null)
    setStayDates({ start: null, end: null })
  }

  function handleStartSearch() {
    handleBackHome()
    // Прокрутка к поиску после обновления DOM главного экрана.
    requestAnimationFrame(() => {
      const searchForm = document.querySelector<HTMLElement>('.search-form')
      searchForm?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      searchForm?.querySelector<HTMLButtonElement>('button')?.focus()
    })
  }

  function handleJumpToListingCalendar() {
    setActivePage('listing')
    // Прокрутка к календарю после переключения на экран объявления.
    requestAnimationFrame(() => {
      const calendarSection = document.getElementById('calendar')
      calendarSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  // Условная маршрутизация экранов без отдельной библиотеки.
  if (activePage === 'admin' && accountRole === 'Admin') {
    return (
      <AdminDashboard
        accessToken={sessionStorage.getItem('access_token') ?? ''}
        onBack={() => setActivePage('home')}
        onSaved={() => setListingsRevision((revision) => revision + 1)}
      />
    )
  }

  if (activePage === 'profile' && accountInitial && !isLocationMapOpen) {
    return (
      <ProfilePage
        onHome={handleBackHome}
        onOpenAdmin={() => setActivePage('admin')}
        onOpenMap={() => setIsLocationMapOpen(true)}
      />
    )
  }

  if (activePage === 'listing' && selectedListing) {
    return (
      <div className="App">
        <ZhitloPage
          listing={selectedListing}
          stayDates={stayDates}
          onStayDatesChange={setStayDates}
          stayNights={stayNights}
          onBack={handleBackHome}
          onStartSearch={handleStartSearch}
          onHome={handleBackHome}
          onReviewAdded={() => setListingsRevision((revision) => revision + 1)}
          onBook={() => setActivePage('booking')}
          onOpenSignIn={() => {
            setIsUserMenuOpen(false)
            setIsSignInModalOpen(true)
          }}
        />

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
          />
        )}
      </div>
    )
  }

  if (activePage === 'booking' && selectedListing) {
    return (
      <div className="App">
        <BookingRequest
          listing={selectedListing}
          stayDates={stayDates}
          stayNights={stayNights}
          paymentOption={paymentOption}
          onPaymentOptionChange={setPaymentOption}
          onBack={() => setActivePage('listing')}
          onHome={handleBackHome}
          onContinue={() => setActivePage('payment')}
          onAuthenticated={handleAuthenticated}
          onEditDates={handleJumpToListingCalendar}
          onEditGuests={handleJumpToListingCalendar}
        />

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
          />
        )}
      </div>
    )
  }

  if (activePage === 'payment' && selectedListing) {
    return (
      <div className="App">
        <PaymentConfirmation
          listing={selectedListing}
          stayDates={stayDates}
          stayNights={stayNights}
          paymentOption={paymentOption}
          onPaymentOptionChange={setPaymentOption}
          onBack={() => setActivePage('booking')}
          onHome={handleBackHome}
          onPaid={handleBackHome}
        />

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
          />
        )}
      </div>
    )
  }

  // Режим карты заменяет каталог на главном экране.
  return (
    <div className="App">
      <div className="page">
        {isLocationMapOpen ? (
          <LocationMap listings={listings} onBack={() => setIsLocationMapOpen(false)} />
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
                    <a className="site-header__host" href="/" onClick={(event) => {
                      event.preventDefault()
                      handleBackHome()
                    }}>
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
                          {accountInitial ? (
                            <>
                              <button type="button" role="menuitem" onClick={() => {
                                setIsUserMenuOpen(false)
                                setActivePage('profile')
                              }}>Профіль</button>
                              {accountRole === 'Admin' && <button type="button" role="menuitem" onClick={() => {
                                setIsUserMenuOpen(false)
                                setActivePage('admin')
                              }}>Админ-панель</button>}
                              <button type="button" role="menuitem" onClick={() => {
                                void logout().finally(() => setIsUserMenuOpen(false))
                              }}>Выйти</button>
                            </>
                          ) : (
                            <>
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
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <SearchForm
                selectedRegion={selectedRegion}
                regions={regions}
                onRegionSelect={(region) => setSelectedRegion(region)}
                onFocusRegion={() => setIsHeaderDark(true)}
                onFocusDates={() => setIsHeaderDark(true)}
                onClosePanels={() => setIsHeaderDark(false)}
                onOpenMap={() => setIsLocationMapOpen(true)}
              />
            </header>

            <main>
              <CategoryListings
                listings={listings}
                isLoading={listingsLoading}
                error={listingsError}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
                onClearRegionFilter={() => setSelectedRegion(null)}
                onOpenListing={handleOpenListing}
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
