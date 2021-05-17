const connectButton = document.getElementById('connect-button')
const messageButton = document.getElementById('message-button')
const cheersButton = document.getElementById('cheers-button')
const status = document.querySelector('#status')
connectButton.onclick = start

cheersButton.onclick = cheers
messageButton.onclick = message

let listeningMessage = false
let listeningCheers = false

const client = new tmi.Client({
	channels: ['MatsDoesGaming'],
});

client.on('connected', () => {
    updateStatus('Connected')
})

client.on('disconnected', () => {
    updateStatus('Not connected')
})

client.on('cheer', async (channel, userstate, message) => {
    if (listeningCheers) {
        await talk(message)
    }
})

client.on('message', async (channel, userstate, message) => {
    if (listeningMessage) {
        await talk(message)
    }
})

function updateStatus(msg) {
    status.innerText = msg
}

function getVoices() {
    return new Promise(
        function (resolve, reject) {
            let synth = window.speechSynthesis;
            let id;

            id = setInterval(() => {
                if (synth.getVoices().length !== 0) {
                    resolve(synth.getVoices());
                    clearInterval(id);
                }
            }, 10);
        }
    )
}

async function talk(text) {
    const voices = await getVoices()
    const msg = new SpeechSynthesisUtterance(text)
    msg.voice = voices.find(voice => voice.name === 'Google Nederlands')
    window.speechSynthesis.speak(msg)
}

function start() {
    updateStatus('Connecting')
    client.connect()
    connectButton.onclick = stop
    connectButton.innerHTML = 'stop'
}

function stop() {
    client.disconnect()
    connectButton.onclick = start
    connectButton.innerHTML = 'connect'
}

function cheers() {
    listeningCheers = !listeningCheers

    if (listeningCheers) {
        cheersButton.innerText = 'listening to cheers'
    } else {
        cheersButton.innerText = 'listen to cheers'
    }
}

function message() {
    listeningMessage = !listeningMessage

    if (listeningMessage) {
        messageButton.innerText = 'listening to messages'
    } else {
        messageButton.innerText = 'listen to messages'
    }
}
