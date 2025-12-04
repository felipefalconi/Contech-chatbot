/* ============================================================ */
/* 1. LÓGICA DO SITE (Menu, Tema, Contato)                      */
/* ============================================================ */

let menu = document.getElementById("menu");
let iconeBarras = document.getElementById("icone-barras");
let iconeX = document.getElementById("icone-x");

function abreFechaMenu() {
    if (menu.classList.contains("menu-fechado")) {
        menu.classList.remove("menu-fechado");
        iconeBarras.style.display = "none";
        iconeX.style.display = "inline";
    } else {
        menu.classList.add("menu-fechado");
        iconeX.style.display = "none";
        iconeBarras.style.display = "inline";
    }
}

onresize = () => {
    menu.classList.remove("menu-fechado");
    iconeBarras.style.display = "none";
    iconeX.style.display = "inline";
}

function alternarTema() {
    const body = document.body;
    body.classList.toggle('dark-mode');
    const isDarkMode = body.classList.contains('dark-mode');
    localStorage.setItem('tema', isDarkMode ? 'dark' : 'light');
}

window.onload = function() {
    const temaSalvo = localStorage.getItem('tema');
    if (temaSalvo === 'dark') {
        document.body.classList.add('dark-mode');
    }
}

function Contatar(event) {
    event.preventDefault();
    const btn = event.target.querySelector('button');
    const textoOriginal = btn.innerText;
    btn.innerText = 'Enviando...';

    const templateParams = {
        nome: document.getElementById('campo-nome').value,
        email: document.getElementById('campo-email').value,
        telefone: `(${document.getElementById('ddd').value}) ${document.getElementById('telefone').value}`,
        mensagem: document.getElementById('campo-texto').value
    };

    const serviceID = 'service_hmfbmmb';
    const templateID = 'template_hl0mhn3';

    emailjs.send(serviceID, templateID, templateParams)
        .then(function(response) {
            console.log('SUCESSO!', response.status, response.text);
            alert('Mensagem enviada com sucesso!');
            event.target.reset();
            btn.innerText = textoOriginal;
        }, function(error) {
            console.log('FALHA...', error);
            alert('Ocorreu um erro ao enviar. Verifique o console para detalhes.');
            btn.innerText = textoOriginal;
        });
}

/* ============================================================ */
/* 2. LÓGICA DO CHATBOT TEKINHO (VIA N8N)                       */
/* ============================================================ */

const iconeTekFechado = document.getElementById('icone-tek-fechado');
const containerChatbot = document.getElementById('container-chatbot');
const cabecalhoChatbot = document.getElementById('cabecalho-chatbot');

const cabecalhoEstadoInicial = document.getElementById('cabecalho-estado-inicial');
const cabecalhoEstadoChat = document.getElementById('cabecalho-estado-chat');

const elementosBoasVindas = document.getElementById('elementos-boasvindas');
const corpoChat = document.getElementById('corpo-chat');

const inputUsuario = document.getElementById('input-usuario');
const botaoEnviar = document.getElementById('botao-enviar');
const botoesCategoria = document.querySelectorAll('.botao-categoria');

// Certifique-se de que os nomes das imagens estão corretos
const URL_MASCOTE_TEKINHO = "img/cabeca.png"; 
const URL_ICONE_USUARIO = "img/icone usuario.png"; 
const URL_VIDEO = "https://www.youtube.com/watch?v=dQw4w9WgXcQ"; 

// LINK DO SEU WEBHOOK N8N (Produção)
const N8N_WEBHOOK_URL = "https://felipefalconi.app.n8n.cloud/webhook/chat";

let chatIniciado = false;

/* FUNÇÃO ESSENCIAL: Cria ID de sessão para memória */
function obterOuCriarIdSessao() {
    let sessionId = localStorage.getItem('chatbotSessionId');
    if (!sessionId) {
        // Gera um ID aleatório simples
        sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem('chatbotSessionId', sessionId);
    }
    return sessionId;
}

function abrirChatbot() {
    iconeTekFechado.style.display = 'none';
    containerChatbot.classList.remove('fechado');

    chatIniciado = false;
    elementosBoasVindas.classList.remove('escondido');
    cabecalhoChatbot.classList.remove('modo-chat');
    cabecalhoEstadoInicial.classList.remove('escondido');
    cabecalhoEstadoChat.classList.add('escondido');

    corpoChat.innerHTML = '';
    
    adicionarMensagem("Olá, Eu sou o Techo!", 'bot');
    adicionarMensagem("O que quer saber?", 'bot');

    inputUsuario.focus();
}

