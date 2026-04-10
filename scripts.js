document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('process-form');
    const loadingOverlay = document.getElementById('loading-overlay');
    const downloadSection = document.getElementById('download-section');
    const downloadLink = document.getElementById('download-link');
    const fileInput = document.getElementById('images');
    const fileError = document.getElementById('file-error');
    const videoError = document.getElementById('video-error');
    const operationSelect = document.getElementById('operation');
    const operationError = document.getElementById('operation-error');
    const languageError = document.getElementById('language-error');
    const sourceLang = document.getElementById("source-lang");
    const targetLang = document.getElementById("target-lang");
    const languageSelection = document.getElementById("language-selection");
    const dubbingOptions = document.getElementById("dubbing-options");
    const dubbingType = document.getElementById("dubbing-type");
    const dubbingLanguage = document.getElementById("dubbing-language");
    const srtFileInput = document.getElementById("srt-file");
    const videoFileInput = document.getElementById("video-file");
    const fileLabel = document.getElementById("file-label");
    const srtFileLabel = document.querySelector('label[for="srt-file"]');
    const videoFileLabel = document.querySelector('label[for="video-file"]');

    languageSelection.style.display = "none";
    dubbingOptions.style.display = "none";

    operationSelect.addEventListener('change', function () {
        let selectedOperation = operationSelect.value;
        resetFormFields();

        if (selectedOperation === "translate" || selectedOperation === "both") {
            languageSelection.style.display = "flex";
            fileLabel.innerText = "Upload File (Max 5 images)";
            fileInput.setAttribute("accept", "image/*");
            fileInput.setAttribute("multiple", "multiple");
            fileInput.style.display = "block";
            fileLabel.style.display = "block";
            sourceLang.required = true;
            targetLang.required = true;
            fileInput.required = true;
        } else if (selectedOperation === "subtitle") {
            languageSelection.style.display = "flex";
            fileLabel.innerText = "Upload File (Max 1 video)";
            fileInput.setAttribute("accept", "video/*");
            fileInput.removeAttribute("multiple");
            fileInput.style.display = "block";
            fileLabel.style.display = "block";
            sourceLang.required = true;
            targetLang.required = true;
            fileInput.required = true;
        } else if (selectedOperation === "dubbing") {
            dubbingOptions.style.display = "flex";
            fileLabel.style.display = "none";
            fileInput.style.display = "none";
            dubbingType.required = true;
        } else {
            fileLabel.innerText = "Upload File (Max 5 images)";
            fileInput.setAttribute("accept", "image/*");
            fileInput.setAttribute("multiple", "multiple");
            fileInput.style.display = "block";
            fileLabel.style.display = "block";
            fileInput.required = true;
        }
    });

    dubbingType.addEventListener('change', function () {
        if (dubbingType.value === "manual") {
            dubbingLanguage.style.display = "flex";
            srtFileInput.style.display = "block";
            videoFileInput.style.display = "block";
            srtFileLabel.style.display = "block";
            videoFileLabel.style.display = "block";
            videoFileInput.required = true;
            srtFileInput.required = true;
            document.getElementById('dubbing-lang').required = true;
        } else {
            dubbingLanguage.style.display = "none";
            srtFileInput.style.display = "none";
            videoFileInput.style.display = "none";
            srtFileLabel.style.display = "none";
            videoFileLabel.style.display = "none";
            videoFileInput.required = false;
            srtFileInput.required = false;
            document.getElementById('dubbing-lang').required = false;
        }
    });

    fileInput.addEventListener('change', function () {
        const files = fileInput.files;
        const selectedOperation = operationSelect.value;
        let hasVideo = false;
        let hasImage = false;

        for (const file of files) {
            if (file.type.startsWith('video/')) {
                hasVideo = true;
            } else if (file.type.startsWith('image/')) {
                hasImage = true;
            }
        }

        if ((selectedOperation === 'subtitle') && !hasVideo) {
            videoError.style.display = 'block';
            fileInput.value = '';
        } else {
            videoError.style.display = 'none';
        }

        if (files.length > 100 && !hasVideo) {
            fileError.style.display = 'block';
            fileInput.value = '';
        } else {
            fileError.style.display = 'none';
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        loadingOverlay.style.display = 'flex';
        const formData = new FormData(form);
        
        try {
            const response = await fetch('/process', {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (data.status === 'ready') {
                downloadLink.href = data.download_url;
                downloadSection.style.display = 'block';
                form.style.display = 'none';
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            loadingOverlay.style.display = 'none';
        }
    });

    function validateForm() {
        let isValid = true;
        let operation = operationSelect.value;
        let sourceLangValue = sourceLang.value;
        let targetLangValue = targetLang.value;

        if (!operation) {
            operationError.innerText = "Please select an operation.";
            operationError.style.display = "block";
            isValid = false;
        } else {
            operationError.style.display = "none";
        }

        if ((operation === "translate" || operation === "both" || operation === "subtitle") &&
            (!sourceLangValue || !targetLangValue)) {
            languageError.innerText = "Both language fields must be selected.";
            languageError.style.display = "block";
            isValid = false;
        } else if (sourceLangValue === targetLangValue && (operation === "translate" || operation === "both")) {
            languageError.innerText = "Source and Target languages cannot be the same.";
            languageError.style.display = "block";
            isValid = false;
        } else {
            languageError.style.display = "none";
        }

        return isValid;
    }

    function resetFormFields() {
        languageSelection.style.display = "none";
        dubbingOptions.style.display = "none";
        dubbingLanguage.style.display = "none";
        srtFileInput.style.display = "none";
        videoFileInput.style.display = "none";
        srtFileLabel.style.display = "none";
        videoFileLabel.style.display = "none";
        fileInput.style.display = "none";
        fileLabel.style.display = "none";
        fileInput.value = '';
        sourceLang.value = '';
        targetLang.value = '';
        dubbingType.value = '';
        document.getElementById('dubbing-lang').value = '';
        sourceLang.required = false;
        targetLang.required = false;
        fileInput.required = false;
        dubbingType.required = false;
        videoFileInput.required = false;
        srtFileInput.required = false;
        document.getElementById('dubbing-lang').required = false;
    }

    // Daily info note
    const note = document.getElementById("daily-note");
    const closeBtn = document.getElementById("close-note");
    const today = new Date().toISOString().split("T")[0];

    if (localStorage.getItem("noteClosedDate") !== today) {
        note.style.display = "block";
    }

    closeBtn.addEventListener("click", function() {
        note.style.display = "none";
        localStorage.setItem("noteClosedDate", today);
    });
});

// Reset form
function resetForm() {
    fetch('/delete-uploads', {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            document.getElementById('process-form').reset();
            document.getElementById('download-section').style.display = 'none';
            document.getElementById('process-form').style.display = 'block';
               window.open("https://koesan-mangaspaces.hf.space/download/results.zip", '_blank'); 
                window.location.href = "https://koesan-mangaspaces.hf.space/";
             
        }
    })
    .catch(error => console.error('Error:', error));
}

function purchase() {
    document.getElementById('purchase-modal').style.display = 'flex';
}

function closePurchaseModal() {
    document.getElementById('purchase-modal').style.display = 'none';
}

function confirmPurchase() {
    alert("Purchase completed successfully!");
    closePurchaseModal();
}
