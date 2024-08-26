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
        .then(data => {
            // document.getElementById('response').innerText = JSON.stringify(data, null, 2);
            // document.getElementById('textContent').innerText = data.parsedDoc.textContent;
            console.log("🚀 ~ data:", data)
            displayCard(data);
            
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


function displayCard(data) {
    const cardContainer = document.getElementById('cardContainer');

    const metadata = data.metadata;

    // Generate a unique ID for each card
    const cardId = `card-${Date.now()}`;

    const card = `
        <div class="card" id="${cardId}">
            <button class="delete-button" onclick="deleteCard('${cardId}')">X</button>
            <img src="${metadata.image}" alt="${metadata.title}">
            <div class="card-content">
                <div class="card-title">${metadata.title}</div>
                <div class="card-description">${metadata.description}</div>
                <div class="card-footer">
                    <div>Author: ${metadata.author || 'Unknown'}</div>
                    <div>Publisher: ${metadata.publisher || 'Unknown'}</div>
                    <div>Date: ${new Date(metadata.date).toLocaleDateString()}</div>
                    <a href="${metadata.url}" target="_blank">Read more</a>
                </div>
            </div>
        </div>
    `;

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
