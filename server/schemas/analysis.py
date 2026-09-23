from pydantic import BaseModel, field_validator

MIN_WORDS = 100
MAX_WORDS = 700

class AnalyseRequest(BaseModel):
    job_description: str
    cv: str

    @field_validator("job_description", "cv")
    @classmethod
    def validate_word_count(cls, value: str, info):
        word_count = len(value.split())
        if word_count < MIN_WORDS:
            raise ValueError(
                f"{info.field_name} must contain at least {MIN_WORDS} words "
                f"(found {word_count})."
            )
        if word_count > MAX_WORDS:
            raise ValueError(
                f"{info.field_name} must contain at most {MAX_WORDS} words "
                f"(found {word_count})."
            )
        return value


class AnalyseResponse(BaseModel):
    score: int
    summary: str
    recommendations: list[str]

    @classmethod
    def get_schema_ai(cls):
        return {
            "type": "object",
            "properties": {
                "score": {
                    "type": "integer",
                    "description": "Match score from 0 to 100",
                },
                "summary": {
                    "type": "string",
                },
                "recommendations": {
                    "type": "array",
                    "items": {"type": "string"},
                },
            },
            "required": [
                "score",
                "summary",
                "recommendations",
            ],
            "additionalProperties": False,
        }