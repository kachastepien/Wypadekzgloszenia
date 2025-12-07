import { WizardData } from './WizardContext';

export interface ChatMessage {
  id: string;
  role: 'bot' | 'user';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  data?: Record<string, any>;
}

interface BotResponse {
  message: string;
  suggestions?: string[];
  nextQuestion: number;
  data?: Record<string, any>;
  isComplete?: boolean;
}

// Logika chatbota - inteligentne przetwarzanie odpowiedzi
export const chatbotLogic = {
  processUserResponse(
    userInput: string,
    currentQuestion: number,
    data: WizardData,
    updateData: (updates: Partial<WizardData>) => void
  ): BotResponse {
    const input = userInput.toLowerCase().trim();

    switch (currentQuestion) {
      // Pytanie 0: Rodzaj zgłoszenia
      case 0:
        return this.handleReportType(input, data, updateData);

      // Pytanie 1: Czy jesteś pełnomocnikiem?
      case 1:
        return this.handleProxyQuestion(input, data, updateData);

      // Pytanie 2: Dane pełnomocnika (jeśli tak)
      case 2:
        return this.handleProxyData(input, data, updateData);

      // Pytanie 3: Imię poszkodowanego
      case 3:
        return this.handleFirstName(input, data, updateData);

      // Pytanie 4: Nazwisko poszkodowanego
      case 4:
        return this.handleLastName(input, data, updateData);

      // Pytanie 5: PESEL
      case 5:
        return this.handlePesel(input, data, updateData);

      // Pytanie 6: Email (opcjonalny)
      case 6:
        return this.handleEmail(input, data, updateData);

      // Pytanie 7: NIP
      case 7:
        return this.handleNip(input, data, updateData);

      // Pytanie 8: Data wypadku
      case 8:
        return this.handleAccidentDate(input, data, updateData);

      // Pytanie 9: Godzina wypadku
      case 9:
        return this.handleAccidentTime(input, data, updateData);

      // Pytanie 10: Miejsce wypadku
      case 10:
        return this.handleAccidentLocation(input, data, updateData);

      // Pytanie 11: Czy związane z pracą?
      case 11:
        return this.handleWorkRelated(input, data, updateData);

      // Pytanie 12: Co robiłeś przed wypadkiem?
      case 12:
        return this.handleActivityBefore(input, data, updateData);

      // Pytanie 13: Czy nagłe?
      case 13:
        return this.handleSuddenness(input, data, updateData);

      // Pytanie 14: Przebieg wypadku
      case 14:
        return this.handleAccidentSequence(input, data, updateData);

      // Pytanie 15: Przyczyna zewnętrzna
      case 15:
        return this.handleExternalCause(input, data, updateData);

      // Pytanie 16: Szczegóły przyczyny
      case 16:
        return this.handleCauseDetails(input, data, updateData);

      // Pytanie 17: Rodzaj obrażenia
      case 17:
        return this.handleInjuryType(input, data, updateData);

      // Pytanie 18: Lokalizacja urazu
      case 18:
        return this.handleInjuryLocation(input, data, updateData);

      // Pytanie 19: Opis obrażeń
      case 19:
        return this.handleInjuryDescription(input, data, updateData);

      // Pytanie 20: Pomoc medyczna
      case 20:
        return this.handleMedicalAttention(input, data, updateData);

      // Pytanie 21: Koniec
      case 21:
        return this.handleCompletion(input, data, updateData);

      default:
        return {
          message: 'Przepraszam, coś poszło nie tak. Spróbujmy od nowa.',
          nextQuestion: 0,
        };
    }
  },

  handleReportType(input: string, data: WizardData, updateData: any): BotResponse {
    let reportType: 'accident' | 'explanation' | 'both' | null = null;

    if (input.includes('1') || input.includes('zawiadomienie')) {
      reportType = 'accident';
    } else if (input.includes('2') || input.includes('wyjaśnienia') || input.includes('wyjasnienia')) {
      reportType = 'explanation';
    } else if (input.includes('3') || input.includes('oba') || input.includes('obie')) {
      reportType = 'both';
    }

    if (reportType) {
      updateData({ reportType });
      return {
        message: `Świetnie! Przygotujemy dla Ciebie ${
          reportType === 'accident' ? 'zawiadomienie o wypadku' :
          reportType === 'explanation' ? 'wyjaśnienia poszkodowanego' :
          'zawiadomienie i wyjaśnienia'
        }.\n\nTeraz kilka pytań o Ciebie. Czy zgłaszasz wypadek w imieniu poszkodowanego jako pełnomocnik?`,
        suggestions: ['Tak, jestem pełnomocnikiem', 'Nie, zgłaszam swój wypadek'],
        nextQuestion: 1,
        data: { 'Rodzaj zgłoszenia': reportType },
      };
    }

    return {
      message: 'Nie zrozumiałem. Wybierz proszę jedną z opcji:\n1️⃣ Zawiadomienie o wypadku\n2️⃣ Wyjaśnienia poszkodowanego\n3️⃣ Oba dokumenty',
      suggestions: ['Zawiadomienie o wypadku', 'Wyjaśnienia poszkodowanego', 'Oba dokumenty'],
      nextQuestion: 0,
    };
  },

  handleProxyQuestion(input: string, data: WizardData, updateData: any): BotResponse {
    const isProxy = input.includes('tak') || input.includes('pełnomocnik') || input.includes('pelnomocnik');
    
    updateData({ isProxy });

    if (isProxy) {
      return {
        message: 'Rozumiem. Potrzebuję Twoich danych jako pełnomocnika.\n\nPodaj proszę swoje imię i nazwisko (np. Jan Kowalski):',
        nextQuestion: 2,
      };
    }

    return {
      message: 'W porządku. Przejdźmy do Twoich danych osobowych.\n\nJak masz na imię?',
      nextQuestion: 3,
    };
  },

  handleProxyData(input: string, data: WizardData, updateData: any): BotResponse {
    const nameParts = input.split(' ').filter(p => p.length > 0);
    
    if (nameParts.length >= 2) {
      updateData({ proxyName: input });
      return {
        message: `Dziękuję, ${input}.\n\n⚠️ Pamiętaj, że będziesz musiał dostarczyć pełnomocnictwo (oryginał lub urzędowo poświadczony odpis).\n\nTeraz dane poszkodowanego. Jak ma na imię poszkodowany?`,
        nextQuestion: 3,
        data: { 'Pełnomocnik': input },
      };
    }

    return {
      message: 'Podaj proszę pełne imię i nazwisko (np. Jan Kowalski):',
      nextQuestion: 2,
    };
  },

  handleFirstName(input: string, data: WizardData, updateData: any): BotResponse {
    const name = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    updateData({ injuredName: name });

    return {
      message: `Cześć ${name}! 👋\n\nJakie jest Twoje nazwisko?`,
      nextQuestion: 4,
      data: { 'Imię': name },
    };
  },

  handleLastName(input: string, data: WizardData, updateData: any): BotResponse {
    const surname = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    updateData({ injuredSurname: surname });

    return {
      message: `${data.injuredName} ${surname}, miło Cię poznać.\n\nPodaj proszę swój numer PESEL (11 cyfr):`,
      nextQuestion: 5,
      data: { 'Nazwisko': surname },
    };
  },

  handlePesel(input: string, data: WizardData, updateData: any): BotResponse {
    const pesel = input.replace(/\s/g, '');
    
    if (/^\d{11}$/.test(pesel)) {
      updateData({ injuredPesel: pesel });
      return {
        message: 'Świetnie! PESEL zapisany ✓\n\nPodaj jeszcze swój adres email (lub napisz "pomiń" jeśli nie chcesz podawać):',
        suggestions: ['Pomiń'],
        nextQuestion: 6,
        data: { 'PESEL': pesel },
      };
    }

    return {
      message: 'PESEL musi składać się z 11 cyfr. Spróbuj ponownie:',
      nextQuestion: 5,
    };
  },

  handleEmail(input: string, data: WizardData, updateData: any): BotResponse {
    if (input.includes('pomiń') || input.includes('pomin') || input.includes('nie')) {
      updateData({ injuredEmail: '' });
      return {
        message: 'Okej, pomijamy email.\n\nTeraz dane Twojej działalności gospodarczej. Podaj NIP (10 cyfr):',
        nextQuestion: 7,
      };
    }

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)) {
      updateData({ injuredEmail: input });
      return {
        message: 'Email zapisany! 📧\n\nTeraz dane Twojej działalności gospodarczej. Podaj NIP (10 cyfr):',
        nextQuestion: 7,
        data: { 'Email': input },
      };
    }

    return {
      message: 'To nie wygląda na prawidłowy email. Spróbuj ponownie lub napisz "pomiń":',
      suggestions: ['Pomiń'],
      nextQuestion: 6,
    };
  },

  handleNip(input: string, data: WizardData, updateData: any): BotResponse {
    const nip = input.replace(/[-\s]/g, '');
    
    if (/^\d{10}$/.test(nip)) {
      // Mock - symulacja pobrania danych z CEIDG
      const mockBusinessData = {
        businessName: `P.H.U. "${data.injuredSurname || 'FIRMA'}" ${data.injuredName || ''} ${data.injuredSurname || ''}`,
        businessAddress: 'ul. Przykładowa 123, 00-001 Warszawa',
        pkdCode: '62.01',
        pkdDescription: 'Działalność związana z oprogramowaniem',
      };

      updateData({
        nip,
        ...mockBusinessData,
      });

      return {
        message: `Świetnie! Znalazłem Twoją działalność w CEIDG 🔍\n\n✅ ${mockBusinessData.businessName}\n✅ ${mockBusinessData.businessAddress}\n✅ PKD: ${mockBusinessData.pkdCode} - ${mockBusinessData.pkdDescription}\n\nTeraz przejdźmy do szczegółów wypadku. Kiedy dokładnie miał miejsce wypadek? Podaj datę (np. 2025-12-06 lub 6 grudnia 2025):`,
        nextQuestion: 8,
        data: { 
          'NIP': nip,
          'Działalność': mockBusinessData.businessName,
        },
      };
    }

    return {
      message: 'NIP musi składać się z 10 cyfr. Spróbuj ponownie:',
      nextQuestion: 7,
    };
  },

  handleAccidentDate(input: string, data: WizardData, updateData: any): BotResponse {
    // Prosta parsowanie daty
    let date = '';
    
    if (/\d{4}-\d{2}-\d{2}/.test(input)) {
      date = input.match(/\d{4}-\d{2}-\d{2}/)?.[0] || '';
    } else if (/\d{2}\.\d{2}\.\d{4}/.test(input)) {
      const parts = input.match(/(\d{2})\.(\d{2})\.(\d{4})/);
      if (parts) date = `${parts[3]}-${parts[2]}-${parts[1]}`;
    } else if (input.includes('wczoraj')) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      date = yesterday.toISOString().split('T')[0];
    } else if (input.includes('dzisiaj') || input.includes('dziś')) {
      date = new Date().toISOString().split('T')[0];
    }

    if (date) {
      updateData({ accidentDate: date });
      return {
        message: `Data zapisana: ${new Date(date).toLocaleDateString('pl-PL')} ✓\n\nO której godzinie to się stało? (np. 14:30 lub "około 14:00"):`,
        nextQuestion: 9,
        data: { 'Data wypadku': date },
      };
    }

    return {
      message: 'Nie rozpoznałem daty. Spróbuj w formacie RRRR-MM-DD (np. 2025-12-06) lub opisowo (np. "wczoraj"):',
      suggestions: ['Wczoraj', 'Dzisiaj', '2025-12-06'],
      nextQuestion: 8,
    };
  },

  handleAccidentTime(input: string, data: WizardData, updateData: any): BotResponse {
    const timeMatch = input.match(/(\d{1,2})[:.h](\d{2})/);
    let time = '';

    if (timeMatch) {
      time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
    } else if (input.includes('rano')) {
      time = '08:00';
    } else if (input.includes('południe')) {
      time = '12:00';
    } else if (input.includes('popołudnie')) {
      time = '15:00';
    } else if (input.includes('wieczór')) {
      time = '18:00';
    }

    if (time) {
      updateData({ accidentTime: time });
      return {
        message: `Godzina zapisana: ${time} ✓\n\nGdzie dokładnie miał miejsce wypadek? Podaj jak najdokładniejszy adres i opis miejsca:`,
        nextQuestion: 10,
        data: { 'Godzina': time },
      };
    }

    return {
      message: 'Podaj godzinę w formacie HH:MM (np. 14:30) lub opisowo (np. "rano", "popołudnie"):',
      suggestions: ['Rano', 'Południe', 'Popołudnie'],
      nextQuestion: 9,
    };
  },

  handleAccidentLocation(input: string, data: WizardData, updateData: any): BotResponse {
    if (input.length < 10) {
      return {
        message: 'Podaj dokładniejszy opis miejsca (adres, nazwa obiektu, pomieszczenie itp.):',
        nextQuestion: 10,
      };
    }

    updateData({ accidentLocation: input });
    return {
      message: `Miejsce zapisane ✓\n\nTeraz kluczowe pytanie: Czy wypadek miał miejsce podczas wykonywania czynności związanych z Twoją działalnością gospodarczą (${data.pkdDescription})?`,
      suggestions: ['Tak, podczas pracy', 'Nie, to była prywatna sprawa'],
      nextQuestion: 11,
      data: { 'Miejsce': input },
    };
  },

  handleWorkRelated(input: string, data: WizardData, updateData: any): BotResponse {
    const wasRelated = input.includes('tak') || input.includes('podczas') || input.includes('prac');
    
    updateData({ wasWorkRelated: wasRelated ? 'tak' : 'nie' });

    if (!wasRelated) {
      return {
        message: '⚠️ UWAGA: Jeśli zdarzenie nie było związane z wykonywaną działalnością, może nie zostać uznane za wypadek przy pracy.\n\nCzy na pewno wypadek nie miał związku z Twoją działalnością?',
        suggestions: ['Jednak miał związek', 'Nie miał związku'],
        nextQuestion: 11,
      };
    }

    return {
      message: 'Dobrze. To spełnia kryterium związku z pracą ✓\n\nOpowiedz mi dokładnie, co robiłeś bezpośrednio przed wypadkiem:',
      nextQuestion: 12,
      data: { 'Związek z pracą': 'TAK' },
    };
  },

  handleActivityBefore(input: string, data: WizardData, updateData: any): BotResponse {
    if (input.length < 20) {
      return {
        message: 'Spróbuj opisać to bardziej szczegółowo. Co dokładnie robiłeś? Jakie narzędzia używałeś?',
        nextQuestion: 12,
      };
    }

    updateData({ activityBeforeAccident: input });
    return {
      message: `Dziękuję za szczegóły! 📝\n\nTeraz pytanie o nagłość: Czy wypadek nastąpił nagle, w krótkim czasie? (np. upadek, uderzenie, itp.)`,
      suggestions: ['Tak, było to nagłe', 'Nie, to było stopniowe'],
      nextQuestion: 13,
      data: { 'Czynności przed wypadkiem': input.substring(0, 50) + '...' },
    };
  },

  handleSuddenness(input: string, data: WizardData, updateData: any): BotResponse {
    const wasSudden = input.includes('tak') || input.includes('nagł');
    
    updateData({ wasSudden: wasSudden ? 'tak' : 'nie' });

    if (!wasSudden) {
      return {
        message: '⚠️ Brak nagłości może oznaczać, że to nie był wypadek, ale choroba zawodowa.\n\nOpowiedz teraz krok po kroku, jak doszło do wypadku. Podziel to na etapy:',
        nextQuestion: 14,
      };
    }

    return {
      message: 'OK, nagłość potwierdzona ✓\n\nTeraz najważniejsza część - opisz krok po kroku, jak doszło do wypadku.\n\nZacznij od pierwszego kroku (np. "Wszedłem na drabiną"):',
      nextQuestion: 14,
      data: { 'Nagłość': 'TAK' },
    };
  },

  handleAccidentSequence(input: string, data: WizardData, updateData: any): BotResponse {
    const currentSequence = data.accidentSequence || [];
    
    currentSequence.push({
      step: currentSequence.length + 1,
      description: input,
    });

    updateData({ accidentSequence: currentSequence });

    if (currentSequence.length < 3) {
      return {
        message: `Krok ${currentSequence.length} zapisany ✓\n\nCo stało się dalej? (Opisz następny krok, lub napisz "koniec" jeśli to wszystko):`,
        suggestions: ['Koniec opisu'],
        nextQuestion: 14,
      };
    }

    return {
      message: `Świetnie! Mam ${currentSequence.length} kroków opisujących wypadek ✓\n\nTeraz powiedz mi - jaka była główna przyczyna zewnętrzna wypadku?\n\nNp: upadek z wysokości, poślizgnięcie, uderzenie przedmiotem, wypadek drogowy...`,
      nextQuestion: 15,
      data: { 'Przebieg wypadku': `${currentSequence.length} kroków` },
    };
  },

  handleExternalCause(input: string, data: WizardData, updateData: any): BotResponse {
    updateData({ externalCause: input });

    return {
      message: `Przyczyna zapisana: "${input}" ✓\n\nOpowiedz teraz dokładniej o okolicznościach - co dokładnie spowodowało wypadek? Uwzględnij warunki, stan narzędzi, pogodę jeśli miała znaczenie:`,
      nextQuestion: 16,
      data: { 'Przyczyna': input },
    };
  },

  handleCauseDetails(input: string, data: WizardData, updateData: any): BotResponse {
    if (input.length < 30) {
      return {
        message: 'Spróbuj opisać to bardziej szczegółowo. Im więcej informacji, tym lepiej:',
        nextQuestion: 16,
      };
    }

    updateData({ causeDetails: input });
    return {
      message: 'Dziękuję za szczegółowy opis! 📋\n\nTeraz o obrażeniach. Jakie obrażenia odniosłeś?\n\nNp: złamanie, stłuczenie, rana, oparzenie...',
      suggestions: ['Złamanie', 'Stłuczenie', 'Rana cięta', 'Oparzenie'],
      nextQuestion: 17,
      data: { 'Szczegóły przyczyny': input.substring(0, 50) + '...' },
    };
  },

  handleInjuryType(input: string, data: WizardData, updateData: any): BotResponse {
    updateData({ injuryType: input });

    return {
      message: `Rodzaj obrażenia: ${input} ✓\n\nKtóra część ciała została uszkodzona?\n\nNp: ręka prawa, noga lewa, głowa, klatka piersiowa...`,
      suggestions: ['Ręka prawa', 'Ręka lewa', 'Noga prawa', 'Noga lewa', 'Głowa', 'Klatka piersiowa'],
      nextQuestion: 18,
      data: { 'Rodzaj obrażenia': input },
    };
  },

  handleInjuryLocation(input: string, data: WizardData, updateData: any): BotResponse {
    updateData({ injuryLocation: input });

    return {
      message: `Miejsce urazu: ${input} ✓\n\nOpowiedz dokładniej o obrażeniach - jak bardzo bolało, czy mogłeś się poruszać, jak wyglądały obrażenia itp.:`,
      nextQuestion: 19,
      data: { 'Lokalizacja': input },
    };
  },

  handleInjuryDescription(input: string, data: WizardData, updateData: any): BotResponse {
    if (input.length < 20) {
      return {
        message: 'Opisz to bardziej szczegółowo. To ważne dla dokumentacji medycznej:',
        nextQuestion: 19,
      };
    }

    updateData({ injuryDescription: input });
    return {
      message: 'Opis obrażeń zapisany ✓\n\nCzy otrzymałeś pomoc medyczną? (szpital, przychodnia, pogotowie)',
      suggestions: ['Tak, byłem w szpitalu', 'Tak, u lekarza', 'Nie, nie było pomocy'],
      nextQuestion: 20,
      data: { 'Opis obrażeń': input.substring(0, 50) + '...' },
    };
  },

  handleMedicalAttention(input: string, data: WizardData, updateData: any): BotResponse {
    const hadMedical = input.includes('tak') || input.includes('szpital') || input.includes('lekarz') || input.includes('przychodnia');
    
    updateData({ 
      medicalAttention: hadMedical ? 'tak' : 'nie',
      hospitalName: hadMedical ? 'Do uzupełnienia' : '',
    });

    if (hadMedical) {
      return {
        message: 'Dobrze, pamiętaj żeby dołączyć dokumentację medyczną! 🏥\n\n✅ Formularz wypełniony!\n\nMam wszystkie potrzebne informacje. Czy chcesz coś zmienić lub uzupełnić?',
        suggestions: ['Wszystko OK', 'Chcę coś poprawić'],
        nextQuestion: 21,
        isComplete: true,
      };
    }

    return {
      message: '⚠️ Zalecam wizytę u lekarza dla dokumentacji!\n\n✅ Formularz wypełniony!\n\nMam wszystkie potrzebne informacje. Czy chcesz coś zmienić lub uzupełnić?',
      suggestions: ['Wszystko OK', 'Chcę coś poprawić'],
      nextQuestion: 21,
      isComplete: true,
    };
  },

  handleCompletion(input: string, data: WizardData, updateData: any): BotResponse {
    return {
      message: `Świetnie! Formularz jest gotowy! 🎉\n\n📄 Zebrane informacje:\n✅ ${data.injuredName} ${data.injuredSurname}\n✅ NIP: ${data.nip}\n✅ Data wypadku: ${data.accidentDate}\n✅ Przyczyna: ${data.externalCause}\n✅ Obrażenia: ${data.injuryType}\n\n🔄 Możesz teraz:\n• Pobrać dokument w PDF\n• Przejść do formularza tradycyjnego\n• Wysłać przez PUE/eZUS\n\nCzy potrzebujesz jeszcze pomocy?`,
      suggestions: ['Pobierz PDF', 'Koniec'],
      nextQuestion: 21,
      isComplete: true,
    };
  },
};
