const { Vimeo } = require('vimeo');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');

const vimeoClient = new Vimeo(
    process.env.VIMEO_CLIENT_ID,
    process.env.VIMEO_CLIENT_SECRET,
    process.env.VIMEO_ACCESS_TOKEN
);


if (!vimeoClient || !vimeoClient.upload) {
    throw new Error('Vimeo client is not initialized correctly');
}


const uploadVideo = async (file) => {
    try {
        if (!file || !file.buffer || file.buffer.length === 0) {
            throw new Error("File is undefined, missing, or empty.");
        }
        
        if (!Buffer.isBuffer(file.buffer)) {
            throw new Error("File buffer is not a valid Buffer.");
        }

        console.log('File object:', file);
        console.log('Uploading video of size:', file.buffer.length);
        
        const vimeoResponse = await new Promise((resolve, reject) => {
            vimeoClient.upload(
                file.buffer,
                {
                    privacy: {
                        view: 'anybody',
                        embed: 'public',
                    },
                },
                (uri) => {
                    console.log(`Video uploaded successfully. URI: ${uri}`);
                    resolve({ link: uri }); // Trả về đường dẫn video
                },
                (bytesUploaded, bytesTotal) => {
                    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                    console.log(`${percentage}% uploaded`);
                },
                (error) => {
                    console.error("Vimeo upload error:", error);
                    reject(new Error(`Error uploading video to Vimeo: ${error.message || 'Unknown error'}`));
                }
            );
        });

        return vimeoResponse.link; // URL của video trên Vimeo
    } catch (error) {
        console.error("Upload video error:", error.message);
        throw new Error(`Error uploading video to Vimeo: ${error.message}`);
    }
};


const setThumbnail = async (videoUri, imgFile) => {
    try {
        if (!imgFile || !imgFile.buffer) {
            throw new Error("Thumbnail file is undefined or missing.");
        }

        const thumbnailResponse = await vimeoClient.request({
            method: 'POST',
            path: `${videoUri}/pictures`,
            query: { active: true },
            fileData: imgFile.buffer // Truyền Buffer của hình ảnh
        });
        return thumbnailResponse.link;
    } catch (error) {
        throw new Error(`Error setting thumbnail: ${error.message}`);
    }
}

// Upload video và thiết lập thumbnail
const uploadFiles = async (videoFile, thumbNailFile) => {
    try {
        const videoUrl = await uploadVideo(videoFile); // Đảm bảo videoFile là đối tượng có buffer
        const imgUrl = await setThumbnail(thumbNailFile); // Đảm bảo thumbNailFile là đối tượng có buffer
        return { videoUrl, imgUrl }; // Trả về URL của video và thumbnail
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

module.exports = {
    uploadVideo,
    setThumbnail,
    uploadFiles
};
