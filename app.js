const socket = io();

const room = "room1";

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

const peer = new RTCPeerConnection({
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" }
  ]
});

async function start(){
  const stream = await navigator.mediaDevices.getUserMedia({
    video:true,
    audio:true
  });

  localVideo.srcObject = stream;

  stream.getTracks().forEach(track=>{
    peer.addTrack(track, stream);
  });

  peer.ontrack = (event)=>{
    remoteVideo.srcObject = event.streams[0];
  };

  peer.onicecandidate = (event)=>{
    if(event.candidate){
      socket.emit("ice_candidate", {
        room,
        candidate:event.candidate
      });
    }
  };

  socket.emit("join_room", room);
}

socket.on("user_joined", async ()=>{
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);

  socket.emit("offer", {
    room,
    offer
  });
});

socket.on("offer", async(data)=>{
  await peer.setRemoteDescription(
    new RTCSessionDescription(data.offer)
  );

  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);

  socket.emit("answer", {
    room,
    answer
  });
});

socket.on("answer", async(data)=>{
  await peer.setRemoteDescription(
    new RTCSessionDescription(data.answer)
  );
});

socket.on("ice_candidate", async(data)=>{
  try{
    await peer.addIceCandidate(data.candidate);
  }catch(err){
    console.log(err);
  }
});

start();
