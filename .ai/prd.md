# Dokument wymagań produktu (PRD) - 10x Cards

## 1. Przegląd produktu
10x Cards to webowa aplikacja do szybkiego generowania i zarządzania fiszkami edukacyjnymi opartymi na metodzie spaced repetition. Produkt ma uprościć tworzenie wysokiej jakości fiszek poprzez konwersję wklejonego tekstu na gotowe karty, umożliwić ręczne uzupełnienia oraz przekazać zatwierdzone materiały do biblioteki SRS opartej na gotowym algorytmie powtórek. 

## 2. Problem użytkownika
- Manualne pisanie rozbudowanych fiszek jest czasochłonne i zniechęca do systematycznych powtórek.
- Brak prostych narzędzi, które pozwalają wkleić materiał źródłowy i otrzymać natychmiastowe, wartościowe fiszki, prowadzi do spadku adopcji metody spaced repetition.

## 3. Wymagania funkcjonalne
1. Generowanie fiszek przez AI
   - Wklejenie tekstu do 20 000 znaków w jednym polu z walidacją inline i komunikatami blokującymi przy przekroczeniu limitu.
   - Wywołanie modelu AI tworzącego do 50 fiszek na sesję (konfigurowalne), każda walidowana do 200 znaków frontu i 500 znaków backu.
   - Udane generacje logowane (user_id, timestamp, liczba fiszek, sesja_id, znaki wejściowe, liczba odrzuconych fiszek).
2. Manualne tworzenie i edycja
   - Formularz dodawania fiszek w tej samej sesji z tymi samymi limitami znaków i walidacją inline.
   - Łączny limit 100 fiszek (AI + manual) na sesję z blokadą dalszych akcji po osiągnięciu limitu i sugestią rozpoczęcia nowej sesji.
3. Recenzja i zarządzanie fiszkami
   - Jedno widokowe flow przeglądu wszystkich wygenerowanych fiszek z przyciskami zaakceptuj/edytuj/odrzuć.
   - Edycja blokuje równoległe akcje na tej fiszce do czasu zapisu, a odrzucone karty nie trafiają do dalszego etapu.
   - Możliwość podglądu, edycji i usuwania fiszek już zapisanych w bibliotece użytkownika.
4. Sesje i integracja z SRS
   - Każda sesja posiada identyfikator oraz stan (aktywna/zakończona).
   - Fiszki zaakceptowane lub edytowane trafiają do biblioteki SRS dopiero po kliknięciu zakończ sesję; przycisk jest nieaktywny, gdy brak zaakceptowanych lub dodanych fiszek.
5. Konta i bezpieczeństwo
   - Rejestracja z e-mailem, hasłem i imieniem; login z walidacją błędów.
   - Reset hasła poprzez e-mail (token czasowy) oraz ręcznie przez panel administratora.
   - Proste zarządzanie biblioteką użytkownika po zalogowaniu.
6. Panel administratora
   - Dostęp ograniczony do upoważnionych kont, logowanie każdej akcji resetu hasła.
   - Możliwość wyszukania użytkownika i zainicjowania ręcznego resetu.
7. Konfiguracja i limity
   - Centralne źródło prawdy dla limitów znaków, liczby fiszek i czasu sesji, rozpropagowane do frontu i backendu.
   - Komunikaty inline i blokady akcji przy przekroczeniu dowolnego limitu.

## 4. Granice produktu
- Algorytm powtórek wykorzystuje istniejące rozwiązanie open-source; brak budowy własnego odpowiednika SuperMemo/Anki w MVP.
- Brak importu plików (PDF, DOCX itp.) oraz brak eksportu; jedyną ścieżką wejścia jest pole tekstowe i formularz manualny.
- Brak kategorii, tagów, zaawansowanego formatowania tekstu oraz dashboardów statystyk w pierwszej wersji.
- Brak współdzielenia zestawów fiszek i integracji z innymi platformami edukacyjnymi.
- Brak aplikacji mobilnych; interfejs ograniczony do przeglądarki desktopowej i mobilnego webview o minimalnych optymalizacjach.
- Testy automatyczne i zaawansowana analityka poza zakresem startowym; dane opierają się na logach sesji i generacji.

## 5. Historyjki użytkowników
ID: US-001
Tytuł: Rejestracja konta
Opis: Jako nowy użytkownik chcę utworzyć konto poprzez podanie e-maila, hasła i imienia, aby móc zapisywać fiszki.
Kryteria akceptacji:
- Formularz waliduje poprawność e-maila i siłę hasła.
- Po udanej rejestracji użytkownik otrzymuje potwierdzenie i jest automatycznie zalogowany lub kierowany do logowania.
- Próba rejestracji istniejącego e-maila zwraca jasny komunikat błędu.

ID: US-002
Tytuł: Logowanie i bezpieczeństwo sesji
Opis: Jako użytkownik chcę zalogować się bezpiecznie, aby mieć dostęp do swoich fiszek i aktywnych sesji.
Kryteria akceptacji:
- Logowanie wymaga poprawnych danych; przy błędnych hasłach wyświetlany jest komunikat inline.
- Po zalogowaniu system odtwarza ostatnią aktywną sesję lub oferuje rozpoczęcie nowej.
- Sesje wygasają po ustalonym czasie bezczynności i wymagają ponownego logowania.

