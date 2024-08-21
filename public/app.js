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
            // const contentString = data.choices[0].message.content;
            document.getElementById('response').innerText = JSON.stringify(data, null, 2);
            document.getElementById('textContent').innerText = data.parsedDoc.textContent;
            console.log("🚀 ~ data:", data)
            
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
