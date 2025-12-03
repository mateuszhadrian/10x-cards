# Dokument wymagań produktu (PRD) - 10x-cards

## 1. Przegląd produktu

Cel produktu  
Umożliwić szybkie tworzenie wysokiej jakości fiszek edukacyjnych z wklejonego tekstu przy wsparciu AI, z prostym przeglądem, edycją podczas przeglądu i zapisem wyłącznie zaakceptowanych kart do jednej domyślnej talii użytkownika. MVP nie zawiera własnego algorytmu powtórek SRS, budujemy bazę zaakceptowanych kart i podstawowy lejek generacja → przegląd → akceptacja/odrzucenie → ewentualne ręczne uzupełnienie do limitu sesji.

Grupa docelowa  
Uczeni samodzielnie (uczniowie, studenci, profesjonaliści) korzystający z metody spaced repetition, zniechęceni czasochłonną, manualną produkcją fiszek.

Wartość dla użytkownika  
Oszczędność czasu (AI generuje do 30 kart na podstawie 1000–10000 znaków wejścia), mniejsza bariera rozpoczęcia nauki, jakość dzięki przeglądowi i możliwości edycji, jedno miejsce przechowywania zaakceptowanych kart.

Zakres MVP (skrót)  
- Generacja kart przez AI z wklejonego tekstu (1000–10000 znaków, maks. 30 kart).  
- Manualne dodawanie kart po przeglądzie.  
- Przegląd, edycja podczas przeglądu, akceptacja/odrzucenie kart.  
- Proste konto użytkownika i pojedyncza domyślna talia.  
- Zapis wyłącznie zaakceptowanych kart; stan przeglądu wyłącznie w kliencie.  
- Prosta telemetria i tygodniowa prezentacja metryki 75% (udział kart z AI w zaakceptowanych).

Definicje i skróty  
- Sesja (session): pojedynczy przepływ generacji i przeglądu kart. Jedna sesja → wiele fiszek.  
- Karta (flashcard): obiekt z front (≤200 znaków) i back (≤500 znaków), czysty tekst.  
- Źródło karty (source): ai_full (akceptowana bez zmian), ai_edited (zaakceptowana po edycji), manual (utworzona ręcznie).  
- Generacja (generation): wywołanie LLM w ramach sesji (metadane, modele, koszty); dotyczy tylko kart z AI.  
- Talia: jedna, domyślna na użytkownika (w MVP wszystkie zaakceptowane karty trafiają do jednej talii).

Założenia i zależności techniczne  
- Web (desktop first), logowanie przez Supabase Auth, przechowywanie w Supabase Postgres z RLS (Row Level Security).  
- Brak przechowywania pełnego wklejonego tekstu; zapisujemy hash i liczbę znaków wejścia.  
- Generacja synchroniczna z globalnym timeoutem 60 s.  
- Brak akcji zbiorczych w przeglądzie w MVP.  
- Integracja SRS odłożona po MVP (na etapie MVP budujemy bazę zaakceptowanych kart).

Wysokopoziomowy przepływ  
Wklej tekst → uruchom generację (≤60 s) → jeśli 0 wyników: komunikat i 1 retry → jeśli ≥1: przegląd kart (Akceptuj/Odrzuć/Edytuj) → zapis do bazy wyłącznie zaakceptowanych kart → po przeglądzie możliwość ręcznego dodania kart do łącznego limitu 50 w sesji → finalizacja sesji.


## 2. Problem użytkownika

Tworzenie fiszek jest skuteczne, ale ich ręczne przygotowanie jest czasochłonne i żmudne, przez co użytkownicy porzucają metodę SRS. Użytkownicy potrzebują narzędzia, które szybko przekształci ich materiały (notatki, konspekty, fragmenty książek) w solidny zestaw fiszek, a jednocześnie da im kontrolę jakości przez szybki przegląd i możliwość korekty. Kluczowe jest skrócenie czasu od materiału do gotowych fiszek oraz utrzymanie prywatności materiałów wejściowych.


