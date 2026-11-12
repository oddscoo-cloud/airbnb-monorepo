# airbnb-monorepo

HomeFU: фронтенд на React + Vite, API на ASP.NET Core 9, PostgreSQL.

Документация по устройству и разработке клиентского приложения: [frontend/README.md](frontend/README.md).
Документация backend API, модели данных и интеграций: [backend/README.md](backend/README.md).

## Быстрый старт (Docker, одна команда)

Требования: Docker Desktop (или Docker Engine + Compose v2). Больше ничего не нужно: ни .NET SDK, ни Node.js, ни локального Postgres.

```powershell
docker compose up -d --build
```

| Сервис | URL / порт | Примечания |
|--------|-----------|------------|
| Сайт (nginx + собранный фронтенд) | http://localhost:3000 | проксирует `/api`, `/listing-images`, `/avatars` на API |
| API | http://localhost:5189 | Swagger: http://localhost:5189/swagger |
| PostgreSQL | localhost:5432 | БД `airbnb_db`, пользователь `postgres` |

При первом запуске (API работает с `ASPNETCORE_ENVIRONMENT=Development`) API сам применяет миграции EF, заполняет пользователей/удобства и создаёт аккаунт администратора:

- Email: `admin@homefu.local`
- Пароль: `Admin12345!`

База данных изначально пустая: объявлений и регионов нет, пока их не добавят в админ-панели или не отправят пользователи.

Остановка: `docker compose down` (данные сохраняются). Полный сброс, включая базу и загруженные файлы: `docker compose down -v`.

Пересборка после изменений в коде: `docker compose up -d --build`. Логи: `docker compose logs -f api`.

### Конфигурация

Значения по умолчанию можно переопределить переменными окружения или файлом `.env` рядом с `docker-compose.yml`:

| Переменная | По умолчанию | Назначение |
|------------|--------------|------------|
| `POSTGRES_PASSWORD` | `postgrespassword` | пароль Postgres |
| `JWT_KEY` | dev-ключ | секрет подписи JWT, минимум 32 случайных символа |
| `ADMIN_EMAIL` | `admin@homefu.local` | email начального администратора |
| `ADMIN_PASSWORD` | `Admin12345!` | пароль начального администратора |
| `SMTP_HOST`, `SMTP_PORT` | не настроены, `587` | SMTP-сервер для отправки писем владельцам |
| `SMTP_USERNAME`, `SMTP_PASSWORD` | не настроены | учетные данные SMTP; задавайте пароль только через `.env` или секреты окружения |
| `SMTP_FROM_ADDRESS`, `SMTP_FROM_NAME` | не настроены, `HomeFU` | адрес и имя отправителя писем |
| `SMTP_ENABLE_SSL` | `true` | использовать защищенное SMTP-соединение |

Гость отправляет сообщение об опубликованном объявлении через форму, указывая имя и email для ответа. Письмо отправляется прямо на email владельца; владелец отвечает на него из своей почты, используя обычную функцию ответа. Сообщения не хранятся на сайте и не отображаются в личном кабинете. Для отправки необходимо настроить SMTP; при ошибке гость увидит уведомление и сможет попробовать снова.

Данные хранятся в томах Docker: `postgres_data` (БД), `listing_images`, `avatars`, `verification_docs`.

Для входа через Google фронтенду нужна переменная `VITE_GOOGLE_CLIENT_ID` (файл `frontend/.env`, пример в `frontend/.env.example`). Без неё сайт работает, но кнопка входа через Google не функционирует. Vite читает переменные только при запуске, а в Docker они попадают в сборку фронтенда, поэтому после изменения нужна пересборка.

## Как сделать пользователя администратором

Обычная регистрация всегда создаёт пользователя с ролью `Guest`. Есть три способа получить роль `Admin`.

**1. Через базу данных (для существующего аккаунта).** Пользователь должен быть уже зарегистрирован:

```powershell
docker exec airbnb_postgres psql -U postgres -d airbnb_db -c "update users set role='Admin' where email='you@example.com'"
```

Чтобы вернуть обычную роль, подставьте `role='Guest'`.

После смены роли пользователь должен выйти из аккаунта и войти снова: роль хранится в JWT-токене. После этого в меню аккаунта появится пункт админ-панели.

**2. Через переменные окружения (начальный админ).** Задайте `ADMIN_EMAIL` и `ADMIN_PASSWORD` в `.env` рядом с `docker-compose.yml` и перезапустите API: `docker compose up -d --build`. В режиме Development при старте API создаёт этот аккаунт, а если он уже существует, назначает ему роль `Admin` и заданный пароль.

**3. Без Docker.** В том же окне PowerShell, из которого запускается API:

```powershell
$env:Admin__Email = Read-Host 'Admin email'
$adminPassword = Read-Host 'Admin password' -AsSecureString
$env:Admin__Password = [System.Net.NetworkCredential]::new('', $adminPassword).Password
```

Подробности: [backend/Airbnb.Api/ADMIN_SETUP.md](backend/Airbnb.Api/ADMIN_SETUP.md). Не коммитьте пароль и не кладите его в `appsettings.json`.

