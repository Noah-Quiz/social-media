require("dotenv").config()
const { default: Mux } = require("@mux/mux-node");
const getLoggers = require("../utils/logger");
const logger = getLoggers("MUX");
const jwt = require("jsonwebtoken");

const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET;

const muxClient = new Mux(MUX_TOKEN_ID, MUX_TOKEN_SECRET);
const { liveStreams, assets } = muxClient.video;

const createLiveStream = async () => {
    try {
        const stream = await liveStreams.create({
            playback_policy: ['signed'],
            new_asset_settings: {
                playback_policy: ['public'],
            },
            latency_mode: 'low',
            use_slate_for_standard_latency: true,
            max_continuous_duration: 300,
            reconnect_window: 300,
        });

        stream.playback_id = stream.playback_ids[0].id;
        stream.stream_url = `https://stream.mux.com/${stream.playback_ids[0].id}.m3u8`;

        logger.info("Create live stream on MUX successfully")
        console.log(stream)
        return stream;
    } catch (error) {
        logger.error(`Error creating live stream on MUX: ${error}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

const deleteLiveStream = async (liveStreamId) => {
    try {
        const response = await liveStreams.delete(liveStreamId);

        logger.info("Delete live stream from MUX successfully")
        return response;
    } catch (error) {
        logger.error(`Error deleting live stream on MUX: ${error.message}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

const resetStreamKey = async (liveStreamId) => {
    try {
        const response = await liveStreams.resetStreamKey(liveStreamId);

        let streamKey = null;
        if (response) {
            streamKey = response.stream_key
        }

        logger.info("Reset live stream key successfully")
        return streamKey;
    } catch (error) {
        logger.error(`Error resetting live stream key: ${error.message}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

const endStream = async (liveStreamId) => {
    try {
        const response = await liveStreams.complete(liveStreamId);

        logger.info("End live stream successfully")
        return response;
    } catch (error) {
        logger.error(`Error ending live stream on MUX: ${error.message}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

const createMuxToken = async (stream) => {
    try {
        const playbackId = stream.muxPlaybackId;

        const keyId = process.env.MUX_SIGNING_KEY_ID;
        const keySecret = process.env.MUX_PRIVATE_KEY;

        let baseOptions = {
            keyId,
            keySecret,
            expiration: '6h',
        };

        const token = await muxClient.jwt.signPlaybackId(playbackId, { ...baseOptions, type: 'video' });
        console.log('Token', token);

        return token;
    } catch (error) {
        logger.error(`Error creating MUX token: ${error.message}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

const retrieveLiveStream = async (liveStreamId) => {
    try {
        const response = await liveStreams.retrieve(liveStreamId);

        logger.info("Retrieve live stream successfully")
        return response;
    } catch (error) {
        logger.error(`Error retrieving live stream: ${error.message}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

const retrieveAssetInputInfo = async (assetId) => {
    try {
        const response = await assets.retrieveInputInfo(assetId);

        logger.info("Retrieve asset successfully")
        return response;
    } catch (error) {
        logger.error(`Error retrieving asset: ${error.message}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

const retrieveAsset = async (assetId) => {
    try {
        const response = await assets.retrieve(assetId);

        logger.info("Retrieve asset successfully")
        return response;
    } catch (error) {
        logger.error(`Error retrieving asset: ${error.message}`);
        throw new Error(`Mux Error: ${error.message}`);
    }
}

module.exports = {
    createLiveStream, 
    deleteLiveStream, 
    endStream, 
    resetStreamKey, 
    createMuxToken, 
    retrieveLiveStream, 
    retrieveAssetInputInfo,
    retrieveAsset,
}