## 3. Wymagania funkcjonalne

3.1. Uwierzytelnianie i autoryzacja  
- Logowanie i rejestracja przez Supabase Auth.  
- RLS zabezpiecza, że użytkownik widzi i modyfikuje wyłącznie swoje sesje i karty.  
- Wszystkie operacje API i zapisu muszą przechodzić walidację uprawnień.

3.2. Wejście i rozpoczęcie sesji  
- Pole wklejenia tekstu: minimalnie 1000 i maksymalnie 10000 znaków (licznik w UI).  
- Przycisk Generuj aktywny dopiero po spełnieniu limitów długości.  
- Jedno wywołanie generacji na sesję; generacja zwraca maksymalnie 30 kart.

3.3. Generacja kart przez AI  
- Generacja synchroniczna z globalnym timeoutem 60 s.  
- W przypadku 0 kart: komunikat, możliwość ponowienia 1 raz; po wykorzystaniu retry sugestia podmiany tekstu.  
- W przypadku ≥1 karty: przejście do widoku przeglądu.  
- Logujemy status, duration_ms, error_code (gdy dotyczy).

3.4. Przegląd kart  
- Dla każdej karty dostępne Akceptuj, Odrzuć, Edytuj.  
- Edycja możliwa wyłącznie w trakcie przeglądu; front ≤200 znaków, back ≤500 znaków (liczniki w UI, walidacja w API i RLS).  
- Akceptacja po edycji kwalifikuje kartę jako ai_edited.  
- Odrzucenie natychmiast usuwa kartę z widoku przeglądu.  
- Brak akcji zbiorczych w MVP.

3.5. Zapis i limity sesji  
- Wyłącznie zaakceptowane karty zapisujemy w bazie (AI lub manualne).  
- Limit sesji: maksymalnie 50 kart zaakceptowanych łącznie (AI + manual).  
- Blokada zapisu przy próbie przekroczenia limitu z czytelnym komunikatem w UI i błędem w API/RLS.

3.6. Ręczne dodawanie kart po przeglądzie  
- Po zakończonym przeglądzie użytkownik może dodać ręcznie brakujące karty, by łączna liczba w sesji nie przekroczyła 50.  
- Front/back jako czysty tekst, odpowiednio ≤200/≤500 znaków; walidacja w UI, API i RLS.  
- Zapisywane od razu po utworzeniu, source = manual.

3.7. Biblioteka kart  
- Widok biblioteki zaakceptowanych kart użytkownika (readonly w MVP).  
- Brak edycji ani usuwania kart w bibliotece w MVP.  
- Wszystkie zaakceptowane karty trafiają do jednej, domyślnej talii.

3.8. Metryki i telemetria  
- W sesji liczony udział kart ai_full + ai_edited we wszystkich zaakceptowanych (AI + manual).  
- Agregacja tygodniowa: informacja o spełnianiu celu 75% prezentowana raz na tydzień przy starcie nowej sesji.  
- Logowane: generated_cards, accepted_cards, podział źródeł, duration_ms, error_code.  
- Generations przechowują metadane LLM przypięte do session_id (model, parametry, tokeny, koszt, status); tylko dla kart AI.

3.9. Prywatność i dane wejściowe  
- Pełny tekst wejściowy nie jest przechowywany.  
- Zapisujemy hash wejścia i liczbę znaków.

3.10. Walidacje i komunikaty błędów  
- Limity znaków na froncie/back i wejściu egzekwowane w UI, API i RLS.  
- Przy blokadach jasne komunikaty w UI; API zwraca precyzyjne kody błędów.  
- Przy 0 wyników generacji: komunikat i 1 retry; po retry sugestia ponownego wklejenia nowego tekstu.