### Частые проблемы

- **Порт уже занят** (3000, 5189, 5432): остановите другой проект или измените левую часть привязки порта в `docker-compose.yml`. Локально установленный Postgres на 5432 конфликтует с контейнером.
- **На том же порту открывается другой проект**: проверьте `docker ps`; очистите кэш браузера или откройте сайт в приватном окне.
- **Каталог пуст**: это нормально для свежей базы. Войдите как администратор, добавьте объявление или отправьте его от верифицированного аккаунта и одобрите в админ-панели.
- **Роль изменена в БД, но доступа администратора нет**: выйдите и войдите снова, роль хранится в JWT.
- **Белый экран на страницах с входом через Google**: не задан `VITE_GOOGLE_CLIENT_ID` (см. раздел «Конфигурация»).

### Перенос данных из локальной базы backend-разработчика

Чтобы использовать существующую локальную базу вместо пустой:

```powershell
pg_dump -U postgres -d <db_name> -F c -f airbnb.dump
docker compose up -d postgres
docker cp airbnb.dump airbnb_postgres:/tmp/airbnb.dump
docker exec airbnb_postgres pg_restore -U postgres -d airbnb_db --clean --if-exists /tmp/airbnb.dump
docker compose up -d --build
```

Изображения и аватары из локальной `wwwroot` нужно скопировать в тома `listing_images` и `avatars`.

## Запуск без Docker (разработка)

Требования: .NET SDK 9, Node.js 20+, PostgreSQL 16.

1. Создайте базу данных и задайте строку подключения и `Jwt:Key` (user secrets или переменные окружения `ConnectionStrings__DefaultConnection`, `Jwt__Key`).
2. Бэкенд: `cd backend\Airbnb.Api; dotnet run` (в режиме Development применяются миграции и заполняются данные).
3. Фронтенд: `cd frontend; npm install; npm run dev`.

## Заявки пользователей на объявления

- Вошедший и верифицированный пользователь открывает «Запропонувати помешкання на HomeFU» и заполняет форму (описание, регион, фото 1–15, удобства). Регион вводится с подсказками; новое название создаёт новый регион.
- Заявка попадает в админ-панель, вкладка «Заявки». Администратор может отредактировать заявку в ожидании, одобрить её (она публикуется) или отклонить с причиной, которую увидит пользователь.
- API: `POST /api/host/listings`, `GET /api/host/listings/mine`, `GET /api/admin/submissions`, `PUT /api/admin/submissions/{id}`, `POST /api/admin/submissions/{id}/approve|reject`, `GET /api/region/all`.

## Заметки для продакшена (для backend-разработчика)

Docker-конфигурация рассчитана на разработку и демо. Перед реальным развёртыванием:

- Выполняйте миграции (`dotnet ef database update`) и создавайте администратора отдельным шагом, не полагаясь на режим Development; задайте `ASPNETCORE_ENVIRONMENT=Production`.
- Используйте настоящие секреты для `JWT_KEY`, `POSTGRES_PASSWORD`, `ADMIN_PASSWORD`; не коммитьте их.
- Не открывайте Postgres наружу (уберите привязку порта `5432`) и отключите Swagger.
- Разместите сайт за HTTPS (reverse proxy / балансировщик).
- Делайте резервные копии томов (база, изображения, документы верификации).

## API аутентификации

Бэкенд предоставляет JWT-аутентификацию по адресу `/api/auth`:

- `POST /register`: `email`, `password`, `confirm_password`, необязательные имена; возвращает `201 Created`.
- `POST /login`: возвращает `access_token` и `refresh_token`; refresh-токен также устанавливается как HTTP-only cookie.
- `POST /refresh`: принимает JSON `refresh_token` или cookie и ротирует refresh-токен.
- `POST /logout`: отзывает переданный или cookie refresh-токен.

Access-токены действуют 30 минут, refresh-токены — 30 дней. Refresh-токены хранятся в `RefreshTokens` в виде SHA-256 хэшей. Передавайте access-токен в заголовке `Authorization: Bearer <token>`; в качестве примера защищено создание объявлений.

Перед развёртыванием задайте `Jwt:Key` через user secrets или переменную окружения (`Jwt__Key`) случайным секретом длиной не менее 32 символов. Схему базы применяйте командой:

```powershell
dotnet ef database update --project backend\Airbnb.Api\Airbnb.Api.csproj --startup-project backend\Airbnb.Api\Airbnb.Api.csproj
```

# Facebook Authentication — Airbnb Project

## Описание работы

В рамках проекта Airbnb мы подготовили серверной части для интеграции авторизации и регистрации пользователей через Facebook.

Наша задача заключалась в добавлении необходимых компонентов, которые позволят пользователям в дальнейшем входить в приложение Airbnb с помощью своего Facebook-аккаунта.

## Что было добавлено и изменено

### 1. Airbnb.Api.csproj
- Добавлена библиотека `Microsoft.AspNetCore.Authentication.Facebook`.
- Используется версия `9.0.10`.
- Подготовлена зависимость для интеграции Facebook Authentication в ASP.NET Core.

