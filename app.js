// Módulo para criar um servidor
const express = require('express')

// Módulo para carregar variáveis de ambiente
const dotenv = require('dotenv').config()

// Módulo para fazer requisições HTTPS do tipo POST
const https = require('https')

// Módulo para trabalhar com caminhos de arquivos e pasta
const path = require('path')

// Define a porta em que o servidor ouve requisições
let port = process.env.PORT

if (port == null || port == '') {
    port = 8000
}

// Cria um servidor
const app = express()

// Indica para o servidor a pasta que contém os ativos estáticos
app.use(express.static('public'))

// Permite fazer o parse do corpo das requisições
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Requisição GET para rota raiz
app.get('/', (req, res) => {
    // Envia o formulário de inscrição
    res.sendFile(path.join(__dirname, '/inscricao.html'))
})

// Requisição POST (envio de formulário) para a rota raiz
app.post('/', (req, res) => {
    // Obtém os valores digitados nos campos do formulário
    const nome = req.body.nome
    const sobrenome = req.body.sobrenome
    const email = req.body.email

    // ID da audiência
    const idLista = process.env.MAILCHIMP_LIST_ID

    // Chave da API
    const apiKey = process.env.MAILCHIMP_API_KEY

    // Dados do novo contato para adicionar ao Mailchimp
    const novoContato = {
        members: [
            {
                email_address: email,
                status: 'subscribed',
                merge_fields: {
                    FNAME: nome,
                    LNAME: sobrenome,
                },
            },
        ],
    }

    // Dados do novo contato em formato JSON
    const novoContatoJSON = JSON.stringify(novoContato)

    // Endpoint da API
    const url = `https://us6.api.mailchimp.com/3.0/lists/${idLista}`

    // Opções da requisição com método e autenticação
    const options = {
        method: 'POST',
        auth: `Diego:${apiKey}`,
    }

    // Variável que armazena a requisição
    const requisicao = https.request(url, options, (resposta) => {
        // Verifica o status da resposta
        if (resposta.statusCode === 200) {
            // Envia a página de sucesso
            res.sendFile(path.join(__dirname, '/sucesso.html'))
        } else {
            // Envia a página de erro
            res.sendFile(path.join(__dirname, '/falha.html'))
        }
        resposta.on('data', (data) => {
            console.log(JSON.parse(data))
        })
    })

    // Faz a requisição POST para os servidores do Mailchimp
    requisicao.write(novoContatoJSON)
    requisicao.end()
})

// Requisição POST para redirecionar o usuário para a página inicial
app.post('/falha', (req, res) => {
    res.redirect('/')
})

// Faz o servidor express ouvir na porta especificada
app.listen(port, () => {
    // Exibe uma mensagem no console
    console.log(`Servidor Express ouvindo na porta ${porta}.`)
})
