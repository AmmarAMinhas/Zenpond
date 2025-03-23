import torch
from segment_anything import sam_model_registry, SamPredictor
from PIL import Image, ImageDraw
import numpy as np
from diffusers import StableDiffusionInpaintPipeline

# Load SAM
print("Loading SAM...")
sam = sam_model_registry["vit_h"](checkpoint="models/sam_vit_h.pth").to("cuda")
predictor = SamPredictor(sam)

# Load Stable Diffusion Inpainting Pipeline
print("Loading Stable Diffusion Inpainting Pipeline...")
pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "runwayml/stable-diffusion-inpainting",
    torch_dtype=torch.float16
).to("cuda")

# Load and preprocess the image
image_path = "pexels-olly-3789888 (1).jpg"  # Replace with your test image
print(f"Loading image: {image_path}")
image = Image.open(image_path).convert("RGB")  # Ensure RGB format
np_image = np.array(image)  # Convert to NumPy array
H, W, _ = np_image.shape  # Get image height and width


# Test SAM
print("Running SAM...")
predictor.set_image(np_image)  # SAM expects a NumPy array

# Define a point prompt (e.g., center of the image)
point_coords = torch.tensor([[[W // 2, H // 2]]], device="cuda")  # Center of the image
point_labels = torch.tensor([[1]], device="cuda")  # Label as foreground (1)

# Predict masks using SAM with point prompts only
masks, _, _ = predictor.predict_torch(
    point_coords=point_coords,  # Point prompt
    point_labels=point_labels,  # Point label
    boxes=None,  # No bounding box
    multimask_output=False  # Set to False for a single mask
)
print("SAM generated masks:", masks)

# Save the mask as an overlay on the original image
mask = masks[0][0].cpu().numpy()  # Convert mask to NumPy array

# Debug: Check mask and image shapes
print("Mask shape:", mask.shape)
print("Image shape:", np_image.shape)

# Debug: Save the mask as a separate image
mask_image = Image.fromarray((mask * 255).astype(np.uint8))
mask_image.save("mask_only.jpg")
print("Mask saved as mask_only.jpg")

# Debug: Check mask region count
print("Mask region count:", np.sum(mask))  # Number of pixels in the mask

# Invert the mask
mask = ~mask  # Invert the mask using the NOT operator
print("Inverted mask region count:", np.sum(mask))  # Number of pixels in the mask

# Create an overlay of the mask on the original image
overlay = np.zeros_like(np_image)  # Create a blank image with the same shape as the input
overlay[mask] = [0, 255, 0]  # Set the mask region to green (more visible)

# Debug: Check overlay shape
print("Overlay shape:", overlay.shape)

# Blend the overlay with the original image
alpha = 0.5  # Transparency of the overlay
output_image = (np_image * (1 - alpha) + overlay * alpha).astype(np.uint8)

# Save the output image
output_image = Image.fromarray(output_image)
output_image.save("output_with_mask.jpg")
print("Output image saved as output_with_mask.jpg")

# Define the prompt for inpainting
prompt = "photo of a realistic capybara, highly detailed, cute animal"  # Replace with your desired prompt

# Perform inpainting using Stable Diffusion
print("Running Stable Diffusion Inpainting...")
result_image = pipe(
    prompt=prompt,
    image=image,
    mask_image=Image.fromarray((mask * 255).astype(np.uint8)).resize(image.size),
    guidance_scale=7.5,
).images[0]

# Save the final result
result_image.save("output_with_capybara.jpg")
print("Output image with capybara saved as output_with_capybara.jpg")


# Moved this down here because I would get NSFW message while getting final output, causing the image to be completely blacked out
from groundingdino.util.inference import load_model, predict

# Load GroundingDINO for generating image with bounding box
print("Loading GroundingDINO...")
grounding_model = load_model("models/GroundingDINO_SwinT_OGC.py", "models/groundingdino_swint_ogc.pth", device="cuda")

# Preprocess the image for GroundingDINO
# GroundingDINO expects a tensor with shape [C, H, W] and values in [0, 1]
image_tensor = torch.from_numpy(np_image).permute(2, 0, 1).float()  # [H, W, C] -> [C, H, W]
image_tensor = image_tensor / 255.0  # Normalize to [0, 1]

# Test GroundingDINO
print("Running GroundingDINO...")
boxes, _, _ = predict(
    grounding_model, image_tensor, "person", box_threshold=0.25, text_threshold=0.20, device="cuda"
)
print("GroundingDINO detected boxes:", boxes)

# Convert normalized box coordinates to pixel coordinates
box_pixels = boxes * torch.tensor([W, H, W, H])
print("Box in pixel coordinates:", box_pixels)

# Convert box format from [x_center, y_center, width, height] to [x0, y0, x1, y1]
x_center, y_center, width, height = box_pixels[0]
x0 = x_center - width / 2
y0 = y_center - height / 2
x1 = x_center + width / 2
y1 = y_center + height / 2

# Ensure the coordinates are within the image bounds
x0 = max(0, x0)
y0 = max(0, y0)
x1 = min(W, x1)
y1 = min(H, y1)

# Draw the bounding box on the image
draw = ImageDraw.Draw(image)
draw.rectangle([(x0, y0), (x1, y1)], outline="red", width=2)
image.save("image_with_box.jpg")
print("Image with bounding box saved as image_with_box.jpg")

