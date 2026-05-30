import { loginService, changePasswordService } from '../services/auth.service.js'

export const login = async (req, res) => {
  const { email, motDePasse } = req.body
  if (!email || !motDePasse) {
    return res.status(400).json({ success: false, message: 'Email et mot de passe requis' })
  }

  try {
    const result = await loginService({ email, motDePasse })
    if (!result) {
      return res.status(401).json({ success: false, message: 'Identifiants invalides' })
    }
    return res.json(result)
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Mot de passe actuel et nouveau mot de passe requis' })
  }

  try {
    await changePasswordService({
      userId: req.user.id,
      currentPassword,
      newPassword,
    })
    return res.json({ success: true, message: 'Mot de passe mis à jour' })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message })
  }
}

export const getCurrentUser = async (req, res) => {
  try {
    return res.json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
