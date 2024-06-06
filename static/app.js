document.getElementById('imageInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const imageCanvas = document.getElementById('imageCanvas');
            const maskCanvas = document.getElementById('maskCanvas');
            const overlayCanvas = document.getElementById('overlayCanvas');
            const imageCtx = imageCanvas.getContext('2d');
            const maskCtx = maskCanvas.getContext('2d');
            const overlayCtx = overlayCanvas.getContext('2d');

            imageCanvas.width = img.width;
            imageCanvas.height = img.height;
            maskCanvas.width = img.width;
            maskCanvas.height = img.height;
            overlayCanvas.width = img.width;
            overlayCanvas.height = img.height;

            imageCtx.drawImage(img, 0, 0);
            maskCtx.fillStyle = 'rgba(255, 255, 255, 1)';
            overlayCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';

            let isDrawing = false;

            function drawMask(x, y) {
                maskCtx.beginPath();
                maskCtx.arc(x, y, 20, 0, 2 * Math.PI);
                maskCtx.fill();

                overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
                overlayCtx.drawImage(imageCanvas, 0, 0);
                overlayCtx.globalAlpha = 0.5;
                overlayCtx.drawImage(maskCanvas, 0, 0);
                overlayCtx.globalAlpha = 1.0;
            }

            overlayCanvas.onmousedown = function(e) {
                isDrawing = true;
                const rect = overlayCanvas.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                drawMask(x, y);
            };

            overlayCanvas.onmousemove = function(e) {
                if (isDrawing) {
                    const rect = overlayCanvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    drawMask(x, y);
                }
            };

            overlayCanvas.onmouseup = function() {
                isDrawing = false;
            };

            overlayCanvas.onmouseout = function() {
                isDrawing = false;
            };

            overlayCtx.drawImage(imageCanvas, 0, 0);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
});

document.getElementById('applyMosaic').addEventListener('click', function() {
    const imageCanvas = document.getElementById('imageCanvas');
    const maskCanvas = document.getElementById('maskCanvas');

    imageCanvas.toBlob(function(imageBlob) {
        maskCanvas.toBlob(function(maskBlob) {
            const formData = new FormData();
            formData.append('image', imageBlob);
            formData.append('mask', maskBlob);

            fetch('/upload', {
                method: 'POST',
                body: formData
            })
            .then(response => response.blob())
            .then(blob => {
                const newImg = document.createElement('img');
                const url = URL.createObjectURL(blob);
                newImg.onload = function() {
                    URL.revokeObjectURL(url);
                };
                newImg.src = url;
                newImg.style.width = '100%';
                document.body.appendChild(newImg);

                const maskCtx = maskCanvas.getContext('2d');
                maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

                document.getElementById('downloadImage').onclick = function() {
                    const a = document.createElement('a');
                    a.href = newImg.src;
                    a.download = 'mosaic_image.png';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                };
            });
        });
    });
});
