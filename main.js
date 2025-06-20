const APP_ID = 'xxxxxxxxx';  // Replace with your App ID
const CHANNEL = 'test';
const TOKEN = null;

let client = AgoraRTC.createClient({ mode: 'rtc', codec: 'vp8' });
let localVideoTrack, localAudioTrack;
let isMicOn = true;
let isCameraOn = true;

async function startCall() {
  const uid = await client.join(APP_ID, CHANNEL, TOKEN, null);

  [localAudioTrack, localVideoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();

  const localContainer = document.getElementById('local-video');
  localContainer.innerHTML = '';
  const localPlayer = document.createElement('div');
  localPlayer.style.width = '100%';
  localPlayer.style.height = '100%';
  localContainer.appendChild(localPlayer);
  localVideoTrack.play(localPlayer);

  await client.publish([localAudioTrack, localVideoTrack]);
  console.log('Tracks published.');

  client.on('user-published', handleUserPublished);
  client.on('user-left', handleUserLeft);
}

async function handleUserPublished(user, mediaType) {
  await client.subscribe(user, mediaType);
  console.log('Subscribed to:', user.uid);

  if (mediaType === 'video') {
    const remoteContainer = document.getElementById('remote-video');
    remoteContainer.innerHTML = '';
    const remotePlayer = document.createElement('div');
    remotePlayer.style.width = '100%';
    remotePlayer.style.height = '100%';
    remotePlayer.id = `remote-player-${user.uid}`;
    remoteContainer.appendChild(remotePlayer);
    user.videoTrack.play(remotePlayer);
  }

  if (mediaType === 'audio') {
    user.audioTrack.play();
  }
}

function handleUserLeft(user) {
  const remotePlayer = document.getElementById(`remote-player-${user.uid}`);
  if (remotePlayer) remotePlayer.remove();
}

function toggleMic() {
  if (localAudioTrack) {
    isMicOn = !isMicOn;
    localAudioTrack.setEnabled(isMicOn);
    alert(`Mic turned ${isMicOn ? 'on' : 'off'}`);
  }
}

function toggleCamera() {
  if (localVideoTrack) {
    isCameraOn = !isCameraOn;
    localVideoTrack.setEnabled(isCameraOn);
    alert(`Camera turned ${isCameraOn ? 'on' : 'off'}`);
  }
}

async function leaveCall() {
  await client.leave();
  localAudioTrack?.stop();
  localAudioTrack?.close();
  localVideoTrack?.stop();
  localVideoTrack?.close();
  document.getElementById('local-video').innerHTML = '';
  document.getElementById('remote-video').innerHTML = '';
  alert("Left the call");
}
