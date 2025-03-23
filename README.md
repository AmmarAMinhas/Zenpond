# 🦆 Zenpond 🌿  
*A calm, lofi-inspired interactive web experience—with a capybara twist.*

## 🌱 About  
Zenpond was created during **GizzHack**, a duck-themed hackathon. It’s a peaceful, animated pond where users can upload a selfie or JPG headshot and watch themselves transform into a capybara using AI. When an image is uploaded, it’s processed and displayed, and one of the ducks in the pond quietly becomes a capybara—gently shifting the scene over time. Lofi music plays in the background to complete the chill vibe.

## 🧠 What We Used  
- **Frontend:** HTML, CSS, JavaScript  
- **Backend:** Flask, Python  
- **AI Models:**  
  - [Grounding SAM](https://github.com/IDEA-Research/GroundingSAM) – for object segmentation  
  - [Grounding DINO (SwinT OGC Config)](https://github.com/IDEA-Research/GroundingDINO/blob/main/groundingdino/config/GroundingDINO_SwinT_OGC.py) – for object detection  
  - **Stable Diffusion** – for the image-to-capybara transformation  

## ⚙️ How It Works  
1. User uploads a JPG selfie or headshot via an HTML file input.  
2. The frontend sends the image to the Flask backend using a `fetch` request.  
3. Flask processes the image with AI:
   - Grounding SAM & DINO detect the person in the image.
   - Stable Diffusion converts them into a capybara.
4. The resulting image is returned in base64 and rendered in the browser.
5. A duck in the pond is replaced with a capybara.
6. Lofi music continues playing as the pond evolves.

## 🚧 Challenges  
We ran into a lot. Docker wouldn’t compile the environment with all the model dependencies, so we pivoted to running everything locally. Getting Grounding DINO, SAM, and Stable Diffusion to work together—especially with object masking—required a lot of debugging. On the frontend side, getting the duck animations and capybara swaps to feel natural and keep the chill vibe took tuning. The HTML image upload and handling also involved some trial-and-error to make it clean and functional.  
**Flask** also posed challenges, particularly in managing image requests and returning base64 data without performance issues.

## ✅ Accomplishments  
- Built a full AI pipeline from image upload to visual feedback.  
- Successfully integrated Flask with multiple AI models.  
- Created a calm, cohesive visual experience with evolving interaction.  
- Maintained smooth teamwork—splitting model development, frontend/GUI work, and integration.

## 💡 What We Learned  
- How to serve and connect AI models like Grounding SAM, DINO, and Stable Diffusion through Flask.  
- How to use HTML/JavaScript to handle real-time image uploads and update UI.  
- How generative AI and segmentation models can enhance interactive design.  
- The importance of smooth user experience in projects that combine AI and frontend animation.  
- How AI models can interact with custom GUIs in creative ways.

## 🔮 What’s Next  
- Containerizing the entire project in a **Docker image** for easy deployment.  
- Hosting the live app at **[zenpond.tech](https://zenpond.tech)** so anyone can upload a photo and enjoy the experience.  
- Optimizing the transformation pipeline for faster feedback.  
- Possibly adding an optional webcam input mode for live capybara conversions.

## 👥 Team  
- **Kevin** – Created the initial AI model skeleton and understood how the models (Grounding SAM, DINO, and Stable Diffusion) worked together. Refined pond logic, polished the UI, and developed the overall art style and visual experience.  
- **Ammar** – Built the initial GUI skeleton, refined backend code, and handled Flask integration. Managed the AI pipeline and ensured smooth communication between frontend and backend.  
- Powered by caffeine, ducks, capybara memes, and late-night debugging.
