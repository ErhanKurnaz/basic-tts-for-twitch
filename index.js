const customRewardId = '655f118d-d9d1-4095-a700-8bcae7ce16d3'

const connectButton = document.getElementById('connect-button')
const messageButton = document.getElementById('message-button')
const rewardButton = document.getElementById('reward-button')
const cheersButton = document.getElementById('cheers-button')
const voiceSelection = document.getElementById('voice-select')
const minBitsInput = document.getElementById('min-bits')
const status = document.querySelector('#status')
let selectedVoice = 'Google Nederlands'

connectButton.onclick = start

cheersButton.onclick = cheers
messageButton.onclick = message
rewardButton.onclick = reward
voiceSelection.onchange = voiceSelected

let listeningMessage = false
let listeningCheers = false
let listeningReward = false

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
        if (Number(userstate.bits) >= Number(minBitsInput.value || 0)) {
            await talk(message)
        }
    }
})

client.on('message', async (channel, userstate, message) => {
    if (listeningMessage || (listeningReward && userstate['custom-reward-id'] === customRewardId)) {
        await talk(message)
    }
})

getVoices().then(voices => {
    voices.forEach(voice => {
        const option = document.createElement('option')
        option.innerText = voice.name
        option.value = voice.name

        if (voice.name === selectedVoice) {
            option.selected = true
        }

        voiceSelection.appendChild(option)
    })
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
    msg.voice = voices.find(voice => voice.name === selectedVoice)
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

function reward() {
    listeningReward = !listeningReward

    if (listeningReward) {
        rewardButton.innerText = 'listening to channel redemptions'
    } else {
        rewardButton.innerText = 'listen to channel redemptions'
    }
}

async function voiceSelected() {
    const voices = await getVoices()
    selectedVoice = voices[voiceSelection.selectedIndex].name
}
