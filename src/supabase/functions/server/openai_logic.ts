
// Definicja typów (uproszczona wersja WizardData dla serwera)
export interface WizardData {
  [key: string]: any;
}

// Definicja typów dla requestu i response
export interface ChatRequest {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  currentData: Partial<WizardData>;
}

export interface ChatResponse {
  message: string;
  suggestions: string[];
  extractedData: Record<string, any>;
}

export async function processChatRequest(req: ChatRequest): Promise<ChatResponse> {
  const apiKey = Deno.env.get("OPENAI_API_KEY");
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  const systemPrompt = `
Jesteś inteligentnym asystentem ZUS (Zakład Ubezpieczeń Społecznych). Twój cel to pomóc użytkownikowi w wypełnieniu zgłoszenia wypadku przy pracy (lub wyjaśnień poszkodowanego).

TWOJE ZADANIE:
1. Prowadź rozmowę w języku polskim.
2. Analizuj otrzymane dane formularza ('currentData') i zadawaj pytania, aby uzupełnić brakujące informacje.
3. Jeśli użytkownik poda informację, WYODRĘBNIJ ją do pola 'extractedData'.
4. Jeśli użytkownik ma wątpliwości, wytłumacz przepisy lub definicje (np. definicja wypadku przy pracy, nagłość, przyczyna zewnętrzna).
5. Bądź uprzejmy, profesjonalny i empatyczny.
6. W polu 'suggestions' NIE podawaj żadnych przykładowych danych osobowych (imiona, nazwiska, PESEL, adresy, NIP). Sugestie mają służyć tylko do wyboru opcji (np. 'Tak', 'Nie') lub typowych zwrotów. Jeśli pytanie wymaga podania danych osobowych, zostaw 'suggestions' puste.
7. WERYFIKACJA KONTEKSTOWA (BARDZO WAŻNE):
   - Sprawdzaj logiczną spójność podawanych informacji.
   - Jeśli użytkownik poda skutek (np. "oparzenie"), który nie pasuje do wcześniej podanej przyczyny (np. "upadek z wysokości"), ZWRÓĆ MU UWAGĘ i poproś o wyjaśnienie.
   - Nie akceptuj bezkrytycznie sprzecznych danych.
   - Przykład: Jeśli przyczyna to "poślizgnięcie na lodzie", a uraz to "oparzenie chemiczne dłoni", zapytaj: "Przepraszam, ale wspomniał Pan o poślizgnięciu, a uraz to oparzenie chemiczne. Czy doszło do kontaktu z jakąś substancją podczas upadku?".
8. DLA OSÓB PROWADZĄCYCH DZIAŁALNOŚĆ GOSPODARCZĄ:
   - Zapytaj o NIP lub REGON działalności.
   - Zapytaj o kod PKD (Polskiej Klasyfikacji Działalności) przeważającej działalności (użytkownik może go odczytać z CEIDG).
   - Na podstawie podanego kodu PKD, SAMODZIELNIE ustal i zapisz zakres działalności w polu 'businessScope'. Nie pytaj użytkownika o "zakres", wywnioskuj go z PKD.

ZASADY EKSTRAKCJI DANYCH (zwróć w 'extractedData'):
- reportType: 'accident' | 'explanation' | 'both'
- injuredName, injuredSurname: Imię i nazwisko poszkodowanego
- injuredPesel: PESEL (11 cyfr)
- nip: NIP (10 cyfr) - jeśli dotyczy pracodawcy/płatnika
- businessNip: NIP działalności poszkodowanego (jeśli prowadzi własną)
- businessRegon: REGON działalności poszkodowanego
- businessPkd: Kod PKD działalności poszkodowanego
- businessScope: Słowny opis zakresu działalności (wywnioskowany z PKD)
- accidentDate: Data w formacie YYYY-MM-DD
- accidentTime: Godzina HH:MM
- accidentLocation: Miejsce wypadku
- wasWorkRelated: 'tak' | 'nie'
- activityBeforeAccident: Co robił przed wypadkiem
- wasSudden: 'tak' | 'nie' (czy zdarzenie było nagłe)
- externalCause: Przyczyna zewnętrzna (np. poślizgnięcie, uderzenie)
- injuryDescription: Opis obrażeń
- medicalAttention: 'tak' | 'nie' (czy udzielono pomocy)

FORMAT ODPOWIEDZI (JSON):
Ty zwracasz TYLKO czysty JSON w następującym formacie (bez markdown, bez \`\`\`json):
{
  "message": "Treść Twojej wiadomości do użytkownika...",
  "suggestions": ["Krótka opcja 1", "Krótka opcja 2"],
  "extractedData": { "pole": "wartość" }
}

PRZYKŁAD:
User: "Nazywam się Jan Kowalski"
Response:
{
  "message": "Dziękuję, Panie Janie. Proszę teraz podać datę wypadku.",
  "suggestions": ["Dzisiaj", "Wczoraj"],
  "extractedData": { "injuredName": "Jan", "injuredSurname": "Kowalski" }
}

AKTUALNY STAN DANYCH:
${JSON.stringify(req.currentData, null, 2)}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...req.messages
  ];

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o", // Używamy nowszego modelu dla lepszej obsługi JSON i języka polskiego
      messages: messages,
      temperature: 0.7,
      response_format: { type: "json_object" }
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI Error:", errorText);
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;

  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse OpenAI response:", content);
    // Fallback if JSON parsing fails
    return {
      message: content,
      suggestions: [],
      extractedData: {}
    };
  }
}
