import { badWords } from "./badword";

export class BadWordFilter {
  private badWords: string[];

  constructor() {
    // Flatten the badWords object into a single array of words
    this.badWords = Object.values(badWords).flat();
  }

  public clean(text: string): string {
    let cleanedText = text;
    this.badWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      cleanedText = cleanedText.replace(regex, '*'.repeat(word.length));
    });
    return cleanedText;
  }

  public hasBadWords(text: string): boolean {
    return this.badWords.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(text)
    );
  }
}