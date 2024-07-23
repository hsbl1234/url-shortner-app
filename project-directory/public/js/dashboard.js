// public/js/dashboard.js
document.addEventListener('DOMContentLoaded', async () => {
    const fullNameSpan = document.getElementById('fullName');
    const logoutButton = document.getElementById('logoutButton');

    // Event listener for logout button
    logoutButton.addEventListener('click', () => {
        // Clear token from localStorage
        localStorage.removeItem('token');
        // Redirect to login page
        window.location.href = '/login'; // Adjust URL if needed
    });

    // Handle form submission to add a new URL
    const addUrlForm = document.getElementById('addUrlForm');
    addUrlForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const shortId = document.getElementById('shortId').value.trim();
        const url = document.getElementById('url').value.trim();

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }

            const response = await fetch(`http://localhost:3000/s/${shortId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ url })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to add URL');
            }

            const responseData = await response.json();

            // Update UI: Add the new URL to the table
            const tableBody = document.querySelector('#urlTable tbody');
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${shortId}</td>
                <td><a href="${url}" target="_blank">${url}</a></td>
                <td>${new Date().toLocaleString()}</td>
                <td class="actions">
                    <button onclick="editUrl('${shortId}')" class="btn btn-primary">Edit</button>
                    <button onclick="deleteUrl('${shortId}')" class="btn btn-danger">Delete</button>
                </td>
            `;
            tableBody.appendChild(newRow);

            // Reset the form
            addUrlForm.reset();

        } catch (error) {
            console.error('Error adding URL:', error.message);
            alert('Failed to add URL.');
        }
    });

    // Function to delete a URL
    window.deleteUrl = async (shortId) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }

            const response = await fetch(`http://localhost:3000/s/${shortId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete URL');
            }

            // Remove the row from the table
            const tableRow = document.querySelector(`#urlTable tbody tr td:nth-child(1):contains(${shortId})`).parentNode;
            tableRow.parentNode.removeChild(tableRow);

            alert('URL deleted successfully');
            location.reload();

        } catch (error) {
            console.error('Error deleting URL:', error.message);
            alert('Failed to delete URL.');
            location.reload();
        }
    };

    // Function to edit a URL
    window.editUrl = (shortId) => {
        // Find the table row based on shortId
        const tableRows = document.querySelectorAll('#urlTable tbody tr');

        let rowToUpdate = null;
        for (let row of tableRows) {
            const shortIdCell = row.querySelector('td:first-child');
            if (shortIdCell.textContent.trim() === shortId) {
                rowToUpdate = row;
                break;
            }
        }

        if (!rowToUpdate) {
            console.error(`Row with shortId ${shortId} not found`);
            return;
        }

        // Pre-fill the edit form fields with existing data
        const existingUrl = rowToUpdate.querySelector('td:nth-child(2) a').getAttribute('href');
        document.getElementById('editedUrl').value = existingUrl;

        // Display the edit popup
        const editPopup = document.getElementById('editPopup');
        editPopup.style.display = 'block';

        // Set up the form submission handler
        const editUrlForm = document.getElementById('editUrlForm');
        editUrlForm.onsubmit = async (event) => {
            event.preventDefault();

            const editedUrl = document.getElementById('editedUrl').value.trim();

            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('Token not found');
                }

                const response = await fetch(`http://localhost:3000/s/${shortId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ url: editedUrl })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to edit URL');
                }

                // Update UI: Update the URL in the table row
                rowToUpdate.querySelector('td:nth-child(2) a').href = editedUrl;
                rowToUpdate.querySelector('td:nth-child(2) a').textContent = editedUrl;

                alert('URL edited successfully');
                closePopup(); // Close the popup after successful edit
                // Do not reload immediately; give some time for UI update to reflect
                // Adjust the delay time as needed

            } catch (error) {
                console.error('Error editing URL:', error.message);
                alert('Failed to edit URL.');
                location.reload();
            }
        };
    };

    // Function to close the edit popup
    window.closePopup = () => {
        const editPopup = document.getElementById('editPopup');
        editPopup.style.display = 'none';
        document.getElementById('editedUrl').value = ''; // Clear the input field when popup is closed
    };

    // Fetch and populate full name
    const fetchFullName = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Token not found');
            }

            const response = await fetch('/fullname', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const errorMessage = await response.text();
                throw new Error(`Failed to fetch full name - ${errorMessage}`);
            }

            const data = await response.json();
            return data.fullName; // Assuming API returns { fullName: 'John Doe' }
        } catch (error) {
            throw new Error(`Failed to fetch full name - ${error.message}`);
        }
    };

    try {
        const fullName = await fetchFullName();

        if (fullNameSpan) {
            fullNameSpan.textContent = fullName;
        }
    } catch (error) {
        console.error('Error fetching full name:', error.message);
        alert('Failed to fetch full name. Please check your network connection and try again.');
    }
});
