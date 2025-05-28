"""Initial migration

Revision ID: 001
Revises: 
Create Date: 2024-03-19 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('email', sa.String(), unique=True, nullable=False),
        sa.Column('password_hash', sa.String(), nullable=False),
        sa.Column('first_name', sa.String()),
        sa.Column('last_name', sa.String()),
        sa.Column('subscription_plan_id', postgresql.UUID(as_uuid=True)),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False)
    )

    # Create instagram_accounts table
    op.create_table(
        'instagram_accounts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('instagram_page_id', sa.String(), nullable=False),
        sa.Column('instagram_user_id', sa.String(), nullable=False),
        sa.Column('instagram_username', sa.String(), nullable=False),
        sa.Column('access_token', sa.String(), nullable=False),
        sa.Column('token_expires_at', sa.DateTime(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE')
    )

    # Create flows table
    op.create_table(
        'flows',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('instagram_account_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String()),
        sa.Column('flow_definition', postgresql.JSONB(), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['instagram_account_id'], ['instagram_accounts.id'], ondelete='CASCADE')
    )

    # Create triggers table
    op.create_table(
        'triggers',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('flow_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('keyword', sa.String()),
        sa.Column('post_permalink', sa.String()),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['flow_id'], ['flows.id'], ondelete='CASCADE')
    )

    # Create contacts table
    op.create_table(
        'contacts',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('instagram_account_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('instagram_user_id', sa.String(), nullable=False),
        sa.Column('instagram_username', sa.String(), nullable=False),
        sa.Column('first_name', sa.String()),
        sa.Column('last_name', sa.String()),
        sa.Column('profile_picture_url', sa.String()),
        sa.Column('last_interaction_at', sa.DateTime()),
        sa.Column('current_flow_id', postgresql.UUID(as_uuid=True)),
        sa.Column('current_flow_step_node_id', sa.String()),
        sa.Column('flow_context', postgresql.JSONB()),
        sa.Column('tags', postgresql.ARRAY(sa.String()), nullable=False, server_default='{}'),
        sa.Column('custom_attributes', postgresql.JSONB(), nullable=False, server_default='{}'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['instagram_account_id'], ['instagram_accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['current_flow_id'], ['flows.id'], ondelete='SET NULL')
    )

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('instagram_account_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contact_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(), nullable=False),
        sa.Column('assigned_agent_id', postgresql.UUID(as_uuid=True)),
        sa.Column('last_message_id', postgresql.UUID(as_uuid=True)),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('closed_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['instagram_account_id'], ['instagram_accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['contact_id'], ['contacts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['assigned_agent_id'], ['users.id'], ondelete='SET NULL')
    )

    # Create message_logs table
    op.create_table(
        'message_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('instagram_account_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('contact_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('direction', sa.String(), nullable=False),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('content', postgresql.JSONB(), nullable=False),
        sa.Column('timestamp', sa.DateTime(), nullable=False),
        sa.Column('is_automated', sa.Boolean(), nullable=False),
        sa.Column('flow_id', postgresql.UUID(as_uuid=True)),
        sa.ForeignKeyConstraint(['instagram_account_id'], ['instagram_accounts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['contact_id'], ['contacts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversations.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['flow_id'], ['flows.id'], ondelete='SET NULL')
    )

    # Update conversations table with last_message_id foreign key
    op.create_foreign_key(
        'fk_conversations_last_message',
        'conversations',
        'message_logs',
        ['last_message_id'],
        ['id'],
        ondelete='SET NULL'
    )


def downgrade() -> None:
    # Drop tables in reverse order
    op.drop_table('message_logs')
    op.drop_table('conversations')
    op.drop_table('contacts')
    op.drop_table('triggers')
    op.drop_table('flows')
    op.drop_table('instagram_accounts')
    op.drop_table('users') 