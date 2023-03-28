const startShare = document.getElementById("startShare");
const screenVideo = document.getElementById("screenVideo");
const socket = io();

startShare.addEventListener("click", async () => {
  const displayMediaOptions = {
    video: {
      cursor: "always",
    },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    screenVideo.srcObject = stream;

    const peerConnection = new RTCPeerConnection();
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("candidate", event.candidate);
      }
    };

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    socket.emit("offer", offer);

    socket.on("answer", async (answer) => {
      await peerConnection.setRemoteDescription(answer);
    });

    socket.on("candidate", async (candidate) => {
      try {
        await peerConnection.addIceCandidate(candidate);
      } catch (error) {
        console.error("Error adding received ice candidate:", error);
      }
    });
  } catch (err) {
    console.error("Error: " + err);
  }
});
