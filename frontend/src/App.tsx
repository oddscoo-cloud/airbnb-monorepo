import { useEffect, useState } from 'react'
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
import { AccountPage } from './components/AccountPage/AccountPage'
import { HostListing } from './components/HostListing/HostListing'
import { Verification } from './components/Verification/Verification'
import { UserMenu } from './components/UserMenu/UserMenu'
import { useListings } from './hooks/useListings'
import { useAccountSession } from './hooks/useAccountSession'
import { useSavedListings } from './hooks/useSavedListings'
import type { Listing } from './types/listing'
import './App.css'
import { getListingRegions, type ListingSearchFilters } from './api/listings'

function App() {
  // Общее состояние экранов приложения.
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false)
  const [isHeaderDark, setIsHeaderDark] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [activePage, setActivePage] = useState<'home' | 'listing' | 'booking' | 'payment' | 'admin' | 'profile' | 'account' | 'verification' | 'host'>('home')
  const [pendingHost, setPendingHost] = useState(false)
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [stayDates, setStayDates] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null })
  const [guestCount, setGuestCount] = useState(1)
  const [paymentOption, setPaymentOption] = useState<'full' | 'split'>('full')
  const [showAllListings, setShowAllListings] = useState(false)
  // Revision для повторной загрузки каталога через useListings.
  const [listingsRevision, setListingsRevision] = useState(0)
  const [searchFilters, setSearchFilters] = useState<ListingSearchFilters>({ guests: 1 })
  const [regions, setRegions] = useState<string[]>([])
  const { listings, isLoading: listingsLoading, error: listingsError } = useListings(searchFilters, listingsRevision)
  const { accountRole, accountInitial, handleAuthenticated, logout } = useAccountSession()
  const accessToken = sessionStorage.getItem('access_token')
  const { savedIds, toggle: toggleSave } = useSavedListings(accessToken)

  function handleOpenHost() {
    // Страница доступна только авторизованным; верификация проверяется на самой странице.
    if (!accountInitial || !sessionStorage.getItem('access_token')) {
      setPendingHost(true)
      setIsSignInModalOpen(true)
      return
    }
    setActivePage('host')
  }

  useEffect(() => {
    if (pendingHost && accountInitial && sessionStorage.getItem('access_token')) {
      setPendingHost(false)
      setIsSignInModalOpen(false)
      setIsRegisterModalOpen(false)
      setActivePage('host')
    }
  }, [pendingHost, accountInitial])

  function handleToggleSave(listingId: number) {
    if (!accountInitial || !sessionStorage.getItem('access_token')) {
      setIsSignInModalOpen(true)
      return
    }
    void toggleSave(listingId)
  }

  useEffect(() => {
    const controller = new AbortController()
    void getListingRegions(controller.signal)
      .then(setRegions)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error('Failed to load listing regions', error)
      })
    return () => controller.abort()
  }, [])

  function updateSearchFilters(changes: Partial<ListingSearchFilters>) {
    setSearchFilters((current) => ({ ...current, ...changes }))
  }

  function formatSearchDate(date: Date | null) {
    if (!date) return null
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  function updateStayDates(dates: { start: Date | null; end: Date | null }) {
    setStayDates(dates)
    updateSearchFilters({
      checkIn: dates.start && dates.end ? formatSearchDate(dates.start) : null,
      checkOut: dates.start && dates.end ? formatSearchDate(dates.end) : null,
    })
  }
  // Условная длительность по умолчанию: пять ночей.
  const stayNights = stayDates.start && stayDates.end
    ? Math.max(1, Math.round((stayDates.end.getTime() - stayDates.start.getTime()) / 86_400_000))
    : 5

  function handleOpenListing(listing: Listing) {
    // Сохраняем даты поиска для последующего шага бронирования.
    setSelectedListing(listing)
    setActivePage('listing')
  }

  function handleBackHome() {
    // Сброс выбранного объявления и дат при возврате в каталог.
    setActivePage('home')
    setSelectedListing(null)
    updateStayDates({ start: null, end: null })
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

  function handleShowAllListings() {
    setShowAllListings(true)
    setSearchFilters({ guests: guestCount })
    setListingsRevision((revision) => revision + 1)
    requestAnimationFrame(() => {
      const categoryListings = document.querySelector<HTMLElement>('.category-listings')
      categoryListings?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  function handleOpenRandomPopularListing() {
    if (listings.length === 0) return

    const listingsWithComments = listings.filter((listing) => listing.reviews && listing.reviews.length > 0)
    if (listingsWithComments.length === 0) return

    const sortedByPopularity = listingsWithComments.sort((a, b) => {
      const scoreA = (a.rating || 0) * (a.reviewCount || 0)
      const scoreB = (b.rating || 0) * (b.reviewCount || 0)
      return scoreB - scoreA
    })

    const randomIndex = Math.floor(Math.random() * sortedByPopularity.length)
    const selectedListing = sortedByPopularity[randomIndex]

    if (selectedListing) {
      handleOpenListing(selectedListing)
    }
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

  if ((activePage === 'account' || activePage === 'verification' || activePage === 'host') && accountInitial && accessToken) {
    const menu = {
      accountInitial,
      accountRole,
      savedCount: savedIds.size,
      onOpenProfile: () => setActivePage('profile'),
      onOpenSaved: () => setActivePage('profile'),
      onOpenAccount: () => setActivePage('account'),
      onOpenAdmin: () => setActivePage('admin'),
      onLogout: () => {
        setActivePage('home')
        void logout()
      },
    }
    if (activePage === 'host') {
      return (
        <HostListing
          accessToken={accessToken}
          menu={menu}
          onHome={handleBackHome}
          onVerify={() => setActivePage('verification')}
        />
      )
    }
    return activePage === 'account' ? (
      <AccountPage
        accessToken={accessToken}
        menu={menu}
        onHome={handleBackHome}
        onVerify={() => setActivePage('verification')}
        onCreateProfile={() => setActivePage('profile')}
        onHost={handleOpenHost}
      />
    ) : (
      <Verification
        accessToken={accessToken}
        menu={menu}
        onHome={handleBackHome}
        onOpenSaved={() => setActivePage('profile')}
        onComplete={() => setActivePage('account')}
      />
    )
  }

  if (activePage === 'profile' && accountInitial && !isLocationMapOpen) {
    return (
      <ProfilePage
        onHome={handleBackHome}
        onOpenAdmin={() => setActivePage('admin')}
        onHost={handleOpenHost}
        onOpenMap={() => setIsLocationMapOpen(true)}
        onOpenListing={(listing) => {
          setSelectedListing(listing)
          setActivePage('listing')
        }}
      />
    )
  }

  if (activePage === 'listing' && selectedListing) {
    return (
      <div className="App">
        <ZhitloPage
          listing={selectedListing}
          stayDates={stayDates}
          onStayDatesChange={updateStayDates}
          stayNights={stayNights}
          onBack={handleBackHome}
          onStartSearch={handleStartSearch}
          onHome={handleBackHome}
          onReviewAdded={() => setListingsRevision((revision) => revision + 1)}
          onBook={() => setActivePage('booking')}
          isSaved={savedIds.has(Number(selectedListing.id))}
          onToggleSave={handleToggleSave}
          savedCount={savedIds.size}
          onOpenSignIn={() => setIsSignInModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onOpenProfile={() => setActivePage('profile')}
          onOpenAdmin={() => setActivePage('admin')}
          onHost={handleOpenHost}
          onLogout={() => void logout()}
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
          onOpenProfile={() => setActivePage('profile')}
          onOpenAdmin={() => setActivePage('admin')}
          onHost={handleOpenHost}
          onOpenSignIn={() => setIsSignInModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onLogout={() => void logout()}
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
          onOpenProfile={() => setActivePage('profile')}
          onOpenAdmin={() => setActivePage('admin')}
          onHost={handleOpenHost}
          onOpenSignIn={() => setIsSignInModalOpen(true)}
          onOpenRegister={() => setIsRegisterModalOpen(true)}
          onLogout={() => void logout()}
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
                  <a href="#stays" onClick={(event) => {
                    event.preventDefault()
                    handleShowAllListings()
                  }}>Варіанти помешкань</a>
                  <a href="#experiences" onClick={(event) => {
                    event.preventDefault()
                    handleOpenRandomPopularListing()
                  }}>Враження</a>
                  <a href="#online" onClick={(event) => {
                    event.preventDefault()
                    handleOpenRandomPopularListing()
                  }}>Онлайн-враження</a>
                </nav>

                <div className="site-header__actions">
                  <div className="site-header__bar">
                    <a className="site-header__host" href="/" onClick={(event) => {
                      event.preventDefault()
                      handleOpenHost()
                    }}>
                      Запропонувати помешкання на HomeFU
                    </a>
                    <div className="site-header__account">
                      <UserMenu
                        accountInitial={accountInitial}
                        accountRole={accountRole}
                        savedCount={savedIds.size}
                        onOpenProfile={() => setActivePage('profile')}
                        onOpenSaved={() => setActivePage('profile')}
                        onOpenAccount={() => setActivePage('account')}
                        onOpenAdmin={() => setActivePage('admin')}
                        onSignIn={() => setIsSignInModalOpen(true)}
                        onRegister={() => setIsRegisterModalOpen(true)}
                        onLogout={() => void logout()}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <SearchForm
                selectedRegion={selectedRegion}
                regions={regions}
                guests={guestCount}
                onGuestsChange={(value) => {
                  setGuestCount(value)
                  updateSearchFilters({ guests: value })
                }}
                stayDates={stayDates}
                onStayDatesChange={updateStayDates}
                onSearch={() => setListingsRevision((revision) => revision + 1)}
                onRegionSelect={(region) => {
                  setSelectedRegion(region)
                  updateSearchFilters({ region })
                }}
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
                guestCount={guestCount}
                onGuestCountChange={(value) => {
                  setGuestCount(value)
                  updateSearchFilters({ guests: value })
                }}
                searchFilters={searchFilters}
                onSearchFiltersChange={updateSearchFilters}
                allRegions={regions}
                selectedRegion={selectedRegion}
                onSelectRegion={(region) => {
                  setSelectedRegion(region)
                  updateSearchFilters({ region })
                }}
                onClearRegionFilter={() => {
                  setSelectedRegion(null)
                  updateSearchFilters({ region: null })
                }}
                onOpenListing={handleOpenListing}
                savedIds={savedIds}
                onToggleSave={handleToggleSave}
                showAllListings={showAllListings}
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
