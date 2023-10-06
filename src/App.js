import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import "@tensorflow/tfjs-backend-webgl";
import * as handpose from "@tensorflow-models/handpose";
import * as fp from "fingerpose";
// import * as fpg from "fingerpose-gestures";
import { drawHand } from "./utilities";
import "./App.css";
const fpg = require("fingerpose-gestures");

function App() {
  const [captured, setCaptured] = useState();
  const [emoji, setEmoji] = useState(null);
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  emoji && console.log(emoji);
  const runHandpose = async () => {
    const net = await handpose.load();
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
      if (hand.length) {
        const GE = new fp.GestureEstimator([
          fp.Gestures.VictoryGesture,
          fp.Gestures.ThumbsUpGesture,
          fpg.Gestures.thumbsDownGesture,
          fpg.Gestures.fingerSplayedGesture,
          fpg.Gestures.raisedHandGesture,
          fpg.Gestures.pinchingGesture,
          fpg.Gestures.okGesture,
          fpg.Gestures.fistGesture,
        ]);
        const gesture = await GE.estimate(hand[0].landmarks, 8);
        if (gesture?.gestures) {
          const confidance = gesture.gestures.map((prediction) => {
            return prediction.score;
          });
          const maxConfidance = confidance.indexOf(
            Math.max.apply(null, confidance)
          );
          setEmoji(gesture?.gestures?.[maxConfidance]?.name || "");
        }
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
      <h2 style={{ margin: "3rem 0 0 0" }}>You are doing :- {emoji}</h2>
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
        <img
          style={{ transform: "scaleX(-1)" }}
          width={300}
          height={200}
          src={captured}
          alt="img captured"
        />
      </div>
    </div>
  );
}

export default App;
