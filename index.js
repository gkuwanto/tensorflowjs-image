let net;

const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();


async function app() {
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');
    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  document.getElementById('class-a').addEventListener('click', ()=> addExample(0));
  document.getElementById('class-b').addEventListener('click', ()=> addExample(1));
  document.getElementById('class-c').addEventListener('click', ()=> addExample(2));
  document.getElementById('class-d').addEventListener('click', ()=> addExample(3));

  while (true) {
    if(classifier.getNumClasses()>0){
      const activation = net.infer(webcamElement, 'conv_preds');
      const result = await classifier.predictClass(activation);
      const classes = ['You Are Doing Nothing', 'Rock', 'Paper', 'Scissors'];
      document.getElementById('console').innerText = `
        prediction: ${classes[result.classIndex]}\n
        probability: ${result.confidences[result.classIndex]}
      `;
    } 

    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: 'enviroment'},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();