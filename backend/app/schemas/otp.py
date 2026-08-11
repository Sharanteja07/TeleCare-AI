from pydantic import BaseModel, field_validator
import re

class OTPSendRequest(BaseModel):
    email: str

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", v):
            raise ValueError("Invalid email format")
        return v

class OTPVerifyRequest(BaseModel):
    email: str
    code: str
    role: str = "customer"

    @field_validator('email')
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[^\s@]+@[^\s@]+\.[^\s@]+$", v):
            raise ValueError("Invalid email format")
        return v

    @field_validator('code')
    @classmethod
    def validate_code_format(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^\d{6}$", v):
            raise ValueError("OTP must be a 6-digit number")
        return v
