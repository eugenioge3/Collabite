"""add contact unlock fields on campaign applications

Revision ID: 6f1f5d2c9b7e
Revises: 4d92b6c0a1f5
Create Date: 2026-03-13 00:00:00.000000

"""

from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6f1f5d2c9b7e"
down_revision: Union[str, None] = "4d92b6c0a1f5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "campaign_applications",
        sa.Column(
            "contact_unlocked",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false"),
        ),
    )
    op.add_column(
        "campaign_applications",
        sa.Column("contact_unlocked_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("campaign_applications", "contact_unlocked_at")
    op.drop_column("campaign_applications", "contact_unlocked")
