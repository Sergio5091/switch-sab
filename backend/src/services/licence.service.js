import { prisma } from './prismaClient.js'
import { createLicenceCode, generateRequestCode, parseLicenceCode, verifyLicenceCode } from '../utils/licenceUtils.js'

export const generateLicenceService = async ({ salleId, validDays = 30 }) => {
   const salle = await prisma.Salle.findUnique({ where: { id: Number(salleId) } })
   if (!salle) {
     throw new Error('Salle introuvable')
   }

   const requestCode = generateRequestCode()
   const expiresAt = new Date(Date.now() + Number(validDays) * 24 * 60 * 60 * 1000)
   const code = createLicenceCode({ requestCode, salleId: salle.id, expiresAt })

   const licence = await prisma.Licence.create({
     data: {
       code,
       requestCode,
       signature: code.split('-').pop(),
       fin: expiresAt,
       salleId: salle.id,
       actif: true,
     },
   })
   
   // Sérialiser la date avant de retourner
   return {
     ...licence,
     fin: licence.fin.toISOString(),
   }
 }

export const activateLicenceService = async ({ licenceCode, userSalleId, userRole }) => {
   if (!verifyLicenceCode(licenceCode)) {
     throw new Error('Licence incorrecte ou modifiée')
   }

   const parsed = parseLicenceCode(licenceCode)
   if (parsed.expiresAt < new Date()) {
     throw new Error('Licence expirée')
   }

   if (userRole !== 'SUPERADMIN' && parsed.salleId !== Number(userSalleId)) {
     throw new Error('Vous ne pouvez activer une licence que pour votre propre salle')
   }

   return prisma.Licence.upsert({
     where: { code: licenceCode },
     update: {
       actif: true,
       fin: parsed.expiresAt,
       signature: parsed.signature,
       requestCode: parsed.requestCode,
     },
     create: {
       code: licenceCode,
       requestCode: parsed.requestCode,
       signature: parsed.signature,
       fin: parsed.expiresAt,
       salleId: parsed.salleId,
       actif: true,
     },
   })
 }

export const getLicenceStatusService = async ({ salleId }) => {
   const licence = await prisma.Licence.findFirst({
     where: { salleId: Number(salleId) },
     orderBy: { fin: 'desc' },
   })

   const now = new Date()
   if (!licence) {
     return {
       active: false,
       blocked: true,
       reportsHidden: false,
       daysRemaining: 0,
       message: 'Aucune licence active trouvée',
     }
   }

   if (licence.fin >= now) {
     const diffDays = Math.ceil((licence.fin - now) / (1000 * 60 * 60 * 24))
     return {
       active: true,
       blocked: false,
       reportsHidden: false,
       daysRemaining: diffDays,
       expiresAt: licence.fin,
     }
   }

   const expiredDays = Math.floor((now - licence.fin) / (1000 * 60 * 60 * 24))
   const reportsHidden = expiredDays <= 3
   const blocked = expiredDays > 3

   return {
     active: false,
     blocked,
     reportsHidden,
     daysRemaining: 0,
     expiredDays,
     message: blocked
       ? 'La licence est expirée depuis plus de 3 jours, l’application est bloquée.'
       : 'La licence est expirée, les rapports sont masqués pendant la période de grâce.',
   }
 }
