from sqlalchemy.orm import Session
from . import eco_score, user_level, badges, streaks, challenges

def trigger_on_points_awarded(db: Session, user_id: int, points: int):
    eco_score.update_eco_score(db, user_id)
    user_level.update_user_level(db, user_id)
    badges.award_badges_post_points(db, user_id)
    streaks.update_on_activity(db, user_id)
    challenges.update_on_points(db, user_id, points)
