from typing import Any, Dict, List, Optional
import httpx
from app.core.config import settings
from datetime import datetime, timedelta
from app.models.instagram_account import InstagramAccount

class InstagramAPIError(Exception):
    def __init__(self, message: str, status_code: int = None, response: Dict = None):
        self.message = message
        self.status_code = status_code
        self.response = response
        super().__init__(self.message)

class InstagramAPI:
    BASE_URL = "https://graph.facebook.com/v18.0"

    def __init__(self):
        self.client = httpx.AsyncClient(base_url=self.BASE_URL)

    async def close(self):
        await self.client.aclose()

    async def _make_request(
        self, method: str, endpoint: str, params: Dict = None, json: Dict = None
    ) -> Dict:
        try:
            response = await self.client.request(
                method,
                endpoint,
                params=params,
                json=json
            )
            response.raise_for_status()
            return response.json()
        except httpx.HTTPError as e:
            error_response = e.response.json() if e.response else None
            raise InstagramAPIError(
                message=str(e),
                status_code=e.response.status_code if e.response else None,
                response=error_response
            )

    async def exchange_token(self, short_lived_token: str) -> Dict[str, Any]:
        """Exchange a short-lived token for a long-lived token."""
        params = {
            "grant_type": "fb_exchange_token",
            "client_id": settings.INSTAGRAM_APP_ID,
            "client_secret": settings.INSTAGRAM_APP_SECRET,
            "fb_exchange_token": short_lived_token,
        }
        return await self._make_request("GET", "/oauth/access_token", params=params)

    async def get_user_profile(self, instagram_user_id: str, access_token: str) -> Dict[str, Any]:
        """Get Instagram user profile information."""
        params = {
            "fields": "id,username,profile_picture_url",
            "access_token": access_token
        }
        return await self._make_request("GET", f"/{instagram_user_id}", params=params)

    async def send_message(
        self,
        instagram_user_id: str,
        recipient_id: str,
        message: Dict[str, Any],
        access_token: str
    ) -> Dict[str, Any]:
        """Send a message to an Instagram user."""
        params = {"access_token": access_token}
        json_data = {
            "recipient": {"id": recipient_id},
            "message": message
        }
        return await self._make_request(
            "POST",
            f"/{instagram_user_id}/messages",
            params=params,
            json=json_data
        )

    async def get_conversations(
        self,
        instagram_user_id: str,
        access_token: str,
        limit: int = 20,
        before: str = None,
        after: str = None
    ) -> Dict[str, Any]:
        """Get a list of conversations."""
        params = {
            "access_token": access_token,
            "limit": limit,
            "fields": "participants,updated_time,messages{id,from,to,message,created_time}"
        }
        if before:
            params["before"] = before
        if after:
            params["after"] = after
        return await self._make_request("GET", f"/{instagram_user_id}/conversations", params=params)

    async def get_messages(
        self,
        conversation_id: str,
        access_token: str,
        limit: int = 20,
        before: str = None,
        after: str = None
    ) -> Dict[str, Any]:
        """Get messages from a specific conversation."""
        params = {
            "access_token": access_token,
            "limit": limit,
            "fields": "id,from,to,message,created_time"
        }
        if before:
            params["before"] = before
        if after:
            params["after"] = after
        return await self._make_request("GET", f"/{conversation_id}/messages", params=params)

    async def subscribe_to_webhooks(
        self,
        instagram_user_id: str,
        access_token: str,
        callback_url: str,
        fields: List[str]
    ) -> Dict[str, Any]:
        """Subscribe to webhook events for an Instagram account."""
        params = {
            "access_token": access_token,
            "object": "instagram",
            "callback_url": callback_url,
            "fields": ",".join(fields),
            "include_values": "true"
        }
        return await self._make_request("POST", f"/{instagram_user_id}/subscriptions", params=params)

class InstagramService:
    def __init__(self):
        self.base_url = settings.INSTAGRAM_API_BASE_URL
        self.version = settings.INSTAGRAM_GRAPH_API_VERSION

    def _make_request(
        self,
        method: str,
        endpoint: str,
        access_token: str,
        params: Optional[Dict[str, Any]] = None,
        json: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Make a request to the Instagram Graph API.
        """
        url = f"{self.base_url}/{endpoint}"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        
        response = requests.request(
            method=method,
            url=url,
            headers=headers,
            params=params,
            json=json
        )
        response.raise_for_status()
        return response.json()

    def refresh_access_token(self, account: InstagramAccount) -> None:
        """
        Refresh the long-lived access token before it expires.
        """
        params = {
            "grant_type": "fb_exchange_token",
            "fb_exchange_token": account.access_token,
            "client_id": settings.INSTAGRAM_APP_ID,
            "client_secret": settings.INSTAGRAM_APP_SECRET
        }
        
        response = self._make_request(
            method="GET",
            endpoint="oauth/access_token",
            access_token=account.access_token,
            params=params
        )
        
        account.access_token = response["access_token"]
        account.token_expires_at = datetime.utcnow() + timedelta(seconds=response["expires_in"])

    def setup_webhooks(self, account: InstagramAccount) -> None:
        """
        Set up webhooks for the Instagram account.
        """
        # Subscribe to messages
        self._make_request(
            method="POST",
            endpoint=f"{account.instagram_page_id}/subscribed_apps",
            access_token=account.access_token,
            json={
                "subscribed_fields": [
                    "messages",
                    "messaging_postbacks",
                    "message_reactions",
                    "messaging_seen"
                ]
            }
        )

    def remove_webhooks(self, account: InstagramAccount) -> None:
        """
        Remove webhooks for the Instagram account.
        """
        self._make_request(
            method="DELETE",
            endpoint=f"{account.instagram_page_id}/subscribed_apps",
            access_token=account.access_token
        )

    def send_message(
        self,
        account: InstagramAccount,
        recipient_id: str,
        message: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Send a message to a user.
        """
        return self._make_request(
            method="POST",
            endpoint=f"{account.instagram_page_id}/messages",
            access_token=account.access_token,
            json={
                "recipient": {"id": recipient_id},
                "message": message
            }
        )

    def get_profile(self, account: InstagramAccount, user_id: str) -> Dict[str, Any]:
        """
        Get a user's Instagram profile information.
        """
        return self._make_request(
            method="GET",
            endpoint=f"{user_id}",
            access_token=account.access_token,
            params={"fields": "id,username,name,profile_pic"}
        )

instagram_api = InstagramAPI() 