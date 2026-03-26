const USER_ID = 1;
const API_URL = `http://localhost:3000/users/${USER_ID}`;

// DOM Elements
const filesGrid = document.getElementById('files-grid');
const storageUsed = document.getElementById('storage-used');
const storageProgress = document.getElementById('storage-progress');
const totalFilesCount = document.getElementById('total-files-count');
const uploadBtn = document.getElementById('upload-btn');
const uploadModal = document.getElementById('upload-modal');
const closeModalBtn = document.getElementById('close-modal');
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchStorageSummary();
    fetchFiles();
});

// Fetch Storage Summary
async function fetchStorageSummary() {
    try {
        const response = await fetch(`${API_URL}/storage-summary`);
        const data = await response.json();
        
        const usedMB = (data.totalStorageUsed / (1024 * 1024)).toFixed(2);
        storageUsed.innerText = `${usedMB} MB`;
        
        const percent = Math.min((data.totalStorageUsed / data.limit) * 100, 100);
        storageProgress.style.width = `${percent}%`;
        
        // Progress bar color based on usage thresholds
        if (percent > 90) storageProgress.style.backgroundColor = '#ef4444';
        else if (percent > 75) storageProgress.style.backgroundColor = '#f59e0b';
        else storageProgress.style.backgroundColor = '#6366f1';
        
        totalFilesCount.innerText = `${data.totalActiveFiles} files`;
    } catch (error) {
        console.error('Error fetching storage summary:', error);
    }
}

// Fetch Files
async function fetchFiles() {
    try {
        const response = await fetch(`${API_URL}/files`);
        const data = await response.json();
        
        filesGrid.innerHTML = '';
        
        if (data.files.length === 0) {
            filesGrid.innerHTML = `<p style="color: #94a3b8; grid-column: 1/-1; text-align: center; padding: 40px;">No files found. Let's upload something!</p>`;
            return;
        }

        data.files.forEach(file => {
            const sizeKB = (file.size / 1024).toFixed(1);
            const date = new Date(file.uploadTime).toLocaleDateString();
            
            // Determine icon based on extension
            let iconClass = 'ri-file-line';
            if (file.fileName.endsWith('.pdf')) iconClass = 'ri-file-pdf-line';
            else if (file.fileName.match(/\.(jpg|jpeg|png)$/)) iconClass = 'ri-image-line';
            else if (file.fileName.match(/\.(mp4|mov)$/)) iconClass = 'ri-video-line';
            else if (file.fileName.endsWith('.zip')) iconClass = 'ri-file-zip-line';

            const card = document.createElement('div');
            card.className = 'file-card';
            card.innerHTML = `
                <button class="delete-btn" onclick="deleteFile(${file.id})">
                    <i class="ri-delete-bin-line"></i>
                </button>
                <i class="${iconClass} file-icon"></i>
                <h3 class="file-name">${file.fileName}</h3>
                <p class="file-meta">${sizeKB} KB • ${date}</p>
            `;
            filesGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching files:', error);
    }
}

// Delete File
async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    try {
        const response = await fetch(`${API_URL}/files/${fileId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            fetchStorageSummary();
            fetchFiles();
        } else {
            alert('Failed to delete file.');
        }
    } catch (error) {
        console.error('Delete error:', error);
    }
}

// Upload Modal Handlers
uploadBtn.addEventListener('click', () => {
    uploadModal.classList.add('active');
});

closeModalBtn.addEventListener('click', () => {
    uploadModal.classList.remove('active');
});

uploadModal.addEventListener('click', (e) => {
    if (e.target === uploadModal) uploadModal.classList.remove('active');
});

// File Upload Handlers (Simulation for real-life files)
dropZone.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        await uploadToAPI(file);
    }
});

// Since the REST API currently relies on the user sending JSON metadata directly (simulating a cloud),
// this script reads the file attributes from the HTML input and constructs the exact JSON schema the backend expects.
async function uploadToAPI(file) {
    // We generate a fake hash for demonstration since we aren't uploading binary data to S3 just yet
    const simulatedHash = 'xyz-' + Date.now() + '-' + file.name;
    
    const payload = {
        name: file.name,
        size: file.size,
        hash: simulatedHash
    };

    try {
        uploadModal.classList.remove('active');
        
        const response = await fetch(`${API_URL}/files`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            fileInput.value = ''; // reset 
            fetchStorageSummary();
            fetchFiles();
        } else {
            const err = await response.json();
            alert(`Error: ${err.error || 'Failed to upload'}`);
        }
    } catch (error) {
        console.error('Upload error:', error);
        alert('Upload failed due to network error.');
    }
}