ID: US-003
Tytuł: Reset hasła przez e-mail
Opis: Jako użytkownik, który zapomniał hasła, chcę otrzymać link resetu na e-mail, aby odzyskać dostęp.
Kryteria akceptacji:
- Formularz resetu przyjmuje e-mail i weryfikuje jego istnienie w bazie.
- System wysyła wiadomość z czasowo ważnym linkiem, po którego użyciu można ustawić nowe hasło.
- Po udanej zmianie hasła użytkownik otrzymuje potwierdzenie i może się zalogować nowymi danymi.

ID: US-004
Tytuł: Ręczny reset hasła przez administratora
Opis: Jako administrator chcę móc zresetować hasło użytkownika z panelu, gdy użytkownik nie ma dostępu do e-maila.
Kryteria akceptacji:
- Dostęp do panelu wymaga uwierzytelnienia administracyjnego.
- Panel pozwala wyszukać użytkownika, wygenerować tymczasowe hasło lub link i zapisuje log z user_id, admin_id, timestamp.
- Każda akcja resetu wymaga potwierdzenia i jest rejestrowana w historii działań.

ID: US-005
Tytuł: Wklejenie tekstu i generacja fiszek AI
Opis: Jako użytkownik chcę wkleić materiał źródłowy (do 20 000 znaków) i otrzymać automatycznie wygenerowane fiszki.
Kryteria akceptacji:
- Pole tekstowe pokazuje licznik znaków i blokuje wklejenie powyżej limitu.
- Przyciski generuj są aktywne tylko, gdy tekst przechodzi walidację.
- System zwraca maksymalnie 50 fiszek na sesję i informuje o liczbie wygenerowanych kart.

ID: US-006
Tytuł: Recenzja AI fiszek
Opis: Jako użytkownik chcę przeglądać, edytować lub odrzucać każdą wygenerowaną fiszkę w jednym widoku, aby kontrolować jakość.
Kryteria akceptacji:
- Każda fiszka ma przyciski zaakceptuj, edytuj, odrzuć z jasnym stanem.
- Edycja waliduje 200/500 znaków; zapisywana fiszka przechodzi w stan zaakceptowana.
- Tylko zaakceptowane lub edytowane fiszki mogą trafić do biblioteki; odrzucone są oznaczone i nie eksportują się.

ID: US-007
Tytuł: Manualne dodawanie fiszek
Opis: Jako użytkownik chcę ręcznie dodać własne fiszki podczas sesji, aby uzupełnić brakujące informacje.
Kryteria akceptacji:
- Formularz manualny dostępny w tej samej sesji co AI i używa tej samej walidacji znaków.
- Dodane fiszki zwiększają licznik sesji i podlegają limitowi 100 kart.
- Użytkownik może edytować lub usuwać manualne fiszki przed zakończeniem sesji.

ID: US-008
Tytuł: Monitorowanie limitów i komunikaty blokujące
Opis: Jako użytkownik chcę widzieć aktualne wykorzystanie limitów znaków, czasu i liczby fiszek, aby uniknąć utraty pracy.
Kryteria akceptacji:
- Interfejs pokazuje liczniki (znaki, fiszki AI, fiszki manualne, czas sesji) i ostrzeżenia przy 80% limitu.
- Po osiągnięciu limitu akcja (kolejna generacja lub dodanie fiszki) jest zablokowana z komunikatem sugerującym nową sesję.
- Przekroczenia są zapisywane w logach jako metryka pomocnicza.

ID: US-009
Tytuł: Zakończenie sesji i eksport do SRS
Opis: Jako użytkownik chcę jednym kliknięciem zakończyć sesję i wysłać zaakceptowane fiszki do biblioteki SRS.
Kryteria akceptacji:
- Przycisk zakończ sesję jest aktywny tylko, gdy istnieje co najmniej jedna zaakceptowana lub manualna fiszka.
- Po potwierdzeniu system przenosi wszystkie kwalifikujące się fiszki i oznacza sesję jako zakończoną.
- Użytkownik otrzymuje podsumowanie: liczba fiszek, czas trwania, status eksportu.

ID: US-010
Tytuł: Zarządzanie biblioteką fiszek
Opis: Jako użytkownik chcę przeglądać, edytować i usuwać zapisane fiszki, aby utrzymać bibliotekę w aktualnym stanie.
Kryteria akceptacji:
- Biblioteka listuje fiszki z możliwością filtrowania według sesji lub daty utworzenia.
- Edytowane fiszki zachowują historię zmian i ponownie przechodzą walidację znaków.
- Usunięte fiszki znikają z algorytmu SRS i są oznaczane w logach.

ID: US-012
Tytuł: Raportowanie sesji i generacji
Opis: Jako właściciel produktu chcę mieć dostęp do logów generacji, aby mierzyć KPI (akceptacja i udział AI).
Kryteria akceptacji:
- Każda udana generacja zapisuje user_id, sesja_id, timestamp, liczba fiszek, typ (AI/manual), liczbę znaków wejściowych i liczbę fiszek odrzuconych.
- Dane są dostępne w panelu administracyjnym lub eksportowane do narzędzia analitycznego w prostym formacie.
- Raport pozwala filtrować po przedziałach czasu i użytkownikach.

## 6. Metryki sukcesu
- Co najmniej 75% fiszek wygenerowanych przez AI zostaje zaakceptowanych lub po edycji trafia do biblioteki SRS.
- Co najmniej 75% wszystkich fiszek wytwarzanych w aplikacji pochodzi z generacji AI.
- Średni czas od wklejenia tekstu do zakończenia sesji jest krótszy niż 10 minut dla 80% użytkowników.

