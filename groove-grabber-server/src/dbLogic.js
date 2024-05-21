const mongoose = require("mongoose");

const Video = mongoose.model('Video', {
    videoId: String,
    downloadCounter: Number,
    viewCounter: Number,
})

function incrementViews(videoId) {
    return new Promise(async (resolve, reject) => {
        let res = await Video.findOne({
            videoId: videoId
        });

        if(res === null) {
            const video = new Video({
                videoId: videoId,
                downloadCounter: 0,
                viewCounter: 1
            });

            await video.save()
                .then(() => {
                    resolve({
                        success: true,
                        msg: "Video added successfully.",
                        downloadCounter: video.downloadCounter,
                        viewCounter: video.viewCounter
                    });
                })
                .catch((e) => {
                    reject({success: false, msg: "Failed to add video."});
                });
        }
        else {
            await Video.updateOne({
                videoId: videoId
            }, {
                viewCounter: res.viewCounter + 1
            })
                .then(() => {
                    resolve({
                        success: true,
                        msg: "Video view-count successfully incremented.",
                        downloadCounter: res.downloadCounter,
                        viewCounter: res.viewCounter
                    })
                })
                .catch((e) => {
                    reject({success: false, msg: "Failed to increment view-count."});
                });
        }
    });
}

function incrementDownloads(videoId) {
    return new Promise(async (resolve, reject) => {
        let res = await Video.findOne({
            videoId: videoId
        });

        if (res === null) {
            //should not occur but added as a failsafe
            const video = new Video({
                videoId: videoId,
                downloadCounter: 1,
                viewCounter: 1
            });

            await video.save()
                .then(() => {
                    resolve({
                        success: true,
                        msg: "Video added successfully.",
                        downloadCounter: video.downloadCounter,
                        viewCounter: video.viewCounter
                    })
                })
                .catch((e) => {
                    reject({success: false, msg: "Failed to add video."});
                });
        } else {
            await Video.updateOne({
                videoId: videoId
            }, {
                downloadCounter: res.downloadCounter + 1
            })
                .then(() => {
                    resolve({
                        success: true,
                        msg: "Video download-count successfully incremented.",
                        downloadCounter: res.downloadCounter,
                        viewCounter: res.viewCounter
                    })
                })
                .catch((e) => {
                    reject({success: false, msg: "Failed to increment download-count."});
                });
        }
    });
}

module.exports = {
    incrementViews,
    incrementDownloads
}