from datetime import datetime, timedelta
from typing import Dict, List, Optional
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.models.message_log import MessageLog
from app.models.contact import Contact
from app.models.flow import Flow
from app.models.trigger import Trigger

class AnalyticsService:
    @staticmethod
    async def get_account_summary(
        db: Session,
        instagram_account_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """Get summary metrics for an Instagram account."""
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()

        # Get total contacts
        total_contacts = db.query(Contact).filter(
            Contact.instagram_account_id == instagram_account_id
        ).count()

        # Get new contacts in period
        new_contacts = db.query(Contact).filter(
            Contact.instagram_account_id == instagram_account_id,
            Contact.created_at.between(start_date, end_date)
        ).count()

        # Get message metrics
        message_metrics = db.query(
            func.count().label('total'),
            func.sum(MessageLog.is_automated.cast(int)).label('automated'),
            MessageLog.direction
        ).filter(
            MessageLog.instagram_account_id == instagram_account_id,
            MessageLog.timestamp.between(start_date, end_date)
        ).group_by(MessageLog.direction).all()

        messages_sent = 0
        messages_received = 0
        automated_messages = 0

        for metric in message_metrics:
            if metric.direction == 'outbound':
                messages_sent = metric.total
                automated_messages = metric.automated
            else:
                messages_received = metric.total

        return {
            "totalContacts": total_contacts,
            "newContacts": new_contacts,
            "messagesSent": messages_sent,
            "messagesReceived": messages_received,
            "automatedMessages": automated_messages,
            "automationRate": (automated_messages / messages_sent * 100) if messages_sent > 0 else 0,
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }

    @staticmethod
    async def get_flow_analytics(
        db: Session,
        flow_id: str,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict:
        """Get detailed analytics for a specific flow."""
        if not start_date:
            start_date = datetime.now() - timedelta(days=30)
        if not end_date:
            end_date = datetime.now()

        # Get flow details
        flow = db.query(Flow).filter(Flow.id == flow_id).first()
        if not flow:
            raise ValueError("Flow not found")

        # Get trigger metrics
        trigger_metrics = db.query(
            Trigger.type,
            func.count(MessageLog.id).label('starts')
        ).join(
            MessageLog,
            MessageLog.flow_id == Trigger.flow_id
        ).filter(
            Trigger.flow_id == flow_id,
            MessageLog.timestamp.between(start_date, end_date)
        ).group_by(Trigger.type).all()

        # Get completion metrics
        completion_metrics = db.query(
            func.count(Contact.id).label('completions')
        ).filter(
            Contact.current_flow_id == flow_id,
            Contact.current_flow_step_node_id.is_(None),  # Flow completed
            Contact.updated_at.between(start_date, end_date)
        ).scalar()

        # Get node engagement
        node_engagement = db.query(
            MessageLog.content['nodeId'].label('nodeId'),
            func.count().label('engagements')
        ).filter(
            MessageLog.flow_id == flow_id,
            MessageLog.timestamp.between(start_date, end_date)
        ).group_by('nodeId').all()

        total_starts = sum(metric.starts for metric in trigger_metrics)

        return {
            "flowId": flow_id,
            "name": flow.name,
            "triggers": [
                {
                    "type": metric.type,
                    "starts": metric.starts
                } for metric in trigger_metrics
            ],
            "totalStarts": total_starts,
            "completions": completion_metrics or 0,
            "completionRate": (completion_metrics / total_starts * 100) if total_starts > 0 else 0,
            "nodeEngagement": [
                {
                    "nodeId": engagement.nodeId,
                    "engagements": engagement.engagements
                } for engagement in node_engagement
            ],
            "period": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            }
        }

    @staticmethod
    async def get_contact_growth(
        db: Session,
        instagram_account_id: str,
        days: int = 30
    ) -> List[Dict]:
        """Get contact growth over time."""
        start_date = datetime.now() - timedelta(days=days)
        
        daily_growth = db.query(
            func.date_trunc('day', Contact.created_at).label('date'),
            func.count().label('new_contacts')
        ).filter(
            Contact.instagram_account_id == instagram_account_id,
            Contact.created_at >= start_date
        ).group_by('date').order_by('date').all()

        return [
            {
                "date": day.date.isoformat(),
                "newContacts": day.new_contacts
            } for day in daily_growth
        ]

analytics_service = AnalyticsService() 