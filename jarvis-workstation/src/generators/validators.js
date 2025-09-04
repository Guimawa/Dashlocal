
/**
 * @file Validation de la qualité du code
 * @module validators
 */

import chalk from 'chalk';

/**
 * @class Validators
 * @description Fournit des méthodes statiques pour valider la qualité et la conformité du code généré.
 */
class Validators {

  /**
   * Valide si le code JavaScript/TypeScript est syntaxiquement correct.
   * Note: Une validation complète nécessiterait un parseur AST (comme Babel ou Acorn).
   * Cette implémentation est une vérification de base.
   * @param {string} code - Le code à valider.
   * @returns {boolean} True si le code semble syntaxiquement correct, sinon False.
   * @example
   * // Exemple d'utilisation:
   * const validJs = 'function greet() { console.log("Hello"); }';
   * console.log('JS valide:', Validators.isValidJavaScriptSyntax(validJs));
   * const invalidJs = 'function greet( { console.log("Hello"); }';
   * console.log('JS invalide:', Validators.isValidJavaScriptSyntax(invalidJs));
   */
  static isValidJavaScriptSyntax(code) {
    if (typeof code !== 'string') {
      console.error(chalk.red('Erreur: Le code à valider doit être une chaîne de caractères.'));
      return false;
    }
    try {
      // Tentative de créer une fonction pour valider la syntaxe. Ce n'est pas parfait mais détecte les erreurs grossières.
      new Function(code);
      console.log(chalk.green('Syntaxe JavaScript valide.'));
      return true;
    } catch (error) {
      console.log(chalk.yellow(`Syntaxe JavaScript invalide: ${error.message}`));
      return false;
    }
  }

  /**
   * Vérifie si le code contient des balises HTML/JSX non fermées.
   * @param {string} code - Le code à vérifier.
   * @returns {boolean} True si toutes les balises sont fermées, sinon False.
   * @example
   * // Exemple d'utilisation:
   * const validHtml = '<div><span>Hello</span></div>';
   * console.log('HTML valide:', Validators.hasBalancedHtmlTags(validHtml));
   * const invalidHtml = '<div><span>Hello</div>';
   * console.log('HTML invalide:', Validators.hasBalancedHtmlTags(invalidHtml));
   */
  static hasBalancedHtmlTags(code) {
    if (typeof code !== 'string') {
      console.error(chalk.red('Erreur: Le code à vérifier doit être une chaîne de caractères.'));
      return false;
    }
    const tags = [];
    const regex = /<(\/)?([a-zA-Z0-9]+)([^>]*)?>/g;
    let match;

    try {
      while ((match = regex.exec(code)) !== null) {
        const isClosingTag = !!match[1];
        const tagName = match[2];

        if (isClosingTag) {
          if (tags.length === 0 || tags.pop() !== tagName) {
            console.log(chalk.yellow(`Balise HTML/JSX non équilibrée: </${tagName}>`));
            return false;
          }
        } else {
          // Ignorer les balises auto-fermantes comme <img /> ou <input />
          if (!match[3] || !match[3].includes('/')) {
            tags.push(tagName);
          }
        }
      }
      const isBalanced = tags.length === 0;
      if (isBalanced) {
        console.log(chalk.green('Balises HTML/JSX équilibrées.'));
      } else {
        console.log(chalk.yellow(`Balises HTML/JSX non équilibrées. Balises restantes: ${tags.join(', ')}`));
      }
      return isBalanced;
    } catch (error) {
      console.error(chalk.red(`Erreur lors de la vérification des balises HTML/JSX: ${error.message}`));
      throw new Error(`Failed to check HTML/JSX tags: ${error.message}`);
    }
  }

  /**
   * Vérifie si le code respecte une longueur de ligne maximale (par défaut 80 caractères).
   * @param {string} code - Le code à vérifier.
   * @param {number} [maxLength=80] - La longueur de ligne maximale autorisée.
   * @returns {boolean} True si toutes les lignes respectent la longueur maximale, sinon False.
   * @example
   * // Exemple d'utilisation:
   * const shortLine = 'const a = 1;';
   * console.log('Ligne courte:', Validators.hasValidLineLength(shortLine, 20));
   * const longLine = 'const thisIsAVeryLongLineThatExceedsTheMaximumLengthAllowed = 1;';
   * console.log('Ligne longue:', Validators.hasValidLineLength(longLine, 50));
   */
  static hasValidLineLength(code, maxLength = 80) {
    if (typeof code !== 'string') {
      console.error(chalk.red('Erreur: Le code à vérifier doit être une chaîne de caractères.'));
      return false;
    }
    if (typeof maxLength !== 'number' || maxLength <= 0) {
      console.error(chalk.red('Erreur: maxLength doit être un nombre positif.'));
      return false;
    }

    try {
      const lines = code.split('\n');
      for (const line of lines) {
        if (line.length > maxLength) {
          console.log(chalk.yellow(`Ligne dépassant la longueur maximale (${maxLength} chars): ${line.substring(0, 50)}...`));
          return false;
        }
      }
      console.log(chalk.green('Toutes les lignes respectent la longueur maximale.'));
      return true;
    } catch (error) {
      console.error(chalk.red(`Erreur lors de la vérification de la longueur des lignes: ${error.message}`));
      throw new Error(`Failed to check line length: ${error.message}`);
    }
  }

  /**
   * Vérifie si le code contient des commentaires JSDoc pour les fonctions/classes.
   * C'est une vérification heuristique et non un parseur JSDoc complet.
   * @param {string} code - Le code à vérifier.
   * @returns {boolean} True si des commentaires JSDoc sont détectés pour les déclarations principales, sinon False.
   * @example
   * // Exemple d'utilisation:
   * const commentedCode = '/**\n * Description\n */\nfunction myFunc() {}';
   * console.log('Code commenté:', Validators.hasJSDocComments(commentedCode));
   * const uncommentedCode = 'function anotherFunc() {}';
   * console.log('Code non commenté:', Validators.hasJSDocComments(uncommentedCode));
   */
  static hasJSDocComments(code) {
    if (typeof code !== 'string') {
      console.error(chalk.red('Erreur: Le code à vérifier doit être une chaîne de caractères.'));
      return false;
    }

    try {
      // Regex pour détecter les blocs JSDoc suivis d'une déclaration de fonction ou de classe
      const jsDocRegex = /\/\*\*[^]*?\*\/\s*(?:function|class)\s+[a-zA-Z0-9_]+\s*\(/g;
      const hasComments = jsDocRegex.test(code);
      if (hasComments) {
        console.log(chalk.green('Commentaires JSDoc détectés.'));
      } else {
        console.log(chalk.yellow('Aucun commentaire JSDoc détecté pour les déclarations principales.'));
      }
      return hasComments;
    } catch (error) {
      console.error(chalk.red(`Erreur lors de la vérification des commentaires JSDoc: ${error.message}`));
      throw new Error(`Failed to check JSDoc comments: ${error.message}`);
    }
  }
}

export default Validators;


