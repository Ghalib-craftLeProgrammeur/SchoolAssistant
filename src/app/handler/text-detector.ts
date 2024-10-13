import fetch from 'node-fetch';

interface TextAnnotation {
    description: string;
}

interface AnnotateImageResponse {
    textAnnotations?: TextAnnotation[];
}

interface GoogleVisionResponse {
    responses: AnnotateImageResponse[];
}

async function detectText(params: { imageData: Buffer }): Promise<string> {
    // Call Rest API from google cloud vision
    // POST https://vision.googleapis.com/v1/images:annotate
    // https://cloud.google.com/vision/docs/ocr

    const Base64Image = params.imageData.toString('base64');

    const requestBody = {
        requests: [
            {
                image: {
                    content: Base64Image
                },
                features: [
                    {
                        type: "TEXT_DETECTION"
                    }
                ]
            }
        ]
    };

    const apiKey = process.env.GOOGLE_API_KEY; 

    const response = await fetch("https://vision.googleapis.com/v1/images:annotate", {
        method: "POST",
        headers: {
            contentType: "application/json",
            'Authorization': `Bearer ${apiKey}`,  // Use Bearer token format
            charset: "utf-8",
            'x-goog-user-project': 'ghalib-school-assistant' ,
        },
        body: JSON.stringify(requestBody)
        
        // ...
      }); 
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
    }
    const result: GoogleVisionResponse  = await response.json() as GoogleVisionResponse; // You can use any for simplicity or define an interface for the response type

      if (result.responses && result.responses[0] && result.responses[0].textAnnotations) {
        return result.responses[0].textAnnotations[0].description;
    
    } else {
        throw new Error('No text detected');
    }
}
async function fetchImageAsBuffer(imageUrl: string): Promise<Buffer> {
    const response = await fetch(imageUrl);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from URL: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}


(async () => {
    try {
        const imageData = await fetchImageAsBuffer('https://i.ibb.co/WKKyQg3/Screenshot-2024-10-13-175538.png');
        const text = await detectText({ imageData });
        console.log("Detected text:", text);
    } catch (error) {
        console.error("Error:", error);
    }
})();
