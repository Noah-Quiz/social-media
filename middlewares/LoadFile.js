let Vimeo = require('vimeo').Vimeo;
require('dotenv').config();
const path = require('path');
const os = require('os');
const stream = require('stream'); // Thêm dòng này
const axios = require('axios');
const fs = require('fs');
const stream = require('stream');

let vimeoClient = new Vimeo(
    process.env.VIMEO_CLIENT_ID,
    process.env.VIMEO_CLIENT_SECRET,
    process.env.VIMEO_ACCESS_TOKEN
);

if (!vimeoClient || !vimeoClient.upload) {
    throw new Error('Vimeo client is not initialized correctly');
}

// Upload video lên Vimeo từ Buffer

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

        // console.log('Uploading video of size:', file);

        // Ghi buffer video tạm thời ra file hệ thống
        const tempFilePath = path.join(os.tmpdir(), file.originalname);
        await fs.promises.writeFile(tempFilePath, file.buffer);

        // console.log('Uploading video of size:', file.buffer.length);

        const vimeoResponse = await new Promise((resolve, reject) => {
            vimeoClient.upload(
                tempFilePath, // Sử dụng đường dẫn tệp tạm thời
                tempFilePath,
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
                    resolve({ link: fullVideoUrl});
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

        // Xóa file tạm sau khi upload xong
        await fs.promises.unlink(tempFilePath);

        return vimeoResponse.link; // URL của video trên Vimeo
    } catch (error) {
        console.error("Upload video error:", error.message);
        throw new Error(`Error uploading video to Vimeo: ${error.message}`);
    }
};


const setThumbnail = async (videoUri, thumbNailFile) => {

    console.log("Video URI", videoUri);
    
const setThumbnail = async ( videoUri, imgBuffer ) => {
    console.log("Video URI", videoUri);
    
    try {
        if (!thumbNailFile || !thumbNailFile.buffer || thumbNailFile.buffer.length === 0) {
            throw new Error("File buffer is undefined, missing, or empty.");
        if (!imgBuffer || imgBuffer.length === 0) {
            throw new Error("Image buffer is undefined, missing, or empty.");
        }

        if (!Buffer.isBuffer(imgBuffer)) {
            throw new Error("Image buffer is not a valid Buffer.");
        }
        
        const tempThumbFilePath = path.join(os.tmpdir(), thumbNailFile.originalname);
        await fs.promises.writeFile(tempThumbFilePath, thumbNailFile.buffer);

        // Bước 1: Tải lên thumbnail
        const thumbnailResponse = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'POST',
                    path: `${videoUri}/pictures`,
                    body: {
                        file: fs.createReadStream(tempThumbFilePath),
                    },
                },
                (uri, body) => {
                    console.log(`Thumbnail uploaded successfully. URI: ${uri}, Response body:`, body);
                    resolve(body);
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

        // Bước 2: Đặt hình thu nhỏ là hình thu nhỏ hoạt động
        const thumbnailUri = thumbnailResponse.uri; // Lấy URI thumbnail từ phản hồi

        const setActiveResponse = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'POST',
                    path: thumbnailUri,
                    body: {
                        active: true,
                    },
                },
                (uri, body) => {
                    console.log(`Thumbnail set to active successfully. URI: ${uri}, Response body:`, body);
                    resolve(body.link); // Trả về link thumbnail
                },
                (error) => {
                    console.error("Vimeo set active thumbnail error:", error);
                    reject(new Error(`Error setting thumbnail active: ${error.message || 'Unknown error'}`));
                }
            );
        });

        const postActiveResponse = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'PUT',
                    path: setActiveResponse.link,
                    body: {
                        thumbNailFile
                    },
                },
                (uri, body) => {
                    console.log(`Thumbnail set to active successfully. URI: ${uri}, Response body:`, body);
                    resolve(body.link); // Trả về link thumbnail
                },
                (error) => {
                    console.error("Vimeo set active thumbnail error:", error);
                    reject(new Error(`Error setting thumbnail active: ${error.message || 'Unknown error'}`));
                }
            );
        });

        await fs.promises.unlink(tempThumbFilePath);

        return setActiveResponse; // URL của thumbnail trên Vimeo

        const thumbnailStream = new stream.PassThrough();
        thumbnailStream.end(imgBuffer);

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
};



// Upload video và thiết lập thumbnail
const uploadFiles = async (videoFile, thumbNailFile) => {
    try {
        const videoUrl = await uploadVideo(videoFile);
        const videoUri = `/videos/${videoUrl.split('/').pop()}`;
        
        const imgUrl = await setThumbnail(videoUri, thumbNailFile);
        return { videoUrl, imgUrl };
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
    uploadFiles
};