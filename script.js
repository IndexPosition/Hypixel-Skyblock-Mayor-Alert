const apiUrl = 'https://api.hypixel.net/v2/resources/skyblock/election';

function convertMinecraftColors(text) {
    return text.replace(/§([0-9a-f])/g, (match, colorCode) => {
        const color = colorMap[colorCode.toLowerCase()] || '#FFFFFF';
        return `<span style="color: ${color}">`;
    }) + '</span>'.repeat((text.match(/§[0-9a-f]/g) || []).length);
}

async function fetchElectionData() {
    const response = await fetch(apiUrl);
    const data = await response.json();
    if (data.success) {
        updateMayorInfo(data.mayor);
        updateMinisterInfo(data.mayor.minister);
        updateCandidatesInfo(data.current.candidates);
        checkForNotification(data.mayor.name);
    }
}

function updateMayorInfo(mayor) {
    document.getElementById('mayor-name').textContent = mayor.name;
    document.getElementById('mayor-img').src = `imgs/${mayorImageMap[mayor.name]}`;
    const perksContainer = document.getElementById('mayor-perks');
    perksContainer.innerHTML = '';
    mayor.perks.forEach(perk => {
        const li = document.createElement('li');
        li.innerHTML = convertMinecraftColors(`${perk.name}: ${perk.description}`);
        perksContainer.appendChild(li);
    });
}

function updateMinisterInfo(minister) {
    document.getElementById('minister-name').textContent = minister.name;
    document.getElementById('minister-img').src = `imgs/${mayorImageMap[minister.name]}`;
    document.getElementById('minister-perk').innerHTML = convertMinecraftColors(`${minister.perk.name}: ${minister.perk.description}`);
}

function updateCandidatesInfo(candidates) {
    const candidatesContainer = document.getElementById('candidates');
    candidatesContainer.innerHTML = '';
    candidates.forEach(candidate => {
        const candidateDiv = document.createElement('div');
        candidateDiv.className = 'candidate';
        candidateDiv.innerHTML = `
            <img src="imgs/${mayorImageMap[candidate.name]}" alt="${candidate.name}" />
            <h3>${candidate.name}</h3>
            <div class="votes">Votes: ${candidate.vote}</div>
            <ul>
                ${candidate.perks.map(perk => `<li>${convertMinecraftColors(perk.name)}: ${convertMinecraftColors(perk.description)}</li>`).join('')}
            </ul>
        `;
        candidatesContainer.appendChild(candidateDiv);
    });
}

document.getElementById('save-selection').addEventListener('click', () => {
    const selectedMayor = document.getElementById('mayor-select').value;
    if (selectedMayor) {
        localStorage.setItem('selectedMayor', selectedMayor);
        alert(`You will be notified when ${selectedMayor} is elected as Mayor.`);
    } else {
        alert('Please select a mayor.');
    }
});

function checkForNotification(currentMayor) {
    const selectedMayor = localStorage.getItem('selectedMayor');
    if (selectedMayor && selectedMayor === currentMayor) {
        notifyUser(currentMayor);
    }
}

function notifyUser(mayorName) {
    if (Notification.permission === 'granted') {
        new Notification('Hypixel Skyblock', {
            body: `${mayorName} is the current mayor!`,
            icon: `imgs/${mayorImageMap[mayorName]}`
        });
    }
}

if (Notification.permission !== 'granted') {
    Notification.requestPermission();
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function(error) {
            console.log('Service Worker registration failed:', error);
        });
}

fetchElectionData();
setInterval(fetchElectionData, 3600000);

