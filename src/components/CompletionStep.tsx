import { useWizard } from './WizardContext';
import { Download, FileText, CheckCircle, Mail, Building2, Printer } from 'lucide-react';
import jsPDF from 'jspdf';

interface CompletionStepProps {
  onPrevious: () => void;
}

export function CompletionStep({ onPrevious }: CompletionStepProps) {
  const { data } = useWizard();

  const generateDocumentText = () => {
    let document = '';

    // Nagłówek
    document += '═══════════════════════════════════════════════════════════\n';
    document += '          ZAWIADOMIENIE O WYPADKU PRZY PRACY\n';
    document += '    dla osoby prowadzącej pozarolniczą działalność gospodarczą\n';
    document += '═══════════════════════════════════════════════════════════\n\n';

    // Dane zgłaszającego
    if (data.isProxy) {
      document += 'ZGŁASZAJĄCY (PEŁNOMOCNIK):\n';
      document += `Imię i nazwisko: ${data.proxyName}\n`;
      document += `Relacja z poszkodowanym: ${data.proxyRelation}\n`;
      document += `Pełnomocnictwo: ${data.hasProxyDocument ? 'TAK (załączone)' : 'NIE (do dostarczenia)'}\n\n`;
    }

    // Dane poszkodowanego
    document += 'DANE POSZKODOWANEGO:\n';
    document += `Imię i nazwisko: ${data.injuredName} ${data.injuredSurname}\n`;
    document += `PESEL: ${data.injuredPesel}\n`;
    if (data.injuredEmail) document += `Email: ${data.injuredEmail}\n`;
    if (data.injuredPhone) document += `Telefon: ${data.injuredPhone}\n`;
    document += '\n';

    // Dane działalności
    document += 'DANE DZIAŁALNOŚCI GOSPODARCZEJ:\n';
    document += `Nazwa: ${data.businessName}\n`;
    document += `NIP: ${data.nip}\n`;
    if (data.regon) document += `REGON: ${data.regon}\n`;
    document += `Adres: ${data.businessAddress}\n`;
    document += `Kod PKD: ${data.pkdCode} - ${data.pkdDescription}\n`;
    document += '\n';

    // Dane wypadku
    document += 'DANE WYPADKU:\n';
    const accidentDateFormatted = new Date(data.accidentDate).toLocaleDateString('pl-PL');
    document += `Data: ${accidentDateFormatted}\n`;
    document += `Godzina: ${data.accidentTime}\n`;
    document += `Miejsce: ${data.accidentLocation}\n`;
    document += '\n';

    // Okoliczności
    document += 'OKOLICZNOŚCI WYPADKU:\n';
    document += `Związek z działalnością gospodarczą: ${data.wasWorkRelated === 'tak' ? 'TAK' : 'NIE'}\n`;
    document += `Nagłość zdarzenia: ${data.wasSudden === 'tak' ? 'TAK' : 'NIE'}\n\n`;

    document += 'Czynności wykonywane przed wypadkiem:\n';
    document += `${data.activityBeforeAccident}\n\n`;

    // Przebieg wypadku
    document += 'PRZEBIEG WYPADKU (SEKWENCJA ZDARZEŃ):\n';
    data.accidentSequence.forEach((step) => {
      document += `\nKrok ${step.step}${step.time ? ` (godz. ${step.time})` : ''}:\n`;
      document += `${step.description}\n`;
    });
    document += '\n';

    // Przyczyna
    document += 'PRZYCZYNA WYPADKU:\n';
    document += `Przyczyna zewnętrzna: ${data.externalCause}\n\n`;
    document += 'Szczegółowy opis przyczyny:\n';
    document += `${data.causeDetails}\n\n`;

    // Obrażenia
    document += 'OBRAŻENIA:\n';
    document += `Rodzaj: ${data.injuryType}\n`;
    document += `Lokalizacja: ${data.injuryLocation}\n\n`;
    document += 'Szczegółowy opis:\n';
    document += `${data.injuryDescription}\n\n`;

    // Pomoc medyczna
    document += `Pomoc medyczna: ${data.medicalAttention === 'tak' ? 'TAK' : 'NIE'}\n`;
    if (data.medicalAttention === 'tak' && data.hospitalName) {
      document += `Placówka: ${data.hospitalName}\n`;
    }
    document += '\n';

    // Świadkowie
    if (data.witnesses.length > 0) {
      document += 'ŚWIADKOWIE:\n';
      data.witnesses.forEach((witness, index) => {
        document += `${index + 1}. ${witness.name}`;
        if (witness.contact) document += ` - kontakt: ${witness.contact}`;
        document += '\n';
      });
      document += '\n';
    }

    // Dokumenty do załączenia
    if (data.requiredDocuments.length > 0) {
      document += 'DOKUMENTY DO ZAŁĄCZENIA:\n';
      data.requiredDocuments.forEach((doc, index) => {
        document += `${index + 1}. ${doc}\n`;
      });
      document += '\n';
    }

    // Stopka
    document += '\n═══════════════════════════════════════════════════════════\n';
    document += `Data wygenerowania: ${new Date().toLocaleDateString('pl-PL')} ${new Date().toLocaleTimeString('pl-PL')}\n`;
    document += '\n';
    document += 'WAŻNE:\n';
    document += '1. Przeczytaj dokument i sprawdź poprawność danych\n';
    document += '2. Podpisz dokument\n';
    document += '3. Dołącz wymagane dokumenty\n';
    document += '4. Prześlij przez PUE/eZUS lub dostarcz do ZUS\n';
    document += '═══════════════════════════════════════════════════════════\n';

    return document;
  };

  const downloadTXT = () => {
    const text = generateDocumentText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Zawiadomienie_wypadek_${data.injuredSurname}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const text = generateDocumentText();
    
    // Konfiguracja czcionki
    doc.setFont('helvetica');
    doc.setFontSize(10);

    // Podział tekstu na linie
    const lines = text.split('\n');
    const pageHeight = doc.internal.pageSize.height;
    let y = 15;

    lines.forEach((line) => {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 15;
      }
      doc.text(line, 15, y);
      y += 5;
    });

    doc.save(`Zawiadomienie_wypadek_${data.injuredSurname}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const printDocument = () => {
    const text = generateDocumentText();
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Zawiadomienie o wypadku</title>');
      printWindow.document.write('<style>body { font-family: monospace; white-space: pre-wrap; padding: 20px; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(text);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-green-900 mb-2">Zgłoszenie gotowe!</h2>
        <p className="text-gray-700 max-w-2xl mx-auto">
          Dokument został wygenerowany. Pobierz go, sprawdź poprawność danych, 
          podpisz i wyślij do ZUS wraz z wymaganymi dokumentami.
        </p>
      </div>

      {/* Podgląd dokumentu */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-600" />
          Podgląd dokumentu
        </h3>
        <div className="bg-gray-50 border border-gray-300 rounded p-4 max-h-96 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono text-gray-800">
            {generateDocumentText()}
          </pre>
        </div>
      </div>

      {/* Opcje pobierania */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Pobierz dokument</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <button
            onClick={downloadPDF}
            className="flex flex-col items-center gap-3 p-6 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
          >
            <Download className="w-8 h-8 text-blue-600" />
            <div className="text-center">
              <p className="text-gray-900">Pobierz PDF</p>
              <p className="text-sm text-gray-600">Format do podpisu</p>
            </div>
          </button>

          <button
            onClick={downloadTXT}
            className="flex flex-col items-center gap-3 p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText className="w-8 h-8 text-gray-600" />
            <div className="text-center">
              <p className="text-gray-900">Pobierz TXT</p>
              <p className="text-sm text-gray-600">Format edytowalny</p>
            </div>
          </button>

          <button
            onClick={printDocument}
            className="flex flex-col items-center gap-3 p-6 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Printer className="w-8 h-8 text-gray-600" />
            <div className="text-center">
              <p className="text-gray-900">Drukuj</p>
              <p className="text-sm text-gray-600">Wydruk dokumentu</p>
            </div>
          </button>
        </div>
      </div>

      {/* Kolejne kroki */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-blue-900 mb-4">Kolejne kroki</h3>
        <ol className="space-y-3">
          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full flex-shrink-0 mt-0.5">
              1
            </span>
            <div>
              <p className="text-gray-900">Pobierz i przeczytaj dokument</p>
              <p className="text-gray-600">Sprawdź poprawność wszystkich danych</p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full flex-shrink-0 mt-0.5">
              2
            </span>
            <div>
              <p className="text-gray-900">Podpisz dokument</p>
              <p className="text-gray-600">Podpis własnoręczny na wydrukowanym dokumencie</p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full flex-shrink-0 mt-0.5">
              3
            </span>
            <div>
              <p className="text-gray-900">Przygotuj wymagane dokumenty</p>
              <p className="text-gray-600">Zobacz listę poniżej</p>
            </div>
          </li>

          <li className="flex items-start gap-3">
            <span className="flex items-center justify-center w-6 h-6 bg-blue-600 text-white rounded-full flex-shrink-0 mt-0.5">
              4
            </span>
            <div>
              <p className="text-gray-900">Wyślij do ZUS</p>
              <p className="text-gray-600">Przez PUE/eZUS lub osobiście w placówce</p>
            </div>
          </li>
        </ol>
      </div>

      {/* Wymagane dokumenty */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Dokumenty do załączenia</h3>
        <div className="space-y-2">
          {data.requiredDocuments.map((doc, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
              <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <span className="text-gray-900">{doc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Sposoby wysyłki */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-gray-900 mb-4">Sposoby złożenia zgłoszenia</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-6 h-6 text-blue-600" />
              <h4 className="text-gray-900">Elektronicznie</h4>
            </div>
            <p className="text-gray-700 mb-2">
              Zaloguj się na platformie PUE ZUS lub eZUS i wyślij zeskanowany, 
              podpisany dokument wraz z załącznikami.
            </p>
            <a
              href="https://www.zus.pl/pue"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Przejdź do PUE ZUS →
            </a>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              <h4 className="text-gray-900">Osobiście</h4>
            </div>
            <p className="text-gray-700 mb-2">
              Dostarcz podpisany dokument wraz z załącznikami do dowolnej 
              placówki ZUS w Polsce.
            </p>
            <a
              href="https://www.zus.pl/o-zus/kontakt/oddzialy-i-inspektoraty"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Znajdź placówkę ZUS →
            </a>
          </div>
        </div>
      </div>

      {/* Kontakt */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
        <h3 className="text-amber-900 mb-2">Potrzebujesz pomocy?</h3>
        <p className="text-gray-700">
          W razie pytań dotyczących zgłoszenia wypadku skontaktuj się z najbliższą 
          placówką ZUS lub zadzwoń na infolinię: <strong>22 560 16 00</strong>
        </p>
      </div>

      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Wstecz
        </button>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Nowe zgłoszenie
        </button>
      </div>
    </div>
  );
}
