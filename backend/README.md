# Документация backend HomeFU

Backend HomeFU — REST API на ASP.NET Core 9 с PostgreSQL и Entity Framework Core. API обслуживает каталог объявлений, аккаунты, аутентификацию, профили, загрузку медиа, сохранённые объявления и модерацию заявок хозяев.

Инструкция по запуску всей системы и Docker находится в [корневом README](../README.md). Порядок создания администратора описан также в [ADMIN_SETUP.md](Airbnb.Api/ADMIN_SETUP.md).

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Архитектура и структура](#архитектура-и-структура)
- [Конфигурация](#конфигурация)
- [Жизненный цикл приложения и база данных](#жизненный-цикл-приложения-и-база-данных)
- [Аутентификация и авторизация](#аутентификация-и-авторизация)
- [HTTP API](#http-api)
- [Данные и файлы](#данные-и-файлы)
- [Проверки и разработка](#проверки-и-разработка)
- [Текущие ограничения API](#текущие-ограничения-api)

## Быстрый старт

### Через Docker Compose

Из корня репозитория:

```powershell
docker compose up -d --build
```

Для старта API Compose сначала проверяет готовность PostgreSQL. API публикуется на `http://localhost:5189`; Swagger UI в Development доступен на `http://localhost:5189/swagger`. Сведения о начальном администраторе, переменных окружения, томах и командах остановки находятся в [корневом README](../README.md).

### Локально без Docker

Требуются .NET 9 SDK и доступный PostgreSQL. Укажите строку подключения через `ConnectionStrings__DefaultConnection` или локальную конфигурацию, затем из корня репозитория выполните:

```powershell
dotnet run --project backend/Airbnb.Api --launch-profile http
```

Профиль `http` устанавливает окружение Development и адрес `http://localhost:5189`. В Development API автоматически применяет EF Core migrations, запускает seed-процедуры и включает Swagger.

Для выдачи начального администратора используйте переменные `Admin__Email` и `Admin__Password`; подробности и примеры безопасной передачи пароля приведены в [ADMIN_SETUP.md](Airbnb.Api/ADMIN_SETUP.md). Не храните реальные секреты в коммитящихся `appsettings*.json`.

## Архитектура и структура

```text
backend/
├── Airbnb.sln
├── Dockerfile
├── Airbnb.Api/
│   ├── Controllers/           # HTTP-маршруты и orchestration запросов
│   ├── Contracts/             # Модель multipart-заявки хозяина
│   ├── Data/                  # Разрешение названия/идентификатора региона
│   ├── Properties/            # Профили запуска
│   ├── wwwroot/               # Публичные статические файлы и медиа
│   ├── Program.cs             # Регистрация сервисов и middleware
│   └── appsettings*.json      # Базовая и Development-конфигурации
├── Airbnb.Application/
│   ├── DTOs/                  # Запросы и ответы API
│   └── Mapping/               # AutoMapper-профили
├── Airbnb.Domain/
│   └── Entities/              # Сущности предметной области
└── Airbnb.Infrastructure/
    ├── Persistence/           # AppDbContext, migrations и seeders
    ├── Repositories/           # Пользователи и refresh tokens
    └── Services/               # Аутентификация и отправка email
```

Решение разделено на API, Application, Domain и Infrastructure. Application содержит DTO и mapping, Domain — EF-сущности, Infrastructure — доступ к PostgreSQL, миграции, репозитории и сервисы. В текущей реализации ряд контроллеров напрямую использует `AppDbContext`; не все операции проходят через отдельные application/use-case сервисы. Настройка основных зависимостей выполняется в `Airbnb.Api/Program.cs`.

### Основные сущности

| Сущность | Назначение |
|---|---|
| `User` | Аккаунт, роль, парольный хеш, статус верификации |
| `RefreshToken` | Хеш обновляемого токена, срок действия и отзыв |
| `Listing` | Объявление, цена, вместимость, публикация и статус модерации |
| `ListingImage` | Изображения объявления и признак обложки |
| `Amenity` | Справочник удобств |
| `Region` | Регион объявления |
| `Review` | Рейтинг и комментарий к объявлению; автор может отсутствовать |
| `Booking` | Даты, стоимость и статус бронирования; самостоятельного HTTP API для бронирований сейчас нет |
| `SavedListing` | Связь пользователя с сохранённым объявлением |
| `ProfileFacts` | Дополнительные поля профиля пользователя |

Основные таблицы и ограничения конфигурируются в `Airbnb.Infrastructure/Persistence/AppDbContext.cs`. Email пользователя и хеш refresh token уникальны; пара `(UserId, ListingId)` для сохранённых объявлений также уникальна. Связанные изображения, отзывы и удобства в ответах каталога загружаются вместе с объявлением.

## Конфигурация

Конфигурация .NET поддерживает обычные провайдеры ASP.NET Core, включая переменные окружения с двойным подчёркиванием вместо `:`. Переменные ниже используются приложением или Docker Compose:

| Переменная окружения | Ключ конфигурации | Назначение |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | `ConnectionStrings:DefaultConnection` | Подключение к PostgreSQL |
| `Jwt__Key` | `Jwt:Key` | Симметричный ключ подписи access token; обязателен |
| `Jwt__Issuer` | `Jwt:Issuer` | Издатель JWT; проверяется при аутентификации |
| `Jwt__Audience` | `Jwt:Audience` | Получатель JWT; проверяется при аутентификации |
| `Admin__Email` | `Admin:Email` | Email начального администратора при Development seed |
| `Admin__Password` | `Admin:Password` | Пароль начального администратора при Development seed |
| `Email__Smtp__Host` | `Email:Smtp:Host` | SMTP-сервер для вопросов хозяевам |
| `Email__Smtp__Port` | `Email:Smtp:Port` | Порт SMTP |
| `Email__Smtp__Username` | `Email:Smtp:Username` | Необязательный логин SMTP |
| `Email__Smtp__Password` | `Email:Smtp:Password` | Необязательный пароль SMTP |
| `Email__Smtp__FromAddress` | `Email:Smtp:FromAddress` | Адрес отправителя |
| `Email__Smtp__FromName` | `Email:Smtp:FromName` | Отображаемое имя отправителя |
| `Email__Smtp__EnableSsl` | `Email:Smtp:EnableSsl` | Использование TLS SMTP |
| `ASPNETCORE_ENVIRONMENT` | — | Окружение ASP.NET Core; влияет на Swagger, миграции и seed |

Для постоянного или production-развёртывания задавайте секреты в окружении/secret store, используйте отдельную БД и уникальный секрет JWT. Значения из Development предназначены только для локальной разработки. Swagger регистрируется и включается только в Development.

### Настройки SMTP

При отправке вопроса SMTP-клиент проверяет наличие host, from address и корректного порта. При отсутствии параметров или сбое отправки API пишет лог, не сохраняет текст сообщения и возвращает `503 Service Unavailable`. Если SMTP настроен, письмо доставляется владельцу объявления, а адрес гостя задаётся как `Reply-To`.

## Жизненный цикл приложения и база данных

На старте `Program.cs`:

1. Регистрирует контроллеры, AutoMapper, PostgreSQL-контекст, JWT authentication, authorization и прикладные сервисы.
2. В Development включает Swagger и создаёт scope для инициализации базы.
3. В Development вызывает `Database.Migrate()`, затем seed пользователей и удобств, а также начального администратора, если для него заданы `Admin:Email` и `Admin:Password`.
4. Включает статические файлы, аутентификацию и авторизацию, затем маппит контроллеры.

Автоматический запуск миграций находится внутри Development-ветки. Не предполагайте автоматическое изменение схемы на production: миграции из `Airbnb.Infrastructure/Persistence/Migrations/` должны применяться контролируемым процессом развертывания до запуска версии приложения, совместимой с новой схемой.

В Development сидер добавляет демонстрационных пользователей, только если таблица пользователей пуста. Сидер удобств добавляет и обновляет стандартный список. Каталог объявлений и регионы автоматически не заполняются.

В Docker постоянные данные размещаются в Compose volumes:

- `postgres_data` — PostgreSQL;
- `listing_images` — публичные изображения объявлений;
- `avatars` — публичные аватары;
- `verification_docs` — каталог `/app/App_Data` с документами проверки личности.

`docker compose down` оставляет volumes; `docker compose down -v` удаляет их вместе с данными.

## Аутентификация и авторизация

Парольная регистрация создаёт пользователя с ролью `Guest`. Пароль сохраняется с помощью ASP.NET Core `PasswordHasher<User>`, а не в открытом виде. Вход выдаёт JWT access token сроком на 30 минут и refresh token сроком на 30 дней. В БД хранится SHA-256-хеш refresh token; обновление отзывает использованный токен и выпускает новую пару.

Access token передаётся как `Authorization: Bearer <token>`. JWT проверяется по подписи, issuer, audience и сроку действия с допуском часов 30 секунд. Роль включается в claims; админские endpoints требуют роль `Admin`.

На входе и обновлении API устанавливает refresh token в cookie `refresh_token` с `HttpOnly`, `SameSite=Strict`, сроком 30 дней и `Secure` для HTTPS-запросов. Refresh endpoint принимает токен как в теле запроса (`refreshToken`), так и из cookie. Выход отзывает refresh token, если он ещё активен, и удаляет cookie.

`GET /api/auth/me` возвращает ID, email и роль из валидированного токена. Передача роли или ID в клиентском интерфейсе сама по себе не предоставляет права: доступ проверяется на API.

## HTTP API

Все пути ниже относительные, с базовым префиксом `/api`. JSON-запросы используют camelCase по стандартным настройкам ASP.NET Core; multipart-поля обозначены отдельно. `[ApiController]` обеспечивает автоматический ответ `400` при нарушении Data Annotations. В некоторых контроллерах ошибки дополнительно возвращаются как `{ "message": "..." }`.

### Аутентификация — `/auth`

| Метод и путь | Доступ | Описание |
|---|---|---|
| `POST /api/auth/register` | Анонимно | Регистрация. Тело: `email`, `password` (минимум 8 символов), `confirm_password`; необязательные `firstName`, `lastName`. Успех — `201`, конфликт email/несовпадение паролей — `409`. |
| `POST /api/auth/login` | Анонимно | Вход по `email` и `password`. Возвращает `access_token`, `refresh_token`, `access_token_expires_at`, `role`; refresh token также устанавливается cookie. Ошибка входа — `401`. |
| `GET /api/auth/me` | JWT | Информация о текущем пользователе из claims. |
| `POST /api/auth/refresh` | Refresh token | Обновление пары токенов. Токен передаётся через `refreshToken` или cookie. Недействительный/истёкший токен — `401`. |
| `POST /api/auth/logout` | Анонимно + refresh token | Отзывает переданный токен, удаляет cookie, отвечает `204`. |

### Каталог и отзывы — `/listings`

| Метод и путь | Доступ | Описание |
|---|---|---|
| `GET /api/listings/regions` | Анонимно | Регионы с опубликованными объявлениями; координаты вычисляются как среднее координат этих объявлений. |
| `GET /api/listings` | Анонимно | Постраничный каталог только опубликованных объявлений. |
| `GET /api/listings/{id}` | Анонимно | Детали опубликованного объявления; иначе `404`. |
| `POST /api/listings/{id}/reviews` | Анонимно или JWT | Создание отзыва к опубликованному объявлению. Рейтинг — 1–5, комментарий — 1–2000 символов. При валидном токене отзыв связывается с пользователем, иначе создаётся анонимным. |
| `POST /api/listings` | JWT | Создание неопубликованного объявления напрямую. Это отдельный endpoint от процесса заявки в `/api/host/listings`. |
| `POST /api/listings/{id}/questions` | Анонимно | Отправка вопроса владельцу опубликованного объявления по email; `204` при успехе, `503` при невозможности отправить письмо. |

Параметры `GET /api/listings`:

| Параметр | Допустимые значения / поведение |
|---|---|
| `page` | Начиная с 1; по умолчанию `1` |
| `pageSize` | 1–100; по умолчанию `100` |
| `region` | Совпадение с названием региона без учёта регистра |
| `category` | Точное совпадение категории |
| `minPrice`, `maxPrice` | Цена за ночь; минимум не должен превышать максимум |
| `minimumRating` | Средний рейтинг, 0–5; объявления без отзывов не подходят |
| `guests` | Минимальная вместимость; допустимо 1–16 |
| `checkIn`, `checkOut` | `YYYY-MM-DD`; должны передаваться вместе, выезд должен быть позже заезда |

При фильтре дат исключаются объявления, у которых есть пересекающееся бронирование со статусом, отличным от `cancelled`, `canceled` или `rejected` (без учёта регистра). Порядок выдачи стабилен по ID объявления.

### Пользователи — `/users`

| Метод и путь | Доступ | Описание |
|---|---|---|
| `GET /api/users` | Admin | Список пользователей без полей facts. |
| `GET /api/users/{id}` | Анонимно | Публичный профиль пользователя и профильные факты. При отсутствии facts endpoint создаёт пустую запись. |
| `POST /api/users/me/verification` | JWT | Multipart: `documentType` (`driver`, `passport`, `id`), `country`, `front`, `back`. Каждое изображение JPEG/PNG до 5 MiB. Сохраняет документы в непубличном `App_Data/verification/{userId}` и устанавливает `IsVerified`. |
| `POST /api/users/me/avatar` | JWT | Multipart-файл `avatar`, JPEG/PNG до 5 MiB. Хранит файл в `wwwroot/avatars` и возвращает `avatarUrl`. |
| `PUT /api/users/me/facts` | JWT | Создать или обновить facts текущего пользователя: `education`, `profession`, `address`, `languages`, `birthdayDecade`, `song`, `excitement`, `fact`, `uselessSkills`, `biographyTitle`, `timeAbsorber`, `pets`, `aboutMe`, `favorite`. |

### Сохранённые объявления — `/saved-listings`

Все endpoints требуют JWT и применяются только к текущему пользователю:

| Метод и путь | Описание |
|---|---|
| `GET /api/saved-listings` | Полные объекты сохранённых опубликованных объявлений. |
| `GET /api/saved-listings/ids` | Массив ID сохранённых объявлений. |
| `POST /api/saved-listings/{listingId}` | Сохранить опубликованное объявление; `201`, `404` если не найдено/не опубликовано, `409` если уже сохранено. |
| `DELETE /api/saved-listings/{listingId}` | Удалить сохранение; `204` или `404`, если связи нет. |

### Регионы — `/region`

| Метод и путь | Доступ | Описание |
|---|---|---|
| `GET /api/region` | Анонимно | Регионы, имеющие опубликованные объявления. |
| `GET /api/region/all` | JWT | Полный справочник `id`, `name`, `imageUrl`, включая регионы без опубликованных объявлений. |
| `POST /api/region` | Admin | Создать регион из `RegionRequestDTO`. |

### Объявления хозяев — `/host/listings`

Все маршруты требуют JWT. Для отправки заявки пользователь должен быть верифицирован.

| Метод и путь | Описание |
|---|---|
| `GET /api/host/listings/amenities` | Справочник удобств. |
| `POST /api/host/listings/amenities` | Получить существующее или создать удобство. |
| `GET /api/host/listings/mine` | Заявки текущего хозяина, отсортированные по дате отправки. |
| `POST /api/host/listings` | Отправить заявку как `multipart/form-data`: текстовые поля объявления, `amenityIds` и повторяющиеся `photos`. Допускается от 1 до 15 фото, JPG/JPEG/PNG/WebP, до 12 MiB каждое. Общий предел запроса — 200 MiB. Новая заявка получает статус `Pending`, не публикуется до модерации. |

Поля заявки: `title`, `location`, `regionName` (или `regionId`), `category`, `description`, `pricePerNight`, `maxGuests`, `latitude`, `longtitude`, `amenityIds`, `photos`. Базовые ограничения полей заданы Data Annotations в `Airbnb.Api/Contracts/SubmitionRequest.cs`.

### Администрирование объявлений — `/admin/listings`

Все маршруты требуют JWT с ролью `Admin`. DTO объявления: `title`, `location`, `regionName`/`regionId`, `category`, `description`, `pricePerNight`, `maxGuests`, `latitude`, `longtitude`, `amenityIds`.

| Метод и путь | Описание |
|---|---|
| `GET /api/admin/listings` | Объявления, созданные через админский интерфейс, и одобренные заявки хозяев. Черновики и одобренные пользовательские объявления доступны для редактирования и снятия с публикации здесь. |
| `GET /api/admin/listings/amenities` | Справочник удобств. |
| `POST /api/admin/listings/amenities` | Получить или создать удобство. |
| `POST /api/admin/listings` | Создать объявление как черновик; ответ `201`. |
| `PUT /api/admin/listings/{id}` | Изменить поля объявления. |
| `POST /api/admin/listings/{id}/publish` | Тело `{ "isPublished": true|false }`; при публикации обязательны непустые адрес и категория. |
| `POST /api/admin/listings/{id}/images` | Multipart: `file`, `isCover`. JPG/JPEG/PNG/WebP до 12 MiB. |
| `DELETE /api/admin/listings/{id}/images/{imageId}` | Удалить запись изображения и связанный файл. |

### Модерация заявок — `/admin/submissions`

Все маршруты требуют JWT с ролью `Admin`.

| Метод и путь | Описание |
|---|---|
| `GET /api/admin/submissions?status=Pending` | Список заявок; необязательный фильтр `Pending`, `Approved` или `Rejected`. |
| `PUT /api/admin/submissions/{id}` | Изменить данные заявки, пока она находится на рассмотрении. |
| `POST /api/admin/submissions/{id}/approve` | Одобрить заявку, записать дату рассмотрения и опубликовать объявление; `204`. |
| `POST /api/admin/submissions/{id}/reject` | Тело `{ "reason": "..." }`; отклонить, сохранить причину и снять с публикации; `204`. |

Для неизвестной или уже рассмотренной заявки операции редактирования/решения возвращают `404`. Отклонение без причины — `400`.

## Данные и файлы

### Изображения и проверочные документы

- Фотографии объявлений сохраняются в `wwwroot/listing-images` под случайными именами и доступны как `/listing-images/{file}`.
- Аватары находятся в `wwwroot/avatars`; имя файла основано на ID пользователя, при замене старые варианты аватара удаляются. URL включает параметр версии `v`.
- Документы верификации находятся в `App_Data/verification/{userId}` вне `wwwroot`; публичной выдачи этих документов через static files нет.
- Вопросы хозяевам передаются по email, а их текст не сохраняется в базе данных.

В Docker этим каталогам соответствуют volumes `listing_images`, `avatars` и `verification_docs`. Для удаления файлов при ручном обслуживании сверяйте записи БД и каталоги; не удаляйте общие каталоги приложения.

### Миграции

EF Core migrations и snapshot хранятся в `Airbnb.Infrastructure/Persistence/Migrations/`. Новое изменение модели должно сопровождаться миграцией и обновлённым model snapshot. Типичный локальный вызов EF CLI из корня репозитория:

```powershell
dotnet ef migrations add <MigrationName> --project backend/Airbnb.Infrastructure --startup-project backend/Airbnb.Api
```

Для этой команды требуется установленный `dotnet-ef`. После генерации проверьте миграцию и протестируйте обновление базы на отдельной локальной БД до её применения в общей или production-среде.

## Проверки и разработка

В backend solution сейчас нет отдельного проекта тестов. Для сборки решения из корня репозитория:

```powershell
dotnet build backend/Airbnb.sln
```

Для запуска API используйте команду из раздела [Быстрый старт](#быстрый-старт). Swagger в Development — актуальный интерактивный список маршрутов и схем запросов. При изменении API проверьте соответствующие DTO, авторизационные атрибуты, migrations и использующие endpoint клиентские вызовы во frontend.

Рекомендуемые границы изменений:

1. Новые HTTP-маршруты оформляйте контроллерами в `Airbnb.Api/Controllers/`.
2. Контракты запросов/ответов размещайте в `Airbnb.Application/DTOs/`; multipart формы — в API contracts, если им нужно связывание ASP.NET.
3. Сущности и правила предметной области добавляйте в `Airbnb.Domain/Entities/`.
4. Для схемы БД создавайте EF migration и сохраняйте совместимость развёртывания.
5. Проверяйте `401`/`403`, валидацию и случаи отсутствующих/неопубликованных записей.
6. Для пользовательских файлов используйте случайные или серверные имена, проверяйте размер и содержимое, не публикуйте приватные документы из `wwwroot`.

## Текущие ограничения API

- У сущности `Booking` есть таблица и фильтрация доступности дат в каталоге, но контроллера/API для создания, просмотра, оплаты или отмены бронирований нет. Экранный интерфейс оплаты не создаёт серверную бронь и не списывает деньги.
- Google OAuth endpoint `/api/auth/google`, вызываемый клиентом, в текущем наборе API-контроллеров не реализован.
- Обычная регистрация создаёт пользователя, но не выдаёт токены автоматически; для создания сессии после регистрации нужен отдельный вход.
- При отправке заявки хозяина статус одобрения напрямую устанавливает `IsPublished = true`; это нужно учитывать при трактовке статуса модерации в каталоге.
- В `RegionController` endpoint `GET /api/region/all` требует JWT, несмотря на то что его данные справочника не пользовательские.
- Автоматическая миграция и Swagger ограничены Development; production-процесс развёртывания должен управлять схемой и секретами отдельно.