3.11. Wydajność i niezawodność  
- Generacja musi zakończyć się w ≤60 s (timeout).  
- Widok przeglądu responsywny dla 1–30 kart.  
- Brak akcji zbiorczych ogranicza ryzyko przeciążeń i złożoności.

3.12. Model danych (skrót)
- sessions: id, user_id, generated_cards, accepted_cards, duration_ms, status, error_code, input_hash, input_chars_count, created_at.  
- flashcards: id, session_id, front, back, source (ai_full|ai_edited|manual), accepted_at, last_edited_at, generation_id (null dla manual), created_at.  
- generations: id, session_id, model, params, prompt_tokens, completion_tokens, total_tokens, status, duration_ms, error_code, created_at.


## 4. Granice produktu

Poza zakresem MVP  
- Własny, zaawansowany algorytm SRS (np. SuperMemo, Anki).  
- Import wielu formatów (PDF, DOCX, itp.).  
- Współdzielenie zestawów między użytkownikami.  
- Integracje z zewnętrznymi platformami edukacyjnymi.  
- Aplikacje mobilne (start tylko web).  
- Akcje zbiorcze w przeglądzie.  
- Edycja/usuwanie kart w bibliotece (readonly w MVP).

Ograniczenia i decyzje architektoniczne  
- Jedna domyślna talia na użytkownika.  
- Sesja może zapisać maksymalnie 50 kart.  
- Wejście: wyłącznie wklejony tekst 1000–10000 znaków, jednorazowa generacja (≤30 kart) na sesję.

Kwestie do doprecyzowania po MVP  
- Telemetria i prywatność: retencja logów, docelowa anonimizacja, algorytm i solenie hashów oraz wersjonowanie.  
- Internationalizacja: język UI (PL/EN) i wsparcie treści wielojęzycznych.


## 5. Historyjki użytkowników

US-001  
Tytuł: Rejestracja i logowanie  
Opis: Jako użytkownik chcę się zarejestrować i zalogować, aby moje fiszki były bezpiecznie powiązane z moim kontem.  
Kryteria akceptacji:  
- Mogę stworzyć konto i zalogować się przez Supabase Auth.  
- Po zalogowaniu mam dostęp do tworzenia sesji i biblioteki kart.  
- Po wylogowaniu tracę dostęp do zasobów, które wymagają autoryzacji.

US-002  
Tytuł: Ochrona zasobów (RLS)  
Opis: Jako użytkownik chcę, aby moje sesje i karty były widoczne tylko dla mnie.  
Kryteria akceptacji:  
- Próba odczytu lub zapisu zasobów innych użytkowników jest blokowana przez RLS.  
- API zwraca błąd autoryzacji przy nieuprawnionym dostępie.  
- Widoki UI nie ujawniają danych innych użytkowników.

US-003  
Tytuł: Rozpoczęcie sesji i wklejenie tekstu  
Opis: Jako użytkownik chcę wkleić tekst wejściowy, aby wygenerować karty.  
Kryteria akceptacji:  
- Pole wejściowe pokazuje licznik znaków.  
- Przycisk Generuj jest aktywny tylko dla 1000–10000 znaków.  
- Po kliknięciu Generuj rozpoczyna się sesja i wywołanie AI.

US-004  
Tytuł: Walidacja długości wejścia  
Opis: Jako użytkownik chcę jasnych komunikatów, gdy długość wejścia jest poza zakresem.  
Kryteria akceptacji:  
- Dla <1000 lub >10000 znaków widzę informację o wymaganym zakresie.  
- Nie mogę uruchomić generacji, dopóki warunki nie zostaną spełnione.

US-005  
Tytuł: Generacja z limitem czasu 60 s  
Opis: Jako użytkownik chcę, aby generacja kończyła się w rozsądnym czasie albo dawała czytelny komunikat.  
Kryteria akceptacji:  
- Dla czasu >60 s widzę komunikat o przekroczeniu limitu i kod błędu.  
- Dla zakończenia <60 s przechodzę do kolejnego kroku (0 wyników lub przegląd).

