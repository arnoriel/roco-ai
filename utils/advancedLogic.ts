// /Users/azriel/Project/Project/my-ai-app/utils/advancedLogic.ts

export class MathEvaluator {
  // Mengevaluasi string matematika seperti "10 + 5 * 2"
  static calculate(expression: string): number | string {
    try {
      // Membersihkan karakter berbahaya, hanya izinkan angka dan operator
      const sanitized = expression.replace(/[^-()\d/*+.]/g, '');
      // Gunakan Function constructor sebagai sandbox sederhana (lebih aman dari eval)
      const result = new Function(`return ${sanitized}`)();
      return Number.isFinite(result) ? result : "Hasil tidak terdefinisi";
    } catch (e) {
      return "Gagal menghitung. Pastikan format angkanya benar.";
    }
  }

  // Mencari pola matematika dalam teks
  static findMathExpression(prompt: string): string | null {
    // Mencocokkan pola seperti "123 + 456", "10 / 2", dll
    const mathRegex = /(\d+[\s\+\-\*\/\%\(\)]+\d+)+/g;
    const match = prompt.match(mathRegex);
    return match ? match[0] : null;
  }
}

// Tambahkan Unit Converter sederhana
export class UnitConverter {
  static convert(val: number, from: string, to: string): string {
    const units: Record<string, number> = {
      'km': 1000, 'm': 1, 'cm': 0.01, 'mm': 0.001,
      'kg': 1000, 'g': 1, 'mg': 0.001
    };
    if (units[from] && units[to]) {
      const result = (val * units[from]) / units[to];
      return `${val}${from} adalah ${result}${to}`;
    }
    return "Satuan tidak dikenal.";
  }
}