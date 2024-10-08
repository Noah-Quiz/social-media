let Vimeo = require('vimeo').Vimeo;
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const os = require('os');
const stream = require('stream'); // Thêm dòng này
const axios = require('axios');

let vimeoClient = new Vimeo(
    process.env.VIMEO_CLIENT_ID,
    process.env.VIMEO_CLIENT_SECRET,
    process.env.VIMEO_ACCESS_TOKEN
);

if (!vimeoClient || !vimeoClient.upload) {
    throw new Error('Vimeo client is not initialized correctly');
}

const getVideo = async (videoId) => {
    try {
        const vimeoResponse = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'GET',
                    path: `/videos/${videoId}`,
                },
                (error, body) => {
                    if (error) {
                        console.error("Vimeo video fetch error:", error);
                        reject(new Error(`Error fetching video from Vimeo: ${error.message || 'Unknown error'}`));
                    } else {
                        console.log(`Video fetched successfully. Response body:`, body);
                        resolve(body); // Resolved with the video data
                    }
                }
            );
        });
        return vimeoResponse;
    } catch (error) {
        console.error("Error fetching video:", error);
    }
};

// Upload video lên Vimeo từ Buffer
const uploadVideo = async (file) => {
    try {
        if (!file || !file.buffer || file.buffer.length === 0) {
            throw new Error("File is undefined, missing, or empty.");
        }

        if (!Buffer.isBuffer(file.buffer)) {
            throw new Error("File buffer is not a valid Buffer.");
        }

        // Ghi buffer video tạm thời ra file hệ thống
        const tempFilePath = path.join(os.tmpdir(), file.originalname);
        await fs.promises.writeFile(tempFilePath, file.buffer);

        // console.log('Uploading video of size:', file.buffer.length);

        const vimeoResponse = await new Promise((resolve, reject) => {
            vimeoClient.upload(
                tempFilePath, // Sử dụng đường dẫn tệp tạm thời
                {
                    privacy: {
                        view: 'anybody',
                        embed: 'public',
                    },
                },
                (uri) => {
                    console.log(`Video uploaded successfully. URI: ${uri}`);
                    const videoId = uri.split('/').pop();
                    const fullVideoUrl = `https://vimeo.com/${videoId}`;
                    resolve({ link: fullVideoUrl });
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

        // Xóa file tạm sau khi upload xong
        await fs.promises.unlink(tempFilePath);

        return vimeoResponse.link; // URL của video trên Vimeo
    } catch (error) {
        console.error("Upload video error:", error.message);
        throw new Error(`Error uploading video to Vimeo: ${error.message}`);
    }
};


const setThumbnail = async (videoUri, imgBuffer) => {

    console.log("Video URI", videoUri);
    

    try {
        if (!imgBuffer || imgBuffer.length === 0) {
            throw new Error("File buffer is undefined, missing, or empty.");
        }

        const thumbnailStream = new stream.PassThrough();
        thumbnailStream.end(imgBuffer);
        console.log("Thumbnail Buffer Length:", imgBuffer.length);
        
        const thumbnailResponse = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'POST',
                    path: `${videoUri}/pictures`,
                    query: { active: true },
                    body: {
                        file: thumbnailStream,
                    },
                },
                (uri, body) => {
                    console.log(`Thumbnail uploaded successfully. URI: ${uri}, Response body:`, body);
                    resolve({ link: body.link });
                },
                (bytesUploaded, bytesTotal) => {
                    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                    console.log(`${percentage}% thumbnail uploaded`);
                },
                (error) => {
                    console.error("Vimeo thumbnail upload error:", error);
                    reject(new Error(`Error uploading thumbnail to Vimeo: ${error.message || 'Unknown error'}`));
                }
            );
        });

        return thumbnailResponse.link; // URL của thumbnail trên Vimeo
    } catch (error) {
        throw new Error(`Error setting thumbnail: ${error.message}`);
    }
};

// Upload video và thiết lập thumbnail
const uploadFiles = async (videoFile, thumbNailFile) => {
    try {
        const videoUrl = await uploadVideo(videoFile);
        const imgUrl = await setThumbnail(videoUrl, thumbNailFile.buffer);
        return { videoUrl, imgUrl };
    } catch (error) {
        console.error(error.message);
        throw error;
    }
};

module.exports = {
    uploadVideo,
    setThumbnail,
    uploadFiles,
    getVideo,
};
