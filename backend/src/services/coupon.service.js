import { prisma } from './prismaClient.js'

export const generateCouponsService = async ({ salleId, valeur, count }) => {
   const coupons = []
   for (let i = 0; i < count; i++) {
     const code = Math.random().toString(36).substring(2, 8).toUpperCase()
     coupons.push(
       await prisma.Coupon.create({
         data: { code, valeur: Number(valeur), salleId: Number(salleId) },
       })
     )
   }
   return coupons
 }

export const useCouponService = async (code, clientId) => {
   const coupon = await prisma.Coupon.findFirst({
     where: { code, utilise: false },
   })
    
   if (!coupon) {
     throw new Error('Coupon introuvable ou déjà utilisé')
   }
    
   return prisma.Coupon.update({
     where: { id: coupon.id },
     data: { utilise: true, utilisePar: Number(clientId) },
   })
 }