let Vimeo = require('vimeo').Vimeo;
require('dotenv').config();
const path = require('path');
const os = require('os');
const fs = require('fs');
const axios = require('axios');

let vimeoClient = new Vimeo(
    process.env.VIMEO_CLIENT_ID,
    process.env.VIMEO_CLIENT_SECRET,
    process.env.VIMEO_ACCESS_TOKEN
);

if (!vimeoClient || !vimeoClient.upload) {
    throw new Error('Vimeo client is not initialized correctly');
}

// Upload video using Vimeo client
const uploadVideo = async (file) => {
    try {
        if (!file || !file.buffer || file.buffer.length === 0) {
            throw new Error("File is undefined, missing, or empty.");
        }

        if (!Buffer.isBuffer(file.buffer)) {
            throw new Error("File buffer is not a valid Buffer.");
        }

        const tempFilePath = path.join(os.tmpdir(), file.originalname);
        await fs.promises.writeFile(tempFilePath, file.buffer);

        const vimeoResponse = await new Promise((resolve, reject) => {
            vimeoClient.upload(
                tempFilePath,
                {
                    privacy: {
                        view: 'anybody',
                        embed: 'public',
                    },
                },
                (uri) => {
                    vimeoClient.request({ method: 'GET', path: uri }, (error, body) => {
                        if (error) {
                            reject(new Error(`Error retrieving video details: ${error.message}`));
                        } else {
                            resolve(body);
                        }
                    });
                },
                (bytesUploaded, bytesTotal) => {
                    const percentage = (bytesUploaded / bytesTotal * 100).toFixed(2);
                    console.log(`${percentage}% uploaded`);
                },
                (error) => {
                    reject(new Error(`Error uploading video: ${error.message}`));
                }
            );
        });

        await fs.promises.unlink(tempFilePath);
        return vimeoResponse;
    } catch (error) {
        throw new Error(`Error uploading video: ${error.message}`);
    }
};

const uploadThumbnail = async (videoUri, thumbnailFile) => {
    try {
        if (!thumbnailFile || !thumbnailFile.buffer) {
            throw new Error("Thumbnail file or its buffer is missing.");
        }

        const tempThumbFilePath = path.join(os.tmpdir(), thumbnailFile.originalname);
        // Write the buffer to a temporary file
        await fs.promises.writeFile(tempThumbFilePath, thumbnailFile.buffer);

        const response = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'GET',
                    path: videoUri,
                    headers: {
                        Accept: 'application/vnd.vimeo.*+json;version=3.4',
                    },
                    query: {
                        fields: 'metadata.connections.pictures.uri',
                    },
                },
                (error, body) => {
                    if (error) {
                        reject(new Error(`Error fetching video metadata: ${error.message}`));
                    } else {
                        resolve(body);
                    }
                }
            );
        });

        let thumbnailUri = response.metadata.connections.pictures.uri;
        console.log(thumbnailUri)
        if (!thumbnailUri) {
            throw new Error("Thumbnail URI not found in video metadata.");
        }

        // Step 1: Create a thumbnail resource on Vimeo
        const thumbnailResponse = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'POST',
                    path: thumbnailUri,
                },
                (error, body) => {
                    if (error) {
                        return reject(new Error(`Error creating thumbnail resource: ${error.message}`));
                    }
                    resolve(body);
                }
            );
        });

        const uploadLink = thumbnailResponse.link;
        thumbnailUri = thumbnailResponse.uri;
        const thumbnailUrl = thumbnailResponse.base_link;

        const vimeoAccessToken = process.env.VIMEO_ACCESS_TOKEN;

        // Step 2: Upload the thumbnail image to the received link
        const thumbnailUploadResponse = await axios({
            method: 'PUT',
            url: uploadLink,
            headers: {
                Authorization: `Bearer ${vimeoAccessToken}`,
            },
            data: thumbnailFile.buffer,
        });

        // Clean up temporary file
        await fs.promises.unlink(tempThumbFilePath);

        return thumbnailUrl;
    } catch (error) {
        throw new Error(`Error uploading thumbnail: ${error.message}`);
    }
};

const deleteVimeoVideo = async (videoId) => {
    try {
        const response = await new Promise((resolve, reject) => {
            vimeoClient.request(
                {
                    method: 'DELETE',
                    path: `/videos/${videoId}`,
                },
                (error, body) => {
                    if (error) {
                        return reject(new Error(`Error deleting video: ${error.message}`));
                    }
                    resolve(body);
                }
            );
        });

        return true;
    } catch (error) {
        throw new Error(`Error deleting video: ${error.message}`)
    }
}

// Upload video and thumbnail
const uploadFiles = async (videoFile, thumbnailFile) => {
    try {
        const videoResponse = await uploadVideo(videoFile);
        const videoUri = videoResponse.uri;

        const thumbnailUrl = await uploadThumbnail(videoUri, thumbnailFile);

        return {
            videoUrl: videoResponse.link,
            embedUrl: videoResponse.player_embed_url,
            thumbnailUrl,
        };
    } catch (error) {
        throw error;
    }
};

module.exports = {
    uploadVideo,
    uploadThumbnail,
    uploadFiles,
    deleteVimeoVideo,
};
