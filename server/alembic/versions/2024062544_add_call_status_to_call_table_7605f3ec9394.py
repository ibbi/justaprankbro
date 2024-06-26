"""add call status to call table

Revision ID: 7605f3ec9394
Revises: 4769b7a2546c
Create Date: 2024-06-25 22:44:35.787138

"""

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

from alembic import op

# revision identifiers, used by Alembic.
revision = "7605f3ec9394"
down_revision = "4769b7a2546c"
branch_labels = None
depends_on = None


def upgrade():
    # Create the enum type
    callstatus = postgresql.ENUM(
        "QUEUED",
        "INITIATED",
        "RINGING",
        "IN_PROGRESS",
        "COMPLETED",
        "FAILED",
        "BUSY",
        "NO_ANSWER",
        name="callstatus",
    )
    callstatus.create(op.get_bind())

    # Add the column using the created enum type
    op.add_column(
        "call", sa.Column("status", callstatus, nullable=False, server_default="QUEUED")
    )


def downgrade():
    # Drop the column
    op.drop_column("call", "status")

    # Drop the enum type
    callstatus = postgresql.ENUM(
        "QUEUED",
        "RINGING",
        "IN_PROGRESS",
        "COMPLETED",
        "FAILED",
        "BUSY",
        "NO_ANSWER",
        name="callstatus",
    )
    callstatus.drop(op.get_bind())
