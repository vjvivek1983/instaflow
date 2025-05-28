"""add subscription plans and admin

Revision ID: 002
Revises: 001
Create Date: 2024-03-14 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # Create subscription_plans table
    op.create_table(
        'subscription_plans',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=False),
        sa.Column('price_monthly', sa.Float(), nullable=False),
        sa.Column('max_instagram_accounts', sa.Integer(), nullable=False),
        sa.Column('max_contacts', sa.Integer(), nullable=False),
        sa.Column('max_flows', sa.Integer(), nullable=False),
        sa.Column('features', sa.ARRAY(sa.String()), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Add is_admin column to users table
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=True, server_default='false'))

    # Create default subscription plans
    op.execute("""
        INSERT INTO subscription_plans (id, name, description, price_monthly, max_instagram_accounts, max_contacts, max_flows, features)
        VALUES 
        ('plan_starter', 'Starter', 'Perfect for small businesses', 29.99, 1, 1000, 5, 
         ARRAY['Basic automation flows', 'Message templates', 'Basic analytics']),
        ('plan_pro', 'Professional', 'For growing businesses', 79.99, 3, 5000, 20,
         ARRAY['Advanced automation flows', 'Message templates', 'Advanced analytics', 'Team collaboration', 'Priority support']),
        ('plan_enterprise', 'Enterprise', 'For large organizations', 199.99, 10, 25000, 100,
         ARRAY['Unlimited automation flows', 'Message templates', 'Advanced analytics', 'Team collaboration', 'Priority support', 'Custom integrations', 'Dedicated account manager'])
    """)

def downgrade():
    # Drop subscription_plans table
    op.drop_table('subscription_plans')

    # Remove is_admin column from users table
    op.drop_column('users', 'is_admin') 