// Theme switching functionality
function applyTheme(isVeggie) {
    const root = document.documentElement;
    const headerEmoji = document.querySelector('.header-emoji');
    const beefText = document.querySelector('.beef-text');
    
    if (isVeggie) {
        root.setAttribute('data-theme', 'veggie');
        headerEmoji.textContent = '🥦';
        beefText.textContent = 'veggies';
    } else {
        root.removeAttribute('data-theme');
        headerEmoji.textContent = '🥩';
        beefText.textContent = 'beefs';
    }
    
    // Save preference to localStorage
    localStorage.setItem('isVeggie', isVeggie);
}

// Initialize theme from localStorage or default to meat
document.addEventListener('DOMContentLoaded', () => {
    // Set up theme toggle
    const themeToggle = document.getElementById('themeToggle');
    const isVeggie = localStorage.getItem('isVeggie') === 'true';
    
    // Apply saved theme
    themeToggle.checked = isVeggie;
    applyTheme(isVeggie);
    
    // Add event listener for theme toggle
    themeToggle.addEventListener('change', (e) => {
        applyTheme(e.target.checked);
    });
    
    // Get DOM elements
    const beefForm = document.getElementById('beef-form');
    const beefsContainer = document.getElementById('beefs-container');
    const refreshButton = document.getElementById('refresh-beefs');
    const beefTemplate = document.getElementById('beef-template');

    // Load beefs when the page loads
    loadBeefs();

    // Add event listeners
    beefForm.addEventListener('submit', submitBeef);
    refreshButton.addEventListener('click', loadBeefs);

    // Function to submit a new beef
    async function submitBeef(event) {
        event.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('beef-content').value.trim();
        
        if (!title || !content) {
            alert('Please fill out all fields');
            return;
        }
        
        try {
            const response = await fetch('/api/beefs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ title, content })
            });
            
            if (!response.ok) {
                throw new Error('Failed to submit beef');
            }
            
            // Clear the form
            beefForm.reset();
            
            // Reload the beefs
            loadBeefs();
            
            // Show success message
            alert('Your beef has been butchered and saved!');
            
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit beef. Please try again.');
        }
    }

    // Function to load beefs
    async function loadBeefs() {
        try {
            beefsContainer.innerHTML = '<p class="text-center text-muted">Loading beefs...</p>';
            
            const response = await fetch('/api/beefs');
            
            if (!response.ok) {
                throw new Error('Failed to load beefs');
            }
            
            const beefs = await response.json();
            
            // Display the beefs
            displayBeefs(beefs);
            
        } catch (error) {
            console.error('Error:', error);
            beefsContainer.innerHTML = '<p class="text-center text-danger">Failed to load beefs. Please try again.</p>';
        }
    }

    // Function to delete a beef
    async function deleteBeef(id) {
        if (!confirm('Are you sure you want to delete this beef?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/beefs/${id}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Failed to delete beef');
            }
            
            // Reload the beefs
            loadBeefs();
            
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to delete beef. Please try again.');
        }
    }

    // Function to display beefs
    function displayBeefs(beefs) {
        if (!beefs || beefs.length === 0) {
            beefsContainer.innerHTML = '<p class="text-center text-muted">No beefs yet. Start venting!</p>';
            return;
        }
        
        // Clear the container
        beefsContainer.innerHTML = '';
        
        // Sort beefs by date, newest first
        beefs.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        // Add each beef to the container
        beefs.forEach(beef => {
            const beefElement = beefTemplate.content.cloneNode(true);
            
            beefElement.querySelector('.beef-title').textContent = beef.title;
            beefElement.querySelector('.beef-content').textContent = beef.content;
            beefElement.querySelector('.beef-date').textContent = formatDate(beef.date);
            
            // Set the beef ID for the delete button
            const deleteButton = beefElement.querySelector('.delete-beef');
            deleteButton.dataset.id = beef.id;
            deleteButton.addEventListener('click', (e) => deleteBeef(e.target.dataset.id));
            
            beefsContainer.appendChild(beefElement);
        });
    }

    // Function to format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString();
    }
});
