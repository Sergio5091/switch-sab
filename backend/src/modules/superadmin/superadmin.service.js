import { createSuperAdmin, findSuperAdminByEmail, findSuperAdminById } from './superadmin.repository.js'

export const getSuperAdminByEmail = async (email) => {
  return findSuperAdminByEmail(email)
}

export const getSuperAdminById = async (id) => {
  return findSuperAdminById(id)
}

export const registerSuperAdmin = async ({ pseudo, email, telephone, motDePasse }) => {
  return createSuperAdmin({ pseudo, email, telephone, motDePasse })
}
