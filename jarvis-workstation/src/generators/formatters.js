
/**
 * @file Utilitaires de formatage et validation du code
 * @module formatters
 */

import chalk from 'chalk';

/**
 * @class Formatters
 * @description Fournit des méthodes statiques pour formater et valider différents types de code.
 */
class Formatters {

  /**
   * Formate une chaîne de code JavaScript/TypeScript en utilisant une indentation standard de 2 espaces.
   * Note: Pour un formatage plus robuste, l'intégration avec Prettier ou ESLint serait recommandée.
   * @param {string} code - La chaîne de code à formater.
   * @returns {string} Le code formaté.
   * @throws {Error} Si le code n'est pas une chaîne de caractères.
   * @example
   * // Exemple d'utilisation:
   * const unformattedCode = 'function  myFunc ( a,  b )  { return a+b; }';
   * const formattedCode = Formatters.formatJavaScript(unformattedCode);
   * console.log('Code JavaScript formaté:\n', formattedCode);
   */
  static formatJavaScript(code) {
    if (typeof code !== 'string') {
      console.error(chalk.red('Erreur: Le code JavaScript à formater doit être une chaîne de caractères.'));
      throw new Error('Invalid input: code must be a string.');
    }

    try {
      // Simple formatting: add semicolons, basic indentation (conceptual)
      // This is a placeholder for a real formatter like Prettier
      let lines = code.split(';').map(line => line.trim()).filter(line => line.length > 0);
      let formatted = lines.map(line => {
        if (line.startsWith('function') || line.startsWith('class') || line.includes('{')) {
          return line.replace(/{/g, '{\n  ').replace(/}/g, '\n}');
        }
        return line;
      }).join(';\n');

      // Basic indentation (very naive, for demonstration)
      formatted = formatted.split('\n').map(line => {
        if (line.startsWith('}')) return line;
        if (line.startsWith('  ')) return line;
        return '  ' + line;
      }).join('\n');

      console.log(chalk.green('Code JavaScript formaté avec succès.'));
      return formatted;
    } catch (error) {
      console.error(chalk.red(`Erreur lors du formatage du code JavaScript: ${error.message}`));
      throw new Error(`Failed to format JavaScript code: ${error.message}`);
    }
  }

  /**
   * Valide si une chaîne de caractères est un JSON valide.
   * @param {string} jsonString - La chaîne à valider.
   * @returns {boolean} True si la chaîne est un JSON valide, sinon False.
   * @example
   * // Exemple d'utilisation:
   * const validJson = '{"name": "Jarvis", "version": "1.0"}';
   * console.log('JSON valide:', Formatters.isValidJson(validJson));
   * const invalidJson = '{name: "Jarvis"}';
   * console.log('JSON invalide:', Formatters.isValidJson(invalidJson));
   */
  static isValidJson(jsonString) {
    if (typeof jsonString !== 'string') {
      console.error(chalk.red('Erreur: L\\'entrée isValidJson doit être une chaîne de caractères.'));
      return false;
    }
    try {
      JSON.parse(jsonString);
      console.log(chalk.green('La chaîne est un JSON valide.'));
      return true;
    } catch (error) {
      console.log(chalk.yellow('La chaîne n\\'est pas un JSON valide.'));
      return false;
    }
  }

  /**
   * Valide si une chaîne de caractères est une URL valide.
   * @param {string} urlString - La chaîne à valider.
   * @returns {boolean} True si la chaîne est une URL valide, sinon False.
   * @example
   * // Exemple d'utilisation:
   * const validUrl = 'https://www.example.com/path?query=1';
   * console.log('URL valide:', Formatters.isValidUrl(validUrl));
   * const invalidUrl = 'not-a-url';
   * console.log('URL invalide:', Formatters.isValidUrl(invalidUrl));
   */
  static isValidUrl(urlString) {
    if (typeof urlString !== 'string') {
      console.error(chalk.red('Erreur: L\\'entrée isValidUrl doit être une chaîne de caractères.'));
      return false;
    }
    try {
      new URL(urlString);
      console.log(chalk.green('La chaîne est une URL valide.'));
      return true;
    } catch (error) {
      console.log(chalk.yellow('La chaîne n\\'est pas une URL valide.'));
      return false;
    }
  }

  /**
   * Nettoie une chaîne de caractères en supprimant les espaces superflus et les caractères non imprimables.
   * @param {string} text - La chaîne de texte à nettoyer.
   * @returns {string} La chaîne nettoyée.
   * @throws {Error} Si le texte n'est pas une chaîne de caractères.
   * @example
   * // Exemple d'utilisation:
   * const dirtyText = '  Hello   World!\n\tThis is a test.  ';
   * const cleanText = Formatters.cleanText(dirtyText);
   * console.log('Texte nettoyé:', cleanText);
   */
  static cleanText(text) {
    if (typeof text !== 'string') {
      console.error(chalk.red('Erreur: Le texte à nettoyer doit être une chaîne de caractères.'));
      throw new Error('Invalid input: text must be a string.');
    }
    try {
      // Supprime les caractères non imprimables et les espaces multiples
      const cleaned = text.replace(/[^\x20-\x7E\s]/g, '').replace(/\s+/g, ' ').trim();
      console.log(chalk.green('Texte nettoyé avec succès.'));
      return cleaned;
    } catch (error) {
      console.error(chalk.red(`Erreur lors du nettoyage du texte: ${error.message}`));
      throw new Error(`Failed to clean text: ${error.message}`);
    }
  }
}

export default Formatters;


