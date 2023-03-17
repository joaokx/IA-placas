import React, { useEffect } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tmImage from "@teachablemachine/image";

const MyModelComponent = () => {
  const URL = "./my_model/";
  let model, webcam, labelContainer, maxPredictions;

  useEffect(() => {
    async function init() {
      const modelURL = URL + "model.json";
      const metadataURL = URL + "metadata.json";

      model = await tmImage.load(modelURL, metadataURL);
      maxPredictions = model.getTotalClasses();

      const flip = true;
      webcam = new tmImage.Webcam(200, 200, flip);
      await webcam.setup();
      await webcam.play();
      window.requestAnimationFrame(loop);

      document.getElementById("webcam-container").appendChild(webcam.canvas);
      labelContainer = document.getElementById("label-container");
      for (let i = 0; i < maxPredictions; i++) {
        labelContainer.appendChild(document.createElement("div"));
      }
    }

    async function loop() {
      webcam.update();
      await predict();
      window.requestAnimationFrame(loop);
    }

    async function predict() {
      const prediction = await model.predict(webcam.canvas);
      for (let i = 0; i < maxPredictions; i++) {
        const classPrediction =
          prediction[i].className + ": " + prediction[i].probability.toFixed(2);
        labelContainer.childNodes[i].innerHTML = classPrediction;
      }
    }

    init();

    // cleanup function to stop webcam and release resources
    return () => {
      webcam.stop();
    };
  }, []);

  return (
    <div>
      <div>Teachable Machine Image Model</div>
      <div id="webcam-container"></div>
      <div id="label-container"></div>
    </div>
  );
};

export default MyModelComponent;