US-006  
Tytuł: Zero wyników + jedno ponowienie  
Opis: Jako użytkownik, gdy generacja zwróci 0 kart, chcę móc spróbować raz ponownie.  
Kryteria akceptacji:  
- Widzę komunikat o 0 wyników i przycisk Spróbuj ponownie.  
- Mogę ponowić wyłącznie 1 raz.  
- Po wykorzystaniu retry widzę sugestię wklejenia nowego tekstu.

US-007  
Tytuł: Wynik częściowy/pełny → przegląd  
Opis: Jako użytkownik, gdy generacja zwróci ≥1 kartę (≤30), chcę przejść do przeglądu.  
Kryteria akceptacji:  
- Widzę listę 1–30 kart.  
- Każda karta ma akcje Akceptuj, Odrzuć, Edytuj.  
- Brak akcji zbiorczych.

US-008  
Tytuł: Akceptacja karty (ai_full)  
Opis: Jako użytkownik chcę zaakceptować kartę bez zmian, aby zapisać ją do mojej talii.  
Kryteria akceptacji:  
- Po kliknięciu Akceptuj karta znika z przeglądu.  
- Karta jest zapisana w bazie jako source = ai_full i przypisana do bieżącej sesji.  
- Licznik zaakceptowanych w sesji wzrasta.

US-009  
Tytuł: Odrzucenie karty  
Opis: Jako użytkownik chcę odrzucić kartę, aby nie trafiała do mojej talii.  
Kryteria akceptacji:  
- Po kliknięciu Odrzuć karta znika z przeglądu.  
- Karta nie jest zapisywana do bazy.  
- Licznik zaakceptowanych nie zmienia się.

US-010  
Tytuł: Edycja karty w przeglądzie  
Opis: Jako użytkownik chcę edytować front i back karty przed akceptacją.  
Kryteria akceptacji:  
- Przycisk Edytuj włącza tryb edycji tej karty.  
- W edycji widzę liczniki znaków i walidacje ≤200/≤500.  
- Po zapisaniu i akceptacji karta trafia do bazy jako source = ai_edited.

US-011  
Tytuł: Limit znaków karty  
Opis: Jako użytkownik chcę, by aplikacja pilnowała limitów front/back.  
Kryteria akceptacji:  
- Nie mogę zapisać/zaakceptować karty przekraczającej limity.  
- Widzę czytelny komunikat o przekroczeniu limitu.  
- API/RLS również egzekwuje limity przy zapisie.

US-012  
Tytuł: Limit sesji 50 kart łącznie  
Opis: Jako użytkownik chcę uniknąć przekroczenia limitu kart w sesji.  
Kryteria akceptacji:  
- Gdy próbuję zaakceptować lub dodać ręcznie >50, operacja jest blokowana.  
- Widzę komunikat o limicie sesji.  
- API i RLS odrzucają zapisy przekraczające limit.

US-013  
Tytuł: Ręczne dodawanie kart po przeglądzie  
Opis: Jako użytkownik chcę dodać brakujące karty ręcznie, aby uzupełnić sesję do 50.  
Kryteria akceptacji:  
- Mogę utworzyć kartę w formularzu z walidacjami ≤200/≤500.  
- Karta zapisuje się jako source = manual.  
- Nie mogę przekroczyć 50 kart w sesji.

US-014  
Tytuł: Finalizacja sesji  
Opis: Jako użytkownik chcę zakończyć sesję, aby wrócić do biblioteki.  
Kryteria akceptacji:  
- Po finalizacji sesja ma status zakończony.  
- Żadne kolejne zapisy w ramach sesji nie są możliwe.  
- Przechodzę do biblioteki kart.

US-015  
Tytuł: Biblioteka fiszek (readonly)  
Opis: Jako użytkownik chcę przeglądać moje zaakceptowane karty w bibliotece.  
Kryteria akceptacji:  
- Widzę listę wszystkich zaakceptowanych kart z różnych sesji.  
- Brak możliwości edycji ani usuwania w MVP.  
- Widok filtruje wyłącznie moje karty (RLS).

