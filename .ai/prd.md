# Dokument wymagań produktu (PRD) - 10x-cards

## 1. Przegląd produktu

Produkt 10x-cards to aplikacja webowa umożliwiająca automatyczne generowanie fiszek edukacyjnych przy użyciu sztucznej inteligencji, z możliwością ich ręcznego tworzenia oraz przeglądania. System umożliwia użytkownikom logowanie (oparte na Supabase), wprowadzanie tekstu spełniającego określone kryteria (1000-10000 znaków), automatyczną generację od 1 do 30 fiszek na żądanie oraz ich recenzję. Fiszki po zatwierdzeniu są zapisywane w globalnej liście.

## 2. Problem użytkownika

Użytkownicy często rezygnują z manualnego tworzenia fiszek edukacyjnych ze względu na wysoki nakład pracy i czasochłonność. Brak efektywnego procesu generowania fiszek obniża motywację do nauki i korzystania z metody spaced repetition. Automatyczne generowanie fiszek przez AI ma na celu rozwiązanie tego problemu, umożliwiając szybsze i bardziej efektywne uczenie się.

## 3. Wymagania funkcjonalne

1. Automatyczne generowanie fiszek przez AI:
   - Użytkownik wprowadza tekst (1000-10000 znaków), który po pozytywnej walidacji jest przetwarzany przez AI.
   - AI generuje od 1 do 30 fiszek, każda zawiera:
     - front: 1-200 znaków
     - back: 1-500 znaków
     - source: informacja o pochodzeniu tekstu
     - inne pola: id, created_at, updated_at, generation_id, user_id
   - W przypadku nieudanego generowania (np. 0 fiszek) wyświetla się komunikat Nie udało się wygenerować fiszek.

2. Ręczne tworzenie fiszek:
   - Użytkownik może tworzyć fiszki ręcznie poprzez interfejs umożliwiający wprowadzenie front oraz back z określonymi ograniczeniami znakowymi.
   - Walidacja pól odbywa się zarówno po stronie UI, API, jak i na poziomie RLS w bazie danych.

3. Przeglądanie i recenzja:
   - Po generacji fiszki trafiają do trybu recenzji, gdzie użytkownik może:
     a) ZAAKCEPTOWAĆ fiszkę - zapisanie do bazy danych
     b) ODRZUCIĆ fiszkę - natychmiastowe usunięcie
     c) EDYTOWAĆ fiszkę - edycja możliwa tylko przed zatwierdzeniem (po zatwierdzeniu, edycja nie jest dostępna)

4. System kont użytkowników:
   - Użytkownicy logują się za pomocą Supabase.
   - Każdy użytkownik zarządza swoimi fiszkami w globalnej liście (bez podziału na talie lub kategorie).

5. Walidacja wejściowego tekstu:
   - Tekst musi mieć od 1000 do 10000 znaków.
   - Walidacja odbywa się na poziomie interfejsu użytkownika, API i poprzez zasady RLS w bazie danych.

## 4. Granice produktu

1. Nie wchodzi w zakres MVP:
   - Własny, zaawansowany algorytm powtórek (np. SuperMemo, Anki).
   - Import plików w formatach PDF, DOCX itp.
   - Współdzielenie zestawów fiszek między użytkownikami.
   - Integracje z innymi platformami edukacyjnymi.
   - Aplikacje mobilne – na początek tylko wersja webowa.
   - Mierzenie zużycia tokenów oraz dodatkowych metryk związanych z AI.

## 5. Historyjki użytkowników

### US-001: Autentykacja użytkownika
- Tytuł: Logowanie przez Supabase
- Opis: Użytkownik loguje się do systemu za pomocą autentykacji opartej na Supabase, co umożliwia zarządzanie osobistymi fiszkami i zapewnia bezpieczeństwo danych.
- Kryteria akceptacji:
  - Użytkownik musi móc zarejestrować i zalogować się przy użyciu email i hasła.
  - Uwierzytelnianie odbywa się zgodnie z mechanizmem Supabase.
  - Nie dopuszcza się logowania społecznościowego.

### US-002: Walidacja wejściowego tekstu
- Tytuł: Wprowadzanie tekstu do generacji fiszek
- Opis: Użytkownik wprowadza tekst, który zostanie użyty do generacji fiszek. Tekst musi spełniać kryteria długości (od 1000 do 10000 znaków).
- Kryteria akceptacji:
  - System wyświetla informację o błędzie, jeśli tekst jest krótszy niż 1000 lub dłuższy niż 10000 znaków.
  - Walidacja odbywa się na poziomie UI, API oraz przez zasady RLS.

### US-003: Generacja fiszek przez AI
- Tytuł: Automatyczne generowanie fiszek
- Opis: Użytkownik po zatwierdzeniu prawidłowego tekstu inicjuje proces generowania fiszek przez AI, które generuje od 1 do 30 fiszek.
- Kryteria akceptacji:
  - AI generuje minimalnie 1 i maksymalnie 30 fiszek na jedno żądanie.
  - Każda fiszka zawiera pola 'front' (1-200 znaków), 'back' (1-500 znaków), 'source' oraz metadane (id, created_at, updated_at, generation_id, user_id).
  - W przypadku braku wygenerowanych fiszek system wyświetla komunikat Nie udało się wygenerować fiszek.

### US-004: Ręczne tworzenie fiszek
- Tytuł: Manualne dodawanie fiszek
- Opis: Użytkownik może ręcznie stworzyć fiszkę poprzez wprowadzenie treści dla pól 'front' oraz 'back' z określonymi limitami znakowymi.
- Kryteria akceptacji:
  - Pole 'front' musi zawierać od 1 do 200 znaków.
  - Pole 'back' musi zawierać od 1 do 500 znaków.
  - Fiszka jest zapisywana tylko po pozytywnej walidacji.

### US-005: Recenzja fiszek
- Tytuł: Przegląd i recenzja fiszek
- Opis: Po wygenerowaniu fiszek użytkownik przegląda je w interfejsie recenzji, gdzie dla każdej fiszki dostępne są trzy opcje: ZAAKCEPTUJ, ODRZUĆ, EDYTUJ (edycja możliwa przed zatwierdzeniem).
- Kryteria akceptacji:
  - Użytkownik widzi listę wygenerowanych fiszek.
  - Dla każdej fiszki dostępne są przyciski: ZAAKCEPTUJ (zapis do bazy), ODRZUĆ (natychmiastowe usunięcie), EDYTUJ (umożliwia korektę przed zatwierdzeniem).
  - Po zatwierdzeniu, edycja fiszki nie jest już dostępna.

### US-006: Zarządzanie fiszkami
- Tytuł: Przeglądanie i zarządzanie zapisanmi fiszkami
- Opis: Użytkownik przegląda wszystkie zapisane fiszki w globalnej liście oraz ma możliwość ich usunięcia, jeśli zajdzie taka potrzeba.
- Kryteria akceptacji:
  - Użytkownik widzi listę wszystkich swoich fiszek.
  - Użytkownik może usunąć fiszkę, co powoduje natychmiastowe jej usunięcie z bazy danych.

## 6. Metryki sukcesu

- 75% generowanych fiszek przez AI musi być akceptowanych przez użytkowników.
- Co najmniej 75% fiszek tworzonych przez użytkowników musi pochodzić z generacji AI.
- Średni czas recenzji fiszek powinien być optymalny, aby zapewnić płynność procesu nauki.
- Walidacja wejściowego tekstu i limitów ilościowych musi być przestrzegana na wszystkich warstwach aplikacji (UI, API, RLS).

