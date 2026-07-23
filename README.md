# Budżet

Osobisty budżet domowy — aplikacja webowa do śledzenia wydatków i przychodów.

## Funkcje

- **Dashboard** — przełącznik miesięcy, kafelki (wydatki w miesiącu / oszczędności w miesiącu / oszczędności łącznie), wykres wydatków wg kategorii, lista "Do zapłacenia"; kolejność sekcji można przeciągać.
- **Transakcje** — wydatki, przychody i historia zmian (audyt), z filtrami (rok / miesiąc / kategoria) i wyszukiwarką.
- **Podsumowanie** — tabela kategorie × miesiące, wykres trendu oszczędności, wykres trendu kategorii.
- **Ustawienia** — widoczność kafelków, zarządzanie kategoriami, eksport do Excela i backup bazy.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router, Turbopack) + React 19 + TypeScript
- [Prisma](https://www.prisma.io) 7 + Postgres (rozwijane z [Neon](https://neon.tech), darmowy plan)
- Tailwind CSS v4
- Recharts

## Uruchomienie od zera

1. **Baza danych** — załóż darmową bazę Postgres, np. na [neon.tech](https://neon.tech), i skopiuj connection string.
2. **Zmienne środowiskowe**
   ```bash
   cp .env.example .env
   # wklej DATABASE_URL do .env
   ```
3. **Instalacja i migracja**
   ```bash
   npm install
   npx prisma migrate deploy
   ```
4. **Start**
   ```bash
   npm run dev
   ```
   Aplikacja wystartuje na `http://localhost:3000`.

Baza startuje pusta — kategorie i transakcje dodajesz sam przez UI (zakładka Ustawienia → Kategorie, potem Transakcje → Dodaj).

## Wdrożenie

Aplikacja jest bezstanowa (poza bazą danych), więc nadaje się do wdrożenia na [Vercel](https://vercel.com):

```bash
npx vercel deploy --prod
```

Ustaw `DATABASE_URL` (produkcyjna baza) i opcjonalnie `APP_PASSWORD` (włącza ekran logowania) w zmiennych środowiskowych projektu na Vercel.
