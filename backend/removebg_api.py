
import io
from fastapi import APIRouter, UploadFile, File, HTTPException, Response
from PIL import Image
from rembg import remove

router = APIRouter()

@router.post("/removebg")
async def remove_bg(file: UploadFile = File(...)):
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Invalid image file.")
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGBA")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image.")
    # Use rembg to remove background
    result_np = remove(image)
    result_img = Image.fromarray(result_np) if not isinstance(result_np, Image.Image) else result_np
    buf = io.BytesIO()
    result_img.save(buf, format="PNG")
    buf.seek(0)
    return Response(buf.getvalue(), media_type="image/png")
