export const getSuperAdminInfo = async (req, res) => {
  try {
    return res.json({ success: true, user: req.user })
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message })
  }
}
