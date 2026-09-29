import { useEffect, useState } from 'react'
import { Menu } from 'lucide-react'
import { SearchForm } from './components/SearchForm/SearchForm'
import { CategoryListings, type Listing } from './components/CategoryListings/CategoryListings'
import { Footer } from './components/Footer/Footer'
import { RegisterModal } from './components/RegisterModal/RegisterModal'
import { SignInModal } from './components/SignInModal/SignInModal'
import { LocationMap } from './components/Map/LocationMap'
import ZhitloPage from './components/Buildingpage/Buildingpage'
import { BookingRequest } from './components/Bookingrequest/BookingRequest'
import { PaymentConfirmation } from './components/Paymentconfirmation/PaymentConfirmation'
import { AdminDashboard } from './components/AdminDashboard/AdminDashboard'
import './App.css'

interface ListingResponse {
  id: number
  title: string
  description: string | null
  pricePerNight: number
  maxGuests: number
  latitude: number
  longtitude: number
  location: string | null
  region: string | null
  category: string | null
  images: { imageUrl: string; isCover: boolean }[]
  amenities: { id: number; name: string; icon: string }[]
  reviews: { id: number; rating: number; comment: string; createdAt: string }[]
  isPublished: boolean
  rating: number | null
  reviewCount: number
}

function App() {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false)
  const [isLocationMapOpen, setIsLocationMapOpen] = useState(false)
  const [isHeaderDark, setIsHeaderDark] = useState(false)
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)
  const [activePage, setActivePage] = useState<'home' | 'listing' | 'booking' | 'payment' | 'admin'>('home')
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [listingsLoading, setListingsLoading] = useState(true)
  const [listingsError, setListingsError] = useState('')
  const [listingsRevision, setListingsRevision] = useState(0)
  const [accountRole, setAccountRole] = useState('')
  const [accountInitial, setAccountInitial] = useState(() => {
    const savedEmail = sessionStorage.getItem('account_email')
    return savedEmail?.charAt(0).toUpperCase() ?? ''
  })

  useEffect(() => {
    let isCurrent = true

    async function loadListings() {
      try {
        const response = await fetch('/api/listings')
        if (!response.ok) throw new Error(`Не вдалося завантажити помешкання (${response.status})`)

        const data: ListingResponse[] = await response.json()
        if (!isCurrent) return

        setListings(data.map((item) => {
          const images = item.images ?? []
          const orderedImages = [...images].sort((left, right) => Number(right.isCover) - Number(left.isCover))

          return {
            id: String(item.id),
            title: item.title,
            description: item.description,
            location: item.location || item.title,
            category: item.category ?? '',
            region: item.region ?? '',
            price: item.pricePerNight,
            rating: item.rating,
            reviewCount: item.reviewCount,
            amenities: item.amenities ?? [],
            reviews: item.reviews ?? [],
            isPublished: item.isPublished,
            maxGuests: item.maxGuests,
            image: orderedImages[0]?.imageUrl ?? '',
            gallery: orderedImages.map((image) => image.imageUrl),
            latitude: item.latitude,
            longitude: item.longtitude,
          }
        }))
      } catch (error) {
        if (isCurrent) {
          setListingsError(error instanceof Error ? error.message : 'Не вдалося завантажити помешкання')
        }
      } finally {
        if (isCurrent) setListingsLoading(false)
      }
    }

    void loadListings()
    return () => { isCurrent = false }
  }, [listingsRevision])

  useEffect(() => {
    const accessToken = sessionStorage.getItem('access_token')
    if (!accessToken) {
      setAccountRole('')
      return
    }

    let isCurrent = true
    void fetch('/api/auth/me', { headers: { Authorization: `Bearer ${accessToken}` } })
      .then(async (response) => {
        if (!response.ok) throw new Error('Сесія завершилася')
        return response.json()
      })
      .then((account: { role: string }) => {
        if (isCurrent) setAccountRole(account.role)
      })
      .catch(() => {
        if (isCurrent) setAccountRole('')
      })

    return () => { isCurrent = false }
  }, [])

  const regions = [...new Set(listings.map((listing) => listing.region).filter(Boolean))]

  function handleAuthenticated(email: string, role: string) {
    const initial = email.trim().charAt(0).toUpperCase()
    sessionStorage.setItem('account_email', email)
    sessionStorage.setItem('account_role', role)
    setAccountInitial(initial)
    setAccountRole(role)
  }

  function handleOpenListing(listing: Listing) {
    setSelectedListing(listing)
    setActivePage('listing')
  }

  function handleBackHome() {
    setActivePage('home')
    setSelectedListing(null)
  }

  function handleJumpToListingCalendar() {
    setActivePage('listing')
    requestAnimationFrame(() => {
      const calendarSection = document.getElementById('calendar')
      calendarSection?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  async function handleLogout() {
    try {
      const refreshToken = document.cookie
        .split('; ')
        .find((cookie) => cookie.startsWith('refresh_token='))
        ?.split('=')[1]

      if (refreshToken) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        })
      }
    } catch (error) {
      console.error('Logout failed', error)
    } finally {
      sessionStorage.removeItem('account_email')
      sessionStorage.removeItem('access_token')
      sessionStorage.removeItem('account_role')
      document.cookie = 'refresh_token=; Max-Age=0; path=/; SameSite=Lax'
      setAccountInitial('')
      setAccountRole('')
      setIsUserMenuOpen(false)
    }
  }

  if (activePage === 'admin' && accountRole === 'Admin') {
    return (
      <AdminDashboard
        accessToken={sessionStorage.getItem('access_token') ?? ''}
        onBack={() => setActivePage('home')}
        onSaved={() => setListingsRevision((revision) => revision + 1)}
      />
    )
  }

  if (activePage === 'listing' && selectedListing) {
    return (
      <div className="App">
        <ZhitloPage
          listing={selectedListing}
          onBack={handleBackHome}
          onBook={() => setActivePage('booking')}
          onOpenSignIn={() => {
            setIsUserMenuOpen(false)
            setIsSignInModalOpen(true)
          }}
          onOpenRegister={() => {
            setIsUserMenuOpen(false)
            setIsRegisterModalOpen(true)
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
          onBack={() => setActivePage('listing')}
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
          onBack={() => setActivePage('booking')}
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
                          {accountInitial ? (
                            <>
                              {accountRole === 'Admin' && <button type="button" role="menuitem" onClick={() => {
                                setIsUserMenuOpen(false)
                                setActivePage('admin')
                              }}>Админ-панель</button>}
                              <button type="button" role="menuitem" onClick={handleLogout}>Выйти</button>
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
