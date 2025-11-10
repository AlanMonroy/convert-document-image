import express from 'express';
import pdfjsLib from 'pdfjs-dist/legacy/build/pdf.js';
import fetch from 'node-fetch';
import { createCanvas } from 'canvas';
import cors from 'cors';
app.use(cors()); // permite cualquier origen


const app = express();
app.use(express.json({ limit: '50mb' })); // Para PDFs grandes

// Endpoint principal
app.post('/convertir', async (req, res) => {
    try {
        const { valorBuscado, fileUrl } = req.body;

        if (!valorBuscado || !fileUrl) {
            return res.status(400).json({ error: "Falta valorBuscado o fileUrl" });
        }

        console.log(`Valor a buscar: ${valorBuscado}`);
        console.log(`Archivo a procesar: ${fileUrl}`);

        // Descargar PDF como ArrayBuffer
        const response = await fetch(fileUrl);
        if (!response.ok) throw new Error("No se pudo descargar el PDF");
        const arrayBuffer = await response.arrayBuffer();

        // Cargar PDF desde buffer
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        console.log(`Número de páginas: ${pdf.numPages}`);

        const imagenesBase64 = [];

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 2.0 });

            const canvas = createCanvas(viewport.width, viewport.height);
            const context = canvas.getContext('2d');

            await page.render({ canvasContext: context, viewport }).promise;

            // Solo Base64, sin prefijo data:image/png;base64,
            const dataURL = canvas.toDataURL("image/png");
            imagenesBase64.push(dataURL.split(",")[1]);
        }

        res.json({
            totalPaginas: pdf.numPages,
            imagenesBase64
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// Puerto de Render o local
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API corriendo en puerto ${PORT}`));
