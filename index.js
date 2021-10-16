const version = '0.1.5'
const customRewardId = '655f118d-d9d1-4095-a700-8bcae7ce16d3'

const allButton = document.getElementById('all-button')
const connectButton = document.getElementById('connect-button')
const messageButton = document.getElementById('message-button')
const rewardButton = document.getElementById('reward-button')
const cheersButton = document.getElementById('cheers-button')
const subButton = document.getElementById('sub-button')
const raidButton = document.getElementById('raid-button')

const voiceSelection = document.getElementById('voice-select')
const minBitsInput = document.getElementById('min-bits')
const status = document.querySelector('#status')

document.querySelector('#version').innerHTML = 'version: ' + version

let selectedVoice = 'Google Nederlands'

connectButton.onclick = start

allButton.onclick = selectAll
cheersButton.onclick = cheers
messageButton.onclick = message
rewardButton.onclick = reward
subButton.onclick = subs
raidButton.onclick = raids
voiceSelection.onchange = voiceSelected

let listeningMessage = false
let listeningCheers = false
let listeningReward = false
let listeningSubs = false
let listeningRaids = false

const pendingMessages = []
const voices = []
let isTalking = false

const client = new tmi.Client({
	channels: ['MatsDoesGaming'],
});

client.on('connected', () => {
    updateStatus('Connected')
})

client.on('disconnected', () => {
    updateStatus('Not connected')
})

client.on('cheer', (_, userstate, message) => {
    if (listeningCheers) {
        if (Number(userstate.bits) >= Number(minBitsInput.value || 0)) {
            talk(message)
        }
    }
})

client.on('message', (_, userstate, message) => {
    if (listeningMessage || (listeningReward && userstate['custom-reward-id'] === customRewardId)) {
        talk(message)
    }
})

client.on('resub', (_, __, ___, message) => {
    if (listeningSubs) {
        talk(message)
    }
})

client.on('subscription', (_, __, ___, message) => {
    if (listeningSubs) {
        talk(message)
    }
})

client.on('raided', (_, username, viewers) => {
    if (listeningRaids) {
        talk(`OMG thank you ${username} for rading with ${viewers} viewers!!! Mats is blushing already`)
    }
})

getVoices().then(v => {
    voices.push(...v)
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

/**
 * Split a string into chunks of the given size
 * @param  {String} string is the String to split
 * @param  {Number} size is the size you of the cuts
 * @return {Array} an Array with the strings
 */
function splitString (string, size) {
	var re = new RegExp('.{1,' + size + '}', 'g');
	return string.match(re);
}

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

function talk(text) {
    splitString(text, 255).forEach(msg => pendingMessages.push(msg))

    if (isTalking) {
        return
    }

    isTalking = true
    const voice = voices.find(voice => voice.name === selectedVoice)
    while (pendingMessages.length > 0) {
        const message = pendingMessages.shift()
        const msg = new SpeechSynthesisUtterance(message)
        msg.voice = voice
        window.speechSynthesis.speak(msg)
    }

    isTalking = false
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

function subs() {
    listeningSubs = !listeningSubs

    if (listeningSubs) {
        subButton.innerText = 'listening to subscriptions'
    } else {
        subButton.innerText = 'listen to subscriptions'
    }
}

function raids() {
    listeningRaids = !listeningRaids

    if (listeningRaids) {
        raidButton.innerText = 'listening to raids'
    } else {
        raidButton.innerText = 'listen to raids'
    }
}

function selectAll() {
    if (!listeningCheers) {
        cheers()
    }

    if (!listeningReward) {
        reward()
    }

    if (!listeningSubs) {
        subs()
    }

    if (!listeningRaids) {
        raids()
    }
}

async function voiceSelected() {
    selectedVoice = voices[voiceSelection.selectedIndex].name
}
