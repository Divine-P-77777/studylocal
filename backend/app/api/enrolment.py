from fastapi import APIRouter, HTTPException, Header, Request
from app.core.limiter import limiter
from app.services.enrolment_service import enrolment_service
from typing import Optional

router = APIRouter()

@router.post("/create")
@limiter.limit("20/minute")
async def create_deal(request: Request, tutor_id: str, student_id: str, subject: Optional[str] = None):
    res = await enrolment_service.create_enrolment(tutor_id, student_id, subject)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@router.post("/confirm/{enrolment_id}")
@limiter.limit("20/minute")
async def confirm_deal(request: Request, enrolment_id: str, x_user_id: str = Header(...)):
    res = await enrolment_service.confirm_enrolment(enrolment_id, x_user_id)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@router.post("/cancel/{enrolment_id}")
@limiter.limit("20/minute")
async def cancel_deal(request: Request, enrolment_id: str, x_user_id: str = Header(...)):
    res = await enrolment_service.cancel_enrolment(enrolment_id, x_user_id)
    if not res["success"]:
        raise HTTPException(status_code=400, detail=res["message"])
    return res

@router.get("/list")
async def get_my_deals(x_user_id: str = Header(...)):
    return await enrolment_service.get_user_enrolments(x_user_id)

@router.get("/status/{tutor_id}/{student_id}")
async def get_deal_status(tutor_id: str, student_id: str):
    enrolment = await enrolment_service.get_enrolment_for_chat(tutor_id, student_id)
    return {"enrolment": enrolment}
