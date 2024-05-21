//conversion & Info
const axios = require("axios");
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
app.use(express.json())
//database
const mongoose = require('mongoose');
const dbLogic = require('./src/dbLogic');

app.use(cors({
    origin: 'http://localhost:4200'
}));

async function initializeDatabase() {
    mongoose.connect("mongodb+srv://190432:Hallo123@wmc.ak93zks.mongodb.net/groovegrabber")
        .then((info) => {
            console.log('DB CONNECTED');
        })
        .catch((err) => {
            console.error(err);
        });
}

app.get('/videoInfo', async (req, res) => {
    let videoId = decodeURIComponent(req.query.id);
    let videoUrl = 'https://www.youtube.com/watch?v=' + videoId;
    let apiUrl = `https://noembed.com/embed?url=${encodeURIComponent(videoUrl)}`;
    try {
        let response = await axios.get(apiUrl);
        let json = response.data;
        json['videoUrl'] = videoUrl;
        dbLogic.incrementViews()
            .then((res) => {
                json['downloads'] = res.downloadCounter;
                json['views'] = res.viewCounter;
            })
            .catch((e) => {
                console.error(e);
                json['downloads'] = 0;
                json['views'] = 0;
            })
            .finally(() => {
                res.status(200).send(json);
            })
    } catch (error) {
        return res.status(500).send('Could not load video info');
    }
});

app.get('/download', async (req, res) => {
    let videoUrl = decodeURIComponent(req.query.url);
    let title;
    let artist;
    let album;

    if(req.query.title === undefined){
        title = 'Unknown Title';
    } else {
        title = decodeURIComponent(req.query.title);
    }
    if(req.query.artist === undefined){
        artist = 'Unknown Artist';
    } else {
        artist = decodeURIComponent(req.query.artist);
    }
    if(req.query.album === undefined){
        album = 'Unknown Album';
    } else {
        album = decodeURIComponent(req.query.album);
    }

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

                    dbLogic.incrementDownloads()
                        .then((res) => {})
                        .catch((e) => {
                            console.error(e);
                        })
                        .finally(() => {
                            let downloadName = title.replace(/[^a-zA-Z0-9_.-]/g, '_');
                            res.header('Content-Disposition', `attachment; filename="${downloadName}.mp3"`);
                            res.sendFile(tempFilePath, (err) => {
                                if (err) {
                                    console.error(err);
                                    cleanupFile(tempFilePath);
                                    return res.status(500).send('Failed to send file.');
                                }
                                cleanupFile(tempFilePath);
                            });
                        })
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
    initializeDatabase();
    console.log(`Server is running on port ${port}`);
});
