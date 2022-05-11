const express = require('express')
const dotenv = require('dotenv').config()
const path = require('path')

const porta = process.env.PORTA || 3000

const app = express()

app.use(express.static('public'))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

const mailchimp = require('@mailchimp/mailchimp_marketing')

mailchimp.setConfig({
  apiKey: process.env.MAILCHIMP_API_KEY,
  server: process.env.MAILCHIMP_SERVER_PREFIX,
})

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/inscricao.html'))
})

app.post('/', (req, res) => {
  const idLista = process.env.MAILCHIMP_LIST_ID
  const inscrito = {
    nome: req.body.nome,
    sobrenome: req.body.sobrenome,
    email: req.body.email,
  }

  async function adicionarMembro() {
    const resposta = await mailchimp.lists.addListMember(idLista, {
      email_address: inscrito.email,
      status: 'subscribed',
      merge_fields: {
        FNAME: inscrito.nome,
        LNAME: inscrito.sobrenome,
      },
    })

    console.log(
      `Contato adicionado com sucesso. O ID do contato é ${resposta.id}.`
    )
  }

  adicionarMembro()
})

app.listen(porta, () => {
  console.log(`Servidor Express ouvindo na porta ${porta}.`)
})