function fecharChatbot() {
    containerChatbot.classList.add('fechado');
    setTimeout(() => {
        iconeTekFechado.style.display = 'block';
    }, 300);
}

function minimizarChatbot() {
    fecharChatbot();
}

function mostrarVideo() {
    window.open(URL_VIDEO, '_blank');
}

function iniciarModoChatCompleto() {
    if (chatIniciado) return;
    chatIniciado = true;

    elementosBoasVindas.classList.add('escondido');
    cabecalhoChatbot.classList.add('modo-chat');
    cabecalhoEstadoInicial.classList.add('escondido');
    cabecalhoEstadoChat.classList.remove('escondido');
}

function adicionarMensagem(texto, remetente) {
    const divMensagem = document.createElement('div');
    
    // Formatação de texto (Negrito e Itálico)
    let textoFormatado = texto
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
        .replace(/\*(.*?)\*/g, '<i>$1</i>')
        .replace(/\n/g, '<br>');

    let iconeHTML = '';
    if (remetente === 'bot') {
        divMensagem.classList.add('mensagem-bot');
        iconeHTML = `<img src="${URL_MASCOTE_TEKINHO}" alt="Tekinho" class="icone-mensagem-bot">`;
        divMensagem.innerHTML = `${iconeHTML} <span>${textoFormatado}</span>`;
    } else {
        divMensagem.classList.add('mensagem-usuario');
        iconeHTML = `<img src="${URL_ICONE_USUARIO}" alt="Você" class="icone-mensagem-usuario">`;
        divMensagem.innerHTML = `<span>${textoFormatado}</span> ${iconeHTML}`;
    }

    corpoChat.appendChild(divMensagem);
    corpoChat.scrollTop = corpoChat.scrollHeight;
}

/**
 * FUNÇÃO PRINCIPAL: Conecta com o n8n + Easter Eggs Locais
 */
async function processarMensagem(texto) {
    if (!texto.trim()) return;

    iniciarModoChatCompleto();

    // 1. Mostra a mensagem do usuário
    adicionarMensagem(texto, 'user');
    inputUsuario.value = '';
    
    // 2. Trava input
    inputUsuario.disabled = true;
    botaoEnviar.disabled = true;
    inputUsuario.placeholder = "Techo está pensando...";

    // --- FILTRO DE EASTER EGGS ---
    const textoBaixo = texto.toLowerCase();

    if (textoBaixo.includes("vai corinthians") || 
        textoBaixo.includes("que time você torce") || 
        textoBaixo.includes("qual seu time") ||
        textoBaixo.includes("qual o seu time")) {
        
        await new Promise(r => setTimeout(r, 1000));
        adicionarMensagem("Aqui é **Corinthians**! Vai Timão! 🦅🖤🤍", 'bot');
        
        inputUsuario.disabled = false;
        botaoEnviar.disabled = false;
        inputUsuario.placeholder = "Digite sua mensagem...";
        inputUsuario.focus();
        return; 
    }
    // ----------------------------
    
    try {
        const userSessionId = obterOuCriarIdSessao(); 

        // --- CONEXÃO COM O N8N ---
        const response = await fetch(N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: texto,
                sessionId: userSessionId 
            })
        });

        if (!response.ok) {
            throw new Error(`Erro no n8n: ${response.status}`);
        }

        const data = await response.json();
        const respostaBot = data.reply || data.output || data.text || "Sem resposta definida.";

        adicionarMensagem(respostaBot, 'bot');

    } catch (error) {
        console.error("Erro detalhado:", error);
        adicionarMensagem("Desculpe, estou com problemas de conexão agora. Tente recarregar a página! 🔌", 'bot');
    } finally {
        inputUsuario.disabled = false;
        botaoEnviar.disabled = false;
        inputUsuario.placeholder = "Digite sua mensagem...";
        inputUsuario.focus();
    }
}

// Event Listeners
botaoEnviar.addEventListener('click', () => {
    processarMensagem(inputUsuario.value);
});

inputUsuario.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        processarMensagem(inputUsuario.value);
    }
});

botoesCategoria.forEach(btn => {
    btn.addEventListener('click', () => {
        let texto = btn.getAttribute('data-prompt');
        processarMensagem(texto);
    });
});