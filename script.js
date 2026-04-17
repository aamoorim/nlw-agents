const apiKeyInput = document.getElementById('apiKey')
const gameSelect = document.getElementById('gameSelect')
const questionInput = document.getElementById('questionInput')
const askButton = document.getElementById('askButton')
const aiResponse = document.getElementById('aiResponse')
const form = document.getElementById('form')

const markdownToHtml = (text) => {
    const converter = new showdown.Converter()
    return converter.makeHtml(text)
}

const askAI = async (question, game, apiKey) => {
    const model = "gemini-2.5-flash"
    const geminiURL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
    const ask = `
    ## Especialidade
    Você é um assistente pessoal para o usuário e especialista em ${game}.

    ## Tarefa
    Você deve responder as perguntas do usuário de forma clara e objetiva, apontando sempre as melhores estratégias, dicas e informações relevantes segundo a pergunta que foi feita, com riqueza de detalhes mas sem enrolação.

    ## Regras
    - Se você não souber a resposta, diga que não sabe e não invente informações.
    - Se a pergunta não for condizente ao jogo, responda para o usuário que essa pergunta não é válida para o jogo ${game} e que ele deve reformular a pergunta.
    - Considere a data atual ${new Date().toLocaleDateString('pt-BR')} para responder as perguntas.
    - Faça pesquisas atualizadas sobre o patch atual do jogo ${game} baseado na data atual, para dar uma respostas coerentes.
    - Nunca responda itens dos quais você não tem certeza que não estão no patch mais atual do jogo ${game}.
    - Utilize sempre respostas relevantes, e que na internet são consideradas as melhores respostas para a pergunta do usuário.
    - Utilize respostas resumidas, mas que ainda assim sejam completas e informativas.
    - Utilize dialeto voltado para o jogo ${game}, mas sem gírias ou termos que possam confundir o usuário.

    ## Respostas
    - Economize nas respostas, seja direto e responda na medida do possível, mas sempre com clareza e objetividade. Se necessário, utilize listas para organizar as informações, pode fazer o uso de espaçamentos, quebras de linha e emojis para deixar a resposta mais amigável.
    - Utilize sempre o formato markdown para formatar as respostas.
    - Responda apenas o que o usuário está perguntando, não acrescente informações extras que não foram solicitadas.

    ## Exemplo de resposta
    Pergunta do usuário: Melhor build para rengar jungle
    resposta: A build mais atual é: \n\n **Itens:** \n\n coloque os itens aqui \n\n **Runas:** \n\n coloque as runas aqui \n\n **Habilidades:** \n\n coloque as habilidades aqui \n\n **Dicas:** \n\n coloque as dicas aqui \n\n **Combos:** \n\n coloque os combos aqui \n\n **Counters:** \n\n coloque os counters aqui

    E explique a razão de essa ser a melhor resposta para a pergunta do usuário, com base no patch atual do jogo ${game}.

    ---
    Aqui está a pergunta do usuário: ${question}
    `


    const contents = [{
        role: 'user',
        parts: [{
            text: ask
        }]
    }]

    const tools = [{
        google_search: {}
    }]

    // chamada API
    const response = await fetch(geminiURL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents,
            tools
        })
    })

    const data = await response.json()
    return data.candidates[0].content.parts[0].text
}

const sendForm = async (event) => {
    event.preventDefault()
    const apiKey = apiKeyInput.value
    const game = gameSelect.value
    const question = questionInput.value

    if (apiKey == '' || game == '' || question == '') {
        alert('Por favor, preencha todos os campos')
        return
    }

    askButton.disabled = true
    askButton.textContent = 'Perguntando...'
    askButton.classList.add('loading')

    try {
        // perguntar para a IA
        const text = await askAI(question, game, apiKey)
        aiResponse.querySelector('.response-content').innerHTML = markdownToHtml(text)
        aiResponse.classList.remove('hidden')

    } catch (error) {
        console.log('Erro: ', error)
    } finally {
        askButton.disabled = false
        askButton.textContent = 'Perguntar'
        askButton.classList.remove('loading')
    }
}

form.addEventListener('submit', sendForm)