import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button, TextField } from '@material-ui/core';
import { get } from 'lodash';
import ReactCrop from 'react-image-crop';
import "react-image-crop/dist/ReactCrop.css";

// Increase pixel density for crop preview quality on retina screens.

const pixelRatio = window.devicePixelRatio || 1;

// We resize the canvas down when saving on retina devices otherwise the image
// will be double or triple the preview size.
/* const getResizedCanvas = (canvas, newWidth, newHeight) => {
 *   const tmpCanvas = document.createElement("canvas");
 *   tmpCanvas.width = newWidth;
 *   tmpCanvas.height = newHeight;
 * 
 *   const ctx = tmpCanvas.getContext("2d");
 *   ctx.drawImage(
 *     canvas,
 *     0,
 *     0,
 *     canvas.width,
 *     canvas.height,
 *     0,
 *     0,
 *     newWidth,
 *     newHeight
 *   );
 * 
 *   return tmpCanvas;
 * }
 *  */
/* const generateDownload = (previewCanvas, crop) => {
 *   if (!crop || !previewCanvas) {
 *     return;
 *   }
 * 
 *   const canvas = getResizedCanvas(previewCanvas, crop.width, crop.height);
 * 
 *   canvas.toBlob(
 *     (blob) => {
 *       const previewUrl = window.URL.createObjectURL(blob);
 * 
 *       const anchor = document.createElement("a");
 *       anchor.download = "cropPreview.png";
 *       anchor.href = URL.createObjectURL(blob);
 *       anchor.click();
 * 
 *       window.URL.revokeObjectURL(previewUrl);
 *     },
 *     "image/png",
 *     1
 *   );
 * }
 *  */

const ImageUploader = props => {
  const [fileName, setFileName] = useState(props.defaultName);
  const [upImg, setUpImg] = useState(props.defaultImg);
  const imgRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const [crop, setCrop] = useState({ unit: "%", width: 30, height: props.isCircle ? undefined : 30, aspect: props.isCircle ? 1 : undefined });
  const [completedCrop, setCompletedCrop] = useState(null);
  const [base64, setBase64] = useState(null);

  const onSelectFile = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => setUpImg(reader.result));
      const file = e.target.files[0];
      setFileName(file.name)
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const onLoad = useCallback((img) => {
    imgRef.current = img;
  }, []);

  const uploadImage = () => {
    props.onUpload(base64, fileName)
  }

  useEffect(() => {
    if (!completedCrop || !previewCanvasRef.current || !imgRef.current) {
      return;
    }

    const image = imgRef.current;
    const canvas = previewCanvasRef.current;
    const crop = completedCrop;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    const ctx = canvas.getContext("2d");

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );
    setBase64(canvas.toDataURL());
  }, [completedCrop]);

  return (
    <div className="App">
      <div className='flex-vertical-center'>
        <TextField
          variant="outlined"
          inputProps={{
            type: "file",
            accept: "image/*"
          }}
          onChange={onSelectFile}
        />
        <Button
          style={{marginLeft: '10px'}}
          variant='outlined'
          color='primary'
          disabled={!get(completedCrop, 'width') || !get(completedCrop, 'height')}
          onClick={uploadImage}
        >
          Upload
        </Button>
      </div>
      <div style={{marginTop: '10px'}}>
        <ReactCrop
          src={upImg}
          onImageLoaded={onLoad}
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          crossorigin='Anonymous'
          circularCrop={props.isCircle}
        />
      </div>
      <div style={{display: 'none'}}>
        <canvas
          ref={previewCanvasRef}
          style={{
            width: Math.round(get(completedCrop, 'width', 0)),
            height: Math.round(get(completedCrop, 'height', 0))
          }}
        />
      </div>
    </div>
  );
}

export default ImageUploader;