US-016  
Tytuł: Metryka 75% przy starcie tygodnia  
Opis: Jako użytkownik chcę raz na tydzień zobaczyć, czy spełniam cel 75% AI.  
Kryteria akceptacji:  
- Przy rozpoczęciu nowej sesji (raz na tydzień) widzę informację o spełnieniu/nie spełnieniu celu.  
- Metryka tygodniowa bazuje na wszystkich aktualnych fiszkach w aplikacji.  
- Informacja nie jest natrętna i można ją zamknąć.

US-017  
Tytuł: Obliczanie metryki w sesji  
Opis: Jako użytkownik chcę widzieć w sesji udział kart AI w zaakceptowanych.  
Kryteria akceptacji:  
- Udział = (ai_full + ai_edited) / (AI + manual) zaakceptowane w sesji.  
- Wartość jest aktualizowana po każdej akceptacji.  
- Udział jest zgodny z danymi zapisanymi w sesji.

US-018  
Tytuł: Nieprzechowywanie pełnego wejścia  
Opis: Jako użytkownik chcę, by pełen tekst wejściowy nie był przechowywany.  
Kryteria akceptacji:  
- System nie zapisuje wklejonej treści.  
- Zapisywany jest hash wejścia i liczba znaków.  
- W polityce prywatności jest to jasno opisane.

US-019  
Tytuł: Komunikaty o błędach i blokadach  
Opis: Jako użytkownik chcę jasnych komunikatów przy błędach i blokadach.  
Kryteria akceptacji:  
- Przekroczenie limitów znaków, limitu 50 kart i błędy autoryzacji są opisane czytelnie.  
- Komunikaty nie ujawniają danych wrażliwych.  
- API zwraca spójne kody błędów.

US-020  
Tytuł: Brak akcji zbiorczych w przeglądzie  
Opis: Jako użytkownik nie mogę wykonać zbiorczej akcji typu Akceptuj wszystkie.  
Kryteria akceptacji:  
- UI nie oferuje akcji zbiorczych.  
- API nie udostępnia endpointów do akceptacji masowej.  
- Test potwierdza brak możliwości akcji zbiorczej.

US-021  
Tytuł: Odporność na utratę stanu przeglądu  
Opis: Jako użytkownik chcę ostrzeżenia przed utratą stanu przeglądu.  
Kryteria akceptacji:  
- Przy próbie odświeżenia/wyjścia widzę ostrzeżenie o utracie lokalnego stanu.  
- Po potwierdzeniu mogę wyjść; stan przeglądu nie jest odzyskiwany (MVP).

US-023  
Tytuł: Limit 30 kart z AI w sesji  
Opis: Jako użytkownik chcę, by system nie tworzył >30 kart w pojedynczej generacji.  
Kryteria akceptacji:  
- Generacja zwraca maksymalnie 30 kart.  
- UI wyświetla co najwyżej 30 kart do przeglądu.  
- Kolejne wywołania generacji w tej samej sesji nie są dostępne w MVP.


## 6. Metryki sukcesu

Metryki produktu  
- Co najmniej 75% zaakceptowanych kart w sesji pochodzi z AI (ai_full + ai_edited) względem wszystkich zaakceptowanych (AI + manual) w sesji.  

Definicje i pomiar  
- Udział w sesji: (ai_full + ai_edited) / (ai_full + ai_edited + manual), liczony i przechowywany w kontekście sesji.   
- Telemetria: generated_cards, accepted_cards (z podziałem źródeł), duration_ms, error_code; bez przechowywania pełnego wejścia (hash + liczba znaków).

Wskaźniki techniczne i bezpieczeństwa  
- 100% zapytań do bazy objętych RLS.  
- 0 naruszeń izolacji danych między użytkownikami.  


