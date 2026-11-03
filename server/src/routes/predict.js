const express = require('express');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const { optionalAuth } = require('../middleware/auth');
const { AnalysisRepository } = require('../models/Analysis');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

/**
 * Helper to extract direct image URL from web page HTML (og:image, twitter:image, or img src)
 */
function extractImageFromHtml(html, pageUrl) {
  try {
    // 1. og:image
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch && ogMatch[1]) return new URL(ogMatch[1], pageUrl).toString();

    // 2. twitter:image
    const twMatch = html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i);
    if (twMatch && twMatch[1]) return new URL(twMatch[1], pageUrl).toString();

    // 3. First major img tag
    const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch && imgMatch[1]) return new URL(imgMatch[1], pageUrl).toString();
  } catch {}
  return null;
}

/**
 * Helper to download an image from a web URL with redirect and HTML fallback support
 */
async function fetchImageBufferFromUrl(targetUrl) {
  let resolvedUrl = targetUrl.trim();

  // If it's a Google image redirect URL: e.g. https://www.google.com/imgres?imgurl=...
  try {
    const urlObj = new URL(resolvedUrl);
    if (urlObj.searchParams.has('imgurl')) {
      resolvedUrl = decodeURIComponent(urlObj.searchParams.get('imgurl'));
    }
  } catch {}

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
  };

  const response = await axios.get(resolvedUrl, {
    responseType: 'arraybuffer',
    timeout: 20000,
    headers,
    maxRedirects: 5,
  });

  const contentType = (response.headers['content-type'] || '').toLowerCase();

  // If the web URL returned an HTML page (e.g. Unsplash or Reddit page), try extracting the true image
  if (contentType.includes('text/html')) {
    const html = Buffer.from(response.data).toString('utf-8');
    const directImageUrl = extractImageFromHtml(html, resolvedUrl);
    if (directImageUrl && directImageUrl !== resolvedUrl) {
      const secondResp = await axios.get(directImageUrl, {
        responseType: 'arraybuffer',
        timeout: 20000,
        headers,
        maxRedirects: 5,
      });
      return {
        buffer: Buffer.from(secondResp.data),
        mime: (secondResp.headers['content-type'] || 'image/jpeg').split(';')[0].trim(),
        sourceUrl: directImageUrl,
      };
    }
    throw new Error('The web URL returned an HTML webpage rather than an image. Please right-click the image on the webpage and select "Copy Image Address", or upload the downloaded image file.');
  }

  return {
    buffer: Buffer.from(response.data),
    mime: (contentType || 'image/jpeg').split(';')[0].trim(),
    sourceUrl: resolvedUrl,
  };
}

router.post('/', optionalAuth, upload.single('file'), async (req, res, next) => {
  try {
    let fileBuffer = null;
    let fileName = 'underwater_image.jpg';
    let fileMime = 'image/jpeg';

    // 1. Check if uploaded via multipart file
    if (req.file) {
      fileBuffer = req.file.buffer;
      fileName = req.file.originalname || 'uploaded_image.jpg';
      fileMime = (req.file.mimetype || 'image/jpeg').split(';')[0].trim();
    } 
    // 2. Check if image URL passed in JSON or form body
    else if (req.body?.imageUrl) {
      const urlStr = req.body.imageUrl.trim();
      if (urlStr.startsWith('data:image/')) {
        const parts = urlStr.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        if (mimeMatch) fileMime = mimeMatch[1].trim();
        fileBuffer = Buffer.from(parts[1], 'base64');
        const ext = fileMime.split('/')[1] || 'png';
        fileName = `pasted_image.${ext}`;
      } else if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
        const fetched = await fetchImageBufferFromUrl(urlStr);
        fileBuffer = fetched.buffer;
        fileMime = fetched.mime;
        try {
          const parsedUrl = new URL(fetched.sourceUrl);
          const base = parsedUrl.pathname.split('/').pop();
          if (base && base.includes('.')) {
            fileName = base.split('?')[0];
          } else {
            const ext = fileMime.split('/')[1] || 'jpg';
            fileName = `web_image.${ext}`;
          }
        } catch {
          fileName = 'web_image.jpg';
        }
      }
    } 
    // 3. Check if base64 data passed directly
    else if (req.body?.imageBase64) {
      const b64 = req.body.imageBase64.replace(/^data:image\/\w+;base64,/, '');
      fileBuffer = Buffer.from(b64, 'base64');
      fileName = 'pasted_clipboard.png';
      fileMime = 'image/png';
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return res.status(400).json({
        error: true,
        message: 'No image found. Please provide an image file, paste a clipboard image, or enter an image web link.',
      });
    }

    // Ensure valid filename extension
    if (!fileName.includes('.')) {
      const ext = fileMime.split('/')[1] || 'jpg';
      fileName = `${fileName}.${ext}`;
    }

    const fastApiUrl = process.env.FASTAPI_URL || 'http://127.0.0.1:8000';

    // Prepare multipart form data for FastAPI
    const form = new FormData();
    form.append('file', fileBuffer, {
      filename: fileName,
      contentType: fileMime,
    });
    form.append('task', 'debris');
    form.append('enhance', 'false'); // default enhancement is false

    // Forward to FastAPI
    const response = await axios.post(`${fastApiUrl}/predict`, form, {
      headers: {
        ...form.getHeaders(),
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      timeout: 45000,
    });

    const fastApiData = response.data;

    // Extract detected classes list
    let detectedClasses = [];
    if (Array.isArray(fastApiData.predictions)) {
      detectedClasses = fastApiData.predictions
        .map((p) => p.class_name || p.name || p.class || p)
        .filter(Boolean);
    }

    // Save to MongoDB (DO NOT store base64 images in MongoDB)
    const savedRecord = await AnalysisRepository.create({
      userId: req.user ? req.user.id : 'guest',
      fileName: fileName,
      detectedClasses,
      coveragePercent: Number(fastApiData.coverage_percentage) || 0,
      processingTimeMs: Number(fastApiData.processing_time) || 0,
    });

    // Return the full visual result and metadata to frontend
    res.json({
      success: true,
      analysisId: savedRecord._id ? savedRecord._id.toString() : savedRecord.id,
      fileName: fileName,
      task: fastApiData.task,
      is_demo: fastApiData.is_demo,
      mode_label: fastApiData.mode_label,
      predictions: fastApiData.predictions,
      segmentation_mask: fastApiData.segmentation_mask,
      overlay: fastApiData.overlay,
      preprocessed: fastApiData.preprocessed,
      enhanced: fastApiData.enhanced || fastApiData.preprocessed,
      original: fastApiData.original,
      coverage_percentage: fastApiData.coverage_percentage,
      processing_time: fastApiData.processing_time,
      microplastic: fastApiData.microplastic,
      createdAt: savedRecord.createdAt,
    });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({
        error: true,
        message: `FastAPI Model Server Error: ${err.response.data?.detail || err.response.statusText}`,
      });
    }
    return res.status(400).json({
      error: true,
      message: err.message || 'Image processing failed.',
    });
  }
});

module.exports = router;
