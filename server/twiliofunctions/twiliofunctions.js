exports.handler = function(context, event, callback) {
    console.log("now:" + Date.now());
    const uuidv4 = require('uuid/v4');

    const room = event.room || uuidv4();
    const identity = event.identity || uuidv4();
    console.log("room:" + room);
    console.log("identity:" + identity);

    const ACCOUNT_SID = context.ACCOUNT_SID;
    const API_KEY = context.TWILIO_VIDEO_KEY;
    const API_SECRET = context.TWILIO_VIDEO_SECRET;


    const AccessToken = Twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // 参加できるルームをトークンで限定
    const videoGrant = new VideoGrant({
        room: room
    });

    const accessToken = new AccessToken(
        ACCOUNT_SID,
        API_KEY,
        API_SECRET
    );

    accessToken.addGrant(videoGrant);
    accessToken.identity = identity;
    callback(null, {
        token: accessToken.toJwt(),
        room: room,
        identity: identity
    });
};