### 2. Models/User.cs
- Добавлено свойство `FacebookId` в модель пользователя.
- Оно предназначено для хранения уникального идентификатора пользователя Facebook.
- Это позволяет связывать Facebook-аккаунт с существующей записью пользователя в базе данных.

### 3. Repositories/UserRepository.cs
- Добавлена логика поиска пользователя по `FacebookId`.
- Репозиторий получил возможность находить пользователей, связанных с Facebook-аккаунтом.
- Это необходимо для дальнейшей реализации авторизации через Facebook.

### 4. Program.cs
- Подготовлена конфигурация серверной части для интеграции Facebook Authentication.
- Создана основа для дальнейшей настройки аутентификации через Facebook в ASP.NET Core.

## Используемые технологии

- C#
- ASP.NET Core 9
- Entity Framework Core
- PostgreSQL
- Microsoft.AspNetCore.Authentication.Facebook
- OAuth 2.0

## Проверка проекта

После внесения изменений была выполнена команда:

`dotnet build Airbnb.Api/Airbnb.Api.csproj`

Сборка проекта прошла успешно.

## Результат работы

В результате была подготовлена основа серверной интеграции Facebook Authentication.

Были добавлены необходимые зависимости, изменена модель пользователя и расширен репозиторий для поиска аккаунтов по Facebook ID.

Эти изменения создают основу для последующего подключения полноценного входа и регистрации пользователей через Facebook.

# Apple ID Authentication — Airbnb Project

## Описание работы

В рамках проекта Airbnb была реализована полноценная интеграция входа и регистрации пользователей через **Sign in with Apple** (OpenID Connect) для веб-приложения и серверной части.

Задача заключалась в обеспечении безопасной, бесшовной аутентификации с помощью аккаунта Apple, включая корректную обработку первичной передачи имени пользователя, поддержку скрытых почтовых адресов (Apple Private Email Relay) и генерацию защищенной JWT-сессии приложения.

## Что было добавлено и изменено

### 1. Фронтенд (React / Vite)

#### `frontend/index.html`
- Подключен официальный клиентский скрипт Apple JS SDK (`appleid.auth.js`) для инициализации и отображения системного окна авторизации Apple в браузере.

#### `frontend/.env`
- Добавлена переменная окружения `VITE_APPLE_CLIENT_ID` для хранения идентификатора сервиса (Services ID), зарегистрированного в Apple Developer Portal.

#### `frontend/src/components/SignInModal.tsx`
- Реализована асинхронная функция `handleAppleLogin`, которая инициализирует `AppleID.auth` с параметрами `clientId`, `scope: 'name email'`, `redirectURI` и режимом всплывающего окна (`usePopup: true`).
- Настроено получение `id_token` и объекта `user` (содержащего `firstName` и `lastName`, которые Apple передает исключительно при первой регистрации аккаунта).
- Реализована отправка полученных данных на серверный эндпоинт `/api/auth/apple`, сохранение возвращенного JWT-токена в `sessionStorage` (`access_token`) и обновление состояния авторизации через `onAuthenticated`.
- Функция `handleAppleLogin` привязана к событию `onClick` кнопки **Sign In with Apple**.

### 2. Бэкенд (ASP.NET Core & Entity Framework Core)

#### `backend/Airbnb.Api/Controllers/AuthController.cs`
- Добавлен POST-эндпоинт `api/auth/apple` и модель входящих данных `AppleLoginDto` (`Id_Token`, `FirstName`, `LastName`).
- Реализовано декодирование и валидация входящего JWT-токена (`id_token`) с помощью `JwtSecurityTokenHandler` и извлечение верифицированного `email` пользователя из claims.
- **Поиск и автоматическая регистрация:** Через `ApplicationDbContext` (Entity Framework Core) выполняется проверка наличия пользователя в базе данных PostgreSQL по `Email`. Если учетная запись не найдена, автоматически создается новый пользователь с указанием провайдера `"Apple"` и переданного имени.
- **Генерация сессии:** Вызывается `GenerateJwtToken(user)` для формирования собственного JWT-токена приложения, который возвращается клиенту вместе с данными профиля.

#### `backend/Airbnb.Api/appsettings.json`
- Подготовлена структура конфигураций для хранения параметров JWT (`Issuer`, `Audience`, `Key`) и настроек внешних провайдеров аутентификации.

## Используемые технологии

- **Frontend:** React, TypeScript, Vite, Apple ID JS SDK (`appleid.auth.js`)
- **Backend:** C#, ASP.NET Core 9, Entity Framework Core, `System.IdentityModel.Tokens.Jwt`
- **Database:** PostgreSQL (`airbnb_db`)
- **Protocols:** OpenID Connect (OIDC), OAuth 2.0, JWT

## Проверка проекта

После внесения изменений на клиенте и сервере выполнена проверка сборки и работы:
1. Проверена корректная загрузка Apple SDK и открытие всплывающего окна авторизации в браузере.
2. Выполнена сборка серверного проекта:
   ```bash
   dotnet build Airbnb.Api/Airbnb.Api.csproj
