# Ekspert ZUS – Inteligentny Asystent Zgłoszeń Wypadkowych
### HackNation 2025 – Etap I

**🔗 Wersja online (Demo):** [https://fray-campus-59931131.figma.site/](https://fray-campus-59931131.figma.site/)

---

## 🎯 Cel projektu
Aplikacja "Ekspert ZUS" to narzędzie wspierające osoby prowadzące pozarolniczą działalność gospodarczą w skomplikowanym procesie zgłaszania wypadków przy pracy. System pełni rolę **wirtualnego urzędnika**, który prowadzi użytkownika "za rękę", weryfikuje poprawność danych w czasie rzeczywistym i edukuje w zakresie wymogów prawnych.

---

## ✅ Realizacja wymagań (Compliance Matrix)

Nasz system spełnia wszystkie założenia opisane w wymaganiach I etapu:

### 1. Przyjmowanie zgłoszeń i wyjaśnień
*   **Wymóg:** Obsługa zawiadomienia o wypadku oraz wyjaśnień poszkodowanego (łącznie lub osobno).
*   **Realizacja:** Na startowym ekranie użytkownik wybiera tryb: "Zgłoszenie wypadku", "Wyjaśnienia poszkodowanego" lub "Kompleksowy pakiet". Kreator dostosowuje liczbę kroków do wyboru.

### 2. Pobieranie danych firmy (CEIDG/GUS) i analiza PKD
*   **Wymóg:** Samodzielne ustalanie zakresu działalności na podstawie NIP/REGON.
*   **Realizacja:** Zintegrowaliśmy system z bazami **CEIDG/GUS**. Po wpisaniu NIP, system automatycznie pobiera dane firmy oraz **kod PKD**.
*   **Inteligentna analiza:** Asystent AI analizuje opis wypadku w kontekście pobranego kodu PKD, aby zweryfikować "związek z pracą" (np. czy wypadek budowlany ma sens przy PKD usług IT).

### 3. Weryfikacja "4 Filarów Wypadku"
*   **Wymóg:** Prowadzenie użytkownika tak, aby uzyskać informacje niezbędne do oceny (nagłość, przyczyna zewnętrzna, uraz, związek z pracą).
*   **Realizacja:** Chatbot oraz formularz dynamicznie pytają o te elementy. Jeśli użytkownik pominie np. przyczynę zewnętrzną, system dopyta o nią, zanim pozwoli przejść dalej.

### 4. Analiza braków i "Miękka Walidacja"
*   **Wymóg:** Wskazywanie brakujących elementów i dokumentów.
*   **Realizacja:**
    *   System pozwala na pracę z niepełnymi danymi (opcja **"Uzupełnij później"**), co jest kluczowe w stresującej sytuacji.
    *   Na ekranie końcowym generowany jest raport braków (np. "Brak PESEL", "Brak dokładnej godziny"), które należy uzupełnić przed wysyłką do ZUS.

### 5. Drzewo przyczyn i sekwencja zdarzeń
*   **Wymóg:** Pomoc w ustaleniu sekwencji zdarzeń i przyczyn.
*   **Realizacja:** Dedykowany krok "Przebieg wypadku" pozwala dodawać zdarzenia chronologicznie (Co robiłeś przed? -> Co się stało? -> Skutek). AI pomaga sformułować opis przyczynowo-skutkowy.

### 6. Pełnomocnictwa
*   **Wymóg:** Wykrywanie zgłoszeń przez pełnomocnika.
*   **Realizacja:** Jeśli użytkownik zaznaczy opcję "Zgłaszam jako pełnomocnik", system weryfikuje posiadanie dokumentu i automatycznie dodaje "Pełnomocnictwo" do listy wymaganych załączników.

### 7. Finalizacja i edukacja
*   **Wymóg:** Generowanie dokumentów, lista załączników, instrukcja wysyłki (PUE/eZUS).
*   **Realizacja:**
    *   System generuje gotowy plik **PDF** (Zawiadomienie/Wyjaśnienia).
    *   Wyświetla spersonalizowaną checklistę załączników (np. "Dokumentacja medyczna", "Zaświadczenie o niezdolności do pracy").
    *   Instruuje o konieczności podpisu i wysyłki przez PUE ZUS.

---

## 🚀 Instrukcja dla Jury (Symulacja)

Aby sprawdzić działanie systemu, polecamy przejście następującej ścieżki (tzw. Happy Path):

1.  **Start:** Wejdź na [https://fray-campus-59931131.figma.site/](https://fray-campus-59931131.figma.site/).
2.  **Wybór:** Kliknij "Rozpocznij nowe zgłoszenie" -> Wybierz "Zawiadomienie o wypadku".
3.  **Dane firmy:**
    *   Wpisz testowy NIP (możesz użyć dowolnego, np. `1234567890` lub skorzystać z prawdziwego).
    *   Kliknij **"Pobierz dane z CEIDG"**. Zobacz, jak system uzupełnia nazwę i PKD.
4.  **Asystent AI (Opcjonalnie):**
    *   Możesz przełączyć się na zakładkę **"Asystent"** i opisać wypadek własnymi słowami (np. *"Spadłem z drabiny podczas malowania ściany u klienta"*).
    *   Zobacz, jak AI analizuje Twoją wypowiedź pod kątem 4 filarów.
5.  **Formularz:**
    *   Przejdź przez kolejne kroki formularza.
    *   W sekcji "Dane poszkodowanego" spróbuj użyć opcji **"Uzupełnij później"** przy numerze PESEL, aby przetestować walidację końcową.
6.  **Finał:**
    *   Na ekranie podsumowania ("Przegląd dokumentu") zweryfikuj dane.
    *   W kroku końcowym ("Zakończenie") zobaczysz:
        *   Status zapisu zgłoszenia w systemie.
        *   Ostrzeżenie o brakującym numerze PESEL (jeśli go pominąłeś).
        *   Przycisk **"Pobierz PDF"**.

---

## 🛠️ Technologie
*   **Frontend:** React, Tailwind CSS (Design System zgodny z ZUS/Gov.pl)
*   **Backend:** Supabase (Edge Functions)
*   **AI:** OpenAI (Logic guardrails zapobiegające halucynacjom)
*   **Integracje:** API CEIDG/GUS, PDF-Lib generator

---
*Projekt przygotowany na HackNation 2025.*
