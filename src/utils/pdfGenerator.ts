import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { WizardData } from '../components/WizardContext';

// Funkcja usuwająca polskie znaki
const normalize = (text: string | undefined | null) => {
  if (!text) return '';
  return text
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z');
};

export async function generateReportPDF(data: WizardData): Promise<void> {
  try {
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const page = pdfDoc.addPage([595.28, 841.89]); // A4
    const { width, height } = page.getSize();
    
    // --- Helper Functions ---
    const drawText = (text: string, x: number, y: number, size = 10, isBold = false, color = rgb(0, 0, 0)) => {
      page.drawText(normalize(text), {
        x,
        y,
        size,
        font: isBold ? fontBold : font,
        color,
      });
    };

    const drawSectionHeader = (text: string, y: number) => {
      page.drawRectangle({
        x: 40,
        y: y - 14,
        width: width - 80,
        height: 20,
        color: rgb(0.9, 0.9, 0.9),
      });
      drawText(text, 45, y - 10, 10, true);
    };

    const drawFieldBackground = (x: number, y: number, w: number, h: number) => {
        page.drawRectangle({
            x,
            y,
            width: w,
            height: h,
            color: rgb(0.97, 0.97, 1.0), // Lekko niebieskie tło dla pól
            borderColor: rgb(0.8, 0.8, 0.8),
            borderWidth: 1,
        });
    };

    const createField = (name: string, value: string, x: number, y: number, w: number, h: number = 20, multiline = false) => {
      drawFieldBackground(x, y, w, h);
      
      const fontSize = 10;
      const textX = x + 5;
      let textY = y + (h / 2) - (fontSize / 2) + 2; 

      if (multiline) {
          textY = y + h - fontSize - 5;
          page.drawText(normalize(value), {
              x: textX,
              y: textY,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0.5),
              maxWidth: w - 10,
              lineHeight: 12,
          });
      } else {
          page.drawText(normalize(value), {
              x: textX,
              y: textY,
              size: fontSize,
              font: font,
              color: rgb(0, 0, 0.5),
          });
      }
    };

    // --- Header ---
    drawText("ZAKLAD UBEZPIECZEN SPOLECZNYCH", 40, height - 50, 10, true, rgb(0.3, 0.3, 0.3));
    
    const title = data.reportType === 'explanation' 
      ? "ZAPIS WYJASNIEN POSZKODOWANEGO" 
      : "ZAWIADOMIENIE O WYPADKU PRZY PRACY";
    
    drawText(title, 40, height - 80, 16, true);
    drawText("Dokument wygenerowany automatycznie", 40, height - 100, 8, false, rgb(0.5, 0.5, 0.5));

    let currentY = height - 130;

    // --- I. Dane Płatnika (Firma) ---
    drawSectionHeader("I. DANE PLATNIKA SKLADEK (FIRMA)", currentY);
    currentY -= 35;
    
    drawText("NIP:", 40, currentY);
    createField("nip", data.nip || "", 80, currentY - 5, 120);
    
    drawText("REGON:", 220, currentY);
    createField("regon", data.regon || "", 270, currentY - 5, 120);
    
    currentY -= 30;
    drawText("Nazwa:", 40, currentY);
    createField("businessName", data.businessName || "", 80, currentY - 5, width - 120);

    currentY -= 30;
    drawText("Adres:", 40, currentY);
    createField("businessAddress", data.businessAddress || "", 80, currentY - 5, width - 120);

    currentY -= 30;
    drawText("PKD:", 40, currentY);
    createField("pkd", `${data.pkdCode || ""} - ${data.pkdDescription || ""}`, 80, currentY - 5, width - 120);

    // --- II. Dane Poszkodowanego ---
    currentY -= 40;
    drawSectionHeader("II. DANE POSZKODOWANEGO", currentY);
    currentY -= 35;

    drawText("Imie:", 40, currentY);
    createField("injuredName", data.injuredName || "", 80, currentY - 5, 180);

    drawText("Nazwisko:", 280, currentY);
    createField("injuredSurname", data.injuredSurname || "", 340, currentY - 5, 180);

    currentY -= 30;
    drawText("PESEL:", 40, currentY);
    createField("injuredPesel", data.injuredPesel || "", 80, currentY - 5, 180);
    
    drawText("Dokument:", 280, currentY);
    createField("idDoc", "", 340, currentY - 5, 180);

    // --- III. Informacje o Wypadku ---
    currentY -= 40;
    drawSectionHeader("III. INFORMACJE O WYPADKU", currentY);
    currentY -= 35;

    drawText("Data:", 40, currentY);
    createField("accidentDate", data.accidentDate || "", 80, currentY - 5, 120);

    drawText("Godzina:", 220, currentY);
    createField("accidentTime", data.accidentTime || "", 270, currentY - 5, 100);

    currentY -= 30;
    drawText("Miejsce:", 40, currentY);
    createField("accidentLocation", data.accidentLocation || "", 90, currentY - 5, width - 130);

    currentY -= 30;
    drawText("Nagly:", 40, currentY);
    createField("wasSudden", data.wasSudden === 'tak' ? 'TAK' : 'NIE', 80, currentY - 5, 60);

    drawText("Zw. z praca:", 160, currentY);
    createField("workRelated", data.wasWorkRelated === 'tak' ? 'TAK' : 'NIE', 230, currentY - 5, 60);

    drawText("Przyczyna zew.:", 310, currentY);
    createField("extCause", data.externalCause || "", 400, currentY - 5, width - 440);

    // --- IV. Opis Okoliczności (Duże pole) ---
    currentY -= 40;
    drawSectionHeader("IV. OKOLICZNOSCI I PRZYCZYNY (OPIS SZCZEGOLOWY)", currentY);
    currentY -= 15;
    
    let fullDescription = `Czynnosci przed wypadkiem:\n${data.activityBeforeAccident || ""}\n\n`;
    fullDescription += `Przebieg:\n`;
    if (data.accidentSequence) {
        data.accidentSequence.forEach(s => {
            fullDescription += `- ${s.description} ${s.time ? '('+s.time+')' : ''}\n`;
        });
    }
    fullDescription += `\nPrzyczyna:\n${data.causeDetails || ""}\n`;
    fullDescription += `\nUraz:\n${data.injuryDescription || ""}`;

    createField("description", fullDescription, 40, currentY - 140, width - 80, 130, true);
    currentY -= 150;

    // --- V. Informacje Dodatkowe (Wyjaśnienia) ---
    if (data.reportType === 'explanation' || data.reportType === 'both') {
      drawSectionHeader("V. INFORMACJE DODATKOWE (BHP, MASZYNY)", currentY);
      currentY -= 15;

      let safetyText = "";
      if (data.safetyInfo) {
          if (data.safetyInfo.machineStatus) safetyText += `Maszyny: ${data.safetyInfo.machineStatus}\n`;
          if (data.safetyInfo.protectiveGear) safetyText += `Srodki ochrony: ${data.safetyInfo.protectiveGear}\n`;
          if (data.safetyInfo.trainings) safetyText += `Szkolenia: ${data.safetyInfo.trainings}\n`;
          if (data.safetyInfo.sobriety) safetyText += `Stan: ${data.safetyInfo.sobriety}\n`;
      } else {
          safetyText = "Brak szczegolowych danych o BHP.";
      }

      createField("safety", safetyText, 40, currentY - 60, width - 80, 50, true);
      currentY -= 70;
    }

    // --- Footer ---
    drawText("Oswiadczam, ze powyzsze dane sa zgodne z prawda.", 40, 80, 10, false);
    
    page.drawLine({
      start: { x: width - 200, y: 50 },
      end: { x: width - 40, y: 50 },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    drawText("Podpis poszkodowanego", width - 180, 35, 8, false);

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const fileName = data.reportType === 'explanation' ? 'ZUS_Wyjasnienia.pdf' : 'ZUS_Zawiadomienie.pdf';
    link.download = `${fileName}`;
    link.click();
    
  } catch (error) {
    console.error("PDF Generation Error:", error);
    throw error;
  }
}
