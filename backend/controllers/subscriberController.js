import subscriberModel from '../models/subscriberModel.js'
import mongoose from 'mongoose'
import validator from 'validator'

const addSubscriber = async (req, res) => {
  try {
    const { email } = req.body
    if (!email || !validator.isEmail(email)) {
      return res.json({ success: false, message: 'Invalid email' })
    }
    const exists = await subscriberModel.findOne({ email })
    if (exists) {
      return res.json({ success: true, message: 'Already subscribed' })
    }
    await subscriberModel.create({ email })
    res.json({ success: true, message: 'Subscribed successfully' })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

const listSubscribers = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.json({ success: false, message: 'Database not connected' })
    }
    const subscribers = await subscriberModel.find({}).sort({ date: -1 })
    res.json({ success: true, subscribers })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { addSubscriber, listSubscribers }

const messageSubscriber = async (req, res) => {
  try {
    const { email, subject, message } = req.body
    if (!email || !validator.isEmail(email)) {
      return res.json({ success: false, message: 'Invalid email' })
    }
    if (!subject || !message) {
      return res.json({ success: false, message: 'Subject and message are required' })
    }

    const { default: nodemailer } = await import('nodemailer')

    let transporter
    let fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER
    try {
      const port = Number(process.env.SMTP_PORT || 587)
      const secure = process.env.SMTP_SECURE === 'true' || port === 465
      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
      await transporter.verify()
    } catch (e) {
      const testAccount = await nodemailer.createTestAccount()
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: { user: testAccount.user, pass: testAccount.pass },
      })
      fromAddr = `VastraHUB <${testAccount.user}>`
    }

    const info = await transporter.sendMail({
      from: fromAddr,
      to: email,
      subject,
      text: message,
      html: `<p>${message}</p>`,
    })

    const previewUrl = nodemailer.getTestMessageUrl ? nodemailer.getTestMessageUrl(info) : null
    res.json({ success: true, message: 'Message sent successfully', previewUrl })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
  }
}

export { messageSubscriber }