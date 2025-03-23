import torch
from groundingdino.util.inference import load_model, predict
from segment_anything import sam_model_registry, SamPredictor
from PIL import Image
import numpy as np

# Load GroundingDINO
print("Loading GroundingDINO...")
grounding_model = load_model("models/GroundingDINO_SwinT_OGC.py", "models/groundingdino_swint_ogc.pth", device="cuda")

# Load SAM
print("Loading SAM...")
sam = sam_model_registry["vit_h"](checkpoint="models/sam_vit_h.pth").to("cuda")
predictor = SamPredictor(sam)

# Load a test image
image_path = "test_image.jpg"  # Replace with your test image
print(f"Loading image: {image_path}")
image = Image.open(image_path).convert("RGB")
np_image = torch.from_numpy(np.array(image)).float()

# Test GroundingDINO
print("Running GroundingDINO...")
boxes, _, _ = predict(
    grounding_model, np_image, "person", box_threshold=0.35, text_threshold=0.25, device="cuda"
)
print("GroundingDINO detected boxes:", boxes)

# Test SAM
print("Running SAM...")
predictor.set_image(np_image)
H, W, _ = np_image.shape
boxes = boxes * torch.tensor([W, H, W, H])
masks, _, _ = predictor.predict_torch(
    boxes=boxes.to("cuda"), multimask_output=False
)
print("SAM generated masks:", masks)

# Save the mask as an image
mask = masks[0][0].cpu().numpy()
mask_image = Image.fromarray((mask * 255).astype(np.uint8))
mask_image.save("mask_output.jpg")
print("Mask saved as mask_output.jpg")