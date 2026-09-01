import { Menu, User } from 'lucide-react'
import { SearchForm } from './components/SearchForm'
import './App.css'

function App() {
  return (
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
          <button className="site-header__menu" type="button" aria-label="Меню користувача">
            <Menu size={16} aria-hidden="true" />
            <User size={22} aria-hidden="true" />
          </button>
        </div>
      </div>

      <SearchForm />
    </header>
  )
}

export default App
