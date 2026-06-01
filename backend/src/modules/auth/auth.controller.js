import { loginService } from './auth.service.js'

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

export const getCurrentUser = async (req, res) => {
  try {
    return res.json({ success: true, user: req.user })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
