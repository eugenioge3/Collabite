"""add social verification fields and table

Revision ID: 4d92b6c0a1f5
Revises: 87e5b35bb9bb
Create Date: 2026-03-13 00:00:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "4d92b6c0a1f5"
down_revision: Union[str, None] = "87e5b35bb9bb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("business_profiles", sa.Column("instagram_handle", sa.String(length=255), nullable=True))
    op.add_column("business_profiles", sa.Column("instagram_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("business_profiles", sa.Column("tiktok_handle", sa.String(length=255), nullable=True))
    op.add_column("business_profiles", sa.Column("tiktok_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False))

    op.add_column("influencer_profiles", sa.Column("instagram_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False))
    op.add_column("influencer_profiles", sa.Column("tiktok_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False))

    op.create_table(
        "social_verifications",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("platform", sa.Enum("instagram", "tiktok", name="verification_platform"), nullable=False),
        sa.Column("account_handle", sa.String(length=255), nullable=False),
        sa.Column("code", sa.String(length=20), nullable=False),
        sa.Column("status", sa.Enum("pending", "verified", "rejected", "expired", name="verification_status"), server_default="pending", nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("verified_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reviewed_by_email", sa.String(length=255), nullable=True),
        sa.Column("review_notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_index(op.f("ix_social_verifications_user_id"), "social_verifications", ["user_id"], unique=False)
    op.create_index(op.f("ix_social_verifications_platform"), "social_verifications", ["platform"], unique=False)
    op.create_index(op.f("ix_social_verifications_status"), "social_verifications", ["status"], unique=False)
    op.create_index(op.f("ix_social_verifications_expires_at"), "social_verifications", ["expires_at"], unique=False)
    op.create_index(op.f("ix_social_verifications_code"), "social_verifications", ["code"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_social_verifications_code"), table_name="social_verifications")
    op.drop_index(op.f("ix_social_verifications_expires_at"), table_name="social_verifications")
    op.drop_index(op.f("ix_social_verifications_status"), table_name="social_verifications")
    op.drop_index(op.f("ix_social_verifications_platform"), table_name="social_verifications")
    op.drop_index(op.f("ix_social_verifications_user_id"), table_name="social_verifications")
    op.drop_table("social_verifications")

    op.drop_column("influencer_profiles", "tiktok_verified")
    op.drop_column("influencer_profiles", "instagram_verified")

    op.drop_column("business_profiles", "tiktok_verified")
    op.drop_column("business_profiles", "tiktok_handle")
    op.drop_column("business_profiles", "instagram_verified")
    op.drop_column("business_profiles", "instagram_handle")

    op.execute("DROP TYPE IF EXISTS verification_status")
    op.execute("DROP TYPE IF EXISTS verification_platform")
