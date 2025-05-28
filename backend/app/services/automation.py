from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta
import json
import logging
from sqlalchemy.orm import Session

from app.models.flow import Flow, FlowStatus, Trigger
from app.models.contact import Contact, Conversation, MessageLog, ConversationStatus
from app.services.instagram import instagram_api, InstagramService
from app.services.redis_service import redis_service

logger = logging.getLogger(__name__)

class AutomationEngine:
    def __init__(self, db: Session):
        self.db = db
        self.instagram_service = InstagramService()
        self.queue_name = "automation_tasks"

    async def queue_flow_execution(
        self,
        flow_id: str,
        trigger_data: Dict[str, Any]
    ) -> bool:
        """Queue a flow for execution."""
        try:
            task_data = {
                "flow_id": flow_id,
                "trigger_data": trigger_data,
                "queued_at": datetime.utcnow().isoformat()
            }
            return await redis_service.add_to_queue(self.queue_name, task_data)
        except Exception as e:
            logger.error(f"Error queueing flow execution: {str(e)}")
            return False

    def process_message(
        self,
        account: InstagramAccount,
        contact: Contact,
        message: MessageLog
    ) -> None:
        """
        Process an incoming message and execute appropriate flows.
        """
        # If contact is in a flow, continue that flow
        if contact.current_flow_id:
            self._continue_flow(account, contact, message)
            return
        
        # Otherwise, check for matching triggers
        self._check_triggers(account, contact, message)

    def process_postback(
        self,
        account: InstagramAccount,
        contact: Contact,
        message: MessageLog
    ) -> None:
        """
        Process a postback (button click) and execute appropriate flows.
        """
        payload = message.content.get("payload")
        if not payload:
            return
        
        # If contact is in a flow, continue that flow
        if contact.current_flow_id:
            self._continue_flow(account, contact, message)
            return
        
        # Otherwise, check for matching triggers
        self._check_triggers(account, contact, message)

    def _check_triggers(
        self,
        account: InstagramAccount,
        contact: Contact,
        message: MessageLog
    ) -> None:
        """
        Check if the message matches any triggers and start the corresponding flow.
        """
        message_text = message.content.get("text", "").lower()
        
        # Check keyword triggers
        triggers = self.db.query(Trigger).join(Flow).filter(
            Flow.instagram_account_id == account.id,
            Trigger.status == "active"
        ).all()
        
        for trigger in triggers:
            if trigger.type == "dm_keyword" and trigger.keyword.lower() in message_text:
                self._start_flow(account, contact, trigger.flow)
                break
            elif trigger.type == "welcome_message" and not contact.last_interaction_at:
                self._start_flow(account, contact, trigger.flow)
                break

    def _start_flow(
        self,
        account: InstagramAccount,
        contact: Contact,
        flow: Flow
    ) -> None:
        """
        Start a new flow for a contact.
        """
        # Set current flow
        contact.current_flow_id = flow.id
        contact.current_flow_step_node_id = flow.flow_definition["startNodeId"]
        contact.flow_context = {}
        
        self.db.add(contact)
        self.db.commit()
        
        # Execute first node
        self._execute_node(account, contact, flow.flow_definition["nodes"][0])

    def _continue_flow(
        self,
        account: InstagramAccount,
        contact: Contact,
        message: MessageLog
    ) -> None:
        """
        Continue an existing flow based on user input.
        """
        flow = self.db.query(Flow).filter(Flow.id == contact.current_flow_id).first()
        if not flow:
            return
        
        current_node = next(
            (node for node in flow.flow_definition["nodes"]
             if node["id"] == contact.current_flow_step_node_id),
            None
        )
        if not current_node:
            return
        
        # Find next node based on conditions
        next_node = self._find_next_node(flow.flow_definition["nodes"], current_node, message, contact)
        if next_node:
            contact.current_flow_step_node_id = next_node["id"]
            self.db.add(contact)
            self.db.commit()
            
            self._execute_node(account, contact, next_node)
        else:
            # End flow if no next node
            contact.current_flow_id = None
            contact.current_flow_step_node_id = None
            contact.flow_context = {}
            self.db.add(contact)
            self.db.commit()

    def _find_next_node(
        self,
        nodes: List[Dict[str, Any]],
        current_node: Dict[str, Any],
        message: MessageLog,
        contact: Contact
    ) -> Optional[Dict[str, Any]]:
        """
        Find the next node based on conditions and user input.
        """
        for connection in current_node.get("connections", []):
            if not connection.get("condition"):
                # If no condition, follow connection
                return next(
                    (node for node in nodes if node["id"] == connection["targetNodeId"]),
                    None
                )
            
            condition = connection["condition"]
            if condition["type"] == "button_payload":
                if message.type == "button_response" and message.content.get("payload") == condition["value"]:
                    return next(
                        (node for node in nodes if node["id"] == connection["targetNodeId"]),
                        None
                    )
            elif condition["type"] == "input_valid":
                # Validate input based on node type
                is_valid = self._validate_input(current_node, message)
                if is_valid == condition["value"]:
                    return next(
                        (node for node in nodes if node["id"] == connection["targetNodeId"]),
                        None
                    )
        
        return None

    def _validate_input(self, node: Dict[str, Any], message: MessageLog) -> bool:
        """
        Validate user input based on node type.
        """
        if node["type"] != "get_input":
            return True
        
        input_type = node.get("inputType")
        text = message.content.get("text", "")
        
        if input_type == "email":
            # Simple email validation
            return "@" in text and "." in text
        elif input_type == "phone":
            # Simple phone validation
            return text.replace(" ", "").replace("-", "").isdigit()
        
        return True

    def _execute_node(
        self,
        account: InstagramAccount,
        contact: Contact,
        node: Dict[str, Any]
    ) -> None:
        """
        Execute a flow node.
        """
        if node["type"] == "message":
            # Send message
            content = self._prepare_message_content(node["content"], contact)
            self.instagram_service.send_message(
                account=account,
                recipient_id=contact.instagram_user_id,
                message=content
            )
        
        elif node["type"] == "tag_contact":
            # Add tag to contact
            if node.get("tagName"):
                current_tags = set(contact.tags)
                current_tags.add(node["tagName"])
                contact.tags = list(current_tags)
                self.db.add(contact)
                self.db.commit()
        
        elif node["type"] == "human_takeover":
            # Mark conversation for human takeover
            conversation = self.db.query(Conversation).filter(
                Conversation.contact_id == contact.id,
                Conversation.status == "open"
            ).first()
            if conversation:
                conversation.status = "pending_human"
                self.db.add(conversation)
                self.db.commit()
        
        elif node["type"] == "wait":
            # Schedule next node execution
            # TODO: Implement delayed execution using Redis/Celery
            pass

    def _prepare_message_content(
        self,
        content: Dict[str, Any],
        contact: Contact
    ) -> Dict[str, Any]:
        """
        Prepare message content with variable substitution.
        """
        if "text" in content:
            text = content["text"]
            # Replace variables
            text = text.replace("{{contact.firstName}}", contact.first_name or "")
            text = text.replace("{{contact.lastName}}", contact.last_name or "")
            content["text"] = text
        
        return content

    async def execute_flow(
        self,
        db: Session,
        flow_id: str,
        trigger_data: Dict[str, Any]
    ) -> None:
        """Execute a flow from the queue."""
        try:
            flow = db.query(Flow).filter(Flow.id == flow_id).first()
            if not flow or flow.status != FlowStatus.ACTIVE:
                return

            contact_id = trigger_data.get("contact_id")
            if not contact_id:
                return

            contact = db.query(Contact).filter(Contact.id == contact_id).first()
            if not contact:
                return

            if trigger_data.get("type") == "continue_flow":
                await self._continue_flow(contact, trigger_data.get("message_data", {}))
            elif trigger_data.get("type") == "start_flow":
                await self._start_flow(contact, flow)

        except Exception as e:
            logger.error(f"Error executing flow from queue: {str(e)}")

automation_engine = None

def get_automation_engine(db: Session) -> AutomationEngine:
    global automation_engine
    if not automation_engine:
        automation_engine = AutomationEngine(db)
    return automation_engine 