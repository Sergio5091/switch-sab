/**
 * LOGGER — Système de logging centralisé
 *
 * Utilisation :
 *   import logger from './config/logger.js'
 *
 *   logger.info('Serveur démarré')
 *   logger.warn('Switch non disponible')
 *   logger.error('Erreur BDD', err)
 *
 * En production (NODE_ENV=production) les logs 'debug' sont masqués.
 */

const NIVEAUX = {
  debug: { label: 'DEBUG', couleur: '\x1b[36m' }, // cyan
  info:  { label: 'INFO ', couleur: '\x1b[32m' }, // vert
  warn:  { label: 'WARN ', couleur: '\x1b[33m' }, // jaune
  error: { label: 'ERROR', couleur: '\x1b[31m' }, // rouge
}

const RESET = '\x1b[0m'

const estProduction = process.env.NODE_ENV === 'production'

const log = (niveau, message, extra) => {
  if (niveau === 'debug' && estProduction) return

  const { label, couleur } = NIVEAUX[niveau]
  const heure = new Date().toISOString().replace('T', ' ').slice(0, 19)

  const ligne = `${couleur}[${heure}] ${label}${RESET} ${message}`
  console.log(ligne)

  if (extra) {
    if (extra instanceof Error) {
      console.log(`${couleur}         ${extra.stack}${RESET}`)
    } else {
      console.log(`${couleur}        `, extra, RESET)
    }
  }
}

const logger = {
  debug: (msg, extra) => log('debug', msg, extra),
  info:  (msg, extra) => log('info',  msg, extra),
  warn:  (msg, extra) => log('warn',  msg, extra),
  error: (msg, extra) => log('error', msg, extra),
}

export default logger
