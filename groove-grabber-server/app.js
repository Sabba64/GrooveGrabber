//conversion
const ytdl = require('ytdl-core');
const NodeID3 = require('node-id3');
//system
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
//express
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000

app.use(cors({
    origin: 'http://localhost:4200'
}));

app.get('/download', async (req, res) => {
    let videoUrl = decodeURIComponent(req.query.url);
    let title = decodeURIComponent(req.query.title) || 'Default Title';
    let artist = decodeURIComponent(req.query.artist) || 'Unknown Artist';
    let album = decodeURIComponent(req.query.album) || 'Unknown Album';



    if (!videoUrl || !ytdl.validateURL(videoUrl)) {
        return res.status(400).send('Invalid URL provided.');
    }

    let tempFileName = crypto.randomUUID() + '.mp3';
    let tempFilePath = path.join(__dirname, tempFileName);
    let writableStream = fs.createWriteStream(tempFilePath);

    writableStream.on('error', err => {
        console.error(err);
        cleanupFile(tempFilePath);
        return res.status(500).send('Failed to write audio file.');
    });

    try {
        ytdl(videoUrl, { format: 'mp3', filter: 'audioonly' })
            .pipe(writableStream)
            .on('finish', () => {
                let tags = { title, artist, album };

                NodeID3.update(tags, tempFilePath, (err, buffer) => {
                    if (err) {
                        console.error(err);
                        cleanupFile(tempFilePath);
                        return res.status(500).send('Failed to update ID3 tags.');
                    }

                    let downloadname = title.replace(/[^a-zA-Z0-9_.-]/g, '_');
                    res.header('Content-Disposition', `attachment; filename="${downloadname}.mp3"`);
                    res.sendFile(tempFilePath, (err) => {
                        if (err) {
                            console.error(err);
                            cleanupFile(tempFilePath);
                            return res.status(500).send('Failed to send file.');
                        }
                        cleanupFile(tempFilePath);
                    });
                });
            });
    } catch (error) {
        console.error(error);
        cleanupFile(tempFilePath);
        return res.status(500).send('Failed to download audio.');
    }
});

function cleanupFile(filePath) {
    fs.unlink(filePath, err => {
        if (err) {
            console.error(err);
        }
    });
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
