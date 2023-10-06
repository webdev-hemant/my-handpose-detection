import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-webgl";
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";
import { drawHand } from "./utilities";
import "./App.css";

function App() {
  const [captured, setCaptured] = useState();
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);

  const runHandpose = async () => {
    const net = await handpose.load();
    console.log("Handpose model loaded.");
    setInterval(() => {
      detect(net);
    }, 100);
  };

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  const detect = async (net) => {
    // check if data is available

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      webcamRef.current.video.readyState === 4
    ) {
      // getting video properties
      const video = webcamRef.current.video;
      const videoWidth = webcamRef.current.video.videoWidth;
      const videoHeight = webcamRef.current.video.videoHeight;

      // set video dimensions (videoWidth, videoHeighs)
      webcamRef.current.video.width = videoWidth;
      webcamRef.current.video.height = videoHeight;
      // setting canvas dimensions
      canvasRef.current.width = videoWidth;
      canvasRef.current.height = videoHeight;
      // make detections

      const hand = await net.estimateHands(video);
      console.log(hand);
      if (hand.length) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 8);
        console.log(gesture);
      }
      const ctx = canvasRef.current.getContext("2d");
      drawHand(hand, ctx);
    }
  };

  useEffect(() => {
    runHandpose();
  }, []);

  return (
    <div className="App">
      <h1>Hemant -- hand pose detection app</h1>
      <header className="App-header">
        <Webcam
          ref={webcamRef}
          className="react-webcam-custom"
          audio={false}
          height={720}
          screenshotFormat="image/jpeg"
          width={1280}
          videoConstraints={videoConstraints}
        >
          {({ getScreenshot }) => (
            <button
              style={{ cursor: "pointer" }}
              onClick={() => {
                const imageSrc = getScreenshot();
                setCaptured(imageSrc);
              }}
            >
              Capture photo
            </button>
          )}
        </Webcam>
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "auto",
            marginRight: "auto",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
            transform: "scaleX(-1)",
          }}
        />
      </header>
      <div>
        <img width={300} height={200} src={captured} alt="img captured" />
      </div>
    </div>
  );
}

export default App;
