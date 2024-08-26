document.getElementById('promptForm').addEventListener('submit', function (e) {
    e.preventDefault();

    // Show loading indicator and disable the submit button
    const loadingIndicator = document.getElementById('loading');
    const submitButton = this.querySelector('button[type="submit"]');
    loadingIndicator.style.display = 'block';
    submitButton.disabled = true;

    const input = document.getElementById('input').value;

    fetch('/fetch-metadata', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: input }),
    })
        .then(response => response.json())
        .then(response => {
            console.log("🚀 ~ response:", response)

            const data = response.data

            if (response.type === "page") {
                displayCard(data);
            } else if (response.type === "tweet") {
                displayTweet(data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        })
        .finally(() => {
            // Hide loading indicator and re-enable the submit button
            loadingIndicator.style.display = 'none';
            submitButton.disabled = false;
        });
});

function displayTweet(data) {
    const cardContainer = document.getElementById('cardContainer');
    const cardId = `card-${Date.now()}`;

    // figure out which image to show
    const card = `
        <div class="card" id="${cardId}">
            <button class="delete-button" onclick="deleteCard('${cardId}')">X</button>
            <img class="headline-image" src="${data.images[data.images.length - 1] || data.favicon}">
            <div class="card-content">
                <div class="tweet-author">
                    <img class="tweet-pfp" src="${data.pfp}" alt="Favicon" />
                    <p class="card-description">@${data.handle}</p>
                </div>
                <div class="card-title">${data.author}</div>
                <div class="card-description">${data.text ?? ''}</div>
                <img class="favicon" src="${data.favicon}" alt="Favicon" />
                <a href="${data.url}" target="_blank">Open page</a>
            </div>
        </div>
    `;
    cardContainer.innerHTML += card;
}

function displayCard(data) {
    const cardContainer = document.getElementById('cardContainer');

    // Generate a unique ID for each card
    const cardId = `card-${Date.now()}`;

    const card = `
        <div class="card" id="${cardId}">
            <button class="delete-button" onclick="deleteCard('${cardId}')">X</button>
            <img class="headline-image" src="${data.image}" alt="${data.title}">
            <div class="card-content">
                <div class="card-title">${data.title}</div>
                <div class="card-description">${data.description ?? ''}</div>
                <div class="card-description">${data.domain}</div>
                <img class="favicon" src="${data.favicon}" alt="Favicon" />
                <a href="${data.url}" target="_blank">Open page</a>
            </div>
        </div>
    `;

    //${data.data.links.map(link => `<a href=${link}  target="_blank">${link}</a>` ).join('<br>')}

    // // old card:
    // const card = `
    //     <div class="card" id="${cardId}">
    //         <button class="delete-button" onclick="deleteCard('${cardId}')">X</button>
    //         <img src="${metadata.image}" alt="${metadata.title}">
    //         <div class="card-content">
    //             <div class="card-title">${metadata.title}</div>
    //             <div class="card-description">${metadata.description}</div>
    //             <div class="card-footer">
    //                 <div>Author: ${metadata.author || 'Unknown'}</div>
    //                 <div>Publisher: ${metadata.publisher || 'Unknown'}</div>
    //                 <div>Date: ${new Date(metadata.date).toLocaleDateString()}</div>
    //                 <a href="${metadata.url}" target="_blank">Read more</a>
    //             </div>
    //         </div>
    //     </div>
    // `;

    cardContainer.innerHTML += card;
}

function deleteCard(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.remove();
    }
}

// "metadata": {
// "author": "Andrej Gajdos",
// "date": "2023-11-14T13:36:14.000Z",
// "description": "The whole strategy of creating link previews, including implementation using open-source libraries in node.js. The whole solution is released as npm package.",
// "image": "https://andrejgajdos.com/wp-content/uploads/2019/11/generating-link-preview.png",
// "logo": "https://logo.clearbit.com/andrejgajdos.com",
// "publisher": "Andrej Gajdos",
// "title": "How to Create a Link Preview: The Definite Guide [Implementation and Demo Included] - Andrej Gajdos",
// "url": "https://andrejgajdos.com/how-to-create-a-link-preview/"
// },
